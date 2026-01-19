const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com';
const PATIENT_LOGIN_URL = `${BASE_URL}/patient/login`;
const PATIENT_EMAIL = process.env.PATIENT_EMAIL || 'your-patient-email@example.com';
const PATIENT_PASSWORD = process.env.PATIENT_PASSWORD || 'your-password-here';

// Validate credentials are set
if (PATIENT_EMAIL === 'your-patient-email@example.com' || PATIENT_PASSWORD === 'your-password-here') {
  console.warn('⚠️  WARNING: Using default credentials. Set PATIENT_EMAIL and PATIENT_PASSWORD environment variables.');
}

// Complete list of all ad pages to test
const AD_PAGES = [
  // ========== NEW/ACTIVE LPs ==========
  '/ad/new-year-new-you',
  '/ad/longevity-nad',
  '/ad/for-women',
  '/ad/how-to-start',
  '/ad/journey',
  '/ad/redefined',
  '/ad/med-spa1',
  '/ad/best-weight-loss-medication',
  '/ad/starter-pack',
  '/ad/holiday-weight-goals',
  
  // ========== OLD LPs ==========
  '/ad/stay-on-track',
  '/ad/glow-up',
  '/ad/free',
  '/ad/science',
  '/ad/otp',
  '/ad/tirz',
  '/ad/glp1-gip-treatment',
  '/ad/sustained',
  '/ad/sustainable-weight-loss',
  '/ad/weight-loss-treatment',
  '/ad/easy-weight-loss',
  '/ad/med-spa',
  '/ad/med-spa2',
  '/ad/med-spa3',
  '/ad/healthy-weight-loss',
  '/ad/sem',
  '/es/ad/med-spa1', // Spanish version
];

// Helper function to close pop-ups on ad pages
async function closePopup(page) {
  try {
    console.log('   🔍 Checking for pop-ups...');
    await page.waitForTimeout(2000);
    
    const closeButton = page.getByRole('button', { name: 'Close flash sale pop-up' });
    const hasCloseButton = await closeButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasCloseButton) {
      console.log('   📦 Found flash sale pop-up');
      await closeButton.click();
      console.log('   ✅ Pop-up closed');
      await page.waitForTimeout(500);
      return;
    }
    
    console.log('   ℹ️  No pop-up found');
  } catch (error) {
    console.log(`   ⚠️  Error in closePopup: ${error.message}`);
  }
}

test.describe('Patient Portal Login - Ad Pages Redirect Test', () => {
  test.describe.configure({ retries: 0 });
  test.setTimeout(120000); // 2 minutes per test

  test('Patient logged in - Check behavior when visiting ad pages', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 PATIENT TO AD PAGES REDIRECT TEST');
    console.log('Testing: Patient Portal Login → Navigate to Ad Pages');
    console.log('='.repeat(80) + '\n');
    
    // Step 1: Login to Patient Portal
    console.log('🔐 Step 1: Login to Patient Portal');
    console.log(`   Navigating to: ${PATIENT_LOGIN_URL}`);
    
    await page.goto(PATIENT_LOGIN_URL);
    await page.waitForLoadState('networkidle');
    
    // Fill in patient credentials
    console.log('   📝 Filling in patient credentials...');
    
    try {
      // Try different selector strategies for email field
      const emailFilled = await (async () => {
        const selectors = [
          'input[type="email"]',
          'input[name="email"]',
          'input[placeholder*="email" i]',
          'input[id*="email" i]'
        ];
        
        for (const selector of selectors) {
          try {
            const field = page.locator(selector).first();
            if (await field.isVisible({ timeout: 2000 })) {
              await field.fill(PATIENT_EMAIL);
              console.log(`   ✅ Email filled using selector: ${selector}`);
              return true;
            }
          } catch (e) {
            continue;
          }
        }
        return false;
      })();
      
      if (!emailFilled) {
        throw new Error('Could not find email input field');
      }
      
      // Try different selector strategies for password field
      const passwordFilled = await (async () => {
        const selectors = [
          'input[type="password"]',
          'input[name="password"]',
          'input[placeholder*="password" i]',
          'input[id*="password" i]'
        ];
        
        for (const selector of selectors) {
          try {
            const field = page.locator(selector).first();
            if (await field.isVisible({ timeout: 2000 })) {
              await field.fill(PATIENT_PASSWORD);
              console.log(`   ✅ Password filled using selector: ${selector}`);
              return true;
            }
          } catch (e) {
            continue;
          }
        }
        return false;
      })();
      
      if (!passwordFilled) {
        throw new Error('Could not find password input field');
      }
      
      // Click login button
      console.log('   🖱️  Clicking login button...');
      const loginClicked = await (async () => {
        const selectors = [
          'button[type="submit"]',
          'button:has-text("Login")',
          'button:has-text("Sign In")',
          'button:has-text("Log In")'
        ];
        
        for (const selector of selectors) {
          try {
            const button = page.locator(selector).first();
            if (await button.isVisible({ timeout: 2000 })) {
              await button.click();
              console.log(`   ✅ Login button clicked using selector: ${selector}`);
              return true;
            }
          } catch (e) {
            continue;
          }
        }
        return false;
      })();
      
      if (!loginClicked) {
        throw new Error('Could not find login button');
      }
      
      // Wait for successful login
      console.log('   ⏳ Waiting for login to complete...');
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`   Current URL after login: ${currentUrl}`);
      
      // Check if login was successful
      if (currentUrl.includes('login') && !currentUrl.includes('patient/dashboard')) {
        console.log('   ⚠️  Still on login page - login may have failed');
        console.log('   Taking screenshot for debugging...');
        await page.screenshot({ path: 'patient-login-failed.png', fullPage: true });
        throw new Error('Patient login appears to have failed');
      }
      
      console.log('✅ Patient logged in successfully!\n');
      
    } catch (error) {
      console.log(`❌ Login failed: ${error.message}`);
      await page.screenshot({ path: 'patient-login-error.png', fullPage: true });
      throw error;
    }
    
    // Wait 3 seconds after successful login
    console.log('⏳ Waiting 3 seconds after login before testing ad pages...\n');
    await page.waitForTimeout(3000);
    
    // Step 2: Test each ad page
    console.log('📄 Step 2: Testing Ad Pages');
    console.log('─'.repeat(80) + '\n');
    
    let successCount = 0;
    let failCount = 0;
    const results = [];
    
    for (const adPage of AD_PAGES) {
      console.log(`\n📍 Testing: ${adPage}`);
      console.log('─'.repeat(40));
      
      try {
        const urlBefore = page.url();
        
        // Navigate to ad page
        console.log(`   🌐 Navigating to: ${BASE_URL}${adPage}`);
        await page.goto(`${BASE_URL}${adPage}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        const urlAfter = page.url();
        
        // Check if we got redirected
        const expectedUrl = `${BASE_URL}${adPage}`;
        const wasRedirected = !urlAfter.includes(adPage);
        
        console.log(`   📊 URL Analysis:`);
        console.log(`      Expected: ${expectedUrl}`);
        console.log(`      Actual:   ${urlAfter}`);
        console.log(`      Redirected: ${wasRedirected ? '✅ YES' : '❌ NO'}`);
        
        if (wasRedirected) {
          // Check where it redirected to
          if (urlAfter.includes('patient')) {
            console.log(`   ✅ Redirected to patient portal/dashboard`);
            results.push({ page: adPage, status: 'redirected', target: 'patient portal' });
          } else if (urlAfter.includes('admin')) {
            console.log(`   ⚠️  Redirected to admin portal (unexpected)`);
            results.push({ page: adPage, status: 'redirected', target: 'admin portal' });
          } else {
            console.log(`   ℹ️  Redirected to: ${urlAfter}`);
            results.push({ page: adPage, status: 'redirected', target: urlAfter });
          }
        } else {
          console.log(`   ✅ Stayed on ad page (no redirect)`);
          
          // Close any pop-ups
          await closePopup(page);
          
          // Check for modals
          console.log('   🔍 Checking for modals...');
          const modalSelectors = [
            '[role="dialog"]',
            '[role="alertdialog"]',
            '.modal',
            '[class*="modal" i]',
            '[class*="Modal"]'
          ];
          
          let modalFound = false;
          for (const selector of modalSelectors) {
            const modal = page.locator(selector).first();
            if (await modal.isVisible({ timeout: 1000 }).catch(() => false)) {
              modalFound = true;
              const modalText = await modal.textContent();
              console.log(`   📦 Modal found!`);
              console.log(`   📝 Modal content preview: ${modalText.substring(0, 100)}...`);
              
              // Check if it's an admin-related modal
              if (modalText.toLowerCase().includes('admin')) {
                console.log(`   ⚠️  Modal mentions "admin"`);
                results.push({ page: adPage, status: 'modal', content: 'admin-related' });
              } else {
                results.push({ page: adPage, status: 'modal', content: 'other' });
              }
              break;
            }
          }
          
          if (!modalFound) {
            console.log('   ℹ️  No modal detected');
            results.push({ page: adPage, status: 'no action', behavior: 'normal' });
          }
        }
        
        successCount++;
        console.log(`   ✅ Test passed for ${adPage}\n`);
        
      } catch (error) {
        failCount++;
        console.log(`   ❌ Test failed: ${error.message}\n`);
        results.push({ page: adPage, status: 'error', error: error.message });
      }
      
      // Small delay between pages
      await page.waitForTimeout(1000);
    }
    
    // Step 3: Summary Report
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY REPORT');
    console.log('='.repeat(80) + '\n');
    
    console.log(`Total Pages Tested: ${AD_PAGES.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}\n`);
    
    // Categorize results
    const redirected = results.filter(r => r.status === 'redirected');
    const withModal = results.filter(r => r.status === 'modal');
    const noAction = results.filter(r => r.status === 'no action');
    const errors = results.filter(r => r.status === 'error');
    
    if (redirected.length > 0) {
      console.log(`\n📤 Pages with Redirects (${redirected.length}):`);
      redirected.forEach(r => {
        console.log(`   - ${r.page} → ${r.target}`);
      });
    }
    
    if (withModal.length > 0) {
      console.log(`\n📦 Pages with Modals (${withModal.length}):`);
      withModal.forEach(r => {
        console.log(`   - ${r.page} (${r.content})`);
      });
    }
    
    if (noAction.length > 0) {
      console.log(`\n✅ Pages with Normal Behavior (${noAction.length}):`);
      noAction.forEach(r => {
        console.log(`   - ${r.page}`);
      });
    }
    
    if (errors.length > 0) {
      console.log(`\n❌ Pages with Errors (${errors.length}):`);
      errors.forEach(r => {
        console.log(`   - ${r.page}: ${r.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(80) + '\n');
  });

  // Individual test for a single ad page (for debugging)
  test('Test single ad page with patient login', async ({ page }) => {
    const testPage = '/ad/for-women'; // Change this to test different pages
    
    console.log('\n🔐 Step 1: Login to Patient Portal');
    await page.goto(PATIENT_LOGIN_URL);
    await page.waitForLoadState('networkidle');
    
    // Login
    await page.locator('input[type="email"]').first().fill(PATIENT_EMAIL);
    await page.locator('input[type="password"]').first().fill(PATIENT_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Patient logged in\n');
    
    console.log(`📄 Step 2: Navigate to: ${testPage}`);
    const urlBefore = page.url();
    
    await page.goto(`${BASE_URL}${testPage}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    
    console.log(`\n📊 Results:`);
    console.log(`   Before: ${urlBefore}`);
    console.log(`   After:  ${urlAfter}`);
    console.log(`   Redirected: ${urlBefore !== urlAfter}`);
    
    if (urlAfter.includes(testPage)) {
      console.log('\n✅ Stayed on ad page');
      
      // Close pop-up
      await closePopup(page);
      
      // Check for modals
      const modal = page.locator('[role="dialog"]').first();
      const hasModal = await modal.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasModal) {
        const modalText = await modal.textContent();
        console.log('\n📦 Modal detected:');
        console.log(modalText);
      } else {
        console.log('\nℹ️  No modal detected');
      }
      
      // Take screenshot
      await page.screenshot({ path: 'patient-on-ad-page.png', fullPage: true });
      console.log('\n📸 Screenshot saved: patient-on-ad-page.png');
      
    } else {
      console.log(`\n📤 Redirected to: ${urlAfter}`);
    }
    
    console.log('\n✅ Test complete');
  });
});
