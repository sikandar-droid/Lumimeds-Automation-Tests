const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://usama-coc-2848.d2493ifc824sz6.amplifyapp.com';
const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sikandar.naeem@devslooptech.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Test@123';

// The 5 pages that failed
const FAILED_PAGES = [
  '/ad/med-spa1',
  '/ad/starter-pack', 
  '/ad/med-spa2',
  '/ad/med-spa3',
  '/es/ad/med-spa1'
];

test.describe('Debug Failed Ad Pages', () => {
  test.setTimeout(300000); // 5 minutes

  test('Investigate failed pages with single login', async ({ page }) => {
    console.log('\n🔐 Logging in as Admin...');
    await page.goto(ADMIN_LOGIN_URL);
    await page.getByRole('textbox', { name: 'Email Address' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/admin/, { timeout: 30000 });
    console.log('✅ Logged in!\n');
    await page.waitForTimeout(2000);

    for (const adPage of FAILED_PAGES) {
      console.log('\n' + '='.repeat(60));
      console.log(`📄 Testing: ${adPage}`);
      console.log('='.repeat(60));
      
      await page.goto(`${BASE_URL}${adPage}`);
      await page.waitForTimeout(2000);
      
      // Close popup if exists
      const closeBtn = page.getByRole('button', { name: 'Close flash sale pop-up' });
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click();
        console.log('   ✅ Closed popup');
        await page.waitForTimeout(500);
      }

      // Check for buttons
      const isSpanish = adPage.includes('/es/');
      const buttonName = isSpanish ? 'Comenzar' : 'Get Started';
      
      const buttons = page.getByRole('button', { name: buttonName });
      const count = await buttons.count();
      console.log(`   Found ${count} "${buttonName}" buttons`);
      
      // Also check for other common button names
      const letDoThis = page.getByRole('button', { name: "Let's Do This" });
      const letDoThisCount = await letDoThis.count();
      if (letDoThisCount > 0) {
        console.log(`   Found ${letDoThisCount} "Let's Do This" buttons`);
      }
      
      const shopNow = page.getByRole('button', { name: 'Shop Now' });
      const shopNowCount = await shopNow.count();
      if (shopNowCount > 0) {
        console.log(`   Found ${shopNowCount} "Shop Now" buttons`);
      }
      
      // Try clicking if we found Get Started buttons
      if (count > 0) {
        console.log('   🖱️  Clicking first "Get Started" button...');
        await buttons.first().click();
        await page.waitForTimeout(2000);
        
        // Check what appeared
        const cancelBtn = page.getByRole('button', { name: 'Cancel' });
        const hasCancel = await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (hasCancel) {
          console.log('   ✅ MODAL APPEARED!');
          await cancelBtn.click();
          await page.waitForTimeout(1000);
        } else {
          console.log('   ❌ No modal appeared');
          console.log(`   Current URL: ${page.url()}`);
          
          // Check if we redirected
          if (!page.url().includes(adPage)) {
            console.log('   ⚠️  Page redirected! Going back...');
            await page.goto(`${BASE_URL}${adPage}`);
            await page.waitForTimeout(2000);
          }
        }
      } else {
        console.log('   ⚠️  No "Get Started" button found, listing all buttons...');
        const allButtons = await page.getByRole('button').all();
        console.log(`   Total buttons: ${allButtons.length}`);
        for (let i = 0; i < Math.min(10, allButtons.length); i++) {
          const text = await allButtons[i].textContent().catch(() => '[no text]');
          console.log(`   Button ${i + 1}: "${text.trim().substring(0, 50)}"`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Debug complete!');
    console.log('='.repeat(60) + '\n');
  });
});

