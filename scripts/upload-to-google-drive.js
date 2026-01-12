const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

/**
 * Upload video file to Google Drive and return a shareable link
 */
async function uploadToGoogleDrive() {
  const videoPath = process.argv[2];
  const fileName = process.env.FILE_NAME || 'checkout-video.webm';
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

  if (!videoPath || !fs.existsSync(videoPath)) {
    console.error('❌ Video file not found:', videoPath);
    process.exit(1);
  }

  if (!folderId) {
    console.error('❌ GOOGLE_DRIVE_FOLDER_ID is required. Service accounts don\'t have storage quota.');
    console.error('   Please create a folder in your Google Drive and share it with the service account.');
    process.exit(1);
  }

  // Get service account credentials from environment variable
  const credentialsJson = process.env.GOOGLE_DRIVE_CREDENTIALS;
  if (!credentialsJson) {
    console.error('❌ GOOGLE_DRIVE_CREDENTIALS environment variable not set');
    process.exit(1);
  }

  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch (error) {
    console.error('❌ Failed to parse GOOGLE_DRIVE_CREDENTIALS:', error.message);
    process.exit(1);
  }

  try {
    // Authenticate with Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Get file stats
    const stats = fs.statSync(videoPath);
    const fileSize = stats.size;
    console.log(`📹 Uploading ${(fileSize / 1024 / 1024).toFixed(2)} MB to Google Drive...`);
    console.log(`📁 Target folder ID: ${folderId.substring(0, 10)}...`);

    // Verify folder exists and is accessible (skip if fails, try upload anyway)
    try {
      const folderInfo = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType',
        supportsAllDrives: true,
        supportsTeamDrives: true,
      });
      console.log(`✅ Folder verified: "${folderInfo.data.name}"`);
    } catch (verifyError) {
      console.log(`⚠️  Folder verification failed: ${verifyError.message}`);
      console.log(`⚠️  Attempting upload anyway - verification can fail even if upload works...`);
      // Don't throw - sometimes verification fails but upload works
    }

    // Create file metadata (folderId is required)
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    // Create readable stream
    const media = {
      mimeType: 'video/webm',
      body: fs.createReadStream(videoPath),
    };

    // Upload file (support Shared Drives)
    try {
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink',
        supportsAllDrives: true,
        supportsTeamDrives: true,
      });
      
      const fileId = response.data.id;
      console.log('✅ File uploaded! ID:', fileId);
      
      // Make the file publicly viewable (support Shared Drives)
      try {
        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
          supportsAllDrives: true,
          supportsTeamDrives: true,
        });
        console.log('✅ File made publicly viewable');
      } catch (permError) {
        console.log('⚠️  Could not set public permissions:', permError.message);
      }

      // Get the shareable link (support Shared Drives)
      const fileDetails = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink, id',
        supportsAllDrives: true,
        supportsTeamDrives: true,
      });

      const viewLink = fileDetails.data.webViewLink;
      const downloadLink = fileDetails.data.webContentLink || viewLink;

      console.log('✅ Upload complete!');
      console.log('🔗 View link:', viewLink);
      console.log('⬇️  Download link:', downloadLink);

      // Output to GITHUB_OUTPUT file (GitHub Actions format)
      const outputFile = process.env.GITHUB_OUTPUT;
      if (outputFile) {
        fs.appendFileSync(outputFile, `file_id=${fileId}\n`);
        fs.appendFileSync(outputFile, `view_url=${viewLink}\n`);
        fs.appendFileSync(outputFile, `download_url=${downloadLink}\n`);
      } else {
        // Fallback for older GitHub Actions (deprecated but still works)
        console.log(`::set-output name=file_id::${fileId}`);
        console.log(`::set-output name=view_url::${viewLink}`);
        console.log(`::set-output name=download_url::${downloadLink}`);
      }

      return { fileId, viewLink, downloadLink };
    } catch (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      if (uploadError.response) {
        console.error('Response:', JSON.stringify(uploadError.response.data, null, 2));
      }
      
      // Provide helpful error message
      if (uploadError.code === 404) {
        throw new Error(`Folder not found (404). Please verify:\n1. Folder ID is correct: ${folderId.substring(0, 20)}...\n2. Service account (${credentials.client_email}) is a Manager of the Shared Drive\n3. Folder is inside the Shared Drive, not regular Drive\n4. Wait a few minutes after sharing for permissions to propagate`);
      }
      throw uploadError;
    }
  } catch (error) {
    console.error('❌ Failed to upload to Google Drive:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

uploadToGoogleDrive().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

