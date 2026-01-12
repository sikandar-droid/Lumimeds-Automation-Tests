const fs = require('fs');

/**
 * Upload video file directly to Slack using files_upload_v2
 * This is the new recommended method
 */
async function uploadVideoToSlack() {
  const videoPath = process.argv[2];
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const slackChannel = process.env.SLACK_CHANNEL || 'C08479Z15N9'; // Default channel ID

  if (!videoPath || !fs.existsSync(videoPath)) {
    console.error('❌ Video file not found:', videoPath);
    process.exit(1);
  }

  if (!slackToken) {
    console.error('❌ SLACK_BOT_TOKEN environment variable not set');
    console.error('   Get this from: https://api.slack.com/apps → Your App → OAuth & Permissions');
    process.exit(1);
  }

  try {
    const stats = fs.statSync(videoPath);
    const fileSize = stats.size;
    const fileName = process.env.FILE_NAME || 'checkout-video.webm';
    
    console.log(`📹 Uploading ${(fileSize / 1024 / 1024).toFixed(2)} MB to Slack...`);

    // Step 1: Get upload URL using files.getUploadURLExternal
    const uploadUrlResponse = await fetch('https://slack.com/api/files.getUploadURLExternal', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        filename: fileName,
        length: fileSize.toString(),
      }),
    });

    const uploadUrlData = await uploadUrlResponse.json();
    
    if (!uploadUrlData.ok) {
      console.error('Upload URL response:', uploadUrlData);
      throw new Error(`Failed to get upload URL: ${uploadUrlData.error}`);
    }

    console.log('✅ Got upload URL');

    // Step 2: Upload file to the URL
    const fileBuffer = fs.readFileSync(videoPath);
    
    const uploadResponse = await fetch(uploadUrlData.upload_url, {
      method: 'POST',
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
    }

    console.log('✅ File uploaded');

    // Step 3: Complete the upload and share to channel
    const completeResponse = await fetch('https://slack.com/api/files.completeUploadExternal', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: [
          {
            id: uploadUrlData.file_id,
            title: process.env.FILE_NAME || 'Checkout Test Video',
          }
        ],
        channel_id: slackChannel,
        initial_comment: `🎬 Checkout Test Video - Run #${process.env.GITHUB_RUN_NUMBER || 'local'}`,
      }),
    });

    const completeData = await completeResponse.json();

    if (!completeData.ok) {
      console.error('Complete upload response:', completeData);
      throw new Error(`Failed to complete upload: ${completeData.error}`);
    }

    console.log('✅ Video uploaded to Slack!');
    
    const fileUrl = completeData.files[0].permalink;
    const fileId = completeData.files[0].id;
    
    console.log('🔗 File URL:', fileUrl);

    // Output to GITHUB_OUTPUT file
    const outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) {
      fs.appendFileSync(outputFile, `slack_file_url=${fileUrl}\n`);
      fs.appendFileSync(outputFile, `slack_file_id=${fileId}\n`);
    }

    return { fileUrl, fileId };
  } catch (error) {
    console.error('❌ Failed to upload to Slack:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

uploadVideoToSlack().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
