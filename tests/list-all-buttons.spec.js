const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com';
const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sikandar.naeem@devslooptech.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Test@123';

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

test.describe('List All Buttons on Ad Pages', () => {
  test.setTimeout(600000); // 10 minutes

  test('Find all buttons and their destinations', async ({ page }) => {
    const allResults = [];

    // Login as admin first
    console.log('\n🔐 Logging in as Admin...');
    await page.goto(ADMIN_LOGIN_URL);
    await page.getByRole('textbox', { name: 'Email Address' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/admin/, { timeout: 30000 });
    console.log('✅ Logged in!\n');
    await page.waitForTimeout(2000);

    for (let i = 0; i < AD_PAGES.length; i++) {
      const adPage = AD_PAGES[i];
      console.log('\n' + '='.repeat(70));
      console.log(`[${i + 1}/${AD_PAGES.length}] 📄 ${adPage}`);
      console.log('='.repeat(70));

      const pageResult = {
        page: adPage,
        buttons: []
      };

      await page.goto(`${BASE_URL}${adPage}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Close popup if exists
      const closeBtn = page.getByRole('button', { name: 'Close flash sale pop-up' });
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }

      // Get all buttons and links that look like CTAs
      const buttons = await page.locator('button, a[role="button"], a.btn, a[class*="button"], a[class*="Button"]').all();
      
      console.log(`\n   Found ${buttons.length} buttons/links`);
      console.log('   ' + '-'.repeat(60));

      for (let j = 0; j < buttons.length; j++) {
        const btn = buttons[j];
        try {
          const text = await btn.textContent().catch(() => '');
          const cleanText = text.trim().replace(/\s+/g, ' ').substring(0, 50);
          
          // Skip empty, navigation, or irrelevant buttons
          if (!cleanText || 
              cleanText.toLowerCase().includes('close') ||
              cleanText.toLowerCase().includes('menu') ||
              cleanText.toLowerCase() === 'login' ||
              cleanText.toLowerCase() === 'faqs' ||
              cleanText.toLowerCase() === 'medications') {
            continue;
          }

          // Check if button is visible
          const isVisible = await btn.isVisible().catch(() => false);
          if (!isVisible) continue;

          // Get href if it's a link
          const href = await btn.getAttribute('href').catch(() => null);

          pageResult.buttons.push({
            text: cleanText,
            href: href,
            index: j
          });

          console.log(`   ${j + 1}. "${cleanText}" ${href ? `→ ${href}` : ''}`);
        } catch (e) {
          // Skip problematic elements
        }
      }

      // Now test clicking CTA buttons to see where they go
      console.log('\n   🧪 Testing CTA buttons...');
      
      const ctaTexts = [
        'Get Started',
        'Comenzar',
        "Let's Do This",
        'Shop Now',
        'Start Now',
        'Learn More',
        'See Plans',
        'View Plans'
      ];

      for (const ctaText of ctaTexts) {
        const ctaBtn = page.getByRole('button', { name: ctaText }).first()
          .or(page.getByRole('link', { name: ctaText }).first());
        
        const hasBtn = await ctaBtn.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (hasBtn) {
          // Save current URL
          const urlBefore = page.url();
          
          try {
            await ctaBtn.click();
            await page.waitForTimeout(2000);
            
            const urlAfter = page.url();
            
            // Check for modal
            const cancelBtn = page.getByRole('button', { name: 'Cancel' });
            const hasModal = await cancelBtn.isVisible({ timeout: 1000 }).catch(() => false);
            
            if (hasModal) {
              console.log(`   ✅ "${ctaText}" → Shows Admin Modal`);
              await cancelBtn.click();
              await page.waitForTimeout(500);
            } else if (urlAfter !== urlBefore) {
              const destination = urlAfter.replace(BASE_URL, '');
              console.log(`   🔗 "${ctaText}" → Redirects to: ${destination}`);
              
              // Check if it's the survey/onboarding page
              if (urlAfter.includes('onboarding') || urlAfter.includes('survey') || urlAfter.includes('questionnaire') || urlAfter.includes('products')) {
                console.log(`      ⚠️  This is a SURVEY/PRODUCTS redirect!`);
              }
              
              // Go back
              await page.goto(`${BASE_URL}${adPage}`, { waitUntil: 'domcontentloaded' });
              await page.waitForTimeout(1500);
              
              // Close popup again if needed
              if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await closeBtn.click();
              }
            } else {
              console.log(`   ℹ️  "${ctaText}" → Stayed on page (no modal, no redirect)`);
            }
          } catch (e) {
            console.log(`   ⚠️  "${ctaText}" → Error: ${e.message.substring(0, 50)}`);
          }
        }
      }

      allResults.push(pageResult);
    }

    // Print summary
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 SUMMARY: BUTTONS THAT REDIRECT TO SURVEY/PRODUCTS');
    console.log('='.repeat(70) + '\n');
    
    console.log('Common CTA buttons found on ad pages:');
    console.log('  • "Get Started" - Main CTA (should show admin modal when admin logged in)');
    console.log('  • "Comenzar" - Spanish version of Get Started');
    console.log('  • "Let\'s Do This" - Hero CTA');
    console.log('  • "Shop Now" - Flash sale popup CTA');
    console.log('  • "Learn More" - Info link');
    console.log('  • "See Plans" / "View Plans" - Pricing section');
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 Scan complete!');
    console.log('='.repeat(70) + '\n');
  });
});

