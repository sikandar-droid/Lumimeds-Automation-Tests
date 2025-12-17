const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');
const OnboardingQuestionnairePage = require('../pages/OnboardingQuestionnairePage');
const PlanSelectionPage = require('../pages/PlanSelectionPage');
const CheckoutPage = require('../pages/CheckoutPage');

// DIAGNOSTIC TEST - STOPS BEFORE FINAL CHECKOUT
test.describe('Diagnostic Production Checkout Test - NO CHARGE', () => {
    test.describe.configure({ retries: 0 });
    test.setTimeout(300000); // 5 minutes

    test('Verify Coupon Application - STOP BEFORE CHECKOUT', async ({ page }) => {
        // Generate a unique email address
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        // Initialize page objects - Production URL
        const homePage = new HomePage(page, 'https://lumimeds.com');
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        // Production card details
        const prodPaymentData = {
            cardNumber: '4246315431366655',
            expiry: '1229',
            cvc: '948'
        };

        console.log('\n🔍 ========== DIAGNOSTIC CHECKOUT TEST ==========\n');
        console.log(`📧 Email: ${uniqueEmail}`);
        console.log(`🎫 Coupon: 99offfromjustin`);
        console.log(`⚠️  WILL NOT COMPLETE FINAL CHECKOUT\n`);

        // Navigate to homepage and start onboarding
        await homePage.goto();
        await homePage.closePopup();
        await homePage.startOnboarding();

        // Complete the onboarding questionnaire
        await questionnaire.completeQuestionnaire(uniqueEmail);

        // Select plan and proceed to checkout
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        // Wait for checkout page to load
        await checkout.waitForPageLoad();
        
        console.log('\n💰 ========== PRICE BEFORE COUPON ==========');
        
        // Capture initial price
        const priceBeforeCoupon = await page.locator('text=/total|subtotal|price/i').allTextContents();
        console.log('Initial prices:', priceBeforeCoupon);
        
        // Take screenshot before coupon
        await page.screenshot({ path: 'screenshots/diagnostic-before-coupon.png', fullPage: true });
        console.log('📸 Screenshot saved: screenshots/diagnostic-before-coupon.png');

        // Fill address first
        const defaultAddress = {
            address: 'test',
            city: 'New York City',
            state: 'New York',
            zipCode: '90210'
        };
        await checkout.fillAddressDetails(defaultAddress);
        console.log('✅ Address filled');

        console.log('\n🗑️  ========== REMOVING AUTO-APPLIED COUPON ==========');
        
        // Remove any existing coupon
        await checkout.removeCoupon();
        await page.waitForTimeout(3000);
        
        // Take screenshot after removal
        await page.screenshot({ path: 'screenshots/diagnostic-after-removal.png', fullPage: true });
        console.log('📸 Screenshot saved: screenshots/diagnostic-after-removal.png');
        
        // Capture price after removal
        const priceAfterRemoval = await page.locator('text=/total|subtotal|price/i').allTextContents();
        console.log('Prices after removal:', priceAfterRemoval);

        console.log('\n🎫 ========== APPLYING NEW COUPON ==========');
        
        // Apply new coupon
        await checkout.applyCoupon('99offfromjustin');
        await page.waitForTimeout(5000); // Extra wait for price to update
        
        // Take screenshot after coupon application
        await page.screenshot({ path: 'screenshots/diagnostic-after-coupon.png', fullPage: true });
        console.log('📸 Screenshot saved: screenshots/diagnostic-after-coupon.png');
        
        // Capture price after coupon
        const priceAfterCoupon = await page.locator('text=/total|subtotal|price/i').allTextContents();
        console.log('Prices after coupon:', priceAfterCoupon);
        
        // Verify coupon code is visible
        const couponApplied = await page.locator('text=/99offfromjustin/i').isVisible().catch(() => false);
        console.log(`Coupon visible on page: ${couponApplied ? '✅ YES' : '❌ NO'}`);

        console.log('\n💳 ========== FILLING PAYMENT DETAILS ==========');
        
        // Fill payment details
        await checkout.fillPaymentDetails(prodPaymentData);
        console.log('✅ Payment details filled');
        
        // Wait for everything to settle
        await page.waitForTimeout(5000);
        
        // Take final screenshot
        await page.screenshot({ path: 'screenshots/diagnostic-final.png', fullPage: true });
        console.log('📸 Screenshot saved: screenshots/diagnostic-final.png');
        
        console.log('\n🔍 ========== FINAL VERIFICATION ==========');
        
        // Check final prices
        const finalPrices = await page.locator('text=/total|subtotal|price/i').allTextContents();
        console.log('Final prices:', finalPrices);
        
        // Verify coupon is STILL applied
        const couponStillApplied = await page.locator('text=/99offfromjustin/i').isVisible().catch(() => false);
        console.log(`Coupon STILL visible: ${couponStillApplied ? '✅ YES' : '❌ NO'}`);
        
        // Check if Remove button is visible (indicates coupon is applied)
        const removeButtonVisible = await page.locator('button', { hasText: 'Remove' }).isVisible().catch(() => false);
        console.log(`Remove button visible: ${removeButtonVisible ? '✅ YES (coupon applied)' : '❌ NO (coupon NOT applied)'}`);
        
        console.log('\n⚠️  ========== TEST STOPPED - NO CHECKOUT COMPLETED ==========');
        console.log('🛑 Pausing for 30 seconds so you can manually inspect the page...\n');
        
        // Wait 30 seconds for manual inspection
        await page.waitForTimeout(30000);
        
        console.log('\n✅ Diagnostic test complete!');
        console.log('📁 Check screenshots in: screenshots/diagnostic-*.png');
        console.log(`📧 Test email: ${uniqueEmail}\n`);
    });
});

