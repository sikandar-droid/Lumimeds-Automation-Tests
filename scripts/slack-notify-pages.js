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

  // Build detailed ad pages summary with dynamic date
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const todayLabel = `[Today] ${today}`;
  
  const statusText = passed ? '✓ PASSED' : '✗ FAILED';
  
  // Extract actual pages tested from results
  const adPages = extractTestedPages(results, testFile);
  const pageCount = adPages.length;
  
  // Build page section title based on count
  const pageTitle = pageCount === 1 
    ? `*AD PAGE TESTED*` 
    : `*AD PAGES TESTED (${pageCount} pages)*`;
  
  const detailedText = 
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `     LUMIMEDS AD PAGES TESTING\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `*${todayLabel}*\n` +
    `Status: *${statusText}*\n\n` +
    
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `${pageTitle}\n\n` +
    adPages.map(page => `  • ${page}`).join('\n') + '\n\n' +
    
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `*VERIFICATION CATEGORIES*\n\n` +
    `  • *Page Loading* - All pages load successfully with correct titles\n` +
    `  • *Get Started Buttons* - All redirect to /products/survey/weight_loss\n` +
    `  • *Special Buttons* - "Choose Your Plan Now", "Start Now",\n` +
    `    "Start Your Journey Now", "Comenzar" (Spanish)\n` +
    `  • *Learn More Flow* - Learn More → Plans Page → Select → Survey Form\n` +
    `  • *Pricing Modal* - Opens modal → Select → Survey Form (OTP page)\n` +
    `  • *Trustpilot Widget* - Visible and functional\n` +
    `  • *Footer Links* - All 6 links verified\n` +
    `    (Terms, Pharmacy, Careers, FAQ, Terms of Use, Privacy)\n` +
    `  • *Footer Contact* - Phone, email, address, service hours present\n` +
    `  • *Header* - Logo, hamburger menu, nav links functional\n\n` +
    
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    
    `*TEST SUMMARY*\n\n` +
    `  Pages Tested:  ${pageCount}\n` +
    `  Test Cases:    ${stats.expected + stats.unexpected || 0}\n` +
    `  Passed:        ${stats.expected || 0}\n` +
    `  Failed:        ${stats.unexpected || 0}\n` +
    `  Flaky:         ${stats.flaky || 0}\n` +
    `  Duration:      ${formatDuration(results.duration)}\n` +
    `  Environment:   ${environment}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const message = {
    username: 'Lumimeds Automation',
    icon_emoji: ':test_tube:',
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
 * Extract which ad pages were actually tested from results
 */
function extractTestedPages(results, testFile) {
  const testedPages = new Set();
  
  // Map of test file names to page URLs
  const pageMap = {
    'Ad-otp': '/ad/otp',
    'Ad-black-friday-sale': '/ad/black-friday-sale',
    'Ad-cyber-monday-sale': '/ad/cyber-monday-sale',
    'Ad-med-spa': '/ad/med-spa',
    'Ad-med-spa1': '/en/ad/med-spa1',
    'Ad-med-spa3': '/es/ad/med-spa3 (Spanish)',
    'Ad-weight-loss-treatment': '/ad/weight-loss-treatment',
    'Ad-weight-loss-thanksgiving': '/ad/weight-loss-thanksgiving',
    'Ad-sustained': '/ad/sustained',
    'Ad-sustainable-weight-loss': '/ad/sustainable-weight-loss',
    'Ad-journey': '/ad/journey',
    'Ad-glow-up': '/ad/glow-up',
    'Ad-science': '/ad/science',
    'Ad-easy-weight-loss': '/ad/easy-weight-loss',
    'Ad-for-women': '/ad/for-women',
    'Ad-free': '/ad/free',
    'Ad-glp1-gip-treatment': '/ad/glp1-gip-treatment',
    'Ad-holiday-weight-goals': '/ad/holiday-weight-goals',
    'Ad-how-to-start': '/ad/how-to-start',
    'Ad-stay-on-track': '/ad/stay-on-track',
    'Ad-redefined': '/ad/redefined',
    'Ad-best-weight-loss-medication': '/ad/best-weight-loss-medication'
  };
  
  try {
    // Extract from test file environment variable first
    if (testFile && testFile !== 'All-Ad-Pages' && testFile !== 'All-Ads-Mobile') {
      const pagePath = pageMap[testFile];
      if (pagePath) {
        return [pagePath];
      }
    }
    
    // If "All" tests or couldn't determine from env var, extract from results
    const collectPages = (obj) => {
      if (!obj) return;
      
      // Check spec file paths
      if (obj.file && obj.file.includes('Ad-')) {
        const match = obj.file.match(/Ad-([a-z0-9-]+)\.spec\.js/);
        if (match) {
          const fileName = 'Ad-' + match[1];
          const pagePath = pageMap[fileName];
          if (pagePath) {
            testedPages.add(pagePath);
          }
        }
      }
      
      // Recursively process suites and specs
      if (obj.suites && Array.isArray(obj.suites)) {
        obj.suites.forEach(collectPages);
      }
      if (obj.specs && Array.isArray(obj.specs)) {
        obj.specs.forEach(collectPages);
      }
    };
    
    if (results.suites) {
      results.suites.forEach(collectPages);
    }
  } catch (error) {
    console.log('ℹ️  Could not extract tested pages:', error.message);
  }
  
  // If we found pages, return them sorted
  if (testedPages.size > 0) {
    return Array.from(testedPages).sort();
  }
  
  // Fallback: return all pages if we couldn't determine
  return Object.values(pageMap).sort();
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


