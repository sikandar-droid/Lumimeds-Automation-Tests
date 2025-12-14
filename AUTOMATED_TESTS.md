# 🤖 Automated Daily Tests

Your Lumimeds checkout tests are now configured to run automatically every day at **3:30 AM PST**.

## ✅ What's Configured

- **Schedule:** Daily at 3:30 AM PST
- **Test:** Staging checkout flow
- **Notifications:** Automatic Slack notifications
- **Logs:** Stored in `logs/daily-test.log`

---

## 📋 Quick Commands

### View Current Schedule
```bash
crontab -l
```

### Test the Automation Now (without waiting)
```bash
./scripts/test-cron-now.sh
```

### View Test Logs
```bash
# View all logs
cat logs/daily-test.log

# Watch logs in real-time
tail -f logs/daily-test.log

# View last 50 lines
tail -50 logs/daily-test.log
```

### Clear Old Logs
```bash
# Clear the log file
> logs/daily-test.log

# Or delete it
rm logs/daily-test.log
```

---

## 🔧 Managing the Automated Tests

### Disable Daily Tests
```bash
crontab -l | grep -v "daily-checkout-test.sh" | crontab -
```

### Change the Schedule
```bash
# Edit crontab
crontab -e

# Cron format: minute hour day month dayofweek
# Examples:
# 30 3 * * *     = Every day at 3:30 AM
# 0 9 * * 1      = Every Monday at 9:00 AM
# 0 */6 * * *    = Every 6 hours
# 30 3 * * 1-5   = Weekdays at 3:30 AM
```

### Run Different Test
Edit `scripts/daily-checkout-test.sh` and change the test command:

```bash
# For production checkout
npm run test:checkout-prod

# For all Ad pages
npm run test:all-ads

# For specific page
npm run test:ad-otp
```

---

## 🎯 What Happens During Automated Run

1. **3:30 AM PST** - Cron triggers the script
2. **Script starts** - Logs timestamp
3. **Test runs** - Full staging checkout flow
4. **Slack notification** - Results sent to your Slack channel
5. **Logs saved** - Output written to `logs/daily-test.log`

---

## 📊 Monitoring

### Check if Cron is Running
```bash
# View system logs for cron (macOS)
log show --predicate 'process == "cron"' --last 1d --info
```

### Verify Last Run
```bash
# Check log file modified time
ls -lh logs/daily-test.log

# Check last few entries
tail logs/daily-test.log
```

### Check Slack Channel
Your Slack channel should show:
- ✅ Daily notifications at ~3:30 AM PST
- Test results with customer email
- Duration and pass/fail status

---

## ⚠️ Important Notes

### macOS Sleep/Power
- If your Mac is **asleep** at 3:30 AM, the test **won't run**
- Keep your Mac powered on and awake, OR
- Run tests during hours when your Mac is on

### Alternative: Run on Wake
To run the test when your Mac wakes up:
```bash
# Create a LaunchAgent (more reliable than cron for laptops)
# See: https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html
```

### Timezone Changes
- The cron job uses your **system timezone**
- If you travel or change timezone, the test will run at 3:30 AM in the **new timezone**
- To keep it PST-specific, you'd need to adjust after timezone changes

---

## 🔍 Troubleshooting

### Test didn't run?
1. Check if cron job exists: `crontab -l`
2. Check Mac was on and awake at 3:30 AM
3. Check logs: `cat logs/daily-test.log`
4. Test manually: `./scripts/test-cron-now.sh`

### Slack notification not sent?
1. Check webhook URL in `scripts/daily-checkout-test.sh`
2. Verify Slack webhook is still valid
3. Check if test actually passed (notifications only on completion)

### Script errors?
1. Check script permissions: `ls -l scripts/daily-checkout-test.sh`
2. Verify paths in script are correct
3. Test manually to see error output

---

## 📈 Advanced Options

### Multiple Daily Tests
Add more cron entries:
```bash
crontab -e

# Add:
30 3 * * * /Users/macbookpro/Desktop/Lumimeds/scripts/daily-checkout-test.sh
0 12 * * * /Users/macbookpro/Desktop/Lumimeds/scripts/midday-test.sh
0 18 * * * /Users/macbookpro/Desktop/Lumimeds/scripts/evening-test.sh
```

### Weekly Full Test Suite
Run all Ad pages once a week:
```bash
# Every Monday at 4:00 AM
0 4 * * 1 cd /Users/macbookpro/Desktop/Lumimeds && npm run test:all-ads
```

### Custom Notifications
Edit the script to add custom Slack messages or email notifications.

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review `SLACK_INTEGRATION.md`
3. Check `TEST_COMMANDS.md` for all available tests
4. Test manually first: `./scripts/test-cron-now.sh`


