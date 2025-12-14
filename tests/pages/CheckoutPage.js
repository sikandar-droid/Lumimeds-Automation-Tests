class CheckoutPage {
    constructor(page) {
        this.page = page;
        
        // Locators
        this.addressInput = page.getByRole('textbox', { name: 'Address' });
        this.cityInput = page.getByRole('textbox', { name: 'City' });
        this.stateDropdown = page.locator('.css-19bb58m').first();
        this.zipCodeInput = page.getByRole('textbox', { name: 'Zip Code' });
        this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
        
        // Discount Coupon
        this.couponInput = page.getByPlaceholder(/coupon|discount|promo/i).or(page.getByLabel(/coupon|discount|promo/i));
        this.applyButton = page.getByRole('button', { name: /apply/i });
        this.discountAmount = page.locator('text=/discount|savings|-/i');
    }

    /**
     * Wait for the checkout page to load
     */
    async waitForPageLoad() {
        await this.addressInput.waitFor({ state: 'visible', timeout: 30000 });
    }

    /**
     * Fill in the address
     * @param {string} address - Street address
     */
    async fillAddress(address) {
        await this.addressInput.click();
        await this.addressInput.fill(address);
    }

    /**
     * Fill in the city
     * @param {string} city - City name
     */
    async fillCity(city) {
        await this.cityInput.click();
        await this.cityInput.fill(city);
    }

    /**
     * Select state
     * @param {string} state - State name (e.g., 'Arkansas')
     */
    async selectState(state) {
        await this.stateDropdown.click();
        await this.page.getByRole('option', { name: state }).click();
    }

    /**
     * Fill in zip code
     * @param {string} zipCode - ZIP code
     */
    async fillZipCode(zipCode) {
        await this.zipCodeInput.click();
        await this.zipCodeInput.fill(zipCode);
    }

    /**
     * Fill in complete address information
     * @param {Object} addressData - Address information
     * @param {string} addressData.address - Street address
     * @param {string} addressData.city - City name
     * @param {string} addressData.state - State name
     * @param {string} addressData.zipCode - ZIP code
     */
    async fillAddressDetails(addressData) {
        await this.fillAddress(addressData.address);
        await this.fillCity(addressData.city);
        await this.selectState(addressData.state);
        await this.fillZipCode(addressData.zipCode);
    }

    /**
     * Remove existing coupon code
     */
    async removeCoupon() {
        console.log('🗑️ Attempting to remove existing coupon...');
        
        try {
            // Look for the Remove button with the specific classes
            const removeButton = this.page.locator('button.tw-text-green-700.tw-underline', { hasText: 'Remove' })
                .or(this.page.locator('button:has-text("Remove")').filter({ hasText: /^Remove$/i }));
            
            // Check if the remove button exists (indicating a coupon is applied)
            const isVisible = await removeButton.isVisible().catch(() => false);
            
            if (isVisible) {
                await removeButton.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(500);
                await removeButton.click();
                await this.page.waitForTimeout(3000); // Wait for coupon to be removed and UI to update
                console.log('✅ Existing coupon removed successfully');
            } else {
                console.log('ℹ️  No existing coupon to remove');
            }
        } catch (e) {
            console.log(`ℹ️  No existing coupon found or already removed: ${e.message}`);
        }
    }

    /**
     * Apply discount coupon code
     * @param {string} couponCode - Coupon code to apply
     */
    async applyCoupon(couponCode) {
        console.log(`🎫 Applying coupon code: ${couponCode}`);
        
        try {
            // Scroll to the coupon section
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight / 2);
            });
            await this.page.waitForTimeout(1000);
            
            // Find and fill the coupon input field
            const couponField = this.page.locator('input[name="coupon"]').or(this.page.locator('input[placeholder*="coupon" i]'));
            
            // Check if coupon field is already visible
            const isVisible = await couponField.isVisible().catch(() => false);
            
            if (!isVisible) {
                // Click "Discount Code?" link/button to reveal the textbox
                const discountCodeButton = this.page.locator('text=/discount code/i').first();
                await discountCodeButton.waitFor({ state: 'visible', timeout: 10000 });
                await discountCodeButton.scrollIntoViewIfNeeded();
                await discountCodeButton.click();
                console.log('✅ Clicked "Discount Code?" to reveal input field');
                await this.page.waitForTimeout(2000);
            } else {
                console.log('ℹ️  Coupon field already visible');
            }
            
            // Wait for coupon field to be visible and ready
            await couponField.waitFor({ state: 'visible', timeout: 10000 });
            await couponField.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(500);
            
            // Fill coupon code
            await couponField.click();
            await couponField.fill(couponCode);
            await this.page.waitForTimeout(1000);
            console.log(`📝 Coupon code entered: ${couponCode}`);
            
            // Click Apply button
            await this.applyButton.waitFor({ state: 'visible', timeout: 5000 });
            await this.applyButton.click();
            console.log('✅ Clicked Apply button');
            
            // Wait for price changes to reflect
            await this.page.waitForTimeout(2000);
            
            console.log(`✅ Coupon code "${couponCode}" applied - price updated`);
        } catch (e) {
            console.log(`⚠️ Failed to apply coupon: ${e.message}`);
            throw e;
        }
    }

    /**
     * Wait for Stripe iframes to load
     */
    async waitForStripeIframes() {
        console.log('⏳ Waiting for Stripe iframes to load...');
        
        // Wait for Stripe container to be visible
        await this.page.waitForTimeout(2000);
        
        // Click on card number label to focus
        try {
            await this.page.locator('div').filter({ hasText: /^Card Number$/ }).click();
        } catch (e) {
            console.log('ℹ️  Card number label click skipped');
        }
        
        // Wait for all Stripe iframes to be attached and visible
        await this.page.locator('iframe[name="card-number-element"]').waitFor({ state: 'attached', timeout: 30000 });
        await this.page.locator('iframe[name="card-expiry-element"]').waitFor({ state: 'attached', timeout: 30000 });
        await this.page.locator('iframe[name="card-cvc-element"]').waitFor({ state: 'attached', timeout: 30000 });
        
        // Wait for iframes to be fully loaded and interactive
        await this.page.waitForTimeout(3000);
        console.log('✅ Stripe iframes loaded');
    }

    /**
     * Fill in card number
     * @param {string} cardNumber - Card number (e.g., '4242424242424242')
     */
    async fillCardNumber(cardNumber) {
        console.log(`📝 Filling card number: ${cardNumber}`);
        const cardNumberFrame = this.page.frameLocator('iframe[name="card-number-element"]');
        const cardNumberInput = cardNumberFrame.locator('input').first();
        
        // Wait for input to be ready
        await cardNumberInput.waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForTimeout(2000);
        
        // Multiple attempts to fill
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                // Click to focus
                await cardNumberInput.click();
                await this.page.waitForTimeout(1000);
                
                // Clear field
                await cardNumberInput.fill('');
                await this.page.waitForTimeout(500);
                
                // Fill card number
                await cardNumberInput.fill(cardNumber);
                await this.page.waitForTimeout(3000);
                
                // Verify by checking if we can still interact with it
                const value = await cardNumberInput.inputValue().catch(() => '');
                if (value || attempts === maxAttempts - 1) {
                    console.log('✅ Card number filled');
                    break;
                }
            } catch (e) {
                attempts++;
                console.log(`⚠️ Card number fill attempt ${attempts} failed, retrying...`);
                if (attempts === maxAttempts) throw e;
            }
        }
    }

    /**
     * Fill in card expiry
     * @param {string} expiry - Expiry in format MMYY (e.g., '1039')
     */
    async fillCardExpiry(expiry) {
        console.log(`📝 Filling expiry date: ${expiry}`);
        const cardExpiryFrame = this.page.frameLocator('iframe[name="card-expiry-element"]');
        const cardExpiryInput = cardExpiryFrame.locator('input').first();
        
        // Wait for input to be ready
        await cardExpiryInput.waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForTimeout(2000);
        
        // Multiple attempts to fill
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                // Click to focus
                await cardExpiryInput.click();
                await this.page.waitForTimeout(1000);
                
                // Clear field
                await cardExpiryInput.fill('');
                await this.page.waitForTimeout(500);
                
                // Fill expiry
                await cardExpiryInput.fill(expiry);
                await this.page.waitForTimeout(2000);
                
                console.log('✅ Expiry date filled');
                break;
            } catch (e) {
                attempts++;
                console.log(`⚠️ Expiry fill attempt ${attempts} failed, retrying...`);
                if (attempts === maxAttempts) throw e;
            }
        }
    }

    /**
     * Fill in card CVC
     * @param {string} cvc - CVC code (e.g., '345')
     */
    async fillCardCvc(cvc) {
        console.log(`📝 Filling CVC: ${cvc}`);
        const cardCvcFrame = this.page.frameLocator('iframe[name="card-cvc-element"]');
        const cardCvcInput = cardCvcFrame.locator('input').first();
        
        // Wait for input to be ready
        await cardCvcInput.waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForTimeout(2000);
        
        // Multiple attempts to fill
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                // Click to focus
                await cardCvcInput.click();
                await this.page.waitForTimeout(1000);
                
                // Clear field
                await cardCvcInput.fill('');
                await this.page.waitForTimeout(500);
                
                // Fill CVC
                await cardCvcInput.fill(cvc);
                await this.page.waitForTimeout(2000);
                
                console.log('✅ CVC filled');
                break;
            } catch (e) {
                attempts++;
                console.log(`⚠️ CVC fill attempt ${attempts} failed, retrying...`);
                if (attempts === maxAttempts) throw e;
            }
        }
    }

    /**
     * Fill in complete payment information
     * @param {Object} paymentData - Payment information
     * @param {string} paymentData.cardNumber - Card number
     * @param {string} paymentData.expiry - Expiry date (MMYY)
     * @param {string} paymentData.cvc - CVC code
     */
    async fillPaymentDetails(paymentData) {
        console.log('\n💳 Starting payment details entry...');
        await this.waitForStripeIframes();
        
        // Fill each field with extra wait between them
        await this.fillCardNumber(paymentData.cardNumber);
        await this.page.waitForTimeout(1000);
        
        await this.fillCardExpiry(paymentData.expiry);
        await this.page.waitForTimeout(1000);
        
        await this.fillCardCvc(paymentData.cvc);
        
        // Wait for Stripe to validate the card
        console.log('⏳ Waiting for Stripe to validate card...');
        await this.page.waitForTimeout(5000);
        console.log('✅ Payment details completed\n');
    }

    /**
     * Wait for checkout button to be ready and Stripe to finish tokenizing
     */
    async waitForCheckoutReady() {
        console.log('⏳ Waiting for Stripe to finish tokenizing...');
        
        // Wait for checkout button to be visible
        await this.checkoutButton.waitFor({ state: 'visible', timeout: 30000 });
        
        // Check if button is disabled and wait for it to be enabled
        let attempts = 0;
        const maxAttempts = 15;
        
        while (attempts < maxAttempts) {
            const isDisabled = await this.checkoutButton.isDisabled();
            if (!isDisabled) {
                console.log('✅ Checkout button is ready');
                // Extra wait to ensure Stripe tokenization is complete
                await this.page.waitForTimeout(2000);
                return;
            }
            console.log(`⏳ Waiting for checkout to be ready... (${attempts + 1}/${maxAttempts})`);
            await this.page.waitForTimeout(2000);
            attempts++;
        }
        
        console.log('⚠️ Proceeding with checkout after max wait time');
        await this.page.waitForTimeout(3000);
    }

    /**
     * Submit the checkout form
     */
    async submitCheckout() {
        await this.waitForCheckoutReady();
        
        console.log('🛒 Clicking checkout button...');
        await this.checkoutButton.click();
        
        // Wait for navigation to success page
        await this.page.waitForURL('**/checkout/success', { timeout: 60000 });
        console.log(`✅ Checkout completed successfully!`);
    }

    /**
     * Complete the entire checkout process
     * @param {Object} addressData - Address information
     * @param {Object} paymentData - Payment information
     * @param {string} couponCode - Optional coupon code to apply
     */
    async completeCheckout(addressData = null, paymentData = null, couponCode = null) {
        await this.waitForPageLoad();
        
        // Default address data
        const defaultAddress = {
            address: 'test',
            city: 'New York City',
            state: 'New York',
            zipCode: '90210'
        };
        
        // Default payment data (Stripe test card)
        const defaultPayment = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };
        
        // Fill address first
        await this.fillAddressDetails(addressData || defaultAddress);
        
        // Apply coupon BEFORE filling payment details (coupon clears card fields)
        if (couponCode) {
            // First remove any existing auto-applied coupon
            await this.removeCoupon();
            // Then apply the new coupon
            await this.applyCoupon(couponCode);
        }
        
        // Fill payment details AFTER coupon is applied
        await this.fillPaymentDetails(paymentData || defaultPayment);
        
        await this.submitCheckout();
    }
}

module.exports = CheckoutPage;

