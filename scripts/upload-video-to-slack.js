const fs = require('fs');
const path = require('path');

/**
 * Upload video file directly to Slack
 * Requires SLACK_BOT_TOKEN (not webhook URL)
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
    console.log(`📹 Uploading ${(fileSize / 1024 / 1024).toFixed(2)} MB to Slack...`);

    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', fs.createReadStream(videoPath));
    form.append('channels', slackChannel);
    form.append('title', process.env.FILE_NAME || 'Checkout Test Video');
    form.append('filename', process.env.FILE_NAME || 'checkout-video.webm');
    form.append('initial_comment', `🎬 Checkout Test Video - Run #${process.env.GITHUB_RUN_NUMBER || 'local'}`);

    const response = await fetch('https://slack.com/api/files.upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    console.log('✅ Video uploaded to Slack!');
    console.log('🔗 File URL:', data.file.permalink);

    // Output to GITHUB_OUTPUT file
    const outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) {
      fs.appendFileSync(outputFile, `slack_file_url=${data.file.permalink}\n`);
      fs.appendFileSync(outputFile, `slack_file_id=${data.file.id}\n`);
    }

    return { fileUrl: data.file.permalink, fileId: data.file.id };
  } catch (error) {
    console.error('❌ Failed to upload to Slack:', error.message);
    process.exit(1);
  }
}

uploadVideoToSlack().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

