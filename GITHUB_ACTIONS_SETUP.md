# 🚀 GitHub Actions Setup Guide

Run your Playwright tests automatically in the cloud using GitHub Actions - no need to keep your Mac on!

## ✅ What You Get

- ☁️ **Cloud-based testing** - Runs on GitHub servers (free for public repos)
- 🤖 **Automatic daily runs** - 3:30 AM PST every day
- 📱 **Slack notifications** - Automatic results posted to Slack
- 🎯 **Manual triggers** - Run tests on-demand from GitHub UI
- 📊 **Test artifacts** - Screenshots, reports saved for 30 days
- 💰 **Free** - 2,000 minutes/month for private repos, unlimited for public

---

## 📋 Setup Steps (5 Minutes)

### Step 1: Add Slack Webhook Secret to GitHub

1. **Go to your GitHub repository**
   - Navigate to: `https://github.com/YOUR_USERNAME/Lumimeds`

2. **Open Settings**
   - Click **Settings** tab at the top

3. **Go to Secrets**
   - In left sidebar: **Secrets and variables** → **Actions**

4. **Add New Secret**
   - Click **"New repository secret"**
   - Name: `SLACK_WEBHOOK_URL`
   - Value: `<YOUR_NEW_SLACK_WEBHOOK_URL_HERE>`
   - Click **"Add secret"**
   - ⚠️ **NEVER** commit the actual webhook URL to your repository!

### Step 2: Push the Workflow to GitHub

```bash
cd /Users/macbookpro/Desktop/Lumimeds

# Add the workflow file
git add .github/workflows/daily-checkout-test.yml

# Commit it
git commit -m "Add GitHub Actions workflow for daily checkout tests"

# Push to GitHub
git push origin main
```

### Step 3: Verify It's Working

1. Go to your GitHub repo
2. Click **"Actions"** tab
3. You should see **"Daily Checkout Test"** workflow listed

### Step 4: Test It Now (Don't Wait for 3:30 AM!)

1. In GitHub Actions tab, click **"Daily Checkout Test"**
2. Click **"Run workflow"** button (top right)
3. Select **"staging"** environment
4. Click **"Run workflow"**
5. Watch it run! Check Slack for notification when done

---

## 🎯 How It Works

### Automatic Daily Runs

The workflow runs **automatically every day at 3:30 AM PST**:

```yaml
schedule:
  - cron: '30 11 * * *'  # 3:30 AM PST
```

- No Mac needed - runs on GitHub servers
- Always runs (unless you disable it)
- Results sent to Slack automatically

### What Gets Tested

**Default (Automatic Daily):**
- Staging checkout flow
- Test credit card
- Full onboarding → plan selection → checkout

**Manual Runs (Your Choice):**
- Staging OR Production
- Run anytime from GitHub UI

---

## 🎮 Running Tests Manually

### From GitHub Web UI

1. Go to **Actions** tab
2. Click **"Daily Checkout Test"**
3. Click **"Run workflow"**
4. Choose:
   - **staging** - Safe, uses test card
   - **production** - Real checkout with production card
5. Click **"Run workflow"**

### From Command Line (GitHub CLI)

```bash
# Install GitHub CLI first (if needed)
brew install gh

# Trigger workflow
gh workflow run daily-checkout-test.yml

# With production environment
gh workflow run daily-checkout-test.yml -f environment=production
```

---

## 📊 Viewing Results

### In GitHub

1. Go to **Actions** tab
2. Click on any workflow run
3. View:
   - ✅ Test results (pass/fail)
   - 📄 Full console output
   - 📊 Test artifacts (reports, screenshots)

### In Slack

You'll receive automatic notifications with:
- ✅ Pass/fail status
- 📧 Email used in test
- 💳 Payment details
- ⏱️ Duration
- 🔗 Link to GitHub run

### Download Reports

From any workflow run:
1. Scroll to **Artifacts** section
2. Download:
   - `playwright-report` - Full HTML report
   - `test-results` - JSON results
   - `screenshots` - Only if tests failed

---

## ⚙️ Configuration

### Change Schedule

Edit `.github/workflows/daily-checkout-test.yml`:

```yaml
schedule:
  # Daily at 3:30 AM PST
  - cron: '30 11 * * *'
  
  # Or every 6 hours
  - cron: '0 */6 * * *'
  
  # Or Monday-Friday only at 3:30 AM PST
  - cron: '30 11 * * 1-5'
```

Cron timezone is **UTC**. For PST:
- PST (Winter): UTC - 8 hours → 3:30 AM PST = 11:30 AM UTC
- PDT (Summer): UTC - 7 hours → 3:30 AM PDT = 10:30 AM UTC

### Run Different Tests

Edit the workflow file to run other tests:

```yaml
- name: 🧪 Run Tests
  run: |
    # Run all Ad pages
    npx playwright test tests/Ad-*.spec.js --project=chromium
    
    # Or specific test
    npx playwright test tests/Ad-otp.spec.js --project=chromium
```

### Add More Browsers

```yaml
- name: 🧪 Run on Chrome, Firefox & Safari
  run: |
    npx playwright test tests/checkout.spec.js
```

(Omit `--project=chromium` to run on all browsers)

---

## 💰 GitHub Actions Pricing

### Free Tier
- **Public repos**: Unlimited minutes
- **Private repos**: 2,000 minutes/month free

### Typical Usage
- Each test run: ~3-5 minutes
- Daily runs: ~90-150 minutes/month
- **Result**: Easily stays within free tier!

### If You Exceed Free Tier
- $0.008/minute for Linux runners
- ~$0.024-$0.040 per test run
- Still very cheap!

---

## 🔐 Security

### Secrets Management
- Slack webhook URL stored securely as GitHub Secret
- Never exposed in logs
- Only accessible during workflow runs

### Best Practices
- ✅ Use GitHub Secrets (not hardcoded)
- ✅ Limit secret access to necessary workflows
- ✅ Rotate webhook URLs periodically
- ✅ Use staging for daily tests, production for manual runs

---

## 🐛 Troubleshooting

### Workflow Not Running?

1. **Check it's enabled**
   - Actions tab → workflow → Enable if disabled

2. **Check schedule syntax**
   - Must be valid cron syntax
   - Times are in UTC

3. **Check repository settings**
   - Settings → Actions → Allow actions

### Slack Not Notified?

1. **Check secret is set**
   - Settings → Secrets → `SLACK_WEBHOOK_URL` should exist

2. **Check secret value**
   - Delete and re-add if unsure

3. **Check test completed**
   - Notification only sent if test finishes

### Tests Failing on GitHub But Not Locally?

1. **Browser differences**
   - GitHub uses Ubuntu, might behave differently

2. **Timing issues**
   - Add longer waits for slow connections

3. **Check artifacts**
   - Download screenshots to see what happened

---

## 📈 Advanced Features

### Multiple Daily Runs

Create multiple workflow files:

```bash
.github/workflows/
  ├── morning-test.yml      # 6 AM
  ├── afternoon-test.yml    # 3 PM
  └── evening-test.yml      # 9 PM
```

### Weekly Full Suite

```yaml
schedule:
  - cron: '0 8 * * 1'  # Mondays at 8 AM UTC
```

Run all Ad pages + checkout

### Matrix Testing (Multiple Browsers)

```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit]
steps:
  - run: npx playwright test --project=${{ matrix.browser }}
```

### Deploy Report to GitHub Pages

```yaml
- name: Deploy report
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./playwright-report
```

---

## 📚 Quick Reference

### Essential Commands

```bash
# Push workflow to GitHub
git add .github/workflows/
git commit -m "Add GitHub Actions"
git push

# View workflows
gh workflow list

# Run workflow manually
gh workflow run daily-checkout-test.yml

# View recent runs
gh run list --workflow=daily-checkout-test.yml

# View logs of last run
gh run view --log
```

### Useful Links

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Playwright CI Docs**: https://playwright.dev/docs/ci-github-actions
- **Cron Syntax**: https://crontab.guru/
- **Your Workflows**: `https://github.com/YOUR_USERNAME/Lumimeds/actions`

---

## ✅ Next Steps

1. ✅ Push workflow to GitHub
2. ✅ Add Slack webhook secret
3. ✅ Trigger manual test run
4. ✅ Check Slack for notification
5. ✅ Wait for tomorrow's 3:30 AM run!

---

## 🆘 Need Help?

If something isn't working:
1. Check this guide again
2. View workflow run logs in GitHub
3. Test locally first with `npm run test:checkout-staging`
4. Check Slack webhook URL is correct

