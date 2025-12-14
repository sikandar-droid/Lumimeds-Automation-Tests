const { test, expect } = require('@playwright/test');
const HomePage = require('./pages/HomePage');
const OnboardingQuestionnairePage = require('./pages/OnboardingQuestionnairePage');
const PlanSelectionPage = require('./pages/PlanSelectionPage');
const CheckoutPage = require('./pages/CheckoutPage');

// Checkout tests for 10 patients (5 Louisiana + 5 Minnesota)
test.describe('Checkout Test - 10 Patients from LA & MN', () => {

    // Set timeout for these tests
    test.setTimeout(180000); // 3 minutes per test

    // ============================================================================
    // LOUISIANA PATIENTS (5)
    // ============================================================================

    test('Patient 1 - Louisiana - Standard Plan', async ({ page }) => {
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        console.log('\n🏛️  Louisiana Patient 1');
        console.log(`📧 Email: ${uniqueEmail}`);

        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        await homePage.goto();
        await homePage.startOnboarding();
        await questionnaire.completeQuestionnaire(uniqueEmail);
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        const louisianaAddress = {
            address: '123 Bourbon Street',
            city: 'New Orleans',
            state: 'Louisiana',
            zipCode: '70112'
        };

        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        await checkout.completeCheckout(louisianaAddress, paymentData);
        console.log('✅ Louisiana Patient 1 checkout completed!\n');
    });

    test('Patient 2 - Louisiana - Premium Plan', async ({ page }) => {
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        console.log('\n🏛️  Louisiana Patient 2');
        console.log(`📧 Email: ${uniqueEmail}`);

        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        await homePage.goto();
        await homePage.startOnboarding();
        await questionnaire.completeQuestionnaire(uniqueEmail);
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        const louisianaAddress = {
            address: '456 Canal Street',
            city: 'Baton Rouge',
            state: 'Louisiana',
            zipCode: '70801'
        };

        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        await checkout.completeCheckout(louisianaAddress, paymentData);
        console.log('✅ Louisiana Patient 2 checkout completed!\n');
    });

    test('Patient 3 - Louisiana - Basic Plan', async ({ page }) => {
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        console.log('\n🏛️  Louisiana Patient 3');
        console.log(`📧 Email: ${uniqueEmail}`);

        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        await homePage.goto();
        await homePage.startOnboarding();
        await questionnaire.completeQuestionnaire(uniqueEmail);
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        const louisianaAddress = {
            address: '789 Magazine Street',
            city: 'Lafayette',
            state: 'Louisiana',
            zipCode: '70501'
        };

        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        await checkout.completeCheckout(louisianaAddress, paymentData);
        console.log('✅ Louisiana Patient 3 checkout completed!\n');
    });

    test('Patient 4 - Louisiana - Advanced Plan', async ({ page }) => {
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        console.log('\n🏛️  Louisiana Patient 4');
        console.log(`📧 Email: ${uniqueEmail}`);

        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        await homePage.goto();
        await homePage.startOnboarding();
        await questionnaire.completeQuestionnaire(uniqueEmail);
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        const louisianaAddress = {
            address: '321 St. Charles Avenue',
            city: 'Shreveport',
            state: 'Louisiana',
            zipCode: '71101'
        };

        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        await checkout.completeCheckout(louisianaAddress, paymentData);
        console.log('✅ Louisiana Patient 4 checkout completed!\n');
    });

    test('Patient 5 - Louisiana - Elite Plan', async ({ page }) => {
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        console.log('\n🏛️  Louisiana Patient 5');
        console.log(`📧 Email: ${uniqueEmail}`);

        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        await homePage.goto();
        await homePage.startOnboarding();
        await questionnaire.completeQuestionnaire(uniqueEmail);
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        const louisianaAddress = {
            address: '555 Frenchmen Street',
            city: 'Metairie',
            state: 'Louisiana',
            zipCode: '70001'
        };

        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        await checkout.completeCheckout(louisianaAddress, paymentData);
        console.log('✅ Louisiana Patient 5 checkout completed!\n');
    });

    // ============================================================================
    // MINNESOTA PATIENTS (5)
    // ============================================================================

    test('Patient 6 - Minnesota - Standard Plan', async ({ page }) => {
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        console.log('\n🌲 Minnesota Patient 6');
        console.log(`📧 Email: ${uniqueEmail}`);

        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        await homePage.goto();
        await homePage.startOnboarding();
        await questionnaire.completeQuestionnaire(uniqueEmail);
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        const minnesotaAddress = {
            address: '123 Nicollet Avenue',
            city: 'Minneapolis',
            state: 'Minnesota',
            zipCode: '55401'
        };

        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        await checkout.completeCheckout(minnesotaAddress, paymentData);
        console.log('✅ Minnesota Patient 6 checkout completed!\n');
    });

    test('Patient 7 - Minnesota - Premium Plan', async ({ page }) => {
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        console.log('\n🌲 Minnesota Patient 7');
        console.log(`📧 Email: ${uniqueEmail}`);

        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        await homePage.goto();
        await homePage.startOnboarding();
        await questionnaire.completeQuestionnaire(uniqueEmail);
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        const minnesotaAddress = {
            address: '456 Summit Avenue',
            city: 'St. Paul',
            state: 'Minnesota',
            zipCode: '55102'
        };

        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        await checkout.completeCheckout(minnesotaAddress, paymentData);
        console.log('✅ Minnesota Patient 7 checkout completed!\n');
    });

    test('Patient 8 - Minnesota - Basic Plan', async ({ page }) => {
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        console.log('\n🌲 Minnesota Patient 8');
        console.log(`📧 Email: ${uniqueEmail}`);

        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        await homePage.goto();
        await homePage.startOnboarding();
        await questionnaire.completeQuestionnaire(uniqueEmail);
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        const minnesotaAddress = {
            address: '789 Lake Street',
            city: 'Duluth',
            state: 'Minnesota',
            zipCode: '55802'
        };

        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        await checkout.completeCheckout(minnesotaAddress, paymentData);
        console.log('✅ Minnesota Patient 8 checkout completed!\n');
    });

    test('Patient 9 - Minnesota - Advanced Plan', async ({ page }) => {
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        console.log('\n🌲 Minnesota Patient 9');
        console.log(`📧 Email: ${uniqueEmail}`);

        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        await homePage.goto();
        await homePage.startOnboarding();
        await questionnaire.completeQuestionnaire(uniqueEmail);
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        const minnesotaAddress = {
            address: '321 Hennepin Avenue',
            city: 'Rochester',
            state: 'Minnesota',
            zipCode: '55901'
        };

        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        await checkout.completeCheckout(minnesotaAddress, paymentData);
        console.log('✅ Minnesota Patient 9 checkout completed!\n');
    });

    test('Patient 10 - Minnesota - Elite Plan', async ({ page }) => {
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        console.log('\n🌲 Minnesota Patient 10');
        console.log(`📧 Email: ${uniqueEmail}`);

        const homePage = new HomePage(page);
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        await homePage.goto();
        await homePage.startOnboarding();
        await questionnaire.completeQuestionnaire(uniqueEmail);
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        const minnesotaAddress = {
            address: '555 University Avenue',
            city: 'Bloomington',
            state: 'Minnesota',
            zipCode: '55420'
        };

        const paymentData = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };

        await checkout.completeCheckout(minnesotaAddress, paymentData);
        console.log('✅ Minnesota Patient 10 checkout completed!\n');
    });
});

