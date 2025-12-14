# Slack Integration for Playwright Tests

This guide explains how to automatically send Playwright test results to Slack.

## Setup Instructions

### 1. Create Slack Incoming Webhook

1. Go to https://api.slack.com/messaging/webhooks
2. Click "Create New App" or select existing app
3. Choose "From scratch" and name it (e.g., "Lumimeds Test Bot")
4. Select your workspace
5. Under "Features" → "Incoming Webhooks", toggle it ON
6. Click "Add New Webhook to Workspace"
7. Select the channel where you want notifications (e.g., #test-results)
8. Copy the webhook URL (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX`)

### 2. Set Environment Variable

Add this to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

Or create a `.env` file in the project root (NOT committed to git):

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
REPORT_URL=http://localhost:9323  # Optional: URL to your test report
```

Then reload your shell:
```bash
source ~/.zshrc
```

### 3. Run Tests with Slack Notifications

Now you can run tests and automatically get Slack notifications:

#### Checkout Tests
```bash
# Production checkout test
npm run test:checkout-prod

# Staging checkout test
npm run test:checkout-staging

# Production checkout in headed mode (watch browser)
npm run test:checkout-prod-headed
```

#### Individual Ad Page Tests
```bash
# OTP page
npm run test:ad-otp

# Black Friday Sale page
npm run test:ad-black-friday

# Cyber Monday Sale page
npm run test:ad-cyber-monday

# Med Spa page
npm run test:ad-med-spa

# Weight Loss Treatment page
npm run test:ad-weight-loss-treatment

# Sustained page
npm run test:ad-sustained

# Journey page
npm run test:ad-journey

# Glow Up page
npm run test:ad-glow-up

# Science page
npm run test:ad-science
```

#### Run All Ad Pages at Once
```bash
# Run all Ad page tests together
npm run test:all-ads

# Run all Ad page tests (mobile)
npm run test:all-ads-mobile
```

#### Other Tests
```bash
# Footer links navigation
npm run test:footer-links
```

## What Gets Sent to Slack?

The notification includes:
- ✅ Test status (Pass/Fail)
- 📊 Test statistics (passed, failed, flaky)
- 🌍 Environment (Production/Staging)
- 🔗 Test URL
- ⏱️ Test duration
- 🔗 Link to HTML report (if REPORT_URL is set)

## Example Slack Message

```
🎭 Playwright Test Results: checkout-prod

Environment: Production
Test URL: https://lumimeds.com

✅ Passed: 1
❌ Failed: 0
⚠️ Flaky: 0
⏱️ Duration: 1m 54s

View Report → http://localhost:9323
```

## Manual Notification (Testing)

To test the Slack integration without running tests:

```bash
node scripts/slack-notify.js
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Run Checkout Tests

on:
  schedule:
    - cron: '0 9 * * *'  # Run daily at 9 AM
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install chromium
        
      - name: Run Production Checkout Test
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          TEST_FILE: 'checkout-prod'
          TEST_ENV: 'Production'
          TEST_URL: 'https://lumimeds.com'
        run: npm run test:checkout-prod
        
      - name: Upload Playwright Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    
    triggers {
        cron('0 9 * * *')  // Run daily at 9 AM
    }
    
    environment {
        SLACK_WEBHOOK_URL = credentials('slack-webhook-url')
    }
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install chromium'
            }
        }
        
        stage('Test Production Checkout') {
            steps {
                sh 'npm run test:checkout-prod'
            }
        }
    }
    
    post {
        always {
            publishHTML([
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
```

## Customization

You can modify `scripts/slack-notify.js` to:
- Change message format
- Add more details (email used, coupon code, etc.)
- Include screenshots
- Mention specific users on failure
- Send to different channels based on results

## Troubleshooting

### Notification not sent?
1. Check that `SLACK_WEBHOOK_URL` is set: `echo $SLACK_WEBHOOK_URL`
2. Verify webhook URL is correct in Slack settings
3. Check that `test-results.json` exists after test run
4. Run `node scripts/slack-notify.js` manually to see errors

### Tests pass but script fails?
The `&&` operator means the notification only runs if tests pass. To always send notifications (even on failure), modify package.json scripts:

```json
"test:checkout-prod": "TEST_FILE='checkout-prod' TEST_ENV='Production' TEST_URL='https://lumimeds.com' npx playwright test tests/checkout-prod.spec.js --project=chromium; node scripts/slack-notify.js"
```

(Use `;` instead of `&&`)

## Support

For more information:
- Playwright Reporters: https://playwright.dev/docs/test-reporters
- Slack Incoming Webhooks: https://api.slack.com/messaging/webhooks

