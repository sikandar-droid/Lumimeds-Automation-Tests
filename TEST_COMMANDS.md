# 🧪 Lumimeds Test Commands Reference

Quick reference for running Playwright tests with automatic Slack notifications.

## 🛒 Checkout Tests

| Command | Description | Environment |
|---------|-------------|-------------|
| `npm run test:checkout-prod` | Full checkout flow with production card | Production (lumimeds.com) |
| `npm run test:checkout-staging` | Full checkout flow with test card | Staging |
| `npm run test:checkout-prod-headed` | Checkout test with visible browser | Production (lumimeds.com) |

**What's tested:**
- Complete onboarding flow
- Plan selection
- Coupon removal and application
- Payment processing
- Order completion

---

## 📄 Individual Ad Page Tests

| Command | Description | Page URL |
|---------|-------------|----------|
| `npm run test:ad-otp` | OTP page functionality | /ad/otp |
| `npm run test:ad-med-spa` | Med Spa page | /ad/med-spa |
| `npm run test:ad-weight-loss-treatment` | Weight loss treatment page | /ad/weight-loss-treatment |
| `npm run test:ad-sustained` | Sustained page | /ad/sustained |
| `npm run test:ad-journey` | Journey page | /ad/journey |
| `npm run test:ad-glow-up` | Glow Up page | /ad/glow-up |
| `npm run test:ad-science` | Science page | /ad/science |

**What's tested per page:**
- ✅ Page loads successfully
- ✅ Correct page title
- ✅ Get Started buttons are clickable
- ✅ Navigation to survey page
- ✅ Popup functionality
- ✅ Footer links are clickable
- ✅ Contact information is present
- ✅ Trustpilot widget works
- 📸 Full page screenshot captured

---

## 🔄 Batch Tests

| Command | Description | Coverage |
|---------|-------------|----------|
| `npm run test:all-ads` | Run all Ad page tests | All 22+ Ad pages |
| `npm run test:all-ads-mobile` | Run all Ad page tests (mobile) | All Ad pages on mobile viewport |
| `npm run test:footer-links` | Test footer navigation | Footer links across site |

---

## 📊 Slack Notifications

Each command automatically sends a notification to Slack with:

### For Checkout Tests:
```
✅ Checkout Test Passed - Production

🛒 checkout-prod - Checkout Flow Test

Status: ✅ SUCCESS
Environment: Production
Test URL: https://lumimeds.com

📧 Customer Email: sikandar.naeem+XXXXX@devslooptech.com
🎫 Coupon Applied: 99offfromjustin
💳 Payment Card: 4246...6655

✅ Passed: 1
❌ Failed: 0
⏱️ Duration: 1m 54s
```

### For Page Tests:
```
✅ Page Tests Passed - Ad-otp

📄 Ad-otp - Functional Tests

Status: ✅ PASSED
Page URL: https://lumimeds.com/ad/otp

📋 Tests Run (9):
✅ should load page successfully
✅ should have correct page title
✅ should have clickable Get Started buttons
✅ should navigate to survey page
✅ should have working Trustpilot widget
✅ should have all footer links clickable
✅ should verify contact information
📸 Screenshots: ✅ Mobile screenshot captured

⏱️ Duration: 45s
```

---

## 🔧 Manual Notifications

Send the last test results to Slack manually:
```bash
npm run notify:slack
```

---

## 🤖 Scheduling Tests

### Option 1: cron (Mac/Linux)

Run checkout test daily at 9 AM:
```bash
crontab -e
```

Add this line:
```cron
0 9 * * * cd /Users/macbookpro/Desktop/Lumimeds && npm run test:checkout-prod
```

Run all Ad page tests weekly on Monday at 8 AM:
```cron
0 8 * * 1 cd /Users/macbookpro/Desktop/Lumimeds && npm run test:all-ads
```

### Option 2: Create a daily test script

Create `daily-tests.sh`:
```bash
#!/bin/bash
cd /Users/macbookpro/Desktop/Lumimeds

echo "🚀 Running daily tests..."

# Monday: Run all tests
if [ $(date +%u) -eq 1 ]; then
    npm run test:all-ads
    npm run test:checkout-prod
# Other days: Just checkout
else
    npm run test:checkout-prod
fi

echo "✅ Daily tests completed!"
```

Make executable and schedule:
```bash
chmod +x daily-tests.sh
crontab -e
# Add: 0 9 * * * /Users/macbookpro/Desktop/Lumimeds/daily-tests.sh
```

---

## 🎯 Common Usage Patterns

### Morning Check (before work)
```bash
# Quick checkout verification
npm run test:checkout-prod
```

### Weekly Full Test Suite
```bash
# Run all Ad pages + checkout
npm run test:all-ads && npm run test:checkout-prod
```

### Deploy Verification
```bash
# After deploying to production
npm run test:checkout-prod
npm run test:footer-links
npm run test:ad-otp
```

### Debug Mode (watch browser)
```bash
# See what's happening in real-time
npm run test:checkout-prod-headed
```

---

## 📖 More Information

- **Setup Guide:** See `SLACK_INTEGRATION.md`
- **Test Files:** Located in `tests/` directory
- **Scripts:** Located in `scripts/` directory
- **Reports:** Run `npx playwright show-report` to view HTML reports

---

## 🆘 Need Help?

### Test failed?
1. Check the Slack notification for error details
2. Run `npx playwright show-report` to see full report
3. Re-run with headed mode: `npm run test:checkout-prod-headed`

### Slack not working?
1. Check webhook URL: `echo $SLACK_WEBHOOK_URL`
2. Run setup: `./scripts/setup-slack.sh`
3. Test manually: `npm run notify:slack`

### See all available commands:
```bash
npm run
```


