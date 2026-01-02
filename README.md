# 📄 Lumimeds Ad Pages Test Automation

**Branch:** `ad-pages-only`  
**Purpose:** Automated testing for all Lumimeds advertising pages

---

## 📋 What's Included

This branch contains **20 Ad Page Tests** for comprehensive testing of Lumimeds advertising pages:

### ✅ Ad Pages Tested:
- `/ad/otp`
- `/ad/med-spa`, `/ad/med-spa1`, `/ad/med-spa3`
- `/ad/weight-loss-treatment`
- `/ad/weight-loss-thanksgiving`
- `/ad/sustained`
- `/ad/sustainable-weight-loss`
- `/ad/journey`
- `/ad/glow-up`
- `/ad/science`
- `/ad/easy-weight-loss`
- `/ad/for-women`
- `/ad/free`
- `/ad/glp1-gip-treatment`
- `/ad/holiday-weight-goals`
- `/ad/how-to-start`
- `/ad/stay-on-track`
- `/ad/redefined`
- `/ad/best-weight-loss-medication`

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/sikandar-droid/Lumimeds-Automation-Tests.git
cd Lumimeds-Automation-Tests
git checkout ad-pages-only
```

### 2. Install Dependencies
```bash
npm install
npx playwright install
```

### 3. Run Tests
```bash
# Run all 22 ad pages
npm run test:all-ads

# Run a single ad page
npm run test:ad-otp

# Or run directly with Playwright
npx playwright test tests/ad-pages/Ad-otp.spec.js --project=chromium
```

---

## 📁 Project Structure

```
Lumimeds-Automation-Tests/
├── tests/
│   ├── ad-pages/              # 22 Ad page test files
│   └── pages/                 # Page Object Models for ad pages
│       └── Ad-*.js            # 22 Page objects
├── scripts/
│   └── slack-notify-pages.js  # Slack notification script
├── .github/workflows/
│   └── ad-pages-test.yml      # GitHub Actions workflow
├── playwright.config.js       # Playwright configuration
└── package.json               # npm scripts & dependencies
```

---

## 🧪 What Each Test Verifies

### ✅ Page Loading
- Page loads successfully
- Correct page title

### ✅ Navigation Elements
- "Get Started" buttons work
- "Learn More" buttons navigate correctly
- Special buttons (Plan selection, Start Now, etc.)

### ✅ Interactive Features
- Pricing modals open and work
- Plan selection flows
- Survey form navigation

### ✅ Page Components
- Trustpilot widget displays
- Footer links are valid
- Header navigation works
- Contact information present

### ✅ Screenshots
- Full page screenshots captured for visual regression

---

## 📊 Available npm Scripts

```bash
# Run individual ad page tests
npm run test:ad-otp
npm run test:ad-med-spa
npm run test:ad-weight-loss-treatment
npm run test:ad-sustained
npm run test:ad-journey
npm run test:ad-glow-up
npm run test:ad-science

# Run all ad pages at once
npm run test:all-ads

# Run with mobile viewport
npm run test:all-ads-mobile
```

---

## 🤖 GitHub Actions (CI/CD)

The workflow file `.github/workflows/ad-pages-test.yml` is included but **scheduled runs are disabled by default**.

To enable automated daily runs, uncomment the schedule section:

```yaml
on:
  schedule:
    - cron: '30 11 * * *' # 3:30 AM PST daily
  workflow_dispatch:
```

---

## 📱 Slack Integration

Test results can be automatically sent to Slack.

### Setup:
1. Create a Slack Incoming Webhook
2. Set environment variable:
   ```bash
   export SLACK_WEBHOOK_URL="your-webhook-url"
   ```
3. Tests will automatically send results to Slack

---

## 🔧 Configuration

### Playwright Config (`playwright.config.js`)
- **Browser:** Chromium (default)
- **Workers:** 3 (optimized for CI)
- **Viewport:** iPhone 15 Pro Max (430x932)
- **Timeout:** 90 seconds per test
- **Retries:** 1 retry on failure

---

## 📸 Screenshots

Screenshots are automatically saved to:
```
screenshots/mobile/ad_[page-name].png
```

---

## 🛠️ Tech Stack

- **Playwright** - Test automation framework
- **Node.js** - Runtime environment
- **GitHub Actions** - CI/CD automation
- **Slack API** - Test reporting

---

## 📞 Support

For questions or issues, contact the test automation team.

---

## ⚡ Quick Commands Cheat Sheet

```bash
# Install & Setup
npm install && npx playwright install

# Run all tests
npm run test:all-ads

# Run single test
npx playwright test tests/ad-pages/Ad-otp.spec.js --project=chromium

# Run with headed browser (see the test run)
npx playwright test tests/ad-pages/Ad-otp.spec.js --project=chromium --headed

# View last test report
npx playwright show-report

# List all tests without running
npx playwright test --list
```

---

**Happy Testing! 🚀**

