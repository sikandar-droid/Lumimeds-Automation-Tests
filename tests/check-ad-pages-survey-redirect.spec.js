const { test, expect } = require('@playwright/test');

// Test configuration
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

test.describe('Non-Admin Survey Redirect - All Pages', () => {
  test.setTimeout(900000); // 15 minutes for all pages

  test('Test survey redirect on ALL 27 ad pages (non-admin)', async ({ page }) => {
    const results = {
      passed: [],
      failed: [],
      skipped: []
    };

    console.log('\n' + '='.repeat(80));
    console.log('📄 TESTING 27 AD PAGES (NON-ADMIN USER)');
    console.log('Expected: Get Started buttons should redirect to survey page');
    console.log('='.repeat(80) + '\n');

    for (let i = 0; i < AD_PAGES.length; i++) {
      const adPage = AD_PAGES[i];
      const isSpanish = adPage.includes('/es/');
      const buttonName = isSpanish ? 'Comenzar' : 'Get Started';
      
      console.log(`\n[${i + 1}/${AD_PAGES.length}] Testing: ${adPage}`);
      
      try {
        // Navigate to ad page (NOT logged in as admin)
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
        
        // Click the button
        await getStartedBtn.click();
        
        // Wait for navigation
        await page.waitForTimeout(3000);
        
        // Get current URL
        const currentUrl = page.url();
        console.log(`   📍 Redirected to: ${currentUrl}`);
        
        // Check if URL contains 'survey'
        if (currentUrl.toLowerCase().includes('survey')) {
          console.log(`   ✅ PASS: Redirected to survey page`);
          results.passed.push({ page: adPage, redirectTo: currentUrl });
        } else {
          console.log(`   ❌ FAIL: Did NOT redirect to survey page`);
          results.failed.push({ page: adPage, redirectTo: currentUrl, reason: 'URL does not contain "survey"' });
        }
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        results.failed.push({ page: adPage, error: error.message });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(80) + '\n');
    
    console.log(`✅ PASSED: ${results.passed.length}/${AD_PAGES.length}`);
    if (results.passed.length > 0) {
      results.passed.forEach(item => {
        console.log(`   ✅ ${item.page} → ${item.redirectTo}`);
      });
    }
    
    console.log(`\n❌ FAILED: ${results.failed.length}/${AD_PAGES.length}`);
    if (results.failed.length > 0) {
      results.failed.forEach(item => {
        if (item.error) {
          console.log(`   ❌ ${item.page} - ${item.error}`);
        } else {
          console.log(`   ❌ ${item.page} → ${item.redirectTo} (${item.reason})`);
        }
      });
    }
    
    console.log(`\n⚠️  SKIPPED: ${results.skipped.length}/${AD_PAGES.length}`);
    if (results.skipped.length > 0) {
      results.skipped.forEach(item => {
        console.log(`   ⚠️  ${item.page} - ${item.reason}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`📈 PASS RATE: ${Math.round((results.passed.length / AD_PAGES.length) * 100)}%`);
    console.log('='.repeat(80) + '\n');

    // Fail test if any pages failed
    expect(results.failed.length, `${results.failed.length} pages failed`).toBe(0);
  });
});
