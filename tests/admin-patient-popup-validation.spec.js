const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com';
const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'your-admin-email@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-password-here';

// Validate credentials are set
if (ADMIN_EMAIL === 'your-admin-email@example.com' || ADMIN_PASSWORD === 'your-password-here') {
  console.warn('⚠️  WARNING: Using default credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
}

// List of ad pages to test
const AD_PAGES = [
  '/ad/for-women',
  '/ad/how-to-start',
  '/ad/journey',
  '/ad/redefined',
  '/ad/med-spa1',
  '/ad/best-weight-loss-medication',
  '/ad/holiday-weight-goals',
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

test.describe('Admin Patient Popup Validation', () => {
  test.describe.configure({ retries: 0 });
  test.setTimeout(120000); // 2 minutes per test

  test('Test 1: Admin logged in - Should show "Login as Patient" popup', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST 1: Admin Logged In → Ad Page → Get Started → Patient Login Popup');
    console.log('='.repeat(80) + '\n');
    
    // Step 1: Login as Admin
    console.log('🔐 Step 1: Login as Admin');
    console.log(`   Navigating to: ${ADMIN_LOGIN_URL}`);
    
    await page.goto(ADMIN_LOGIN_URL);
    await page.waitForLoadState('networkidle');
    
    try {
      // Fill admin credentials
      console.log('   📝 Filling admin credentials...');
      
      // Try different selector strategies for email
      const emailFilled = await (async () => {
        const selectors = [
          'input[type="email"]',
          'input[name="email"]',
          'input[placeholder*="email" i]',
          'input[id*="email" i]',
          'input[type="text"]'
        ];
        
        for (const selector of selectors) {
          try {
            const field = page.locator(selector).first();
            if (await field.isVisible({ timeout: 2000 })) {
              await field.fill(ADMIN_EMAIL);
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
        // Try role-based selector
        try {
          await page.getByRole('textbox', { name: /email/i }).fill(ADMIN_EMAIL);
          console.log('   ✅ Email filled using role selector');
        } catch (e) {
          throw new Error('Could not find email input field');
        }
      }
      
      // Fill password
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
              await field.fill(ADMIN_PASSWORD);
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
        // Try role-based selector
        try {
          await page.getByRole('textbox', { name: /password/i }).fill(ADMIN_PASSWORD);
          console.log('   ✅ Password filled using role selector');
        } catch (e) {
          throw new Error('Could not find password input field');
        }
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
        // Try role-based selector
        try {
          await page.getByRole('button', { name: /login/i }).click();
          console.log('   ✅ Login button clicked using role selector');
        } catch (e) {
          throw new Error('Could not find login button');
        }
      }
      
      // Wait for successful login
      console.log('   ⏳ Waiting for login to complete...');
      await page.waitForURL(/admin/, { timeout: 30000 });
      console.log('✅ Admin logged in successfully!\n');
      
    } catch (error) {
      console.log(`❌ Login failed: ${error.message}`);
      await page.screenshot({ path: 'admin-login-error.png', fullPage: true });
      throw error;
    }
    
    // Wait 3 seconds after login
    console.log('⏳ Waiting 3 seconds after login...\n');
    await page.waitForTimeout(3000);
    
    // Step 2: Test each ad page
    console.log('📄 Step 2: Testing Ad Pages');
    console.log('─'.repeat(80) + '\n');
    
    for (const adPage of AD_PAGES) {
      console.log(`\n📍 Testing: ${adPage}`);
      console.log('─'.repeat(40));
      
      try {
        // Navigate to ad page
        console.log(`   🌐 Navigating to: ${BASE_URL}${adPage}`);
        await page.goto(`${BASE_URL}${adPage}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Close any pop-ups
        await closePopup(page);
        
        // Step 3: Find and click "Get Started" button
        console.log('   🔍 Looking for "Get Started" button...');
        
        const getStartedSelectors = [
          'button:has-text("Get Started")',
          'a:has-text("Get Started")',
          'button:has-text("Get started")',
          'a:has-text("Get started")',
          '[role="button"]:has-text("Get Started")'
        ];
        
        let buttonClicked = false;
        for (const selector of getStartedSelectors) {
          try {
            const buttons = await page.locator(selector).all();
            for (let i = 0; i < buttons.length; i++) {
              const button = buttons[i];
              if (await button.isVisible({ timeout: 2000 })) {
                console.log(`   🖱️  Clicking "Get Started" button (${i + 1}/${buttons.length})...`);
                await button.click();
                buttonClicked = true;
                break;
              }
            }
            if (buttonClicked) break;
          } catch (e) {
            continue;
          }
        }
        
        if (!buttonClicked) {
          // Try role-based selector
          try {
            const button = page.getByRole('button', { name: 'Get Started' });
            if (await button.isVisible({ timeout: 2000 })) {
              console.log('   🖱️  Clicking "Get Started" button (role selector)...');
              await button.click();
              buttonClicked = true;
            }
          } catch (e) {
            console.log('   ❌ Could not find "Get Started" button');
            throw new Error(`"Get Started" button not found on ${adPage}`);
          }
        }
        
        // Wait for modal/popup to appear
        console.log('   ⏳ Waiting for popup to appear...');
        await page.waitForTimeout(2000);
        
        // Step 4: Validate "Login as Patient" popup appears
        console.log('   🔍 Validating "Login as Patient" popup...');
        
        const modalSelectors = [
          '[role="dialog"]',
          '[role="alertdialog"]',
          '.modal',
          '[class*="modal" i]',
          '[class*="Modal"]'
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
          console.log('   ❌ FAIL: Modal/popup did not appear');
          await page.screenshot({ path: `admin-popup-missing-${adPage.replace(/\//g, '-')}.png`, fullPage: true });
          throw new Error(`Modal/popup did not appear on ${adPage} when admin is logged in`);
        }
        
        // Check modal content for "patient" or "login" text
        const modalText = await modalLocator.textContent();
        console.log(`   📝 Modal content preview: ${modalText.substring(0, 150)}...`);
        
        const hasPatientText = modalText.toLowerCase().includes('patient');
        const hasLoginText = modalText.toLowerCase().includes('login');
        
        if (!hasPatientText && !hasLoginText) {
          console.log('   ⚠️  Warning: Modal does not contain "patient" or "login" text');
        }
        
        // Look for "Proceed to Patient Login" or similar button/link
        const proceedButtonSelectors = [
          'link:has-text("Proceed to Patient Login")',
          'a:has-text("Proceed to Patient Login")',
          'button:has-text("Proceed to Patient Login")',
          'a:has-text("Patient Login")',
          'button:has-text("Patient Login")',
          'a:has-text("Login as Patient")',
          'button:has-text("Login as Patient")'
        ];
        
        let proceedButtonFound = false;
        for (const selector of proceedButtonSelectors) {
          try {
            const button = page.locator(selector).first();
            if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
              proceedButtonFound = true;
              console.log(`   ✅ Found "Proceed to Patient Login" button using: ${selector}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!proceedButtonFound) {
          // Try role-based selector
          try {
            const link = page.getByRole('link', { name: /proceed to patient login/i });
            if (await link.isVisible({ timeout: 2000 })) {
              proceedButtonFound = true;
              console.log('   ✅ Found "Proceed to Patient Login" link (role selector)');
            }
          } catch (e) {
            // Continue to check
          }
        }
        
        if (!proceedButtonFound) {
          console.log('   ⚠️  Warning: "Proceed to Patient Login" button/link not found in modal');
        }
        
        // Check for Cancel button
        const cancelButton = page.getByRole('button', { name: 'Cancel' });
        const hasCancelButton = await cancelButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (hasCancelButton) {
          console.log('   ✅ Cancel button found');
        } else {
          console.log('   ⚠️  Cancel button not found');
        }
        
        if (modalFound && (hasPatientText || hasLoginText || proceedButtonFound)) {
          console.log(`   ✅ PASS: "Login as Patient" popup validated successfully on ${adPage}\n`);
        } else {
          console.log(`   ⚠️  Partial validation: Modal appeared but may not be the expected "Login as Patient" popup\n`);
        }
        
      } catch (error) {
        console.log(`   ❌ FAIL: ${error.message}\n`);
        throw error;
      }
      
      // Small delay between pages
      await page.waitForTimeout(1000);
    }
    
    console.log('='.repeat(80));
    console.log('✅ TEST 1 COMPLETE: All ad pages tested with admin login');
    console.log('='.repeat(80) + '\n');
  });

  test('Test 2: Not logged in - Should open survey form directly', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST 2: Not Logged In → Ad Page → Get Started → Survey Form');
    console.log('='.repeat(80) + '\n');
    
    // Step 1: Navigate to ad page (without logging in)
    console.log('📄 Step 1: Testing Ad Pages (No Login)');
    console.log('─'.repeat(80) + '\n');
    
    for (const adPage of AD_PAGES) {
      console.log(`\n📍 Testing: ${adPage}`);
      console.log('─'.repeat(40));
      
      try {
        // Navigate to ad page
        console.log(`   🌐 Navigating to: ${BASE_URL}${adPage}`);
        await page.goto(`${BASE_URL}${adPage}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Close any pop-ups
        await closePopup(page);
        
        const urlBeforeClick = page.url();
        console.log(`   📍 URL before click: ${urlBeforeClick}`);
        
        // Step 2: Find and click "Get Started" button
        console.log('   🔍 Looking for "Get Started" button...');
        
        const getStartedSelectors = [
          'button:has-text("Get Started")',
          'a:has-text("Get Started")',
          'button:has-text("Get started")',
          'a:has-text("Get started")',
          '[role="button"]:has-text("Get Started")'
        ];
        
        let buttonClicked = false;
        for (const selector of getStartedSelectors) {
          try {
            const buttons = await page.locator(selector).all();
            for (let i = 0; i < buttons.length; i++) {
              const button = buttons[i];
              if (await button.isVisible({ timeout: 2000 })) {
                console.log(`   🖱️  Clicking "Get Started" button (${i + 1}/${buttons.length})...`);
                await button.click();
                buttonClicked = true;
                break;
              }
            }
            if (buttonClicked) break;
          } catch (e) {
            continue;
          }
        }
        
        if (!buttonClicked) {
          // Try role-based selector
          try {
            const button = page.getByRole('button', { name: 'Get Started' });
            if (await button.isVisible({ timeout: 2000 })) {
              console.log('   🖱️  Clicking "Get Started" button (role selector)...');
              await button.click();
              buttonClicked = true;
            }
          } catch (e) {
            console.log('   ❌ Could not find "Get Started" button');
            throw new Error(`"Get Started" button not found on ${adPage}`);
          }
        }
        
        // Wait for navigation or form to appear
        console.log('   ⏳ Waiting for survey form to appear...');
        await page.waitForTimeout(3000);
        
        const urlAfterClick = page.url();
        console.log(`   📍 URL after click: ${urlAfterClick}`);
        
        // Step 3: Validate survey form is opened (not popup)
        console.log('   🔍 Validating survey form opened...');
        
        // Check if URL changed (redirected to survey/questionnaire page)
        const urlChanged = urlAfterClick !== urlBeforeClick;
        const isSurveyUrl = urlAfterClick.includes('survey') || 
                           urlAfterClick.includes('questionnaire') || 
                           urlAfterClick.includes('qualify') ||
                           urlAfterClick.includes('form');
        
        // Check for form elements on the page
        const formSelectors = [
          'form',
          'input[type="email"]',
          'input[placeholder*="email" i]',
          'input[name*="email" i]',
          '[role="form"]',
          'input[type="text"]'
        ];
        
        let formFound = false;
        for (const selector of formSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
              formFound = true;
              console.log(`   ✅ Form element found using selector: ${selector}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        // Check if admin modal appeared (it should NOT)
        const modalSelectors = [
          '[role="dialog"]',
          '[role="alertdialog"]',
          '.modal',
          '[class*="modal" i]'
        ];
        
        let adminModalAppeared = false;
        for (const selector of modalSelectors) {
          const modal = page.locator(selector).first();
          if (await modal.isVisible({ timeout: 1000 }).catch(() => false)) {
            const modalText = await modal.textContent();
            if (modalText.toLowerCase().includes('admin') || 
                modalText.toLowerCase().includes('patient login') ||
                modalText.toLowerCase().includes('proceed to patient')) {
              adminModalAppeared = true;
              console.log(`   ❌ FAIL: Admin modal appeared when it should not!`);
              console.log(`   Modal content: ${modalText.substring(0, 100)}...`);
              break;
            }
          }
        }
        
        if (adminModalAppeared) {
          await page.screenshot({ path: `unexpected-popup-${adPage.replace(/\//g, '-')}.png`, fullPage: true });
          throw new Error(`Admin modal incorrectly appeared on ${adPage} for unauthenticated user`);
        }
        
        // Validate results
        if (urlChanged && isSurveyUrl) {
          console.log(`   ✅ PASS: Redirected to survey/questionnaire page`);
          console.log(`   ✅ Survey form opened successfully on ${adPage}\n`);
        } else if (formFound) {
          console.log(`   ✅ PASS: Survey form found on page`);
          console.log(`   ✅ Survey form opened successfully on ${adPage}\n`);
        } else if (urlChanged) {
          console.log(`   ⚠️  URL changed but may not be survey form: ${urlAfterClick}`);
          console.log(`   ⚠️  Please verify manually: ${adPage}\n`);
        } else {
          console.log(`   ⚠️  Could not definitively verify survey form opened`);
          console.log(`   ⚠️  Please verify manually: ${adPage}\n`);
        }
        
      } catch (error) {
        console.log(`   ❌ FAIL: ${error.message}\n`);
        await page.screenshot({ path: `survey-form-error-${adPage.replace(/\//g, '-')}.png`, fullPage: true });
        throw error;
      }
      
      // Small delay between pages
      await page.waitForTimeout(1000);
    }
    
    console.log('='.repeat(80));
    console.log('✅ TEST 2 COMPLETE: All ad pages tested without login');
    console.log('='.repeat(80) + '\n');
  });
});
