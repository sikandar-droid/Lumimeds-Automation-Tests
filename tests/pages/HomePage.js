class HomePage {
    constructor(page, baseUrl = null) {
        this.page = page;
        this.baseUrl = baseUrl || process.env.BASE_URL || 'https://staging.lumimeds.com';
        
        // Locators
        this.getStartedButton = page.locator('button[data-tracking-id="get-started-home-weight-loss-program"]');
        this.continueButton = page.getByRole('button', { name: 'Continue' });
    }

    /**
     * Navigate to the homepage with optimized loading
     */
    async goto() {
        await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait for page to settle and allow async content to load
        await this.page.waitForTimeout(2000);
        
        // Try to wait for network to be mostly idle, but don't fail if it doesn't
        try {
            await this.page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch {
            console.log('⚠️ Network still active, proceeding anyway...');
        }
        
        // Close any popup that might appear
        await this.closePopup();
    }

    /**
     * Close any popups or modals (e.g., $50 OFF LUMI50 popup)
     */
    async closePopup() {
        try {
            // Wait for any popup to appear
            await this.page.waitForTimeout(3000);
            
            console.log('🔍 Attempting to close any popup by clicking...');
            
            // Always click at multiple positions to close any popup
            // (popup may not be detectable with our selectors)
            const positions = [
                { x: 10, y: 10 },
                { x: 5, y: 5 },
                { x: 15, y: 15 },
            ];
            
            for (const pos of positions) {
                try {
                    await this.page.mouse.click(pos.x, pos.y);
                    await this.page.waitForTimeout(800);
                } catch (e) {
                    // Continue to next position
                }
            }
            
            console.log('✅ Popup close sequence completed');
            return true;
        } catch (e) {
            console.log(`ℹ️  Popup close attempt: ${e.message}`);
            return false;
        }
    }

    /**
     * Click the Get Started button and wait for modal
     */
    async clickGetStarted() {
        await this.getStartedButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.getStartedButton.click();
        
        // Wait for navigation or modal to appear
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(2000);
    }

    /**
     * Click Continue button in the modal/overlay
     */
    async clickContinue() {
        await this.continueButton.waitFor({ state: 'visible', timeout: 15000 });
        await this.continueButton.click();
    }

    /**
     * Complete the initial homepage flow to start onboarding
     */
    async startOnboarding() {
        await this.clickGetStarted();
        await this.clickContinue();
    }
}

module.exports = HomePage;

