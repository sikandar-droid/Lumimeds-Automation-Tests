class PlanSelectionPage {
    constructor(page) {
        this.page = page;
        
        // Locators
        this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    }

    /**
     * Wait for checkout button to be enabled
     */
    async waitForCheckoutButtonEnabled() {
        await this.checkoutButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.checkoutButton.scrollIntoViewIfNeeded();
        
        await this.page.waitForFunction(
            (buttonText) => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const button = buttons.find(btn => btn.textContent?.includes(buttonText));
                return button && !button.disabled;
            },
            'Checkout',
            { timeout: 20000 }
        );
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
     * Proceed to checkout after selecting a plan
     */
    async proceedToCheckout() {
        await this.waitForCheckoutButtonEnabled();
        await this.page.waitForTimeout(500);
        await this.checkoutButton.click();
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

