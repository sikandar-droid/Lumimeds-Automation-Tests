# Google Drive Upload Setup (Advanced - Optional)

⚠️ **Note:** Google Drive upload requires **Google Workspace with Shared Drives** or **OAuth delegation**. Service accounts don't have storage quota.

**Most users should use GitHub Artifacts instead** (which is the default fallback).

This guide explains how to set up Google Drive upload for checkout test videos if you have Google Workspace.

## Steps to Set Up:

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the **Google Drive API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Give it a name (e.g., "lumimeds-video-uploader")
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

### 3. Create and Download Service Account Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Download the JSON file

### 4. Create and Share Google Drive Folder (REQUIRED)

**This step is REQUIRED** - Service accounts don't have storage quota, so videos must be uploaded to a folder in your personal Google Drive.

1. Create a folder in **your personal Google Drive** (e.g., "Lumimeds Test Videos")
2. Right-click the folder → "Share"
3. Add the service account email (found in the JSON file as `client_email`)
4. Give it **"Editor"** permissions
5. Click "Send" (or "Done")
6. Copy the **Folder ID** from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - The Folder ID is the long string after `/folders/`
   - Example: If URL is `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`, then Folder ID is `1a2b3c4d5e6f7g8h9i0j`

### 5. Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add two secrets:

   **Secret 1: `GOOGLE_DRIVE_CREDENTIALS`**
   - Name: `GOOGLE_DRIVE_CREDENTIALS`
   - Value: Copy the entire contents of the downloaded JSON file
   
   **Secret 2: `GOOGLE_DRIVE_FOLDER_ID`** (REQUIRED)
    - Name: `GOOGLE_DRIVE_FOLDER_ID`
   - Value: The Folder ID from step 4
   - **This is REQUIRED** - Service accounts don't have storage quota, so videos must be uploaded to a folder in your personal Google Drive

### 6. Install Dependencies

The `googleapis` package is already in `package.json`. Just run:

```bash
npm install
```

## How It Works

- When tests pass and video recording is enabled, the video is automatically uploaded to Google Drive
- A shareable download link is included in the Slack notification
- Videos are named: `checkout-video-run-{RUN_NUMBER}.webm`
- Videos are automatically set to "anyone with the link can view" for easy sharing

## Testing

To test locally, you'll need to set the environment variables:

```bash
export GOOGLE_DRIVE_CREDENTIALS='{"type":"service_account",...}'
export GOOGLE_DRIVE_FOLDER_ID='your-folder-id'
export FILE_NAME='test-video.webm'
node scripts/upload-to-google-drive.js test-results/your-video.webm
```

## Troubleshooting

**Error: "GOOGLE_DRIVE_CREDENTIALS not set"**
- Make sure you added the secret in GitHub Actions secrets

**Error: "Invalid credentials"**
- Verify the JSON file was copied correctly (no extra spaces/characters)
- Make sure Google Drive API is enabled in your project

**Error: "Permission denied"**
- Make sure the service account email has access to the Drive folder (if using a folder)

