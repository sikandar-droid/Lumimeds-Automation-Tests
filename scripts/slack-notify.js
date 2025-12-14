const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Send Playwright test results to Slack
 */
async function sendSlackNotification() {
  // Slack webhook URL - set this as environment variable
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error('❌ SLACK_WEBHOOK_URL environment variable not set');
    process.exit(1);
  }

  // Read test results
  const resultsPath = path.join(__dirname, '../test-results.json');
  let results;
  
  try {
    const resultsData = fs.readFileSync(resultsPath, 'utf8');
    results = JSON.parse(resultsData);
  } catch (error) {
    console.error('❌ Could not read test results:', error.message);
    process.exit(1);
  }

  // Parse results
  const stats = results.stats || {};
  const testFile = process.env.TEST_FILE || 'Unknown';
  const environment = process.env.TEST_ENV || 'Unknown';
  const testUrl = process.env.TEST_URL || 'N/A';
  
  // Determine color based on test results
  let color = '#36a64f'; // green
  if (stats.unexpected > 0) {
    color = '#ff0000'; // red
  } else if (stats.flaky > 0) {
    color = '#ffaa00'; // orange
  }

  // Get report URL (if deployed)
  const reportUrl = process.env.REPORT_URL || 'Run locally to view report';

  // Build Slack message
  const message = {
    username: 'Playwright Test Bot',
    icon_emoji: ':robot_face:',
    attachments: [
      {
        color: color,
        title: `🎭 Playwright Test Results: ${testFile}`,
        title_link: reportUrl,
        fields: [
          {
            title: 'Environment',
            value: environment,
            short: true
          },
          {
            title: 'Test URL',
            value: testUrl,
            short: true
          },
          {
            title: '✅ Passed',
            value: `${stats.expected || 0}`,
            short: true
          },
          {
            title: '❌ Failed',
            value: `${stats.unexpected || 0}`,
            short: true
          },
          {
            title: '⚠️ Flaky',
            value: `${stats.flaky || 0}`,
            short: true
          },
          {
            title: '⏱️ Duration',
            value: formatDuration(results.duration),
            short: true
          }
        ],
        footer: 'Lumimeds Test Automation',
        footer_icon: 'https://playwright.dev/img/playwright-logo.svg',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };

  // Send to Slack
  const url = new URL(webhookUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Slack notification sent successfully!');
          resolve(data);
        } else {
          console.error(`❌ Slack notification failed: ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error sending Slack notification:', error.message);
      reject(error);
    });

    req.write(JSON.stringify(message));
    req.end();
  });
}

function formatDuration(ms) {
  if (!ms) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

// Run the notification
sendSlackNotification().catch((error) => {
  console.error('Failed to send notification:', error);
  process.exit(1);
});


