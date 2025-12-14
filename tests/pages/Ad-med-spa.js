/**
 * Page Object Model for LumiMeds Ad Page - med-spa
 * Has Choose Your Plan Now button and Get Started buttons
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
        this.heroDescription = page.locator('text=/Avoid the med spa markups|mark it right/i');
        
        // CTA Buttons (Get Started)
        this.getStartedButtons = page.getByRole('button', { name: /^get started$/i });
        this.getStartedLinks = page.getByRole('link', { name: /^get started$/i });
        this.primaryCTAButton = page.getByRole('button', { name: /^get started$/i }).first();
        
        // Choose Your Plan Now Button
        this.chooseYourPlanButton = page.getByRole('button', { name: /choose your plan now/i });
        this.chooseYourPlanLink = page.getByRole('link', { name: /choose your plan now/i });
        
        // Subscription Plans
        this.starterPlan = page.locator('text=/starter/i').first();
        this.valuePlan = page.locator('text=/value/i').first();
        this.monthlyPlan = page.locator('text=/Monthly/i').first();
        
        // Trustpilot Section
        this.customerReviewsHeading = page.locator('text=/What our customer say/i');
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

    async goto(pageName, options = {}) {
        const defaultOptions = {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
            ...options
        };
        await this.page.goto(`https://lumimeds.com/ad/${pageName}`, defaultOptions);
    }

    async waitForPageLoad() {
        try {
            await this.page.waitForLoadState('networkidle', { timeout: 30000 });
        } catch (e) {
            console.log('Network still active, proceeding...');
        }
        await this.page.waitForTimeout(2000);
    }

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

    async getAllGetStartedButtons() {
        const buttons = await this.getStartedButtons.all();
        const links = await this.getStartedLinks.all();
        return [...buttons, ...links];
    }

    async clickPrimaryGetStarted() {
        // Try "Choose Your Plan Now" button first
        try {
            if (await this.chooseYourPlanButton.isVisible({ timeout: 3000 })) {
                await this.chooseYourPlanButton.first().scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(1000);
                await this.chooseYourPlanButton.first().click();
                return;
            }
        } catch (e) {
            // Button not found, try link
        }
        
        try {
            if (await this.chooseYourPlanLink.isVisible({ timeout: 3000 })) {
                await this.chooseYourPlanLink.first().scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(1000);
                await this.chooseYourPlanLink.first().click();
                return;
            }
        } catch (e) {
            // Link not found, fall back to Get Started
        }
        
        // Fall back to regular Get Started button
        await this.primaryCTAButton.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await this.primaryCTAButton.click();
    }

    async clickChooseYourPlan() {
        const button = await this.chooseYourPlanButton.isVisible({ timeout: 3000 }).catch(() => false)
            ? this.chooseYourPlanButton.first()
            : this.chooseYourPlanLink.first();
        
        await button.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await button.click();
    }

    async isChooseYourPlanVisible() {
        const buttonVisible = await this.chooseYourPlanButton.first().isVisible({ timeout: 3000 }).catch(() => false);
        const linkVisible = await this.chooseYourPlanLink.first().isVisible({ timeout: 3000 }).catch(() => false);
        return buttonVisible || linkVisible;
    }

    async scrollToTrustpilot() {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.waitForTimeout(3000);
    }

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

    async takeFullPageScreenshot(filename, device = 'mobile') {
        await this.page.screenshot({
            path: `screenshots/${device}/${filename}`,
            fullPage: true
        });
    }

    async isPageLoaded() {
        try {
            await this.logo.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch (e) {
            return false;
        }
    }

    async getPageTitle() {
        return await this.mainHeading.textContent();
    }

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

