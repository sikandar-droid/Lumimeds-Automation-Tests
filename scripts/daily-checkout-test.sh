#!/bin/bash

# Daily Checkout Test - Runs at 3:30 AM PST
# This script runs the staging checkout test and sends results to Slack

# Set Slack webhook URL from environment variable
# Make sure SLACK_WEBHOOK_URL is set in your environment before running this script
# You can set it in your shell profile or pass it when running:
# SLACK_WEBHOOK_URL="your-webhook-url" ./scripts/daily-checkout-test.sh

if [ -z "$SLACK_WEBHOOK_URL" ]; then
    echo "❌ ERROR: SLACK_WEBHOOK_URL environment variable is not set"
    echo "Please set it before running this script:"
    echo "  export SLACK_WEBHOOK_URL='your-webhook-url'"
    exit 1
fi

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


