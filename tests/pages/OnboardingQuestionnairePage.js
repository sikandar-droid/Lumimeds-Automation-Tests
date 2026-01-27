class OnboardingQuestionnairePage {
    constructor(page) {
        this.page = page;
        
        // Generic locators
        this.textbox = page.getByRole('textbox');
        this.nextButton = page.getByRole('button', { name: 'Next' });
        this.submitButton = page.getByRole('button', { name: 'Submit & Proceed to Checkout' });
    }

    /**
     * Wait for next button to be enabled
     */
    async waitForNextButtonEnabled() {
        await this.page.waitForFunction(
            () => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const nextButton = buttons.find(btn => btn.textContent?.trim() === 'Next');
                return nextButton && !nextButton.disabled;
            },
            { timeout: 10000 }
        );
    }

    /**
     * Wait for submit button to be enabled
     */
    async waitForSubmitButtonEnabled() {
        await this.submitButton.waitFor({ state: 'visible' });
        await this.page.waitForFunction(
            (buttonText) => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const button = buttons.find(btn => btn.textContent?.includes(buttonText));
                return button && !button.disabled;
            },
            'Submit & Proceed to Checkout',
            { timeout: 10000 }
        );
    }

    /**
     * Wait for page change (textbox to clear)
     */
    async waitForPageChange() {
        await this.page.waitForFunction(
            () => {
                const textbox = document.querySelector('input[type="text"], input[type="email"]');
                return textbox && textbox.value === '';
            },
            { timeout: 10000 }
        );
        await this.page.waitForTimeout(500);
    }

    /**
     * Enter email address
     * @param {string} email - The email address
     */
    async enterEmail(email) {
        await this.textbox.click();
        await this.textbox.fill(email);
        await this.nextButton.click();
        await this.waitForPageChange();
    }

    /**
     * Enter first name and last name (handles both same page and separate pages)
     * @param {string} name - The full name (will be split into first and last)
     */
    async enterName(name) {
        // Split name into first and last name
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Sikandar';
        const lastName = nameParts.slice(1).join(' ') || 'Automation';
        
        console.log(`📝 Entering first name: ${firstName} and last name: ${lastName}`);
        
        // Try to find both fields on the same page first
        let firstNameField;
        let lastNameField;
        
        // Find first name field - try multiple selectors
        const firstNameSelectors = [
            () => this.page.getByRole('textbox', { name: /first name/i }),
            () => this.page.getByPlaceholder(/first name|your first name/i),
            () => this.page.getByLabel(/first name/i),
            () => this.page.locator('input[placeholder*="first name" i]'),
            () => this.page.locator('input[placeholder*="Your first name" i]')
        ];
        
        for (const selectorFn of firstNameSelectors) {
            try {
                const field = selectorFn().first();
                await field.waitFor({ state: 'visible', timeout: 2000 });
                firstNameField = field;
                console.log('✅ Found first name field');
                break;
            } catch (e) {
                continue;
            }
        }
        
        // Find last name field - try multiple selectors
        const lastNameSelectors = [
            () => this.page.getByRole('textbox', { name: /last name/i }),
            () => this.page.getByPlaceholder(/last name|your last name/i),
            () => this.page.getByLabel(/last name/i),
            () => this.page.locator('input[placeholder*="last name" i]'),
            () => this.page.locator('input[placeholder*="Your last name" i]')
        ];
        
        for (const selectorFn of lastNameSelectors) {
            try {
                const field = selectorFn().first();
                await field.waitFor({ state: 'visible', timeout: 2000 });
                lastNameField = field;
                console.log('✅ Found last name field');
                break;
            } catch (e) {
                continue;
            }
        }
        
        // If both fields found on same page, fill them both
        if (firstNameField && lastNameField) {
            console.log('📋 Both fields on same page - filling both');
            // Fill first name
            await firstNameField.click();
            await firstNameField.fill(firstName);
            await this.page.waitForTimeout(500);
            
            // Fill last name
            await lastNameField.click();
            await lastNameField.fill(lastName);
            await this.page.waitForTimeout(500);
            
            // Click Next button after both fields are filled
            await this.waitForNextButtonEnabled();
            await this.nextButton.click();
        } else {
            // Fallback: fields on separate pages (old behavior)
            console.log('📋 Fields on separate pages - using fallback');
            console.log(`📝 Entering first name: ${firstName}`);
            // Fill first name
            await this.textbox.click();
            await this.textbox.fill(firstName);
            await this.waitForNextButtonEnabled();
            await this.nextButton.click();
            await this.waitForPageChange();
            
            console.log(`📝 Entering last name: ${lastName}`);
            // Fill last name
            await this.textbox.click();
            await this.textbox.fill(lastName);
            await this.waitForNextButtonEnabled();
            await this.nextButton.click();
        }
        
        // Wait for next page - date of birth dropdowns (not a textbox)
        await this.page.waitForSelector('#rsd__select-month', { state: 'visible', timeout: 10000 }).catch(() => {
            // Fallback: wait a bit for page transition
            console.log('⚠️ Date of birth dropdowns not immediately visible, waiting...');
        });
        await this.page.waitForTimeout(500);
    }

    /**
     * Enter date of birth
     * @param {string} month - Month (1-12)
     * @param {string} day - Day (1-31)
     * @param {string} year - Year (4 digits)
     */
    async enterDateOfBirth(month, day, year) {
        await this.page.locator('#rsd__select-month').selectOption(month);
        await this.page.locator('#rsd__select-day').selectOption(day);
        await this.page.locator('#rsd__select-year').selectOption(year);
        await this.nextButton.click();
    }

    /**
     * Select gender
     * @param {string} gender - 'Male' or 'Female'
     */
    async selectGender(gender) {
        await this.page.getByRole('button', { name: gender, exact: true }).click();
    }

    /**
     * Enter phone number
     * @param {string} phone - Phone number
     */
    async enterPhone(phone) {
        await this.textbox.click();
        await this.textbox.fill(phone);
        await this.nextButton.click();
    }

    /**
     * Enter height and weight
     * @param {string} feet - Height in feet
     * @param {string} inches - Height in inches
     * @param {string} weight - Weight in lbs
     */
    async enterHeightWeight(feet, inches, weight) {
        await this.page.getByLabel('Feet').selectOption(feet);
        await this.page.getByLabel('Inches').selectOption(inches);
        await this.page.getByRole('textbox', { name: 'Weight (lbs)' }).click();
        await this.page.getByRole('textbox', { name: 'Weight (lbs)' }).fill(weight);
        await this.nextButton.click();
    }

    /**
     * Click Proceed button
     */
    async clickProceed() {
        await this.page.getByRole('button', { name: 'Proceed' }).click();
    }

    /**
     * Select weight loss goal
     * @param {string} goal - e.g., 'Fat loss'
     */
    async selectWeightLossGoal(goal) {
        await this.page.getByRole('button', { name: goal }).click();
        await this.nextButton.click();
    }

    /**
     * Answer yes/no question
     * @param {string} answer - 'Yes' or 'No'
     */
    async answerYesNo(answer) {
        await this.page.getByRole('button', { name: answer }).waitFor({ state: 'visible', timeout: 15000 });
        await this.page.getByRole('button', { name: answer }).click();
    }

    /**
     * Select medical condition
     * @param {string} condition - The medical condition text
     */
    async selectMedicalCondition(condition) {
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('button', { name: condition }).waitFor({ state: 'visible', timeout: 15000 });
        await this.page.getByRole('button', { name: condition }).click();
        await this.waitForNextButtonEnabled();
        await this.nextButton.click();
    }

    /**
     * Answer pregnancy question
     * @param {string} answer - 'Yes' or 'No'
     */
    async answerPregnancyQuestion(answer) {
        await this.page.waitForSelector('text=Are you currently pregnant, breastfeeding, or planning to become pregnant?', { state: 'visible', timeout: 15000 });
        await this.page.getByRole('button', { name: answer }).waitFor({ state: 'visible' });
        await this.page.waitForTimeout(500);
        await this.page.getByRole('button', { name: answer }).click({ force: true });
    }

    /**
     * Select motivation level
     * @param {string} motivation - e.g., 'Ready to start immediately'
     */
    async selectMotivation(motivation) {
        await this.page.waitForSelector('text=How motivated are you to begin your weight loss journey right now?', { state: 'visible', timeout: 15000 });
        await this.page.waitForSelector(`text=${motivation}`, { state: 'visible', timeout: 15000 });
        await this.page.getByRole('button', { name: motivation }).click({ force: true });
        
        // Add longer wait for mobile - last question before product selection
        console.log('⏳ Waiting for page to process motivation selection (mobile compatibility)...');
        await this.page.waitForTimeout(2000);
    }

    /**
     * Submit the questionnaire
     */
    async submitQuestionnaire() {
        console.log('⏳ Waiting for submit button to be ready...');
        await this.waitForSubmitButtonEnabled();
        await this.page.waitForTimeout(1500); // Increased from 500ms for mobile compatibility
        console.log('🖱️  Clicking submit button...');
        await this.submitButton.click({ force: true });
        
        // Wait for navigation to product selection page
        console.log('⏳ Waiting for navigation to product selection...');
        
        // Wait for the submit button to disappear (indicates page transition started)
        try {
            await this.submitButton.waitFor({ state: 'hidden', timeout: 30000 });
            console.log('✅ Submit button hidden - page is transitioning');
        } catch (e) {
            console.log('⚠️ Submit button still visible, waiting longer...');
        }
        
        // Wait for either: URL change to product/checkout, OR product selection elements to appear
        try {
            await Promise.race([
                // Wait for URL to contain product-related paths
                this.page.waitForURL(/\/(product|checkout|plan|subscription)/i, { timeout: 30000 }),
                // OR wait for product selection elements
                this.page.waitForSelector('input[type="radio"]', { state: 'visible', timeout: 30000 }),
                // OR wait for "Checkout" button to appear
                this.page.waitForSelector('button:has-text("Checkout")', { state: 'visible', timeout: 30000 }),
                // OR wait for subscription/plan text
                this.page.waitForSelector('text=/subscription|month|plan/i', { state: 'visible', timeout: 30000 })
            ]);
            console.log('✅ Navigation to product selection complete');
        } catch (e) {
            console.log('⚠️ Could not detect product selection page, proceeding anyway...');
        }
        
        // Extra stabilization wait
        await this.page.waitForTimeout(2000);
    }

    /**
     * Complete the entire onboarding questionnaire with predefined data
     * @param {string} email - Email address
     * @param {string} name - Full name
     */
    async completeQuestionnaire(email, name = 'Sikandar Automation') {
        console.log(`🚀 Starting checkout with email: ${email}`);
        
        await this.enterEmail(email);
        await this.enterName(name);
        await this.enterDateOfBirth('3', '15', '1997');
        await this.selectGender('Male');
        await this.enterPhone('(435) 234-52345');
        await this.enterHeightWeight('4', '11', '220');
        await this.clickProceed();
        await this.selectWeightLossGoal('Fat loss');
        await this.answerYesNo('No');
        await this.selectMedicalCondition('Type 2 Diabetes or Insulin Resistance');
        await this.answerPregnancyQuestion('Yes');
        await this.selectMotivation('Ready to start immediately');
        await this.submitQuestionnaire();
    }
}

module.exports = OnboardingQuestionnairePage;

