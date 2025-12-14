class LoginPage {
    constructor(page) {
        this.page = page;
        
        // Locators
        this.emailInput = page.getByRole('textbox', { name: 'Enter your email address' });
        this.passwordInput = page.getByRole('textbox', { name: 'Enter your password' });
        this.loginButton = page.getByRole('button', { name: 'Login' });
    }

    /**
     * Navigate to the login page
     */
    async goto() {
        await this.page.goto('https://staging.lumimeds.com/patient/login');
    }

    /**
     * Fill in the email field
     * @param {string} email - The email address to enter
     */
    async fillEmail(email) {
        await this.emailInput.click();
        await this.emailInput.fill(email);
    }

    /**
     * Fill in the password field
     * @param {string} password - The password to enter
     */
    async fillPassword(password) {
        await this.passwordInput.fill(password);
    }

    /**
     * Click the login button
     */
    async clickLogin() {
        await this.loginButton.click();
    }

    /**
     * Perform complete login action
     * @param {string} email - The email address
     * @param {string} password - The password
     */
    async login(email, password) {
        await this.fillEmail(email);
        await this.emailInput.press('Tab');
        await this.fillPassword(password);
        await this.clickLogin();
        // Wait for navigation to patient dashboard
        await this.page.waitForURL('https://staging.lumimeds.com/patient');
    }
}

module.exports = LoginPage;

