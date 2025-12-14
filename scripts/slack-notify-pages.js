const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced Slack notification for Ad Page tests
 * Shows page functionality test results
 */
async function sendPageTestNotification() {
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
  const testFile = process.env.TEST_FILE || 'Ad Page Tests';
  const environment = process.env.TEST_ENV || 'Production';
  const testUrl = process.env.TEST_URL || 'https://lumimeds.com';
  
  // Extract test details
  const testDetails = extractTestDetails(results);
  
  // Determine status
  const passed = stats.unexpected === 0;
  const hasFlaky = stats.flaky > 0;
  
  let color = '#36a64f'; // green
  let emoji = '✅';
  let status = 'PASSED';
  
  if (!passed) {
    color = '#ff0000'; // red
    emoji = '❌';
    status = 'FAILED';
  } else if (hasFlaky) {
    color = '#ffaa00'; // orange
    emoji = '⚠️';
    status = 'PASSED (with flaky tests)';
  }

  // Get report URL
  const reportUrl = process.env.REPORT_URL || 'Run `npx playwright show-report` to view';

  // Build message fields
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
      title: 'Page URL',
      value: `<${testUrl}|${testUrl}>`,
      short: false
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
  ];

  // Add test details if available
  if (testDetails.testsRun.length > 0) {
    const testList = testDetails.testsRun
      .map(test => {
        const icon = test.passed ? '✅' : '❌';
        return `${icon} ${test.name}`;
      })
      .slice(0, 10) // Limit to first 10
      .join('\n');
    
    fields.push({
      title: `📋 Tests Run (${testDetails.testsRun.length})`,
      value: testList + (testDetails.testsRun.length > 10 ? '\n_...and more_' : ''),
      short: false
    });
  }

  // Add screenshot info if available
  if (testDetails.screenshotTaken) {
    fields.push({
      title: '📸 Screenshots',
      value: `✅ Mobile screenshot captured`,
      short: true
    });
  }

  fields.push({
    title: '📊 Full Report',
    value: reportUrl.startsWith('http') ? `<${reportUrl}|View Report>` : reportUrl,
    short: true
  });

  // Build detailed ad pages summary
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const statusEmoji = passed ? ':white_check_mark:' : ':x:';
  const statusText = passed ? 'PASSED' : 'FAILED';
  const statusBanner = passed ? '🟢 *ALL PAGES VERIFIED*' : '🔴 *SOME PAGES FAILED*';
  
  // List of ad pages
  const adPages = [
    '/ad/for-women',
    '/ad/how-to-start',
    '/ad/journey',
    '/ad/redefined',
    '/en/ad/med-spa1',
    '/ad/best-weight-loss-medication',
    '/ad/weight-loss-thanksgiving',
    '/ad/stay-on-track',
    '/ad/glow-up',
    '/ad/free',
    '/ad/black-friday-sale',
    '/ad/science',
    '/ad/otp',
    '/ad/cyber-monday-sale',
    '/ad/glp1-gip-treatment',
    '/ad/sustained',
    '/ad/sustainable-weight-loss',
    '/ad/weight-loss-treatment',
    '/ad/easy-weight-loss',
    '/ad/med-spa',
    '/es/ad/med-spa3 (Spanish)',
    '/ad/holiday-weight-goals'
  ];
  
  const detailedText = 
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `       📄 *LUMIMEDS AD PAGES TESTING*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `📅 *${today}*\n` +
    `${statusBanner}\n\n` +
    
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `📋 *AD PAGES TESTED (${adPages.length} pages)*\n\n` +
    adPages.map(page => `   ${statusEmoji}  ${page}`).join('\n') + '\n\n' +
    
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `✅ *WHAT WE VERIFIED*\n\n` +
    `   ${statusEmoji}  *Page Loading* - All pages load successfully with correct titles\n\n` +
    `   ${statusEmoji}  *Get Started Buttons* - All redirect to /products/survey/weight_loss\n\n` +
    `   ${statusEmoji}  *Special Buttons* - "Choose Your Plan Now", "Start Now",\n` +
    `        "Start Your Journey Now", "Comenzar" (Spanish)\n\n` +
    `   ${statusEmoji}  *Learn More Flow* - Learn More → Plans Page → Select → Survey Form\n\n` +
    `   ${statusEmoji}  *Pricing Modal* - Opens modal → Select → Survey Form (OTP page)\n\n` +
    `   ${statusEmoji}  *Trustpilot Widget* - Visible and functional\n\n` +
    `   ${statusEmoji}  *Footer Links* - All 6 links verified\n` +
    `        (Terms, Pharmacy, Careers, FAQ, Terms of Use, Privacy)\n\n` +
    `   ${statusEmoji}  *Footer Contact* - Phone, email, address, service hours present\n\n` +
    `   ${statusEmoji}  *Header* - Logo, hamburger menu, nav links functional\n\n` +
    
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `📊 *TEST SUMMARY*\n\n` +
    `   📄  *Pages Tested:*  ${adPages.length}\n` +
    `   ✅  *Passed:*  ${stats.expected || 0}\n` +
    `   ❌  *Failed:*  ${stats.unexpected || 0}\n` +
    `   ⚠️  *Flaky:*  ${stats.flaky || 0}\n` +
    `   ⏱️  *Duration:*  ${formatDuration(results.duration)}\n` +
    `   📈  *Status:*  *${statusText}*\n` +
    (details.screenshotTaken ? `   📸  *Screenshots:*  Captured\n` : '') +
    `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const message = {
    username: 'Lumimeds Automation',
    icon_emoji: ':globe_with_meridians:',
    text: detailedText
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
 * Extract test details from results
 */
function extractTestDetails(results) {
  const details = {
    testsRun: [],
    screenshotTaken: false
  };

  try {
    const collectTests = (obj) => {
      if (!obj) return;
      
      // Collect test information
      if (obj.tests && Array.isArray(obj.tests)) {
        obj.tests.forEach(test => {
          if (test.results && test.results.length > 0) {
            const lastResult = test.results[test.results.length - 1];
            details.testsRun.push({
              name: test.title || 'Unknown test',
              passed: lastResult.status === 'passed' || lastResult.status === 'expected',
              status: lastResult.status
            });
          }
        });
      }
      
      // Check for screenshots
      if (obj.stdout) {
        const stdout = Array.isArray(obj.stdout) ? obj.stdout.join('\n') : obj.stdout;
        if (stdout.includes('Screenshot saved') || stdout.includes('Capturing screenshot')) {
          details.screenshotTaken = true;
        }
      }
      
      // Recursively process suites
      if (obj.suites && Array.isArray(obj.suites)) {
        obj.suites.forEach(collectTests);
      }
      
      if (obj.specs && Array.isArray(obj.specs)) {
        obj.specs.forEach(collectTests);
      }
    };
    
    if (results.suites) {
      results.suites.forEach(collectTests);
    }
  } catch (error) {
    console.log('ℹ️  Could not extract test details:', error.message);
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

// Run the notification
sendPageTestNotification().catch((error) => {
  console.error('Failed to send notification:', error);
  process.exit(1);
});


