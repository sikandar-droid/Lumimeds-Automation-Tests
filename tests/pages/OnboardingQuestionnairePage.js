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
     * Enter full name
     * @param {string} name - The full name
     */
    async enterName(name) {
        await this.textbox.click();
        await this.textbox.fill(name);
        await this.waitForNextButtonEnabled();
        await this.nextButton.click();
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

