/**
 * Page Object Model for LumiMeds Ad Page - weight-loss-treatment
 * Has Get Started buttons and Learn More buttons
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
        this.heroDescription = page.locator('text=/Reach your goals|Tirzepatide/i');
        
        // CTA Buttons (Get Started)
        this.getStartedButtons = page.getByRole('button', { name: /^get started$/i });
        this.getStartedLinks = page.getByRole('link', { name: /^get started$/i });
        this.primaryCTAButton = page.getByRole('button', { name: /^get started$/i }).first();
        
        // Learn More Buttons - multiple selectors for flexibility
        this.learnMoreButtons = page.getByRole('button', { name: /learn more/i });
        this.learnMoreLinks = page.getByRole('link', { name: /learn more/i });
        this.learnMoreAlt = page.locator('button:has-text("Learn More"), a:has-text("Learn More")');
        
        // Select Buttons (on plans page after Learn More click)
        this.selectButtons = page.getByRole('button', { name: /^select$/i });
        this.selectLinks = page.getByRole('link', { name: /^select$/i });
        
        // Get In Touch Button (contact form)
        this.getInTouchButton = page.getByRole('button', { name: /get in touch/i });
        
        // Subscription Plans
        this.starterPlan = page.locator('text=/Starter 3-Month Supply/i').first();
        this.valuePlan = page.locator('text=/Value 3-Month Subscription/i').first();
        this.monthlyPlan = page.locator('text=/Monthly Subscription/i').first();
        
        // Trustpilot Section
        this.customerReviewsHeading = page.locator('text=/What our customers say/i');
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

    async getAllLearnMoreButtons() {
        const buttons = await this.learnMoreButtons.all();
        const links = await this.learnMoreLinks.all();
        const alt = await this.learnMoreAlt.all();
        // Deduplicate by combining all found elements
        const allElements = [...buttons, ...links];
        if (allElements.length === 0) {
            return alt;
        }
        return allElements;
    }

    async clickPrimaryGetStarted() {
        await this.primaryCTAButton.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await this.primaryCTAButton.click();
    }

    async clickLearnMore() {
        const learnMoreBtn = this.learnMoreLinks.first();
        await learnMoreBtn.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await learnMoreBtn.click();
    }

    /**
     * Click Learn More and verify navigation to plans page
     * @returns {Promise<boolean>} True if navigated to plans page
     */
    async verifyLearnMoreNavigation() {
        // Try multiple selectors to find Learn More
        let learnMoreBtn;
        
        // Try role-based link selector
        try {
            if (await this.learnMoreLinks.first().isVisible({ timeout: 3000 })) {
                learnMoreBtn = this.learnMoreLinks.first();
                console.log('✅ Found Learn More as link');
            }
        } catch (e) {}
        
        // Try role-based button selector
        if (!learnMoreBtn) {
            try {
                if (await this.learnMoreButtons.first().isVisible({ timeout: 3000 })) {
                    learnMoreBtn = this.learnMoreButtons.first();
                    console.log('✅ Found Learn More as button');
                }
            } catch (e) {}
        }
        
        // Try alternative text-based selector
        if (!learnMoreBtn) {
            try {
                if (await this.learnMoreAlt.first().isVisible({ timeout: 3000 })) {
                    learnMoreBtn = this.learnMoreAlt.first();
                    console.log('✅ Found Learn More using text selector');
                }
            } catch (e) {}
        }
        
        if (!learnMoreBtn) {
            console.log('⚠️ No Learn More button or link found');
            return false;
        }
        
        await learnMoreBtn.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}),
            learnMoreBtn.click()
        ]);
        
        await this.page.waitForTimeout(3000);
        const currentUrl = this.page.url();
        const normalizedUrl = currentUrl.split('?')[0].replace('https://www.', 'https://');
        
        return normalizedUrl.includes('/products/glp-1') && normalizedUrl.includes('plans');
    }

    /**
     * Click Select button on the plans page
     */
    async clickSelectOnPlansPage() {
        let selectBtn;
        
        // Wait for modal/page to fully load
        await this.page.waitForTimeout(2000);
        
        try {
            if (await this.selectButtons.first().isVisible({ timeout: 10000 })) {
                selectBtn = this.selectButtons.first();
            }
        } catch (e) {}
        
        if (!selectBtn) {
            try {
                if (await this.selectLinks.first().isVisible({ timeout: 5000 })) {
                    selectBtn = this.selectLinks.first();
                }
            } catch (e) {}
        }
        
        if (selectBtn) {
            console.log('✅ Select button found, ensuring it\'s clickable...');
            
            // Ensure button is in viewport and fully loaded
            await selectBtn.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(1500);
            
            // Wait for button to be enabled and clickable
            await selectBtn.waitFor({ state: 'visible', timeout: 10000 });
            
            // Check if button is enabled (not disabled)
            const isEnabled = await selectBtn.isEnabled();
            if (!isEnabled) {
                throw new Error('Select button is disabled');
            }
            
            console.log('✅ Select button is clickable, clicking now...');
            
            // Click with retry logic
            let clicked = false;
            for (let i = 0; i < 3; i++) {
                try {
                    await selectBtn.click({ timeout: 10000 });
                    clicked = true;
                    console.log('✅ Select button clicked successfully');
                    break;
                } catch (e) {
                    console.log(`⚠️ Click attempt ${i + 1} failed: ${e.message}`);
                    if (i < 2) {
                        await this.page.waitForTimeout(2000);
                    } else {
                        throw e;
                    }
                }
            }
            
            if (!clicked) {
                throw new Error('Failed to click Select button after 3 attempts');
            }
        } else {
            throw new Error('Select button not found on plans page');
        }
    }

    /**
     * Verify Learn More → Plans → Select → Survey full flow
     * @returns {Promise<boolean>} True if navigated to survey page
     */
    async verifyLearnMoreToSurveyFlow() {
        // Step 1: Click Learn More and go to plans page
        const onPlansPage = await this.verifyLearnMoreNavigation();
        if (!onPlansPage) {
            console.log('⚠️ Did not navigate to plans page');
            return false;
        }
        console.log('✅ Navigated to plans page');
        
        // Step 2: Wait for plans page to load
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(2000);
        
        // Step 3: Click Select button
        await this.clickSelectOnPlansPage();
        
        // Step 4: Wait for navigation to survey
        await this.page.waitForTimeout(3000);
        const finalUrl = this.page.url();
        const normalizedUrl = finalUrl.split('?')[0].replace('https://www.', 'https://');
        
        return normalizedUrl.includes('/products/survey/weight_loss');
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

    async countLearnMoreButtons() {
        const allButtons = await this.getAllLearnMoreButtons();
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

