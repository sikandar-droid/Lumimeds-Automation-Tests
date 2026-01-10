class CheckoutPage {
    constructor(page) {
        this.page = page;
        
        // Locators - using exact name+placeholder selectors for stability
        this.addressInput = page.locator('input[name="shipping_address"][placeholder="Street address, house number, or P.O. Box"]');
        this.cityInput = page.locator('input[name="shipping_city"]');
        // Use multiple fallback selectors for the state dropdown (react-select component)
        this.stateDropdown = page.locator('[id*="state"]').filter({ has: page.locator('input') }).first()
            .or(page.getByRole('combobox').filter({ hasText: /state|select/i }).first())
            .or(page.locator('.css-19bb58m').first())
            .or(page.locator('[class*="control"]').filter({ hasText: /state|select/i }).first());
        this.zipCodeInput = page.getByRole('textbox', { name: 'Zip Code' });
        this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
        
        // Discount Coupon
        this.couponInput = page.getByPlaceholder(/coupon|discount|promo/i).or(page.getByLabel(/coupon|discount|promo/i));
        this.applyButton = page.getByRole('button', { name: /apply/i });
        this.discountAmount = page.locator('text=/discount|savings|-/i');
    }

    /**
     * Wait for the checkout page to load and stabilize
     */
    async waitForPageLoad() {
        console.log('⏳ Waiting for checkout page to load...');
        
        // Wait for address input to appear
        await this.addressInput.waitFor({ state: 'visible', timeout: 30000 });
        
        // Wait for any loading overlays to disappear
        try {
            const loadingOverlay = this.page.locator('.tw-absolute.tw-inset-0.tw-bg-white\\/80');
            const hasOverlay = await loadingOverlay.isVisible().catch(() => false);
            if (hasOverlay) {
                console.log('⏳ Waiting for loading overlay to disappear...');
                await loadingOverlay.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
                console.log('✅ Loading overlay check complete');
            }
        } catch (e) {
            console.log('ℹ️  Loading overlay check skipped');
        }
        
        // Wait for "Loading Payment Options..." to disappear
        try {
            const loadingPayment = this.page.locator('text="Loading Payment Options"');
            const isLoadingPayment = await loadingPayment.isVisible().catch(() => false);
            if (isLoadingPayment) {
                console.log('⏳ Waiting for payment options to load...');
                await loadingPayment.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
                console.log('✅ Payment options check complete');
            }
        } catch (e) {
            console.log('ℹ️  Payment options check skipped');
        }
        
        // Wait for page to fully stabilize (longer for CI environments)
        console.log('⏳ Waiting for form to stabilize...');
        await this.page.waitForTimeout(8000);
        console.log('✅ Checkout page ready');
    }

    /**
     * Fill in the address with polling retry approach
     * @param {string} address - Street address
     */
    async fillAddress(address) {
        console.log('📝 Filling address field...');
        
        const maxAttempts = 10;
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${maxAttempts} to fill address...`);
                
                // Create fresh locator each time
                const addressField = this.page.locator('input[name="shipping_address"][placeholder="Street address, house number, or P.O. Box"]');
                
                // Short wait (5s) instead of long (30s)
                await addressField.waitFor({ state: 'visible', timeout: 5000 });
                await this.page.waitForTimeout(300);
                
                // Try to click and fill
                await addressField.click({ force: true, timeout: 5000 });
                await addressField.fill(address);
                
                // Verify it worked
                const value = await addressField.inputValue();
                if (value === address) {
                    console.log('✅ Address filled successfully');
                    return;
                }
                
                console.log(`⚠️ Value mismatch, retrying...`);
            } catch (e) {
                lastError = e;
                console.log(`⚠️ Attempt ${attempt} failed: ${e.message.split('\n')[0]}`);
                
                // Wait longer between retries
                await this.page.waitForTimeout(2000);
            }
        }
        
        throw new Error(`Failed to fill address after ${maxAttempts} attempts: ${lastError?.message}`);
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
        // Wait for any loading overlays to disappear before selecting state
        await this.page.waitForTimeout(2000);
        
        // Wait for "Loading Payment Options..." to disappear if present
        const loadingOverlay = this.page.locator('text="Loading Payment Options"');
        const isLoading = await loadingOverlay.isVisible().catch(() => false);
        if (isLoading) {
            console.log('⏳ Waiting for payment options to load...');
            await loadingOverlay.waitFor({ state: 'hidden', timeout: 30000 });
            console.log('✅ Payment options loaded');
        }
        
        // Wait for any white loading overlays to disappear (tw-bg-white/80)
        console.log('⏳ Checking for loading overlays...');
        const whiteOverlay = this.page.locator('.tw-absolute.tw-inset-0.tw-bg-white\\/80');
        const hasOverlay = await whiteOverlay.isVisible().catch(() => false);
        if (hasOverlay) {
            console.log('⏳ Waiting for loading overlay to disappear...');
            await whiteOverlay.waitFor({ state: 'hidden', timeout: 30000 });
            console.log('✅ Loading overlay removed');
        }
        
        // Wait a bit more for page to stabilize
        await this.page.waitForTimeout(1000);
        
        // Try multiple approaches to click the state dropdown
        console.log('🔍 Looking for state dropdown...');
        let dropdownClicked = false;
        
        // Approach 1: Try the defined stateDropdown locator
        try {
            const isVisible = await this.stateDropdown.isVisible().catch(() => false);
            if (isVisible) {
                await this.stateDropdown.click();
                dropdownClicked = true;
                console.log('✅ Clicked state dropdown (primary locator)');
            }
        } catch (e) {
            console.log('ℹ️  Primary dropdown locator failed, trying alternatives...');
        }
        
        // Approach 2: Find by label "State" and click the adjacent/child dropdown
        if (!dropdownClicked) {
            try {
                const stateLabel = this.page.locator('label:has-text("State")').first();
                const stateContainer = stateLabel.locator('..').locator('[class*="control"], [class*="select"], [role="combobox"]').first();
                const containerVisible = await stateContainer.isVisible().catch(() => false);
                if (containerVisible) {
                    await stateContainer.click();
                    dropdownClicked = true;
                    console.log('✅ Clicked state dropdown (label-based)');
                }
            } catch (e) {
                console.log('ℹ️  Label-based approach failed...');
            }
        }
        
        // Approach 3: Find react-select by its unique input placeholder or container
        if (!dropdownClicked) {
            try {
                const reactSelect = this.page.locator('[class*="-control"]').filter({ hasText: /select/i }).first();
                const selectVisible = await reactSelect.isVisible().catch(() => false);
                if (selectVisible) {
                    await reactSelect.click();
                    dropdownClicked = true;
                    console.log('✅ Clicked state dropdown (react-select)');
                }
            } catch (e) {
                console.log('ℹ️  React-select approach failed...');
            }
        }
        
        // Approach 4: Click directly on "Select..." text in the dropdown area
        if (!dropdownClicked) {
            try {
                const selectText = this.page.locator('text="Select..."').first()
                    .or(this.page.locator('[class*="placeholder"]').filter({ hasText: /select/i }).first());
                await selectText.click();
                dropdownClicked = true;
                console.log('✅ Clicked state dropdown (placeholder text)');
            } catch (e) {
                console.log('ℹ️  Placeholder text approach failed...');
            }
        }
        
        if (!dropdownClicked) {
            throw new Error('❌ Could not find or click the state dropdown');
        }
        
        await this.page.waitForTimeout(500);
        
        // Wait again for any overlay that might appear after clicking dropdown
        const overlayAfterClick = this.page.locator('.tw-absolute.tw-inset-0.tw-bg-white\\/80');
        const hasOverlayAfterClick = await overlayAfterClick.isVisible().catch(() => false);
        if (hasOverlayAfterClick) {
            console.log('⏳ Waiting for overlay after dropdown click...');
            await overlayAfterClick.waitFor({ state: 'hidden', timeout: 30000 });
            console.log('✅ Overlay cleared');
        }
        
        // Now click the state option - try multiple approaches
        console.log(`🔍 Looking for state option: ${state}`);
        try {
            // First try role-based
            await this.page.getByRole('option', { name: state }).click();
            console.log(`✅ Selected state: ${state}`);
        } catch (e) {
            // Fallback to text-based
            try {
                await this.page.locator(`[class*="option"]:has-text("${state}")`).first().click();
                console.log(`✅ Selected state: ${state} (fallback)`);
            } catch (e2) {
                // Last resort - click text directly
                await this.page.locator(`text="${state}"`).first().click();
                console.log(`✅ Selected state: ${state} (text match)`);
            }
        }
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
     * Get current total price from the page
     * @returns {number} - Current total price as a number
     */
    async getTotalPrice() {
        try {
            // Look for Total price text
            const totalText = await this.page.locator('text=/total/i').locator('..').textContent();
            
            // Extract price using regex (matches $123.45 or $123)
            const priceMatch = totalText.match(/\$(\d+\.?\d*)/);
            
            if (priceMatch) {
                const price = parseFloat(priceMatch[1]);
                console.log(`💰 Current total price: $${price.toFixed(2)}`);
                return price;
            }
            
            throw new Error('Could not extract price from page');
        } catch (e) {
            console.log(`⚠️ Failed to get total price: ${e.message}`);
            throw e;
        }
    }

    /**
     * Apply discount coupon code with price verification
     * @param {string} couponCode - Coupon code to apply
     * @param {number} expectedDiscountPercent - Expected discount percentage (e.g., 99 for 99% off)
     * @returns {Object} - { priceBeforeCoupon, priceAfterCoupon, discountApplied, discountPercent }
     */
    async applyCoupon(couponCode, expectedDiscountPercent = null) {
        console.log(`🎫 Applying coupon code: ${couponCode}`);
        
        // FIRST: Remove any auto-applied coupons (flash sales, promotions, etc.)
        console.log('🗑️ Checking for and removing any auto-applied coupons...');
        await this.removeCoupon();
        
        // Capture price BEFORE applying coupon (after removing auto-applied ones)
        const priceBeforeCoupon = await this.getTotalPrice();
        console.log(`📊 Price BEFORE coupon: $${priceBeforeCoupon.toFixed(2)}`);
        
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
            // Hide Intercom widget if it's blocking (mobile issue)
            try {
                await this.page.evaluate(() => {
                    const intercom = document.querySelector('.intercom-lightweight-app');
                    if (intercom) {
                        intercom.style.display = 'none';
                        console.log('🔇 Intercom widget hidden');
                    }
                });
            } catch (e) {
                console.log('ℹ️  Intercom widget not found or already hidden');
            }
            
            // Scroll Apply button into view (important for mobile)
            await this.applyButton.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(1000);
            
            // Click the Apply button with force (handles mobile overlays)
            await this.applyButton.click({ force: true });
            console.log('✅ Clicked Apply button');
            
            // Wait for price changes to reflect
            await this.page.waitForTimeout(3000);
            
            // Capture price AFTER applying coupon
            const priceAfterCoupon = await this.getTotalPrice();
            console.log(`📊 Price AFTER coupon: $${priceAfterCoupon.toFixed(2)}`);
            
            // Calculate discount
            const discountApplied = priceBeforeCoupon - priceAfterCoupon;
            const discountPercent = (discountApplied / priceBeforeCoupon) * 100;
            
            console.log(`💵 Discount applied: $${discountApplied.toFixed(2)} (${discountPercent.toFixed(1)}% off)`);
            
            // Verify discount if expected percentage provided
            if (expectedDiscountPercent !== null) {
                const tolerance = 2; // Allow 2% tolerance for rounding/fees
                const minExpected = expectedDiscountPercent - tolerance;
                const maxExpected = expectedDiscountPercent + tolerance;
                
                if (discountPercent < minExpected || discountPercent > maxExpected) {
                    throw new Error(
                        `🚨 COUPON VERIFICATION FAILED!\n` +
                        `Expected: ${expectedDiscountPercent}% discount\n` +
                        `Actual: ${discountPercent.toFixed(1)}% discount\n` +
                        `Price before: $${priceBeforeCoupon.toFixed(2)}\n` +
                        `Price after: $${priceAfterCoupon.toFixed(2)}`
                    );
                }
                console.log(`✅ Coupon verification PASSED - Discount is within expected range`);
            }
            
            return {
                priceBeforeCoupon,
                priceAfterCoupon,
                discountApplied,
                discountPercent
            };
            
        } catch (e) {
            console.log(`❌ Failed to apply coupon: ${e.message}`);
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
     * @param {number} expectedPrice - Expected final price to verify before submission
     */
    async submitCheckout(expectedPrice = null) {
        await this.waitForCheckoutReady();
        
        // FINAL SAFETY CHECK: Verify price right before checkout
        if (expectedPrice !== null) {
            console.log('\n🛡️  ========== FINAL PRICE VERIFICATION BEFORE CHECKOUT ==========');
            const finalPrice = await this.getTotalPrice();
            console.log(`💰 Expected price: $${expectedPrice.toFixed(2)}`);
            console.log(`💰 Current price: $${finalPrice.toFixed(2)}`);
            
            if (Math.abs(finalPrice - expectedPrice) > 0.10) {
                await this.page.screenshot({
                    path: 'screenshots/final-price-mismatch.png',
                    fullPage: true
                });
                throw new Error(`🚨 CRITICAL: Price mismatch! Expected $${expectedPrice.toFixed(2)} but found $${finalPrice.toFixed(2)}. STOPPING CHECKOUT!`);
            }
            console.log('✅ Final price verification passed - safe to proceed');
            console.log('========================================\n');
        }
        
        // Scroll to checkout button (important for mobile)
        console.log('📜 Scrolling to checkout button...');
        await this.checkoutButton.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000); // Wait for scroll to complete
        
        // Store current URL before clicking
        const urlBeforeClick = this.page.url();
        console.log(`📍 Current URL before checkout: ${urlBeforeClick}`);
        
        console.log('🛒 Clicking checkout button...');
        await this.checkoutButton.click({ force: true }); // Force click for mobile
        
        // Wait for checkout processing
        console.log('⏳ Waiting for checkout to process...');
        
        // First, wait for some indication that checkout is processing
        try {
            // Wait for button to become disabled or for loading state
            await Promise.race([
                this.checkoutButton.waitFor({ state: 'hidden', timeout: 10000 }),
                this.page.waitForSelector('text=/processing|loading|please wait/i', { timeout: 10000 }),
                this.page.waitForTimeout(3000) // Minimum wait
            ]).catch(() => {});
        } catch (e) {
            console.log('ℹ️  No explicit processing indicator found, continuing...');
        }
        
        // Wait for redirect to success page using multiple approaches
        console.log('⏳ Waiting for redirect to success page...');
        
        let redirectSuccess = false;
        
        // Approach 1: Use waitForURL (most reliable)
        try {
            await this.page.waitForURL(/.*success.*/i, { timeout: 90000 });
            redirectSuccess = true;
            console.log('✅ Redirect detected via waitForURL');
        } catch (e) {
            console.log('⚠️ waitForURL timed out, trying alternative approaches...');
        }
        
        // Approach 2: Check if URL already changed
        if (!redirectSuccess) {
            const currentUrl = this.page.url();
            if (currentUrl !== urlBeforeClick && currentUrl.toLowerCase().includes('success')) {
                redirectSuccess = true;
                console.log('✅ Redirect detected via URL comparison');
            }
        }
        
        // Approach 3: Wait for success page elements
        if (!redirectSuccess) {
            try {
                await Promise.race([
                    this.page.waitForSelector('text=/thank you|order confirmed|success/i', { timeout: 30000 }),
                    this.page.waitForSelector('[class*="success"]', { timeout: 30000 })
                ]);
                redirectSuccess = true;
                console.log('✅ Success page elements detected');
            } catch (e) {
                console.log('⚠️ Could not detect success page elements');
            }
        }
        
        // Approach 4: Poll for URL change
        if (!redirectSuccess) {
            console.log('⏳ Polling for URL change...');
            for (let i = 0; i < 30; i++) {
                await this.page.waitForTimeout(2000);
                const currentUrl = this.page.url();
                if (currentUrl.toLowerCase().includes('success')) {
                    redirectSuccess = true;
                    console.log('✅ Success URL detected via polling');
                    break;
                }
                if (i % 5 === 0) {
                    console.log(`⏳ Still waiting... (${i * 2}s) - Current URL: ${currentUrl}`);
                }
            }
        }
        
        const successUrl = this.page.url();
        
        if (!redirectSuccess) {
            // Take a screenshot for debugging
            await this.page.screenshot({
                path: 'screenshots/checkout-redirect-failed.png',
                fullPage: true
            });
            console.log('📸 Screenshot saved: screenshots/checkout-redirect-failed.png');
            console.log(`❌ Final URL: ${successUrl}`);
            throw new Error(`❌ Checkout redirect failed. Expected success URL but got: ${successUrl}`);
        }
        
        console.log(`✅ Checkout completed successfully!`);
        console.log(`📍 Success page URL: ${successUrl}`);
        
        // Soft validation: Just check if URL contains "success"
        if (successUrl.toLowerCase().includes('success')) {
            console.log(`✅ Success URL validation passed (contains "success")`);
        } else {
            console.log(`⚠️ URL doesn't contain "success" but redirect was detected: ${successUrl}`);
        }
    }

    /**
     * Complete the entire checkout process
     * @param {Object} addressData - Address information
     * @param {Object} paymentData - Payment information
     * @param {string} couponCode - Optional coupon code to apply
     */
    async completeCheckout(addressData = null, paymentData = null, couponCode = null) {
        await this.waitForPageLoad();
        
        // Default address data - Updated to Las Vegas address
        const defaultAddress = {
            address: '5328 Poker Flat Ln',
            city: 'Las Vegas',
            state: 'Nevada',
            zipCode: '89118'
        };
        
        // Default payment data (Stripe test card)
        const defaultPayment = {
            cardNumber: '4242424242424242',
            expiry: '1039',
            cvc: '345'
        };
        
        // Fill address first
        await this.fillAddressDetails(addressData || defaultAddress);
        
        // Variable to store expected final price
        let expectedFinalPrice = null;
        
        // Apply coupon BEFORE filling payment details (coupon clears card fields)
        if (couponCode) {
            console.log('\n🛡️  ========== SAFETY CHECK: COUPON VERIFICATION ==========\n');
            
            // First remove any existing auto-applied coupon
            await this.removeCoupon();
            
            // Determine expected discount based on coupon code
            let expectedDiscount = null;
            if (couponCode.toLowerCase().includes('99off')) {
                expectedDiscount = 99; // Expect 99% discount
                console.log('🎯 Expected discount: 99% off (based on coupon code)');
            }
            
            // Apply coupon with price verification
            try {
                const result = await this.applyCoupon(couponCode, expectedDiscount);
                
                // Store the expected final price after coupon
                expectedFinalPrice = result.priceAfterCoupon;
                
                console.log('\n✅ ========== COUPON VERIFICATION PASSED ==========');
                console.log(`   Original price: $${result.priceBeforeCoupon.toFixed(2)}`);
                console.log(`   Discounted price: $${result.priceAfterCoupon.toFixed(2)}`);
                console.log(`   Discount: ${result.discountPercent.toFixed(1)}% off`);
                console.log(`   Savings: $${result.discountApplied.toFixed(2)}`);
                console.log('✅ Safe to proceed with checkout\n');
                
            } catch (e) {
                console.log('\n❌ ========== COUPON VERIFICATION FAILED ==========');
                console.log(`   ${e.message}`);
                console.log('🛑 STOPPING CHECKOUT TO PREVENT FULL CHARGE!\n');
                
                // Take screenshot of the error
                await this.page.screenshot({ 
                    path: 'screenshots/coupon-verification-failed.png', 
                    fullPage: true 
                });
                console.log('📸 Screenshot saved: screenshots/coupon-verification-failed.png\n');
                
                throw new Error('🚨 CHECKOUT STOPPED: Coupon verification failed. This prevents full payment charge.');
            }
        }
        
        // Fill payment details AFTER coupon is applied
        await this.fillPaymentDetails(paymentData || defaultPayment);
        
        // CRITICAL: Re-verify coupon is still applied after filling payment details
        if (couponCode && expectedFinalPrice !== null) {
            console.log('\n🛡️  ========== RE-VERIFYING COUPON AFTER PAYMENT DETAILS ==========');
            
            await this.page.waitForTimeout(2000); // Wait for any state updates
            
            const currentPrice = await this.getTotalPrice();
            console.log(`💰 Expected price: $${expectedFinalPrice.toFixed(2)}`);
            console.log(`💰 Current price after payment: $${currentPrice.toFixed(2)}`);
            
            // Check if coupon was removed by payment details
            if (Math.abs(currentPrice - expectedFinalPrice) > 0.10) {
                console.log('⚠️  WARNING: Price changed after filling payment! Coupon may have been removed!');
                console.log('🔄 Attempting to re-apply coupon...');
                
                // Try to re-apply the coupon
                try {
                    const reapplyResult = await this.applyCoupon(couponCode, expectedFinalPrice);
                    expectedFinalPrice = reapplyResult.priceAfterCoupon;
                    console.log(`✅ Coupon re-applied successfully: $${expectedFinalPrice.toFixed(2)}`);
                } catch (e) {
                    await this.page.screenshot({ 
                        path: 'screenshots/coupon-removed-after-payment.png', 
                        fullPage: true 
                    });
                    throw new Error(`🚨 CRITICAL: Coupon was removed after filling payment details! Current price: $${currentPrice.toFixed(2)}, Expected: $${expectedFinalPrice.toFixed(2)}. STOPPING CHECKOUT!`);
                }
            } else {
                console.log('✅ Coupon still applied after payment details');
            }
            console.log('========================================\n');
        }
        
        // Submit checkout with final price verification
        await this.submitCheckout(expectedFinalPrice);
    }
}

module.exports = CheckoutPage;

