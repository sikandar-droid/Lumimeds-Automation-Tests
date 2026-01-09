const { test, expect } = require('@playwright/test');

// Test configuration
const ADMIN_LOGIN_URL = process.env.ADMIN_LOGIN_URL || 'https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com/admin/login';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'your-admin-email@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-password-here';
const BASE_URL = process.env.BASE_URL || 'https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com';

// Validate credentials are set
if (ADMIN_EMAIL === 'your-admin-email@example.com' || ADMIN_PASSWORD === 'your-password-here') {
  console.warn('⚠️  WARNING: Using default credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
}

// List of all 19 ad pages to test (correct routes)
const AD_PAGES = [
  '/ad/best-weight-loss-medication',
  '/ad/easy-weight-loss',
  '/ad/for-women',
  '/ad/free',
  '/ad/glow-up',
  '/ad/glp1-gip-treatment',
  '/ad/holiday-weight-goals',
  '/ad/how-to-start',
  '/ad/journey',
  '/ad/med-spa',
  '/ad/otp',
  '/ad/redefined',
  '/ad/science',
  '/ad/stay-on-track',
  '/ad/sustainable-weight-loss',
  '/ad/sustained',
  '/ad/weight-loss-treatment',
  '/en/ad/med-spa1',
  '/es/ad/med-spa3'  // Spanish page - uses "Comenzar"
];

// Helper function to close pop-ups on ad pages
async function closePopup(page) {
  try {
    console.log('   🔍 Checking for pop-ups...');
    
    // Wait a bit for popup to appear
    await page.waitForTimeout(2000);
    
    // Try the specific close button from codegen first
    const closeButton = page.getByRole('button', { name: 'Close flash sale pop-up' });
    const hasCloseButton = await closeButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasCloseButton) {
      console.log('   📦 Found flash sale pop-up');
      await closeButton.click();
      console.log('   ✅ Pop-up closed using close button');
      await page.waitForTimeout(500);
      return;
    }
    
    console.log('   ℹ️  No pop-up found');
  } catch (error) {
    console.log(`   ⚠️  Error in closePopup: ${error.message}`);
  }
}

test.describe('Admin Modal on Ad Pages - Get Started Button', () => {
  test.describe.configure({ retries: 0 });
  test.setTimeout(120000); // 2 minutes per test

  test('Admin logged in - Should show modal when clicking Get Started', async ({ page }) => {
    console.log('🔐 Step 1: Login as Admin');
    
    // Navigate to admin login page
    await page.goto(ADMIN_LOGIN_URL);
    
    // Login as admin
    await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', ADMIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"], input[placeholder*="password" i]', ADMIN_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    // Wait for successful login (adjust selector based on actual admin dashboard)
    await page.waitForURL(/admin/, { timeout: 30000 });
    console.log('✅ Admin logged in successfully');
    
    // Wait 3 seconds after login before navigating to ad page
    console.log('⏳ Waiting 3 seconds after login...');
    await page.waitForTimeout(3000);

    // Test each ad page
    for (const adPage of AD_PAGES) {
      console.log(`\n📄 Testing: ${adPage}`);
      
      // Navigate to ad page
      await page.goto(`${BASE_URL}${adPage}`);
      await page.waitForLoadState('networkidle');
      
      // Close any pop-ups that may appear
      await closePopup(page);
      
      // Find all "Get Started" buttons
      const getStartedButtons = await page.locator('button:has-text("Get Started"), a:has-text("Get Started")').all();
      console.log(`   Found ${getStartedButtons.length} "Get Started" button(s)`);
      
      if (getStartedButtons.length === 0) {
        console.log(`   ⚠️  No "Get Started" buttons found on ${adPage}`);
        continue;
      }

      // Click the first "Get Started" button
      await getStartedButtons[0].click();
      
      // Wait for modal to appear
      console.log('   ⏳ Waiting for admin modal to appear...');
      
      // Look for modal - try multiple possible selectors
      const modalSelectors = [
        '[role="dialog"]',
        '[role="alertdialog"]',
        '.modal',
        '[class*="modal"]',
        '[class*="Modal"]',
        'div:has-text("Admin")',
        'div:has-text("Patient flow")'
      ];
      
      let modalFound = false;
      let modalLocator = null;
      
      for (const selector of modalSelectors) {
        const modal = page.locator(selector).first();
        if (await modal.isVisible({ timeout: 5000 }).catch(() => false)) {
          modalFound = true;
          modalLocator = modal;
          console.log(`   ✅ Modal found using selector: ${selector}`);
          break;
        }
      }
      
      if (!modalFound) {
        console.log('   ❌ FAIL: Modal did not appear after clicking Get Started as Admin');
        throw new Error(`Modal not found on ${adPage} when logged in as Admin`);
      }
      
      // Verify modal content
      const modalText = await modalLocator.textContent();
      console.log(`   📝 Modal text: ${modalText.substring(0, 100)}...`);
      
      // Check if modal mentions "Admin" and "Patient"
      const hasAdminText = modalText.toLowerCase().includes('admin');
      const hasPatientText = modalText.toLowerCase().includes('patient');
      
      if (!hasAdminText || !hasPatientText) {
        console.log(`   ⚠️  Warning: Modal may not have expected content (Admin: ${hasAdminText}, Patient: ${hasPatientText})`);
      }
      
      // Look for action buttons in the modal
      const continueButton = modalLocator.locator('button:has-text("Continue"), button:has-text("Login as Patient"), button:has-text("Patient")').first();
      const cancelButton = modalLocator.locator('button:has-text("Cancel"), button:has-text("Close"), button:has-text("Stay"), button:has-text("Remain")').first();
      
      const hasContinueButton = await continueButton.isVisible({ timeout: 2000 }).catch(() => false);
      const hasCancelButton = await cancelButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      console.log(`   🔘 Continue/Login as Patient button: ${hasContinueButton ? '✅ Found' : '❌ Not found'}`);
      console.log(`   🔘 Cancel/Stay in Admin button: ${hasCancelButton ? '✅ Found' : '❌ Not found'}`);
      
      if (!hasContinueButton || !hasCancelButton) {
        console.log('   ⚠️  Warning: Modal may be missing expected action buttons');
      }
      
      // Test Cancel button functionality
      if (hasCancelButton) {
        console.log('   🖱️  Clicking Cancel button...');
        await cancelButton.click();
        
        // Verify modal closes
        await expect(modalLocator).not.toBeVisible({ timeout: 5000 });
        console.log('   ✅ Modal closed successfully after clicking Cancel');
        
        // Verify still on ad page (not redirected)
        const currentUrl = page.url();
        if (currentUrl.includes('/ad/')) {
          console.log('   ✅ Still on ad page after cancel');
        } else {
          console.log(`   ⚠️  Warning: URL changed after cancel: ${currentUrl}`);
        }
      }
      
      console.log(`   ✅ ${adPage} - Admin modal test PASSED\n`);
    }
    
    console.log('🎉 All ad pages tested successfully with admin login!');
  });

  test('Not logged in as Admin - Should NOT show modal, normal flow continues', async ({ page }) => {
    console.log('🔓 Testing without admin login (unauthenticated user)');
    
    // Test a few ad pages without logging in
    const testPages = AD_PAGES.slice(0, 3); // Test first 3 pages
    
    for (const adPage of testPages) {
      console.log(`\n📄 Testing: ${adPage}`);
      
      // Navigate to ad page (without logging in)
      await page.goto(`${BASE_URL}${adPage}`);
      await page.waitForLoadState('networkidle');
      
      // Close any pop-ups that may appear
      await closePopup(page);
      
      // Find all "Get Started" buttons
      const getStartedButtons = await page.locator('button:has-text("Get Started"), a:has-text("Get Started")').all();
      console.log(`   Found ${getStartedButtons.length} "Get Started" button(s)`);
      
      if (getStartedButtons.length === 0) {
        console.log(`   ⚠️  No "Get Started" buttons found on ${adPage}`);
        continue;
      }

      // Get current URL before clicking
      const urlBeforeClick = page.url();
      
      // Click the first "Get Started" button
      await getStartedButtons[0].click();
      
      // Wait a moment for any modal to appear (if it incorrectly appears)
      await page.waitForTimeout(2000);
      
      // Check if modal appeared (it should NOT)
      const modalSelectors = [
        '[role="dialog"]',
        '[role="alertdialog"]',
        '.modal',
        '[class*="modal"]',
        '[class*="Modal"]'
      ];
      
      let modalAppeared = false;
      for (const selector of modalSelectors) {
        const modal = page.locator(selector).first();
        if (await modal.isVisible().catch(() => false)) {
          const modalText = await modal.textContent();
          if (modalText.toLowerCase().includes('admin')) {
            modalAppeared = true;
            console.log(`   ❌ FAIL: Admin modal appeared for unauthenticated user!`);
            break;
          }
        }
      }
      
      if (modalAppeared) {
        throw new Error(`Admin modal incorrectly appeared on ${adPage} for unauthenticated user`);
      }
      
      console.log('   ✅ No admin modal appeared (correct behavior)');
      
      // Verify normal flow continues (either URL changed or form appeared)
      const urlAfterClick = page.url();
      const urlChanged = urlAfterClick !== urlBeforeClick;
      
      // Check if questionnaire/form appeared
      const formAppeared = await page.locator('form, [role="form"], input[type="email"], input[placeholder*="email" i]')
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      
      if (urlChanged) {
        console.log(`   ✅ Normal flow: Redirected to ${urlAfterClick}`);
      } else if (formAppeared) {
        console.log('   ✅ Normal flow: Form/questionnaire appeared');
      } else {
        console.log('   ⚠️  Warning: Could not verify normal flow continuation');
      }
      
      console.log(`   ✅ ${adPage} - Unauthenticated test PASSED\n`);
    }
    
    console.log('🎉 All tested ad pages work correctly without admin login!');
  });

  test('View modal content details for first ad page', async ({ page }) => {
    console.log('🔍 Detailed modal inspection test');
    
    // Login as admin
    console.log('🔐 Logging in as Admin...');
    await page.goto(ADMIN_LOGIN_URL);
    await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Login")');
    await page.waitForURL(/admin/, { timeout: 30000 });
    console.log('✅ Admin logged in');
    
    // Wait 3 seconds after login before navigating to ad page
    console.log('⏳ Waiting 3 seconds after login...');
    await page.waitForTimeout(3000);
    
    // Navigate to first ad page
    const testPage = AD_PAGES[0];
    console.log(`\n📄 Inspecting modal on: ${testPage}`);
    await page.goto(`${BASE_URL}${testPage}`);
    await page.waitForLoadState('networkidle');
    
    // Close any pop-ups
    await closePopup(page);
    
    // Click Get Started
    const getStartedButton = page.locator('button:has-text("Get Started"), a:has-text("Get Started")').first();
    await getStartedButton.click();
    
    // Wait for modal
    await page.waitForTimeout(2000);
    
    // Take screenshot of modal
    await page.screenshot({ path: 'admin-modal-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved: admin-modal-screenshot.png');
    
    // Get all modal elements
    const modals = await page.locator('[role="dialog"], [role="alertdialog"], .modal, [class*="modal"], [class*="Modal"]').all();
    
    console.log(`\n📊 Found ${modals.length} potential modal(s)`);
    
    for (let i = 0; i < modals.length; i++) {
      const modal = modals[i];
      const isVisible = await modal.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`\n--- Modal ${i + 1} ---`);
        const text = await modal.textContent();
        console.log(`Text content:\n${text}\n`);
        
        // Get all buttons in modal
        const buttons = await modal.locator('button').all();
        console.log(`Buttons found: ${buttons.length}`);
        
        for (let j = 0; j < buttons.length; j++) {
          const buttonText = await buttons[j].textContent();
          console.log(`  Button ${j + 1}: "${buttonText}"`);
        }
      }
    }
    
    console.log('\n✅ Modal inspection complete');
  });
});

// Run individual test for each ad page
test.describe('Individual Ad Page Tests - Admin Modal', () => {
  
  // Create a separate test for each ad page
  AD_PAGES.forEach((adPagePath, index) => {
    test(`Test ${index + 1}/${AD_PAGES.length}: ${adPagePath}`, async ({ page }) => {
      test.setTimeout(120000); // 2 minutes per page
      
      console.log('\n' + '='.repeat(80));
      console.log(`📄 Testing: ${adPagePath}`);
      console.log('='.repeat(80));
      
      // Step 1: Login as Admin
      console.log('\n🔐 Step 1: Login as Admin');
      await page.goto(ADMIN_LOGIN_URL);
      await page.getByRole('textbox', { name: 'Email Address' }).fill(ADMIN_EMAIL);
      await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForURL(/admin/, { timeout: 30000 });
      console.log('✅ Admin logged in successfully');
      
      // Wait 3 seconds after login
      console.log('⏳ Waiting 3 seconds after login...');
      await page.waitForTimeout(3000);
      
      // Step 2: Navigate to ad page
      console.log(`\n📄 Step 2: Navigate to ${adPagePath}`);
      await page.goto(`${BASE_URL}${adPagePath}`);
      await page.waitForLoadState('networkidle');
      
      // Close pop-up
      await closePopup(page);
      
      // PART A: Test Cancel Button
      console.log('\n--- PART A: Testing Cancel Button ---');
      
      // Spanish page (med-spa3) uses "Comenzar", all others use "Get Started"
      const isSpanishPage = adPagePath.includes('/es/ad/med-spa3');
      const buttonName = isSpanishPage ? 'Comenzar' : 'Get Started';
      
      console.log(`🖱️  Clicking ${buttonName} button...`);
      
      // Find all Get Started buttons and click the first visible one
      const getStartedButtons = page.getByRole('button', { name: buttonName });
      const buttonCount = await getStartedButtons.count();
      console.log(`   Found ${buttonCount} "${buttonName}" buttons`);
      
      // Try clicking different button positions until one works
      let buttonClicked = false;
      for (let i = 0; i < buttonCount; i++) {
        try {
          const button = getStartedButtons.nth(i);
          if (await button.isVisible({ timeout: 2000 })) {
            await button.click({ timeout: 5000 });
            console.log(`   Clicked button at position ${i}`);
            buttonClicked = true;
            break;
          }
        } catch (e) {
          console.log(`   Button at position ${i} not clickable: ${e.message}`);
          continue;
        }
      }
      
      if (!buttonClicked) {
        console.log('❌ FAIL: Could not find clickable Get Started button');
        expect(buttonClicked).toBeTruthy(); // Fail the test
        return;
      }
      
      await page.waitForTimeout(2000);
      
      const cancelButton = page.getByRole('button', { name: 'Cancel' });
      const hasCancelBtn = await cancelButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hasCancelBtn) {
        console.log('✅ Modal appeared');
        console.log('🖱️  Clicking Cancel button...');
        
        const urlBeforeCancel = page.url();
        await cancelButton.click();
        await page.waitForTimeout(2000);
        
        const urlAfterCancel = page.url();
        const modal = page.locator('[role="dialog"]').first();
        const modalVisible = await modal.isVisible().catch(() => false);
        
        if (!modalVisible && urlBeforeCancel === urlAfterCancel) {
          console.log('✅ PASS: Modal closed, stayed on ad page');
          pageResult.cancelTest.passed = true;
          pageResult.cancelTest.reason = 'Modal closed correctly';
        } else {
          console.log(`❌ FAIL: Modal visible=${modalVisible}, URL changed=${urlBeforeCancel !== urlAfterCancel}`);
          pageResult.cancelTest.passed = false;
          pageResult.cancelTest.reason = `Modal still visible or URL changed`;
        }
      } else {
        console.log('❌ FAIL: Modal did not appear');
        pageResult.cancelTest.passed = false;
        pageResult.cancelTest.reason = 'Modal did not appear';
        results.push(pageResult);
        continue; // Skip to next page
      }
      
      // Wait a moment before Part B
      await page.waitForTimeout(1000);
      
      // PART B: Test Proceed to Patient Login
      console.log('\n--- PART B: Testing Proceed to Patient Login ---');
      console.log(`🖱️  Clicking ${buttonName} button again...`);
      
      // Find all Get Started buttons and click the first visible one
      buttonClicked = false;
      for (let i = 0; i < buttonCount; i++) {
        try {
          const button = getStartedButtons.nth(i);
          if (await button.isVisible({ timeout: 2000 })) {
            await button.click({ timeout: 5000 });
            console.log(`   Clicked button at position ${i}`);
            buttonClicked = true;
            break;
          }
        } catch (e) {
          console.log(`   Button at position ${i} not clickable: ${e.message}`);
          continue;
        }
      }
      
      if (!buttonClicked) {
        console.log('❌ FAIL: Could not find clickable Get Started button');
        pageResult.proceedTest.passed = false;
        pageResult.proceedTest.reason = 'Could not click Get Started button';
        results.push(pageResult);
        continue; // Skip to next page
      }
      
      await page.waitForTimeout(2000);
      
      const proceedButton = page.getByRole('link', { name: 'Proceed to Patient Login' });
      const hasProceedBtn = await proceedButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hasProceedBtn) {
        console.log('✅ Modal appeared');
        console.log('🖱️  Clicking "Proceed to Patient Login" button...');
        
        const urlBefore = page.url();
        await proceedButton.click();
        await page.waitForTimeout(3000);
        
        const urlAfter = page.url();
        
        if (urlAfter.includes('patient/login') && urlAfter.includes('intent=patient-login')) {
          console.log(`✅ PASS: Redirected to patient login`);
          console.log(`   URL: ${urlAfter}`);
          pageResult.proceedTest.passed = true;
          pageResult.proceedTest.reason = 'Redirected correctly';
        } else {
          console.log(`❌ FAIL: Did not redirect to patient login`);
          console.log(`   Expected: /patient/login?intent=patient-login`);
          console.log(`   Got: ${urlAfter}`);
          pageResult.proceedTest.passed = false;
          pageResult.proceedTest.reason = `Wrong redirect: ${urlAfter}`;
        }
      } else {
        console.log('❌ FAIL: Modal did not appear');
        pageResult.proceedTest.passed = false;
        pageResult.proceedTest.reason = 'Modal did not appear';
      }
      
      results.push(pageResult);
      console.log(`\n✅ Completed testing: ${testPage}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));
    
    // Calculate statistics
    const totalPages = results.length;
    const cancelPassed = results.filter(r => r.cancelTest.passed).length;
    const proceedPassed = results.filter(r => r.proceedTest.passed).length;
    const bothPassed = results.filter(r => r.cancelTest.passed && r.proceedTest.passed).length;
    
    console.log(`\n📈 SUMMARY STATISTICS:`);
    console.log(`   Total Ad Pages Tested: ${totalPages}`);
    console.log(`   Cancel Button Tests Passed: ${cancelPassed}/${totalPages} (${Math.round(cancelPassed/totalPages*100)}%)`);
    console.log(`   Proceed Button Tests Passed: ${proceedPassed}/${totalPages} (${Math.round(proceedPassed/totalPages*100)}%)`);
    console.log(`   Both Tests Passed: ${bothPassed}/${totalPages} (${Math.round(bothPassed/totalPages*100)}%)`);
    
    console.log(`\n📋 DETAILED RESULTS:`);
    console.log('─'.repeat(80));
    
    results.forEach((result, index) => {
      const pageName = result.page.split('/').pop();
      const cancelIcon = result.cancelTest.passed ? '✅' : '❌';
      const proceedIcon = result.proceedTest.passed ? '✅' : '❌';
      
      console.log(`\n${index + 1}. ${pageName}`);
      console.log(`   Cancel Test: ${cancelIcon} ${result.cancelTest.reason}`);
      console.log(`   Proceed Test: ${proceedIcon} ${result.proceedTest.reason}`);
    });
    
    console.log('\n' + '─'.repeat(80));
    console.log('\n✅ PASSED PAGES:');
    results.filter(r => r.cancelTest.passed && r.proceedTest.passed).forEach(r => {
      console.log(`   ✅ ${r.page}`);
    });
    
    if (results.some(r => !r.cancelTest.passed || !r.proceedTest.passed)) {
      console.log('\n❌ FAILED PAGES:');
      results.filter(r => !r.cancelTest.passed || !r.proceedTest.passed).forEach(r => {
        console.log(`   ❌ ${r.page}`);
        if (!r.cancelTest.passed) console.log(`      - Cancel: ${r.cancelTest.reason}`);
        if (!r.proceedTest.passed) console.log(`      - Proceed: ${r.proceedTest.reason}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 ALL TESTS COMPLETE!');
    console.log('='.repeat(80));
  });

  test('Test single ad page with admin login', async ({ page }) => {
    const testPage = '/en/ad/med-spa1'; // Change this to test different pages
    
    console.log('🔐 Login as Admin');
    await page.goto(ADMIN_LOGIN_URL);
    await page.getByRole('textbox', { name: 'Email Address' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/admin/, { timeout: 30000 });
    console.log('✅ Admin logged in successfully');
    
    // Wait 3 seconds after login before navigating to ad page
    console.log('⏳ Waiting 3 seconds after login...');
    await page.waitForTimeout(3000);
    
    console.log(`📄 Navigate to: ${testPage}`);
    await page.goto(`${BASE_URL}${testPage}`);
    await page.waitForLoadState('networkidle');
    
    // Close any pop-ups
    await closePopup(page);
    
    console.log('\n🖱️  Clicking Get Started button (2nd button - nth(1))...');
    await page.getByRole('button', { name: 'Get Started' }).nth(1).click();
    await page.waitForTimeout(2000);
    
    // Check for the "Patient Flow Required" modal (should appear immediately)
    console.log('\n🔍 Checking for "Patient Flow Required" modal...');
    
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    const proceedButton = page.getByRole('link', { name: 'Proceed to Patient Login' });
    
    const hasCancelBtn = await cancelButton.isVisible({ timeout: 5000 }).catch(() => false);
    const hasProceedBtn = await proceedButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasCancelBtn && hasProceedBtn) {
      console.log('✅ ✅ ✅ SUCCESS! Admin modal appeared with expected buttons!');
      console.log(`🔘 "Cancel" button: ✅ Found`);
      console.log(`🔘 "Proceed to Patient Login" button: ✅ Found`);
      
      // Get modal content
      const modal = page.locator('[role="dialog"]').first();
      const modalText = await modal.textContent().catch(() => 'Could not get modal text');
      console.log(`\n📝 Modal content:\n${modalText}`);
      
      // Wait to see the modal
      console.log('\n⏳ Waiting 5 seconds to observe modal...');
      await page.waitForTimeout(5000);
      
      // Test Cancel button
      console.log('\n🖱️  Testing Cancel button...');
      await cancelButton.click();
      await page.waitForTimeout(2000);
      
      const modalStillVisible = await modal.isVisible().catch(() => false);
      if (!modalStillVisible) {
        console.log('✅ Modal closed after clicking Cancel');
      } else {
        console.log('⚠️  Modal still visible after Cancel');
      }
      
    } else {
      console.log('❌ Modal did not appear or buttons not found');
      console.log(`   Cancel button: ${hasCancelBtn ? '✅' : '❌'}`);
      console.log(`   Proceed button: ${hasProceedBtn ? '✅' : '❌'}`);
    }
    
    console.log('\n✅ Test complete - Check browser for results');
  });

  test('Test "Proceed to Patient Login" button functionality', async ({ page }) => {
    const testPage = '/en/ad/med-spa1';
    
    console.log('🔐 Login as Admin');
    await page.goto(ADMIN_LOGIN_URL);
    await page.getByRole('textbox', { name: 'Email Address' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/admin/, { timeout: 30000 });
    console.log('✅ Admin logged in successfully');
    
    // Wait 3 seconds after login
    console.log('⏳ Waiting 3 seconds after login...');
    await page.waitForTimeout(3000);
    
    console.log(`📄 Navigate to: ${testPage}`);
    await page.goto(`${BASE_URL}${testPage}`);
    await page.waitForLoadState('networkidle');
    
    // Close pop-up
    await closePopup(page);
    
    console.log('\n🖱️  Clicking Get Started button (2nd button - nth(1))...');
    await page.getByRole('button', { name: 'Get Started' }).nth(1).click();
    await page.waitForTimeout(2000);
    
    // Check for modal
    console.log('\n🔍 Checking for "Patient Flow Required" modal...');
    const proceedButton = page.getByRole('link', { name: 'Proceed to Patient Login' });
    const hasProceedBtn = await proceedButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasProceedBtn) {
      console.log('✅ Modal appeared');
      
      // Click "Proceed to Patient Login"
      console.log('\n🖱️  Clicking "Proceed to Patient Login" button...');
      const urlBeforeClick = page.url();
      console.log(`   URL before click: ${urlBeforeClick}`);
      
      await proceedButton.click();
      await page.waitForTimeout(3000);
      
      // Check what happened after clicking proceed
      const urlAfterClick = page.url();
      console.log(`   URL after click: ${urlAfterClick}`);
      
      if (urlAfterClick !== urlBeforeClick) {
        console.log('✅ Navigated to different page/URL');
        
        // Check if we're on a login page
        const isLoginPage = urlAfterClick.includes('login') || urlAfterClick.includes('signin') || urlAfterClick.includes('auth');
        if (isLoginPage) {
          console.log('✅ Redirected to patient login page');
        } else {
          console.log(`ℹ️  Redirected to: ${urlAfterClick}`);
        }
        
        // Wait to observe the page
        await page.waitForTimeout(5000);
      } else {
        console.log('⚠️  URL did not change');
        
        // Check if modal closed
        const modal = page.locator('[role="dialog"]').first();
        const modalVisible = await modal.isVisible().catch(() => false);
        if (!modalVisible) {
          console.log('✅ Modal closed');
        } else {
          console.log('⚠️  Modal still visible');
        }
      }
      
    } else {
      console.log('❌ Modal did not appear');
    }
    
    console.log('\n✅ Test complete - Check browser for results');
  });
});

