# Slack Video Upload Setup

This guide explains how to upload test videos directly to Slack (simpler than Google Drive).

## Why Slack Instead of Google Drive?

- ✅ **Simpler setup** - No Google Cloud project needed
- ✅ **Direct upload** - Video appears immediately in Slack channel
- ✅ **Team access** - Everyone in the channel can view it
- ✅ **No extra permissions** - Uses your existing Slack workspace

## Setup Steps

### 1. Create a Slack App (if you don't have one)

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Name: `Lumimeds Test Bot` (or any name)
5. Select your workspace
6. Click **"Create App"**

### 2. Add Bot Token Scopes

1. In your app settings, go to **"OAuth & Permissions"** (left sidebar)
2. Scroll to **"Scopes"** → **"Bot Token Scopes"**
3. Click **"Add an OAuth Scope"** and add these **REQUIRED** scopes:
   - `files:write` (required - to upload files)
   - `files:read` (required - to complete upload)
   - `chat:write` (required - to post messages with files)
   - `channels:read` (optional - to list channels)

### 3. Install App to Workspace

1. Scroll to top of **"OAuth & Permissions"** page
2. Click **"Install to Workspace"**
3. Click **"Allow"** to grant permissions
4. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)
   - Example: `xoxb-1234-5678-XXXX-YourTokenHere`

### 4. Invite Bot to Your Channel

1. Go to your Slack channel (e.g., `#test-notifications`)
2. Type: `/invite @Lumimeds Test Bot` (or your bot name)
3. The bot will join the channel

### 5. Get Channel ID

**Option A: From Slack Desktop App**
1. Right-click your channel name
2. Click **"View channel details"**
3. Scroll to bottom - Channel ID is shown
4. Example: `C08479Z15N9`

**Option B: From URL**
1. Open your channel in Slack
2. Look at the URL: `https://app.slack.com/client/T07JLMUGJQM/C08479Z15N9`
  3. The last part is your Channel ID: `C08479Z15N9`

### 6. Add Secrets to GitHub

Go to your repository → **Settings** → **Secrets and variables** → **Actions**

**Secret 1: `SLACK_BOT_TOKEN`** (REQUIRED)
- Name: `SLACK_BOT_TOKEN`
- Value: Your bot token from step 3 (format: xoxb-NUMBERS-NUMBERS-LETTERS)

**Secret 2: `SLACK_CHANNEL`** (OPTIONAL)
- Name: `SLACK_CHANNEL`
- Value: Your channel ID from step 5
- Example: `C08479Z15N9`
- If not set, defaults to `C08479Z15N9`

## Testing Locally

1. Create a `.env` file (if you don't have one):

```bash
SLACK_BOT_TOKEN=xoxb-YOUR-TOKEN-HERE
SLACK_CHANNEL=C08479Z15N9
```

2. Run a test with video recording:

```bash
npm run test:checkout-prod-record
```

3. The video will be uploaded to your Slack channel!

## How It Works

1. Playwright records the test video
2. After test passes, script finds the video file
3. Video is uploaded directly to Slack using `files.upload` API
4. Link appears in the notification message
5. Team can view/download video from Slack

## Troubleshooting

### Error: `not_in_channel`
- The bot hasn't been invited to the channel
- Solution: Type `/invite @YourBotName` in the channel

### Error: `missing_scope`
- The bot doesn't have required permissions
- Solution: Go to OAuth & Permissions → Add `files:write` scope → Reinstall app

### Error: `invalid_auth`
- The token is incorrect or expired
- Solution: Copy the token again from OAuth & Permissions page

### Error: `channel_not_found`
- The channel ID is incorrect
- Solution: Check the channel ID in channel details or URL

## File Size Limits

- **Free Slack**: 5 GB per file
- **Pro/Business+**: 10+ GB per file
- Test videos are typically 5-20 MB, so no issues!

## Privacy

- Videos are only accessible to Slack workspace members
- Videos are stored on Slack's servers (not public internet)
- Videos can be deleted from Slack channel if needed

## Comparison: Slack vs Google Drive

| Feature | Slack Upload | Google Drive |
|---------|-------------|--------------|
| Setup complexity | ⭐ Simple | ⭐⭐⭐ Complex |
| Initial setup time | 5 minutes | 20+ minutes |
| File access | Workspace members | Anyone with link |
| Storage location | Slack servers | Google Drive |
| Download speed | Fast | Fast |
| Best for | Internal team | External sharing |

**Recommendation**: Use Slack upload for internal testing, Google Drive for client deliverables.

