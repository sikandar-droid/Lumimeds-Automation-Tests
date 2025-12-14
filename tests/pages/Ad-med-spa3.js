/**
 * Page Object Model for LumiMeds Ad Page - med-spa3 (Spanish)
 * Spanish page with "Comenzar" buttons and Spanish footer links
 */

class AdPage {
    constructor(page) {
        this.page = page;
        
        // Header Elements
        this.logo = page.locator('text=LumiMeds').first();
        this.navigationMedications = page.getByRole('link', { name: /medications|medicamentos/i });
        this.navigationFAQs = page.getByRole('link', { name: /^faqs$|preguntas/i });
        this.navigationGetStarted = page.getByRole('link', { name: /get started|comenzar/i }).first();
        this.navigationLogin = page.getByRole('link', { name: /login|iniciar/i });
        this.headerPhone = page.locator('text=(415) 968-0890').first();
        
        // Promo Banner
        this.promoBanner = page.locator('text=/Secure 3 Months|Use Code LUMI50|Asegura 3 Meses/i').first();
        this.countdownTimer = page.locator('text=/DAYS.*HRS.*MINS.*SECS|DÍAS.*HRS.*MINS.*SEGS/i');
        
        // Hero Section
        this.mainHeading = page.locator('h1, [role="heading"]').first();
        
        // CTA Buttons (Comenzar - Spanish for "Get Started")
        this.comenzarButtons = page.getByRole('button', { name: /^comenzar$/i });
        this.comenzarLinks = page.getByRole('link', { name: /^comenzar$/i });
        this.primaryCTAButton = page.getByRole('button', { name: /^comenzar$/i }).first();
        
        // Also check for "Get Started" buttons in case page is partially in English
        this.getStartedButtons = page.getByRole('button', { name: /^get started$/i });
        this.getStartedLinks = page.getByRole('link', { name: /^get started$/i });
        
        // Choose Your Plan Now (may be in Spanish: "Elige Tu Plan Ahora")
        this.chooseYourPlanButton = page.getByRole('button', { name: /choose your plan|elige tu plan/i });
        this.chooseYourPlanLink = page.getByRole('link', { name: /choose your plan|elige tu plan/i });
        
        // Subscription Plans
        this.starterPlan = page.locator('text=/starter|inicial/i').first();
        this.valuePlan = page.locator('text=/value|valor/i').first();
        this.monthlyPlan = page.locator('text=/Monthly|Mensual/i').first();
        
        // Trustpilot Section
        this.customerReviewsHeading = page.locator('text=/What Our Customers Say|Lo que dicen nuestros clientes/i');
        this.trustpilotWidget = page.locator('iframe[title*="Customer reviews"], iframe[title*="Trustpilot"], .trustpilot-widget, [class*="trustbox"]').first();
        
        // Footer - Contact Info
        this.footerPhone = page.locator('footer').getByText('(415) 968-0890');
        this.footerEmail = page.locator('footer').getByText('help@lumimeds.com');
        this.footerAddress = page.locator('footer').getByText('Las Vegas, NV');
        this.serviceHours = page.locator('footer').getByText(/Service Hours|Horario de Servicio/i);
        
        // Footer - Quick Links (Spanish)
        this.footerLinks = {
            membershipTerms: page.locator('footer a, footer button').filter({ hasText: /términos.*condiciones.*membresía|membership.*terms/i }).first(),
            pharmacyPartnerships: page.locator('footer a, footer button').filter({ hasText: /asociaciones.*farmacéuticas|pharmacy.*partnerships/i }).first(),
            careers: page.locator('footer a, footer button').filter({ hasText: /carreras|aplicar.*posición|careers|apply.*position/i }).first(),
            faq: page.locator('footer a, footer button').filter({ hasText: /^faq$|preguntas.*frecuentes/i }).first(),
            termsOfUse: page.locator('footer a, footer button').filter({ hasText: /términos.*uso|terms.*use/i }).first(),
            privacyPolicy: page.locator('footer a, footer button').filter({ hasText: /política.*privacidad|privacy.*policy/i }).first()
        };
        
        // Popup/Modal Elements
        this.modalCloseButton = page.locator('button[aria-label="Close"], button[aria-label="Cerrar"], button:has-text("×"), button:has-text("✕"), [class*="close"]').first();
        this.popup = page.locator('[role="dialog"], [class*="modal"], [class*="popup"]').first();
    }

    async goto(pageName, options = {}) {
        const defaultOptions = {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
            ...options
        };
        // Spanish page uses /es/ad/ path
        await this.page.goto(`https://lumimeds.com/es/ad/${pageName}`, defaultOptions);
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

    async getAllComenzarButtons() {
        const comenzarBtns = await this.comenzarButtons.all();
        const comenzarLnks = await this.comenzarLinks.all();
        const getStartedBtns = await this.getStartedButtons.all();
        const getStartedLnks = await this.getStartedLinks.all();
        return [...comenzarBtns, ...comenzarLnks, ...getStartedBtns, ...getStartedLnks];
    }

    async clickPrimaryComenzar() {
        // Try "Comenzar" button first (Spanish)
        try {
            if (await this.comenzarButtons.first().isVisible({ timeout: 3000 })) {
                await this.comenzarButtons.first().scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(1000);
                await this.comenzarButtons.first().click();
                return;
            }
        } catch (e) {
            // Button not found
        }
        
        try {
            if (await this.comenzarLinks.first().isVisible({ timeout: 3000 })) {
                await this.comenzarLinks.first().scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(1000);
                await this.comenzarLinks.first().click();
                return;
            }
        } catch (e) {
            // Link not found
        }
        
        // Fall back to "Get Started" button (English)
        try {
            if (await this.getStartedButtons.first().isVisible({ timeout: 3000 })) {
                await this.getStartedButtons.first().scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(1000);
                await this.getStartedButtons.first().click();
                return;
            }
        } catch (e) {
            // Button not found
        }
        
        try {
            if (await this.getStartedLinks.first().isVisible({ timeout: 3000 })) {
                await this.getStartedLinks.first().scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(1000);
                await this.getStartedLinks.first().click();
                return;
            }
        } catch (e) {
            // Link not found
        }
        
        throw new Error('No Comenzar or Get Started button found');
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

    async countComenzarButtons() {
        const allButtons = await this.getAllComenzarButtons();
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

