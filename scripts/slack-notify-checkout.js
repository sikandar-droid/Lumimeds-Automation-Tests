const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced Slack notification for checkout tests
 * Extracts email, coupon code, and other checkout-specific details
 */
async function sendCheckoutNotification() {
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
  const testFile = process.env.TEST_FILE || 'checkout-prod';
  const environment = process.env.TEST_ENV || 'Production';
  const testUrl = process.env.TEST_URL || 'https://lumimeds.com';
  
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

  // Build detailed checkout summary
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const statusEmoji = passed ? ':white_check_mark:' : ':x:';
  const statusText = passed ? 'PASSED' : 'FAILED';
  
  const detailedText = `*Today's Automated Checkout Summary — ${today}*\n\n` +
    `*Checkout Flow*\n\n` +
    `Tested the complete flow of the Survey Form. ${statusEmoji}\n\n` +
    `Product pricing is correct ${statusEmoji}\n\n` +
    `Promos being applied correctly ${statusEmoji}\n\n` +
    `Promo on relevant medication on product summary ${statusEmoji}\n\n` +
    `Patient info such as Name, DOB, Address, Phone Number saved correctly ${statusEmoji}\n\n` +
    `All questions verified and functioning as expected. ${statusEmoji}\n\n` +
    `*Product Summary Form*\n\n` +
    `Successfully navigated to the Product Summary Form. ${statusEmoji}\n\n` +
    `Page flow and transitions working smoothly. ${statusEmoji}\n\n` +
    `---\n` +
    `*Test Details:*\n` +
    `• Environment: ${environment}\n` +
    `• URL: ${testUrl}\n` +
    (checkoutDetails.email ? `• Email: \`${checkoutDetails.email}\`\n` : '') +
    (checkoutDetails.couponCode ? `• Coupon: \`${checkoutDetails.couponCode}\`\n` : '') +
    `• Duration: ${formatDuration(results.duration)}\n` +
    `• Status: *${statusText}*`;

  const message = {
    username: 'Lumimeds Checkout Bot',
    icon_emoji: ':shopping_bags:',
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

// Run the notification
sendCheckoutNotification().catch((error) => {
  console.error('Failed to send notification:', error);
  process.exit(1);
});


