const { test, expect } = require('@playwright/test');
const LoginPage = require('./pages/LoginPage');
const PatientDashboardPage = require('./pages/PatientDashboardPage');

test.describe('Patient Portal Tests', () => {
    test('patient login and navigation', async ({ page }) => {
        // Increase timeout for this test as login might be slow
        test.setTimeout(60000);

        // Initialize page objects
        const loginPage = new LoginPage(page);
        const dashboard = new PatientDashboardPage(page);

        // Login
        await loginPage.goto();
        await loginPage.login('sikandar.naeem@devslooptech.com', 'Test@123');

        // Navigate through all sections
        await dashboard.navigateAllSections();

        // Logout
        await dashboard.logout();
    });
});