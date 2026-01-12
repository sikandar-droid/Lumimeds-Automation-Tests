const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced Slack notification for checkout tests
 * Extracts email, coupon code, and other checkout-specific details
 * Supports video upload to Slack
 */
async function sendCheckoutNotification() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const recordVideo = process.env.RECORD_VIDEO === 'true';
  const githubRunId = process.env.GITHUB_RUN_ID;
  const githubRepository = process.env.GITHUB_REPOSITORY;
  const githubRunNumber = process.env.GITHUB_RUN_NUMBER;
  
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
  
  // Find video file if recording was enabled
  let videoPath = null;
  if (recordVideo) {
    videoPath = findVideoFile();
  }

  // Parse results
  const stats = results.stats || {};
  const testFile = process.env.TEST_FILE || 'checkout-prod';
  const environment = process.env.TEST_ENV || 'Production';
  const testUrl = process.env.TEST_URL || 'https://lumimeds.com';
  const testBrowser = process.env.TEST_BROWSER || 'All';
  const testDevice = process.env.TEST_DEVICE || null;
  
  // Try to extract checkout details from test output
  const checkoutDetails = extractCheckoutDetails(results);
  
  // Determine status
  const passed = stats.unexpected === 0;
  const color = passed ? '#36a64f' : '#ff0000';
  const emoji = passed ? '✅' : '❌';
  const status = passed ? 'SUCCESS' : 'FAILED';

  // Get report URL
  const reportUrl = process.env.REPORT_URL || 'Run `npx playwright show-report` to view';

  // Build rich message
  const fields = [
    {
      title: 'Status',
      value: `${emoji} ${status}`,
      short: true
    },
    {
      title: 'Environment',
      value: environment,
      short: true
    },
    {
      title: 'Test URL',
      value: `<${testUrl}|${testUrl}>`,
      short: false
    }
  ];

  // Add checkout-specific details if found
  if (checkoutDetails.email) {
    fields.push({
      title: '📧 Customer Email',
      value: `\`${checkoutDetails.email}\``,
      short: false
    });
  }

  if (checkoutDetails.couponCode) {
    fields.push({
      title: '🎫 Coupon Applied',
      value: `\`${checkoutDetails.couponCode}\``,
      short: true
    });
  }

  if (checkoutDetails.cardNumber) {
    fields.push({
      title: '💳 Payment Card',
      value: `\`${checkoutDetails.cardNumber}\``,
      short: true
    });
  }

  // Add test statistics
  fields.push(
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
      title: '⏱️ Duration',
      value: formatDuration(results.duration),
      short: true
    },
    {
      title: '📊 Report',
      value: reportUrl.startsWith('http') ? `<${reportUrl}|View Report>` : reportUrl,
      short: true
    }
  );

  // Build detailed checkout summary with dynamic date
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const todayLabel = `[Today] ${today}`;
  
  const statusEmoji = passed ? ':white_check_mark:' : ':x:';
  const statusText = passed ? 'PASSED' : 'FAILED';
  const statusBanner = passed ? '🟢 *ALL TESTS PASSED*' : '🔴 *TESTS FAILED*';
  
  // Build browser section based on what was tested
  const browserMap = {
    'Chromium': '🌐 *Chromium* - Chrome/Edge compatible',
    'Firefox': '🦊 *Firefox* - Mozilla Firefox',
    'WebKit': '🧭 *WebKit* - Safari compatible',
    'WebKit (Safari)': '🧭 *WebKit* - Safari compatible'
  };
  
  let browserSection;
  if (testDevice) {
    // Mobile checkout
    const browserName = browserMap[testBrowser] ? browserMap[testBrowser].replace(/🌐|🦊|🧭 \*/g, '') : testBrowser;
    browserSection = 
      `📱 *DEVICE TESTED*\n\n   • ${testDevice}\n\n` +
      `🌐 *BROWSER TESTED*\n\n   • ${browserName}\n\n`;
  } else if (testBrowser !== 'All' && browserMap[testBrowser]) {
    // Desktop single browser
    browserSection = `🌐 *BROWSER TESTED*\n\n   • ${browserMap[testBrowser].replace(/🌐|🦊|🧭 \*/g, '')}\n\n`;
  } else {
    // Desktop all browsers
    browserSection = `🌐 *BROWSERS TESTED*\n\n   • Chromium (Chrome/Edge)\n   • Firefox\n   • WebKit (Safari)\n\n`;
  }
  
  const detailedText = 
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `       🛒 *LUMIMEDS CHECKOUT AUTOMATION*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `📅 *${todayLabel}*\n` +
    `${statusBanner}\n\n` +
    
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `📋 *CHECKOUT FLOW*\n\n` +
    `   ${statusEmoji}  Survey Form - Complete flow tested\n` +
    `   ${statusEmoji}  Product Pricing - Verified correct\n` +
    `   ${statusEmoji}  Promo Application - Working correctly\n` +
    `   ${statusEmoji}  Medication Summary - Promo displayed\n` +
    `   ${statusEmoji}  Patient Info - Name, DOB, Address, Phone saved\n` +
    `   ${statusEmoji}  Questions - All verified and functional\n\n` +
    
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `📦 *PRODUCT SUMMARY FORM*\n\n` +
    `   ${statusEmoji}  Navigation - Successfully accessed\n` +
    `   ${statusEmoji}  Page Flow - Smooth transitions\n\n` +
    
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    browserSection +
    
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  // Add video section only if recording was enabled AND tests passed
  let videoSection = '';
  if (passed && recordVideo && githubRunId && githubRepository) {
    const artifactUrl = `https://github.com/${githubRepository}/actions/runs/${githubRunId}`;
    const artifactName = process.env.ARTIFACT_NAME || `checkout-video-${githubRunNumber}`;
    videoSection = `\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🎬 *VIDEO RECORDING*\n\n` +
      `   📹 <${artifactUrl}|⬇️ View Run #${githubRunNumber}>\n\n` +
      `   📥 *How to Download:*\n` +
      `   1. Click the link above\n` +
      `   2. Scroll to "Artifacts" section\n` +
      `   3. Click "${artifactName}"\n` +
      `   4. If nothing happens, try:\n` +
      `      • Right-click → "Save link as"\n` +
      `      • Or use: \`gh run download ${githubRunId} --name ${artifactName}\`\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else if (passed && recordVideo && videoPath) {
    videoSection = `\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🎬 *VIDEO RECORDING*\n\n` +
      `   📹 Video saved locally\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }

  const message = {
    username: 'Lumimeds Automation',
    icon_emoji: ':robot_face:',
    text: detailedText + videoSection
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

/**
 * Extract checkout details from test results
 */
function extractCheckoutDetails(results) {
  const details = {
    email: null,
    couponCode: null,
    cardNumber: null
  };

  try {
    // Look through test suites for console output
    if (results.suites && results.suites.length > 0) {
      const searchOutput = (obj) => {
        if (!obj) return;
        
        // Check stdout/stderr
        if (obj.stdout) {
          const stdout = Array.isArray(obj.stdout) ? obj.stdout.join('\n') : obj.stdout;
          
          // Extract email
          const emailMatch = stdout.match(/sikandar\.naeem\+(\d+)@devslooptech\.com/);
          if (emailMatch) {
            details.email = emailMatch[0];
          }
          
          // Extract coupon code
          const couponMatch = stdout.match(/Applying coupon code: (\w+)/);
          if (couponMatch) {
            details.couponCode = couponMatch[1];
          }
          
          // Extract card number (masked)
          const cardMatch = stdout.match(/Filling card number: (\d{4})\d+(\d{4})/);
          if (cardMatch) {
            details.cardNumber = `${cardMatch[1]}...${cardMatch[2]}`;
          }
        }
        
        // Recursively search nested objects
        if (obj.specs) obj.specs.forEach(searchOutput);
        if (obj.suites) obj.suites.forEach(searchOutput);
        if (obj.tests) obj.tests.forEach(searchOutput);
      };
      
      results.suites.forEach(searchOutput);
    }
  } catch (error) {
    console.log('ℹ️  Could not extract checkout details:', error.message);
  }

  return details;
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

/**
 * Find the video file in test-results directory
 */
function findVideoFile() {
  const testResultsDir = path.join(__dirname, '../test-results');
  
  try {
    if (!fs.existsSync(testResultsDir)) {
      return null;
    }
    
    // Recursively find .webm files
    const findVideos = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          const found = findVideos(filePath);
          if (found) return found;
        } else if (file.endsWith('.webm')) {
          return filePath;
        }
      }
      return null;
    };
    
    return findVideos(testResultsDir);
  } catch (error) {
    console.log('ℹ️  Could not find video file:', error.message);
    return null;
  }
}


// Run the notification
sendCheckoutNotification().catch((error) => {
  console.error('Failed to send notification:', error);
  process.exit(1);
});


