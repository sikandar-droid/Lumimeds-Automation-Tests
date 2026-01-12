const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com';

// All 27 ad pages
const AD_PAGES = [
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
  '/es/ad/med-spa1',
];

test.describe('List All Buttons - No Admin Login', () => {
  test.setTimeout(600000); // 10 minutes

  test('Find all CTA buttons and where they redirect (as regular user)', async ({ page }) => {
    const results = [];

    console.log('\n' + '='.repeat(70));
    console.log('🔍 SCANNING ALL AD PAGES FOR CTA BUTTONS (NO ADMIN LOGIN)');
    console.log('='.repeat(70) + '\n');

    for (let i = 0; i < AD_PAGES.length; i++) {
      const adPage = AD_PAGES[i];
      console.log(`\n[${i + 1}/${AD_PAGES.length}] 📄 ${adPage}`);
      console.log('-'.repeat(60));

      const pageResult = {
        page: adPage,
        buttons: []
      };

      await page.goto(`${BASE_URL}${adPage}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);

      // Close popup if exists
      const closeBtn = page.getByRole('button', { name: 'Close flash sale pop-up' });
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }

      // CTA buttons to check
      const ctaButtons = [
        { name: 'Get Started', selector: page.getByRole('button', { name: 'Get Started' }).first() },
        { name: 'Comenzar', selector: page.getByRole('button', { name: 'Comenzar' }).first() },
        { name: "Let's Do This", selector: page.getByRole('button', { name: "Let's Do This" }).first().or(page.getByRole('link', { name: "Let's Do This" }).first()) },
        { name: 'Shop Now', selector: page.getByRole('button', { name: 'Shop Now' }).first().or(page.getByRole('link', { name: 'Shop Now' }).first()) },
        { name: 'Start Now', selector: page.getByRole('button', { name: 'Start Now' }).first().or(page.getByRole('link', { name: 'Start Now' }).first()) },
        { name: 'Begin Your Online Evaluation', selector: page.getByRole('button', { name: 'Begin Your Online Evaluation' }).first().or(page.getByRole('link', { name: 'Begin Your Online Evaluation' }).first()) },
        { name: 'Check Your Eligibility', selector: page.getByRole('button', { name: /Check.*Eligibility/i }).first().or(page.getByRole('link', { name: /Check.*Eligibility/i }).first()) },
        { name: 'See Plans', selector: page.getByRole('button', { name: 'See Plans' }).first().or(page.getByRole('link', { name: 'See Plans' }).first()) },
        { name: 'Learn More', selector: page.getByRole('button', { name: 'Learn More' }).first().or(page.getByRole('link', { name: 'Learn More' }).first()) },
        { name: 'Pricing', selector: page.getByRole('button', { name: 'Pricing' }).first().or(page.getByRole('link', { name: 'Pricing' }).first()) },
      ];

      for (const cta of ctaButtons) {
        try {
          const isVisible = await cta.selector.isVisible({ timeout: 1000 }).catch(() => false);
          
          if (isVisible) {
            const urlBefore = page.url();
            
            await cta.selector.click();
            await page.waitForTimeout(2000);
            
            const urlAfter = page.url();
            const destination = urlAfter.replace(BASE_URL, '');
            
            let redirectType = 'same page';
            if (urlAfter !== urlBefore) {
              if (destination.includes('onboarding') || destination.includes('questionnaire')) {
                redirectType = '📋 SURVEY/ONBOARDING';
              } else if (destination.includes('products')) {
                redirectType = '🛒 PRODUCTS PAGE';
              } else if (destination.includes('checkout')) {
                redirectType = '💳 CHECKOUT';
              } else {
                redirectType = `→ ${destination}`;
              }
            }

            console.log(`   ✅ "${cta.name}" ${redirectType}`);
            
            pageResult.buttons.push({
              name: cta.name,
              destination: destination,
              redirectType: redirectType
            });

            // Go back to the ad page for next button
            if (urlAfter !== urlBefore) {
              await page.goto(`${BASE_URL}${adPage}`, { waitUntil: 'domcontentloaded' });
              await page.waitForTimeout(1000);
              
              // Close popup again
              if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await closeBtn.click();
                await page.waitForTimeout(300);
              }
            }
          }
        } catch (e) {
          // Skip errors silently
        }
      }

      results.push(pageResult);
    }

    // Print summary
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 SUMMARY: ALL CTA BUTTONS AND THEIR DESTINATIONS');
    console.log('='.repeat(70) + '\n');

    // Group by destination
    const surveyButtons = [];
    const productsButtons = [];
    const otherButtons = [];

    for (const pageResult of results) {
      for (const btn of pageResult.buttons) {
        const entry = { page: pageResult.page, button: btn.name, destination: btn.destination };
        
        if (btn.redirectType.includes('SURVEY') || btn.redirectType.includes('ONBOARDING')) {
          surveyButtons.push(entry);
        } else if (btn.redirectType.includes('PRODUCTS')) {
          productsButtons.push(entry);
        } else if (btn.redirectType !== 'same page') {
          otherButtons.push(entry);
        }
      }
    }

    console.log(`\n📋 BUTTONS THAT GO TO SURVEY/ONBOARDING (${surveyButtons.length}):`);
    console.log('-'.repeat(60));
    if (surveyButtons.length > 0) {
      const uniqueButtons = [...new Set(surveyButtons.map(b => b.button))];
      uniqueButtons.forEach(btn => {
        const pages = surveyButtons.filter(b => b.button === btn).map(b => b.page);
        console.log(`   "${btn}" → Found on ${pages.length} pages`);
      });
    } else {
      console.log('   None found');
    }

    console.log(`\n🛒 BUTTONS THAT GO TO PRODUCTS PAGE (${productsButtons.length}):`);
    console.log('-'.repeat(60));
    if (productsButtons.length > 0) {
      const uniqueButtons = [...new Set(productsButtons.map(b => b.button))];
      uniqueButtons.forEach(btn => {
        const pages = productsButtons.filter(b => b.button === btn).map(b => b.page);
        console.log(`   "${btn}" → Found on ${pages.length} pages`);
      });
    } else {
      console.log('   None found');
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 Scan complete!');
    console.log('='.repeat(70) + '\n');
  });
});

