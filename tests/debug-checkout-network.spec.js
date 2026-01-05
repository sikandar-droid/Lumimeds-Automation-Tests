const { test, expect } = require('@playwright/test');
const HomePage = require('./pages/HomePage');
const OnboardingQuestionnairePage = require('./pages/OnboardingQuestionnairePage');
const PlanSelectionPage = require('./pages/PlanSelectionPage');
const CheckoutPage = require('./pages/CheckoutPage');

test.describe('Debug - Checkout Network Requests', () => {
    test('Capture API calls during checkout', async ({ page }) => {
        // Array to store network requests
        const requests = [];
        const responses = [];

        // Listen to all network requests
        page.on('request', request => {
            requests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                postData: request.postData()
            });
        });

        // Listen to all network responses
        page.on('response', async response => {
            const url = response.url();
            let body = null;
            
            try {
                // Only try to get JSON for API calls
                if (url.includes('/api/') || url.includes('stripe') || url.includes('checkout')) {
                    body = await response.json();
                }
            } catch (e) {
                // Not JSON, skip
            }

            responses.push({
                url: url,
                status: response.status(),
                statusText: response.statusText(),
                headers: response.headers(),
                body: body
            });
        });

        // Generate a unique email address
        const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
        const uniqueEmail = `sikandar.naeem+${uniqueNumber}@devslooptech.com`;

        // Initialize page objects - Production URL
        const homePage = new HomePage(page, 'https://lumimeds.com');
        const questionnaire = new OnboardingQuestionnairePage(page);
        const planSelection = new PlanSelectionPage(page);
        const checkout = new CheckoutPage(page);

        // Test card details (Stripe test card - will not charge)
        const prodPaymentData = {
            cardNumber: '4242424242424242',
            expiry: '1229',
            cvc: '123'
        };

        console.log('\n🔍 ========== STARTING CHECKOUT WITH NETWORK LOGGING ==========\n');

        // Navigate to homepage and start onboarding
        await homePage.goto();
        await homePage.closePopup();
        await homePage.startOnboarding();

        // Complete the onboarding questionnaire
        await questionnaire.completeQuestionnaire(uniqueEmail);

        // Select plan and proceed to checkout
        await planSelection.selectPlanAndCheckout('3-Month Subscription');

        // Fill checkout details but DON'T submit yet
        console.log('\n💳 Filling payment details...\n');
        
        // Get initial price
        const initialPrice = await checkout.getTotalPrice();
        console.log(`💰 Initial price: $${initialPrice.toFixed(2)}`);
        
        // Apply coupon
        const couponResult = await checkout.applyCoupon('99offfromjustin', 99);
        console.log(`✅ Coupon applied: $${couponResult.priceBeforeCoupon.toFixed(2)} → $${couponResult.priceAfterCoupon.toFixed(2)}`);
        
        // Fill payment details
        await checkout.fillPaymentDetails(null, prodPaymentData);
        
        // Wait for checkout button to be ready
        await checkout.waitForCheckoutReady();
        
        console.log('\n🎯 ========== CLICKING CHECKOUT BUTTON ==========\n');
        console.log('📊 Watching for API calls...\n');
        
        // Scroll to checkout button
        await checkout.checkoutButton.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        // Click checkout button and wait for ANY response
        await checkout.checkoutButton.click({ force: true });
        
        // Wait up to 60 seconds for SOMETHING to happen
        await page.waitForTimeout(60000);
        
        console.log('\n📊 ========== NETWORK REQUESTS CAPTURED ==========\n');
        
        // Filter and log relevant API calls
        const apiCalls = responses.filter(r => 
            r.url.includes('/api/') || 
            r.url.includes('stripe') || 
            r.url.includes('checkout') ||
            r.url.includes('subscription') ||
            r.url.includes('payment')
        );
        
        console.log(`\n🔍 Found ${apiCalls.length} relevant API calls:\n`);
        
        apiCalls.forEach((call, index) => {
            console.log(`\n--- API Call ${index + 1} ---`);
            console.log(`URL: ${call.url}`);
            console.log(`Status: ${call.status} ${call.statusText}`);
            if (call.body) {
                console.log(`Response Body:`, JSON.stringify(call.body, null, 2));
            }
        });
        
        console.log('\n📍 Current URL:', page.url());
        
        // Take screenshot
        await page.screenshot({ path: 'debug-checkout-network.png', fullPage: true });
        console.log('\n📸 Screenshot saved: debug-checkout-network.png');
    });
});

