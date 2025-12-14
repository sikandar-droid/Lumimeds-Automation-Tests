class AdPage {
    constructor(page) {
        this.page = page;
        this.url = 'https://lumimeds.com/ad/holiday-weight-goals';
        
        // Primary CTA buttons - multiple variations
        this.primaryCTAButton = page.getByRole('button', { name: /^get started$/i }).first();
        this.getStartedButtons = page.getByRole('button', { name: /^get started$/i });
        this.getStartedLinks = page.getByRole('link', { name: /^get started$/i });
        
        // Holiday-specific buttons
        this.startEvaluationButton = page.getByRole('link', { name: /start your online evaluation/i }).or(
            page.getByRole('button', { name: /start your online evaluation/i })
        );
        this.getYourPlanButton = page.getByRole('button', { name: /get your plan/i }).or(
            page.getByRole('link', { name: /get your plan/i })
        );
        
        // Popup button
        this.popupGetYoursNowButton = page.getByRole('button', { name: /get yours now/i });
        
        // Footer elements
        this.footerLinks = {
            membershipTerms: page.getByRole('link', { name: /membership terms/i }),
            pharmacyPartnerships: page.getByRole('link', { name: /pharmacy partnerships/i }),
            careers: page.getByRole('link', { name: /careers/i }),
            faq: page.locator('footer').getByRole('link', { name: /^faq$/i }),
            termsOfUse: page.getByRole('link', { name: /terms of use/i }),
            privacyPolicy: page.getByRole('link', { name: /privacy policy/i })
        };
        
        // Contact information
        this.footerPhone = page.locator('footer').getByText('(415) 968-0890');
        this.footerEmail = page.locator('footer').getByText('help@lumimeds.com');
        this.footerAddress = page.locator('footer').getByText('Las Vegas, NV');
        this.serviceHours = page.locator('footer').getByText(/Service Hours/i);
        
        // Header elements
        this.headerLogo = page.locator('[class*="logo"], img[alt*="lumi" i], text=LumiMeds').first();
        this.hamburgerMenu = page.getByRole('button', { name: /menu/i });
        
        // Trustpilot
        this.trustpilotWidget = page.locator('[class*="trustpilot"], iframe[title*="Customer reviews"]').first();
    }

    async goto() {
        await this.page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.page.waitForTimeout(2000);
    }

    async waitForPageLoad() {
        try {
            await this.page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch {
            console.log('Network still active, proceeding...');
        }
        await this.page.waitForTimeout(2000);
    }

    async isPageLoaded() {
        // Check for multiple indicators that the page has loaded
        try {
            // Try to find logo first
            const logo = this.page.locator('[class*="logo"], img[alt*="lumi" i], text=LumiMeds').first();
            const logoVisible = await logo.isVisible({ timeout: 5000 }).catch(() => false);
            
            if (logoVisible) return true;
            
            // If logo not found, check for Get Started button
            const button = await this.primaryCTAButton.isVisible({ timeout: 3000 }).catch(() => false);
            if (button) return true;
            
            // Check for page heading
            const heading = this.page.locator('h1').first();
            const headingVisible = await heading.isVisible({ timeout: 3000 }).catch(() => false);
            
            return headingVisible;
        } catch (e) {
            return false;
        }
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
        await this.primaryCTAButton.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await this.primaryCTAButton.click();
    }

    async clickStartEvaluation() {
        await this.startEvaluationButton.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await this.startEvaluationButton.click();
    }

    async clickGetYourPlan() {
        await this.getYourPlanButton.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await this.getYourPlanButton.click();
    }

    async clickPopupGetYoursNow() {
        await this.popupGetYoursNowButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.popupGetYoursNowButton.click();
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
                console.log(`⚠️ Direct click failed: ${clickError.message}`);
                try {
                    const frame = this.page.frameLocator('iframe[title*="Customer reviews"]').first();
                    await frame.locator('body').click({ timeout: 5000 });
                } catch (frameError) {
                    console.log(`⚠️ Frame click also failed: ${frameError.message}`);
                }
            }

            try {
                const newPage = await pagePromise;
                return newPage;
            } catch (e) {
                console.log(`⚠️ No new page opened: ${e.message}`);
                return null;
            }
        }
        
        return null;
    }

    async captureFullPageScreenshot(filename) {
        await this.page.setViewportSize({ width: 430, height: 932 });
        
        const totalHeight = await this.page.evaluate(() => document.documentElement.scrollHeight);
        const viewportHeight = 932;
        let currentPosition = 0;
        
        while (currentPosition < totalHeight) {
            await this.page.evaluate((pos) => window.scrollTo(0, pos), currentPosition);
            await this.page.waitForTimeout(1000);
            currentPosition += viewportHeight;
        }
        
        await this.page.evaluate(() => window.scrollTo(0, 0));
        await this.page.waitForTimeout(2000);
        
        await this.page.screenshot({ 
            path: filename,
            fullPage: true 
        });
    }
}

module.exports = AdPage;

