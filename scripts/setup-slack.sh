#!/bin/bash

echo "🚀 Lumimeds Slack Integration Setup"
echo "===================================="
echo ""

# Check if webhook URL is already set
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    echo "✅ SLACK_WEBHOOK_URL is already set in your environment"
    echo ""
else
    echo "📝 SLACK_WEBHOOK_URL is not set"
    echo ""
    echo "To set it up:"
    echo "1. Go to: https://api.slack.com/messaging/webhooks"
    echo "2. Create a new webhook for your Slack channel"
    echo "3. Copy the webhook URL"
    echo ""
    read -p "Enter your Slack Webhook URL: " webhook_url
    
    if [ ! -z "$webhook_url" ]; then
        # Determine shell config file
        if [ -f "$HOME/.zshrc" ]; then
            config_file="$HOME/.zshrc"
        elif [ -f "$HOME/.bashrc" ]; then
            config_file="$HOME/.bashrc"
        else
            config_file="$HOME/.bash_profile"
        fi
        
        echo "" >> "$config_file"
        echo "# Lumimeds Test Automation - Slack Integration" >> "$config_file"
        echo "export SLACK_WEBHOOK_URL=\"$webhook_url\"" >> "$config_file"
        
        echo ""
        echo "✅ Added SLACK_WEBHOOK_URL to $config_file"
        echo ""
        echo "⚠️  Please run: source $config_file"
        echo "   Or restart your terminal for changes to take effect"
    else
        echo "❌ No webhook URL provided"
        exit 1
    fi
fi

echo ""
echo "📋 Available Commands:"
echo "   npm run test:checkout-prod        - Run production checkout test + Slack notify"
echo "   npm run test:checkout-staging     - Run staging checkout test + Slack notify"
echo "   npm run test:checkout-prod-headed - Run production test in headed mode + notify"
echo "   npm run notify:slack              - Send last test results to Slack"
echo ""
echo "📖 For more info, see: SLACK_INTEGRATION.md"
echo ""


