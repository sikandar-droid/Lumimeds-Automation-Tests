const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');
const OnboardingQuestionnairePage = require('../pages/OnboardingQuestionnairePage');
const PlanSelectionPage = require('../pages/PlanSelectionPage');
const CheckoutPage = require('../pages/CheckoutPage');

// Checkout tests for Louisiana and Minnesota
test.describe('Checkout Test - Multiple States', () => {

    // Set timeout for these tests
    test.setTimeout(180000); // 3 minutes

    test('Complete Checkout Flow - Louisiana', async ({ page }) => {
        // Generate a unique email address
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+louisiana${uniqueNumber}@devslooptech.com`;

        console.log('\n🏛️  Starting checkout for LOUISIANA');
        console.log(`📧 Email: ${uniqueEmail}`);

        // Initialize page objects
        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        // Navigate to homepage and start onboarding
        await homePage.goto();
        await homePage.startOnboarding();

        // Complete the onboarding questionnaire
        await questionnaire.completeQuestionnaire(uniqueEmail);

        // Select plan and proceed to checkout
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        // Louisiana address data
        const louisianaAddress = {
            address: '123 Bourbon Street',
            city: 'New Orleans',
            state: 'Louisiana',
            zipCode: '70112'
        };

        // Default payment data (Stripe test card)
        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        // Complete checkout with Louisiana address
        await checkout.completeCheckout(louisianaAddress, paymentData);

        console.log('✅ Louisiana checkout completed successfully!\n');
    });

    test('Complete Checkout Flow - Minnesota', async ({ page }) => {
        // Generate a unique email address
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+minnesota${uniqueNumber}@devslooptech.com`;

        console.log('\n🌲 Starting checkout for MINNESOTA');
        console.log(`📧 Email: ${uniqueEmail}`);

        // Initialize page objects
        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        // Navigate to homepage and start onboarding
        await homePage.goto();
        await homePage.startOnboarding();

        // Complete the onboarding questionnaire
        await questionnaire.completeQuestionnaire(uniqueEmail);

        // Select plan and proceed to checkout
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        // Minnesota address data
        const minnesotaAddress = {
            address: '456 Summit Avenue',
            city: 'Minneapolis',
            state: 'Minnesota',
            zipCode: '55401'
        };

        // Default payment data (Stripe test card)
        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        // Complete checkout with Minnesota address
        await checkout.completeCheckout(minnesotaAddress, paymentData);

        console.log('✅ Minnesota checkout completed successfully!\n');
    });
});

