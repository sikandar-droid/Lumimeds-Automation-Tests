const { test, expect } = require('@playwright/test');
const HomePage = require('./pages/HomePage');
const OnboardingQuestionnairePage = require('./pages/OnboardingQuestionnairePage');
const PlanSelectionPage = require('./pages/PlanSelectionPage');
const CheckoutPage = require('./pages/CheckoutPage');

// Production checkout test with real card
test.describe('Production Checkout Test', () => {
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
        await checkout.completeCheckout(null, prodPaymentData, '99offfromjustin');
        
        console.log(`✅ Production checkout completed with 99% discount!`);
        console.log(`📧 Email: ${uniqueEmail}`);
    });
});

