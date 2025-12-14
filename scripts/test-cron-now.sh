#!/bin/bash

# Test the daily cron job manually (without waiting for 3:30 AM)

echo "🧪 Testing the daily checkout test script..."
echo ""

/Users/macbookpro/Desktop/Lumimeds/scripts/daily-checkout-test.sh

echo ""
echo "✅ Test complete! Check the log file:"
echo "   tail -f /Users/macbookpro/Desktop/Lumimeds/logs/daily-test.log"


