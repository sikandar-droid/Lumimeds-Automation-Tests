const { test, expect } = require('@playwright/test');
const HomePage = require('./pages/HomePage');
const OnboardingQuestionnairePage = require('./pages/OnboardingQuestionnairePage');
const PlanSelectionPage = require('./pages/PlanSelectionPage');
const CheckoutPage = require('./pages/CheckoutPage');

// Single checkout test execution
test.describe('Checkout Test', () => {
    // Disable retries for checkout tests
    test.describe.configure({ retries: 0 });

    // Set timeout for this test
    test.setTimeout(180000); // 3 minutes

    test('Complete Checkout Flow', async ({ page }) => {
        // Generate a unique email address
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        // Initialize page objects - Staging URL
        const homePage = new HomePage(page, 'https://staging.lumimeds.com');
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        // Navigate to homepage and start onboarding
        await homePage.goto();
        await homePage.closePopup();
        await homePage.startOnboarding();

        // Complete the onboarding questionnaire
        await questionnaire.completeQuestionnaire(uniqueEmail);

        // Select plan and proceed to checkout
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        // Complete checkout with default test data
        await checkout.completeCheckout();
    });
});