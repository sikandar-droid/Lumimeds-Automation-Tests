class PatientDashboardPage {
    constructor(page) {
        this.page = page;
        
        // Navigation Links
        this.homeLink = page.getByRole('link', { name: 'Home' });
        this.ordersRefillsLink = page.getByRole('link', { name: 'Orders / Refills' });
        this.subscriptionsLink = page.getByRole('link', { name: 'Subscriptions' });
        this.appointmentsLink = page.getByRole('link', { name: 'Appointments' });
        this.messagesLink = page.getByRole('link', { name: 'Messages' });
        this.formsLink = page.getByRole('link', { name: 'Forms' });
        
        // User menu
        this.userMenuButton = page.getByRole('button', { name: 'SN' });
        this.logoutButton = page.getByRole('button', { name: 'Logout' });
    }

    /**
     * Navigate to Home section
     */
    async goToHome() {
        await this.homeLink.click();
    }

    /**
     * Navigate to Orders/Refills section
     */
    async goToOrdersRefills() {
        await this.ordersRefillsLink.click();
        await this.page.waitForURL('**/patient/orders');
    }

    /**
     * Navigate to Subscriptions section
     */
    async goToSubscriptions() {
        await this.subscriptionsLink.click();
    }

    /**
     * Navigate to Appointments section
     */
    async goToAppointments() {
        await this.appointmentsLink.click();
    }

    /**
     * Navigate to Messages section
     */
    async goToMessages() {
        await this.messagesLink.click();
    }

    /**
     * Navigate to Forms section
     */
    async goToForms() {
        await this.formsLink.click();
    }

    /**
     * Open user menu
     */
    async openUserMenu() {
        await this.userMenuButton.click();
    }

    /**
     * Logout from the patient portal
     */
    async logout() {
        await this.userMenuButton.click();
        await this.logoutButton.click();
    }

    /**
     * Navigate through all main sections of the dashboard
     */
    async navigateAllSections() {
        await this.goToHome();
        await this.goToOrdersRefills();
        await this.goToSubscriptions();
        await this.goToAppointments();
        await this.goToMessages();
        await this.goToForms();
    }
}

module.exports = PatientDashboardPage;

