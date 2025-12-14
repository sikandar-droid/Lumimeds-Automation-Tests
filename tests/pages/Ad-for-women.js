/**
 * Page Object Model for LumiMeds Ad Pages
 * Represents common elements and actions across all ad landing pages
 */

class AdPage {
    constructor(page) {
        this.page = page;
        
        // Header Elements
        this.logo = page.locator('text=LumiMeds').first();
        this.navigationMedications = page.getByRole('link', { name: /medications/i });
        this.navigationFAQs = page.getByRole('link', { name: /^faqs$/i });
        this.navigationGetStarted = page.getByRole('link', { name: /get started/i }).first();
        this.navigationLogin = page.getByRole('link', { name: /login/i });
        this.headerPhone = page.locator('text=(415) 968-0890').first();
        
        // Promo Banner
        this.promoBanner = page.locator('text=/Secure 3 Months|Use Code LUMI50/i').first();
        this.countdownTimer = page.locator('text=/DAYS.*HRS.*MINS.*SECS/');
        
        // Hero Section
        this.mainHeading = page.locator('h1, [role="heading"]').first();
        this.heroDescription = page.locator('text=/More than weight loss|finding balance/i');
        
        // CTA Buttons (Get Started)
        this.getStartedButtons = page.getByRole('button', { name: /^get started$/i });
        this.getStartedLinks = page.getByRole('link', { name: /^get started$/i });
        this.primaryCTAButton = page.getByRole('button', { name: /^get started$/i }).first();
        
        // Subscription Plans
        this.monthlySubscriptionSection = page.locator('text=Monthly Subscription').first();
        this.threeMonthSubscriptionSection = page.locator('text=/3-Month Subscription/i').first();
        this.starterSupplySection = page.locator('text=/Starter 3-Month Supply/i').first();
        
        // Trustpilot Section
        this.customerReviewsHeading = page.locator('text=/What Our Customers Say/i');
        this.trustpilotWidget = page.locator('iframe[title*="Customer reviews"], iframe[title*="Trustpilot"], .trustpilot-widget, [class*="trustbox"]').first();
        
        // Footer - Contact Info
        this.footerPhone = page.locator('footer').getByText('(415) 968-0890');
        this.footerEmail = page.locator('footer').getByText('help@lumimeds.com');
        this.footerAddress = page.locator('footer').getByText('Las Vegas, NV');
        this.serviceHours = page.locator('footer').getByText(/Service Hours/i);
        
        // Footer - Quick Links
        this.footerLinks = {
            membershipTerms: page.locator('footer a, footer button').filter({ hasText: /membership.*terms.*conditions/i }).first(),
            pharmacyPartnerships: page.locator('footer a, footer button').filter({ hasText: /pharmacy.*partnerships/i }).first(),
            careers: page.locator('footer a, footer button').filter({ hasText: /careers|apply.*position/i }).first(),
            faq: page.locator('footer a, footer button').filter({ hasText: /^faq$/i }).first(),
            termsOfUse: page.locator('footer a, footer button').filter({ hasText: /terms.*use/i }).first(),
            privacyPolicy: page.locator('footer a, footer button').filter({ hasText: /privacy.*policy/i }).first()
        };
        
        // Popup/Modal Elements
        this.modalCloseButton = page.locator('button[aria-label="Close"], button:has-text("×"), button:has-text("✕"), [class*="close"]').first();
        this.popup = page.locator('[role="dialog"], [class*="modal"], [class*="popup"]').first();
        this.blackFridayPopup = page.locator('text=/black friday|cyber monday|sale/i').first();
    }

    /**
     * Navigate to the ad page
     * @param {string} pageName - The ad page name (e.g., 'for-women', 'otp', 'science')
     * @param {object} options - Navigation options (waitUntil, timeout)
     */
    async goto(pageName, options = {}) {
        const defaultOptions = {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
            ...options
        };
        await this.page.goto(`https://lumimeds.com/ad/${pageName}`, defaultOptions);
    }

    /**
     * Wait for page to be fully loaded
     */
    async waitForPageLoad() {
        try {
            await this.page.waitForLoadState('networkidle', { timeout: 30000 });
        } catch (e) {
            console.log('Network still active, proceeding...');
        }
        await this.page.waitForTimeout(2000);
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
     * Get all Get Started buttons on the page
     */
    async getAllGetStartedButtons() {
        const buttons = await this.getStartedButtons.all();
        const links = await this.getStartedLinks.all();
        return [...buttons, ...links];
    }

    /**
     * Click the primary Get Started button
     */
    async clickPrimaryGetStarted() {
        await this.primaryCTAButton.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await this.primaryCTAButton.click();
    }

    /**
     * Click Get Started button by index
     * @param {number} index - Button index (0-based)
     */
    async clickGetStartedByIndex(index = 0) {
        const allButtons = await this.getAllGetStartedButtons();
        if (allButtons[index]) {
            await allButtons[index].scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(1000);
            await allButtons[index].click();
        } else {
            throw new Error(`Get Started button at index ${index} not found`);
        }
    }

    /**
     * Verify Get Started button navigates to survey page
     * @returns {Promise<boolean>} True if navigated to survey page
     */
    async verifyGetStartedNavigation() {
        const [response] = await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
            this.clickPrimaryGetStarted()
        ]);
        
        await this.page.waitForTimeout(2000);
        const currentUrl = this.page.url();
        const normalizedUrl = currentUrl.split('?')[0].replace('https://www.', 'https://');
        
        return normalizedUrl.includes('/products/survey/weight_loss');
    }

    /**
     * Scroll to Trustpilot section
     */
    async scrollToTrustpilot() {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.waitForTimeout(3000);
    }

    /**
     * Click Trustpilot widget
     * @param {object} context - Browser context for handling new tabs
     * @returns {Promise<Page|null>} New page if opened, null otherwise
     */
    async clickTrustpilotWidget(context) {
        await this.scrollToTrustpilot();
        
        if (await this.trustpilotWidget.isVisible({ timeout: 10000 })) {
            // Scroll widget into center of viewport
            await this.trustpilotWidget.scrollIntoViewIfNeeded();
            await this.page.evaluate(el => {
                const rect = el.getBoundingClientRect();
                window.scrollBy(0, rect.top - window.innerHeight / 2);
            }, await this.trustpilotWidget.elementHandle());
            await this.page.waitForTimeout(3000);

            // Listen for new page
            const pagePromise = context.waitForEvent('page', { timeout: 30000 });
            
            try {
                await this.trustpilotWidget.click({ timeout: 5000 });
            } catch (clickError) {
                await this.trustpilotWidget.click({ force: true });
            }
            
            try {
                const newPage = await pagePromise;
                return newPage;
            } catch (e) {
                console.log('No new page opened');
                return null;
            }
        }
        
        throw new Error('Trustpilot widget not found');
    }

    /**
     * Verify a footer link is clickable
     * @param {string} linkName - Name of the footer link
     * @returns {Promise<boolean>}
     */
    async isFooterLinkClickable(linkName) {
        const link = this.footerLinks[linkName];
        if (!link) {
            throw new Error(`Footer link "${linkName}" not found`);
        }
        
        const isVisible = await link.isVisible({ timeout: 5000 });
        const isEnabled = await link.isEnabled();
        
        return isVisible && isEnabled;
    }

    /**
     * Get all footer links and their clickability status
     * @returns {Promise<Array>}
     */
    async getAllFooterLinksStatus() {
        const results = [];
        
        for (const [name, locator] of Object.entries(this.footerLinks)) {
            try {
                const isVisible = await locator.isVisible({ timeout: 3000 });
                const isEnabled = isVisible ? await locator.isEnabled() : false;
                
                results.push({
                    name,
                    found: isVisible,
                    clickable: isEnabled
                });
            } catch (e) {
                results.push({
                    name,
                    found: false,
                    clickable: false,
                    error: e.message
                });
            }
        }
        
        return results;
    }

    /**
     * Take a full page screenshot
     * @param {string} filename - Screenshot filename
     * @param {string} device - Device type (mobile, tablet, laptop)
     */
    async takeFullPageScreenshot(filename, device = 'mobile') {
        await this.page.screenshot({
            path: `screenshots/${device}/${filename}`,
            fullPage: true
        });
    }

    /**
     * Check if page is loaded successfully
     * @returns {Promise<boolean>}
     */
    async isPageLoaded() {
        try {
            await this.logo.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get page title from main heading
     * @returns {Promise<string>}
     */
    async getPageTitle() {
        return await this.mainHeading.textContent();
    }

    /**
     * Count Get Started buttons
     * @returns {Promise<number>}
     */
    async countGetStartedButtons() {
        const allButtons = await this.getAllGetStartedButtons();
        let visibleCount = 0;
        
        for (const button of allButtons) {
            if (await button.isVisible({ timeout: 2000 })) {
                visibleCount++;
            }
        }
        
        return visibleCount;
    }
}

module.exports = AdPage;

