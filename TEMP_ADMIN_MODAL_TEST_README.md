# 🧪 Temporary Admin Modal Test

## 📋 Purpose
Test the new admin modal functionality on ad pages when clicking "Get Started" button.

## ✅ What This Tests

### Test 1: Admin Logged In
**Expected Behavior:**
- ✅ Modal appears when admin clicks "Get Started"
- ✅ Modal explains this is for Patient flow
- ✅ Modal has "Continue as Patient" button
- ✅ Modal has "Cancel/Stay in Admin" button
- ✅ Cancel button closes modal and stays on ad page

### Test 2: Not Logged In (Unauthenticated)
**Expected Behavior:**
- ✅ NO modal appears
- ✅ Normal flow continues (redirect to questionnaire/form)

### Test 3: Modal Inspection
**Expected Behavior:**
- ✅ Takes screenshot of modal
- ✅ Logs all modal content and buttons
- ✅ Helps debug modal structure

## 🚀 How to Run

### Run All Tests (All Ad Pages)
```bash
npx playwright test tests/temp-admin-modal-test.spec.js --headed
```

### Run Specific Test
```bash
# Test admin login flow only
npx playwright test tests/temp-admin-modal-test.spec.js --headed -g "Admin logged in"

# Test unauthenticated flow only
npx playwright test tests/temp-admin-modal-test.spec.js --headed -g "Not logged in"

# Inspect modal details
npx playwright test tests/temp-admin-modal-test.spec.js --headed -g "View modal content"

# Quick single page test
npx playwright test tests/temp-admin-modal-test.spec.js --headed -g "Quick Test"
```

### Run on Specific Browser
```bash
# Chrome
npx playwright test tests/temp-admin-modal-test.spec.js --project=chromium --headed

# Firefox
npx playwright test tests/temp-admin-modal-test.spec.js --project=firefox --headed

# Safari
npx playwright test tests/temp-admin-modal-test.spec.js --project=webkit --headed
```

### Run Without Headed Mode (Faster)
```bash
npx playwright test tests/temp-admin-modal-test.spec.js
```

## 📊 Test Coverage

The test covers these ad pages:
- ✅ /ad/med-spa1
- ✅ /ad/med-spa2
- ✅ /ad/med-spa3
- ✅ /ad/weight-loss-for-women
- ✅ /ad/semaglutide-telemedicine
- ✅ /ad/ozempic-online
- ✅ /ad/weight-loss-program

## 🔧 Configuration

**Test Environment:**
- Admin Portal: `https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com/admin/login`
- Ad Pages: `https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com/ad/*`
- Admin Credentials:
  - Email: `sikandar.naeem@devslooptech.com`
  - Password: `Test@123`

## 📸 Screenshots

The "View modal content details" test will save a screenshot:
- **File:** `admin-modal-screenshot.png`
- **Location:** Project root

## 🐛 Troubleshooting

### Modal Not Found?
The test tries multiple selectors to find the modal:
- `[role="dialog"]`
- `[role="alertdialog"]`
- `.modal`
- `[class*="modal"]`
- `[class*="Modal"]`
- Text-based: `div:has-text("Admin")`

**If modal still not found:**
1. Run the inspection test to see page structure
2. Update modal selectors in the test
3. Check browser console for errors

### Login Fails?
The test tries multiple login form selectors:
- `input[type="email"]`
- `input[name="email"]`
- `input[placeholder*="email"]`

**If login fails:**
1. Verify admin credentials are correct
2. Check if admin portal URL changed
3. Run test in headed mode to see what's happening

### Get Started Button Not Found?
The test looks for:
- `button:has-text("Get Started")`
- `a:has-text("Get Started")`

**If button not found:**
1. Check if button text changed
2. Update button selector in test
3. Run inspection test to see all buttons

## 📝 Test Output

The test logs detailed information:
```
🔐 Step 1: Login as Admin
✅ Admin logged in successfully

📄 Testing: /ad/med-spa1
   Found 2 "Get Started" button(s)
   ⏳ Waiting for admin modal to appear...
   ✅ Modal found using selector: [role="dialog"]
   📝 Modal text: You are logged in as Admin...
   🔘 Continue/Login as Patient button: ✅ Found
   🔘 Cancel/Stay in Admin button: ✅ Found
   🖱️  Clicking Cancel button...
   ✅ Modal closed successfully after clicking Cancel
   ✅ Still on ad page after cancel
   ✅ /ad/med-spa1 - Admin modal test PASSED

🎉 All ad pages tested successfully with admin login!
```

## ⚠️ Important Notes

1. **This is a TEMPORARY test** - Delete after verification complete
2. **Uses real admin credentials** - Don't commit to public repo
3. **No retries configured** - Tests fail immediately to catch issues
4. **2-minute timeout per test** - Adjust if needed for slower connections

## 🗑️ Cleanup

After testing is complete, delete these files:
```bash
rm tests/temp-admin-modal-test.spec.js
rm TEMP_ADMIN_MODAL_TEST_README.md
rm admin-modal-screenshot.png  # if generated
```

## 🔄 Modify for Your Needs

### Test Different Ad Pages
Edit the `AD_PAGES` array in the test file:
```javascript
const AD_PAGES = [
  '/ad/your-page-1',
  '/ad/your-page-2',
  // ... add more
];
```

### Change Admin Credentials
Update constants at top of test file:
```javascript
const ADMIN_EMAIL = 'your-email@example.com';
const ADMIN_PASSWORD = 'YourPassword';
```

### Quick Single Page Test
Edit the `testPage` in "Quick Test" describe block:
```javascript
const testPage = '/ad/your-preferred-page';
```

---

**Created:** January 2026  
**Status:** Temporary Test  
**Delete After:** Verification complete

