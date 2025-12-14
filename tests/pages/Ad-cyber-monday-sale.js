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
        this.heroDescription = page.locator('text=/CYBER MONDAY|Secure 3 months/i');
        
        // CTA Buttons
        this.getStartedButtons = page.getByRole('button', { name: /^get started$/i });
        this.getStartedLinks = page.getByRole('link', { name: /^get started$/i });
        this.primaryCTAButton = page.getByRole('button', { name: /^get started$/i }).first();
        
        // "Get Your Plan" Button - Primary CTA for this page
        this.getYourPlanButton = page.getByRole('button', { name: /get your plan/i }).first();
        this.getYourPlanLink = page.getByRole('link', { name: /get your plan/i }).first();
        
        // Subscription Plans
        this.monthlySubscriptionSection = page.locator('text=Monthly Subscription').first();
        this.threeMonthSubscriptionSection = page.locator('text=/3-Month Subscription/i').first();
        this.semaglutideSection = page.locator('text=/Compounded Semaglutide/i').first();
        this.tirzepatideSection = page.locator('text=/Compounded Tirzepatide/i').first();
        
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
    }

    /**
     * Navigate to the ad page
     */
    async goto() {
        await this.page.goto('https://lumimeds.com/ad/cyber-monday-sale', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
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
     * Close any popups or modals
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
     * Click the "Get Your Plan" button
     */
    async clickGetYourPlan() {
        // Try button first, then link
        const button = this.getYourPlanButton;
        const link = this.getYourPlanLink;
        
        if (await button.isVisible({ timeout: 5000 })) {
            await button.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(1000);
            await button.click();
            console.log('✅ Clicked "Get Your Plan" button');
        } else if (await link.isVisible({ timeout: 5000 })) {
            await link.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(1000);
            await link.click();
            console.log('✅ Clicked "Get Your Plan" link');
        } else {
            throw new Error('"Get Your Plan" button not found');
        }
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
     * Scroll to Trustpilot section
     */
    async scrollToTrustpilot() {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.waitForTimeout(3000);
    }

    /**
     * Click Trustpilot widget
     */
    async clickTrustpilotWidget(context) {
        await this.scrollToTrustpilot();
        
        if (await this.trustpilotWidget.isVisible({ timeout: 10000 })) {
            await this.trustpilotWidget.scrollIntoViewIfNeeded();
            await this.page.evaluate(el => {
                const rect = el.getBoundingClientRect();
                window.scrollBy(0, rect.top - window.innerHeight / 2);
            }, await this.trustpilotWidget.elementHandle());
            await this.page.waitForTimeout(3000);

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
     * Get all footer links and their clickability status
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
     */
    async takeFullPageScreenshot(filename, device = 'mobile') {
        await this.page.screenshot({
            path: `screenshots/${device}/${filename}`,
            fullPage: true
        });
    }

    /**
     * Check if page is loaded successfully
     */
    async isPageLoaded() {
        try {
            // Try multiple indicators that page is loaded
            const loadIndicators = [
                this.page.locator('text=LumiMeds').first(),
                this.page.locator('[class*="logo"]').first(),
                this.page.locator('text=/BLACK FRIDAY|CYBER MONDAY/i').first(),
                this.page.locator('text=/Get Your Plan|GET STARTED/i').first(),
                this.page.locator('header').first()
            ];
            
            for (const indicator of loadIndicators) {
                if (await indicator.isVisible({ timeout: 5000 }).catch(() => false)) {
                    return true;
                }
            }
            
            // Final fallback - check if page has content
            const body = this.page.locator('body');
            const hasContent = await body.textContent();
            return hasContent && hasContent.length > 100;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get page title from main heading
     */
    async getPageTitle() {
        return await this.mainHeading.textContent();
    }

    /**
     * Count Get Started buttons
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

