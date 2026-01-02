const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');
const OnboardingQuestionnairePage = require('../pages/OnboardingQuestionnairePage');
const PlanSelectionPage = require('../pages/PlanSelectionPage');
const CheckoutPage = require('../pages/CheckoutPage');

// Mobile viewport settings - iPhone 15 Pro Max
const iPhoneViewport = {
    viewport: { width: 430, height: 932 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
};

// Production checkout test with real card - MOBILE
test.describe('Production Checkout Test - Mobile (iPhone 15 Pro Max)', () => {
    // Configure for mobile viewport
    test.use(iPhoneViewport);
    
    // Disable retries for production checkout
    test.describe.configure({ retries: 0 });

    // Set timeout for this test
    test.setTimeout(180000); // 3 minutes

    test('Complete Checkout Flow with Production Card', async ({ page }) => {
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

        // Navigate to homepage and start onboarding
        await homePage.goto();
        await homePage.closePopup();
        await homePage.startOnboarding();

        // Complete the onboarding questionnaire
        await questionnaire.completeQuestionnaire(uniqueEmail);

        // Select plan and proceed to checkout
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        // Complete checkout with production card and coupon code
        // This will automatically verify the 99% discount is applied
        // If verification fails, it will STOP and prevent full charge
        try {
            await checkout.completeCheckout(null, prodPaymentData, '99offfromjustin');
            
            console.log(`\n✅ ========== PRODUCTION CHECKOUT SUCCESS (MOBILE) ==========`);
            console.log(`📱 Device: iPhone 15 Pro Max (430x932)`);
            console.log(`✅ Coupon verified and applied correctly`);
            console.log(`✅ Checkout completed with 99% discount!`);
            console.log(`📧 Email: ${uniqueEmail}`);
            console.log(`💳 Charged: ~$6.49 (99% off)`);
            console.log(`========================================\n`);
            
        } catch (e) {
            console.log(`\n❌ ========== PRODUCTION CHECKOUT FAILED (MOBILE) ==========`);
            console.log(`📱 Device: iPhone 15 Pro Max (430x932)`);
            console.log(`❌ ${e.message}`);
            console.log(`🛡️  Safety check prevented full payment charge`);
            console.log(`📧 Email (not charged): ${uniqueEmail}`);
            console.log(`========================================\n`);
            throw e;
        }
    });
});

