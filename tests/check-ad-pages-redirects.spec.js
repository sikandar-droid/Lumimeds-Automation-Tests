const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com';

// Complete list of all ad pages (27 total)
const AD_PAGES = [
  // ========== NEW/ACTIVE LPs ==========
  '/ad/new-year-new-you',        // NEW
  '/ad/longevity-nad',           // NEW
  '/ad/for-women',
  '/ad/how-to-start',
  '/ad/journey',
  '/ad/redefined',
  '/ad/med-spa1',
  '/ad/best-weight-loss-medication',
  '/ad/starter-pack',            // NEW
  '/ad/holiday-weight-goals',
  
  // ========== OLD LPs ==========
  '/ad/stay-on-track',
  '/ad/glow-up',
  '/ad/free',
  '/ad/science',
  '/ad/otp',
  '/ad/tirz',                    // NEW
  '/ad/glp1-gip-treatment',
  '/ad/sustained',
  '/ad/sustainable-weight-loss',
  '/ad/weight-loss-treatment',
  '/ad/easy-weight-loss',
  '/ad/med-spa',
  '/ad/med-spa2',                // NEW
  '/ad/med-spa3',
  '/ad/healthy-weight-loss',     // NEW
  '/ad/sem',                     // NEW
  '/es/ad/med-spa1',             // Spanish version (med-spa1_spanish)
];

test.describe('Check Ad Pages for Redirects', () => {
  test('Check which ad pages redirect to home page', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes timeout
    
    const results = {
      active: [],
      archived: [],
      errors: []
    };
    
    console.log(`\n🔍 Checking all ${AD_PAGES.length} ad pages for redirects...\n`);
    console.log('================================================================================\n');
    
    for (let i = 0; i < AD_PAGES.length; i++) {
      const adPage = AD_PAGES[i];
      const fullUrl = `${BASE_URL}${adPage}`;
      
      console.log(`📄 [${i + 1}/${AD_PAGES.length}] Checking: ${adPage}`);
      
      try {
        // Navigate to the ad page
        await page.goto(fullUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });
        
        // Wait a bit for any redirects
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        const normalizedCurrentUrl = currentUrl.split('?')[0].toLowerCase();
        const normalizedBaseUrl = BASE_URL.toLowerCase();
        
        // Check if we're on home page (with or without /en/ prefix)
        const isHomePage = 
          normalizedCurrentUrl === normalizedBaseUrl || 
          normalizedCurrentUrl === `${normalizedBaseUrl}/` ||
          normalizedCurrentUrl === `${normalizedBaseUrl}/en` ||
          normalizedCurrentUrl === `${normalizedBaseUrl}/en/`;
        
        if (isHomePage) {
          console.log(`   ❌ ARCHIVED - Redirects to: ${currentUrl}`);
          results.archived.push(adPage);
        } else if (normalizedCurrentUrl.includes(adPage.toLowerCase())) {
          console.log(`   ✅ ACTIVE - Stays on ad page`);
          results.active.push(adPage);
        } else {
          console.log(`   ⚠️  UNEXPECTED - Redirects to: ${currentUrl}`);
          results.archived.push({
            page: adPage,
            redirectTo: currentUrl
          });
        }
        
      } catch (error) {
        console.log(`   ⚠️  ERROR - ${error.message}`);
        results.errors.push({
          page: adPage,
          error: error.message
        });
      }
      
      console.log('');
    }
    
    // Print summary
    console.log('================================================================================');
    console.log('\n📊 SUMMARY REPORT\n');
    console.log('================================================================================\n');
    
    console.log(`✅ Active Pages (${results.active.length}):`);
    if (results.active.length > 0) {
      results.active.forEach(page => console.log(`   - ${page}`));
    } else {
      console.log('   None');
    }
    
    console.log(`\n❌ Archived/Redirected Pages (${results.archived.length}):`);
    if (results.archived.length > 0) {
      results.archived.forEach(page => {
        if (typeof page === 'string') {
          console.log(`   - ${page} → Home page`);
        } else {
          console.log(`   - ${page.page} → ${page.redirectTo}`);
        }
      });
    } else {
      console.log('   None');
    }
    
    console.log(`\n⚠️  Error Pages (${results.errors.length}):`);
    if (results.errors.length > 0) {
      results.errors.forEach(item => console.log(`   - ${item.page}: ${item.error}`));
    } else {
      console.log('   None');
    }
    
    console.log('\n================================================================================');
    console.log(`\n📈 Statistics:`);
    console.log(`   Total Pages Checked: ${AD_PAGES.length}`);
    console.log(`   Active: ${results.active.length}`);
    console.log(`   Archived: ${results.archived.length}`);
    console.log(`   Errors: ${results.errors.length}`);
    console.log('\n================================================================================\n');
  });
});

