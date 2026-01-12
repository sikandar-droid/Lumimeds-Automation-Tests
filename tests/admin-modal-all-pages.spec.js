const { test, expect } = require('@playwright/test');

// Test configuration
const ADMIN_LOGIN_URL = process.env.ADMIN_LOGIN_URL || 'https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com/admin/login';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'your-admin-email@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-password-here';
const BASE_URL = process.env.BASE_URL || 'https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com';

// Complete list of all 27 ad pages to test
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
  '/es/ad/med-spa1',  // Spanish version
];

// Helper function to close pop-ups
async function closePopup(page) {
  try {
    await page.waitForTimeout(1500);
    const closeButton = page.getByRole('button', { name: 'Close flash sale pop-up' });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }
  } catch (error) {
    // Ignore popup errors
  }
}

test.describe('Admin Modal - All Pages (Single Login)', () => {
  test.setTimeout(900000); // 15 minutes for all pages

  test('Test admin modal on ALL 27 ad pages with single login', async ({ page }) => {
    const results = {
      passed: [],
      failed: [],
      skipped: []
    };

    // ========== STEP 1: LOGIN ONCE ==========
    console.log('\n' + '='.repeat(80));
    console.log('🔐 LOGGING IN AS ADMIN (ONCE)');
    console.log('='.repeat(80));
    
    await page.goto(ADMIN_LOGIN_URL);
    await page.getByRole('textbox', { name: 'Email Address' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/admin/, { timeout: 30000 });
    
    console.log('✅ Admin logged in successfully!\n');
    await page.waitForTimeout(2000);

    // ========== STEP 2: TEST ALL PAGES ==========
    console.log('='.repeat(80));
    console.log(`📄 TESTING ${AD_PAGES.length} AD PAGES`);
    console.log('='.repeat(80) + '\n');

    for (let i = 0; i < AD_PAGES.length; i++) {
      const adPage = AD_PAGES[i];
      const isSpanish = adPage.includes('/es/');
      const buttonName = isSpanish ? 'Comenzar' : 'Get Started';
      
      console.log(`\n[${i + 1}/${AD_PAGES.length}] Testing: ${adPage}`);
      
      try {
        // Navigate to ad page
        await page.goto(`${BASE_URL}${adPage}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1000);
        
        // Close popup
        await closePopup(page);
        
        // Find and click Get Started button
        const getStartedBtn = page.getByRole('button', { name: buttonName }).first();
        const hasButton = await getStartedBtn.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (!hasButton) {
          console.log(`   ⚠️  SKIP: No "${buttonName}" button found`);
          results.skipped.push({ page: adPage, reason: 'No button found' });
          continue;
        }
        
        await getStartedBtn.click();
        await page.waitForTimeout(1500);
        
        // Check for Cancel button (indicates modal appeared)
        const cancelBtn = page.getByRole('button', { name: 'Cancel' });
        const hasModal = await cancelBtn.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (!hasModal) {
          console.log(`   ❌ FAIL: Modal did not appear`);
          results.failed.push({ page: adPage, reason: 'Modal did not appear' });
          continue;
        }
        
        // Test Cancel button
        await cancelBtn.click();
        await page.waitForTimeout(1000);
        
        // Verify modal closed and still on ad page
        const modalGone = !(await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false));
        const stillOnAdPage = page.url().includes('/ad/');
        
        if (modalGone && stillOnAdPage) {
          console.log(`   ✅ PASS: Modal works correctly`);
          results.passed.push(adPage);
        } else {
          console.log(`   ❌ FAIL: Modal didn't close properly`);
          results.failed.push({ page: adPage, reason: 'Modal did not close' });
        }
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        results.failed.push({ page: adPage, reason: error.message });
      }
    }

    // ========== STEP 3: PRINT RESULTS ==========
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(80));
    
    console.log(`\n✅ PASSED: ${results.passed.length}/${AD_PAGES.length}`);
    if (results.passed.length > 0) {
      results.passed.forEach(p => console.log(`   ✅ ${p}`));
    }
    
    console.log(`\n❌ FAILED: ${results.failed.length}/${AD_PAGES.length}`);
    if (results.failed.length > 0) {
      results.failed.forEach(f => console.log(`   ❌ ${f.page} - ${f.reason}`));
    }
    
    console.log(`\n⚠️  SKIPPED: ${results.skipped.length}/${AD_PAGES.length}`);
    if (results.skipped.length > 0) {
      results.skipped.forEach(s => console.log(`   ⚠️  ${s.page} - ${s.reason}`));
    }
    
    console.log('\n' + '='.repeat(80));
    const passRate = Math.round((results.passed.length / AD_PAGES.length) * 100);
    console.log(`📈 PASS RATE: ${passRate}%`);
    console.log('='.repeat(80) + '\n');
    
    // Fail test if any pages failed
    expect(results.failed.length, `${results.failed.length} pages failed`).toBe(0);
  });
});

