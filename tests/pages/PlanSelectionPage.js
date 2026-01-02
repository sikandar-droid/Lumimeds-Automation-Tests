class PlanSelectionPage {
    constructor(page) {
        this.page = page;
        
        // Locators for both desktop and mobile
        this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
        this.continueButton = page.getByRole('button', { name: /Continue.*\$/ }); // Mobile button with "Continue $216 / mo."
    }

    /**
     * Wait for checkout/continue button to be enabled (handles both desktop and mobile)
     */
    async waitForCheckoutButtonEnabled() {
        console.log('⏳ Waiting for checkout/continue button...');
        
        // Try to find either the desktop "Checkout" or mobile "Continue" button
        try {
            // Wait for either button to appear
            await Promise.race([
                this.checkoutButton.waitFor({ state: 'visible', timeout: 10000 }),
                this.continueButton.waitFor({ state: 'visible', timeout: 10000 })
            ]);
            
            // Determine which button is visible
            const isCheckoutVisible = await this.checkoutButton.isVisible().catch(() => false);
            const isContinueVisible = await this.continueButton.isVisible().catch(() => false);
            
            if (isCheckoutVisible) {
                console.log('✅ Found desktop "Checkout" button');
                await this.checkoutButton.scrollIntoViewIfNeeded();
                
                await this.page.waitForFunction(
                    () => {
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const button = buttons.find(btn => btn.textContent?.includes('Checkout'));
                        return button && !button.disabled;
                    },
                    { timeout: 20000 }
                );
            } else if (isContinueVisible) {
                console.log('✅ Found mobile "Continue" button');
                await this.continueButton.scrollIntoViewIfNeeded();
                
                await this.page.waitForFunction(
                    () => {
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const button = buttons.find(btn => btn.textContent?.includes('Continue'));
                        return button && !button.disabled;
                    },
                    { timeout: 20000 }
                );
            }
        } catch (error) {
            console.log('❌ Neither Checkout nor Continue button found');
            throw error;
        }
    }

    /**
     * Select a subscription plan
     * @param {string} planName - Name of the plan (e.g., '3-Month Subscription')
     */
    async selectPlan(planName) {
        const planRadio = this.page.getByRole('radio', { name: `value ${planName}` }).first();
        await planRadio.waitFor({ state: 'visible', timeout: 10000 });
        await planRadio.scrollIntoViewIfNeeded();
        
        // Try multiple approaches for Firefox compatibility
        try {
            await planRadio.check({ timeout: 5000 });
        } catch (error) {
            // If check() fails, try clicking directly
            await planRadio.click({ force: true });
        }
        
        // Verify the radio button is actually checked
        await this.page.waitForFunction(
            (plan) => {
                const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
                const targetRadio = radios.find(r => {
                    const label = r.parentElement?.textContent || '';
                    return label.includes(`value ${plan}`);
                });
                return targetRadio && targetRadio.checked;
            },
            planName,
            { timeout: 10000 }
        );
        
        // Wait a moment for the app's JavaScript to process the selection
        await this.page.waitForTimeout(2000);
    }

    /**
     * Proceed to checkout after selecting a plan (handles both desktop and mobile)
     */
    async proceedToCheckout() {
        await this.waitForCheckoutButtonEnabled();
        await this.page.waitForTimeout(500);
        
        // Click whichever button is visible
        const isCheckoutVisible = await this.checkoutButton.isVisible().catch(() => false);
        const isContinueVisible = await this.continueButton.isVisible().catch(() => false);
        
        if (isCheckoutVisible) {
            console.log('🖱️  Clicking desktop "Checkout" button');
            await this.checkoutButton.click();
        } else if (isContinueVisible) {
            console.log('🖱️  Clicking mobile "Continue" button');
            await this.continueButton.click();
        } else {
            throw new Error('Neither Checkout nor Continue button is visible');
        }
    }

    /**
     * Select a plan and proceed to checkout
     * @param {string} planName - Name of the plan (default: '3-Month Subscription')
     */
    async selectPlanAndCheckout(planName = '3-Month Subscription') {
        await this.selectPlan(planName);
        await this.proceedToCheckout();
    }
}

module.exports = PlanSelectionPage;

