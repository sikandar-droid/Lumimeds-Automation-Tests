#!/bin/bash

# Daily Checkout Test - Runs at 3:30 AM PST
# This script runs the staging checkout test and sends results to Slack

# Set Slack webhook URL
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/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"

# Change to project directory
cd /Users/macbookpro/Desktop/Lumimeds

# Log start time
echo "========================================" >> /Users/macbookpro/Desktop/Lumimeds/logs/daily-test.log
echo "Daily test started at: $(date)" >> /Users/macbookpro/Desktop/Lumimeds/logs/daily-test.log

# Run the staging checkout test
npm run test:checkout-staging >> /Users/macbookpro/Desktop/Lumimeds/logs/daily-test.log 2>&1

# Log completion
echo "Daily test completed at: $(date)" >> /Users/macbookpro/Desktop/Lumimeds/logs/daily-test.log
echo "========================================" >> /Users/macbookpro/Desktop/Lumimeds/logs/daily-test.log


