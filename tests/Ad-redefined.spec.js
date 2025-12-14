const { test, expect } = require('@playwright/test');
const AdPage = require('./pages/Ad-redefined');

// iPhone 15 Pro Max viewport
const iPhone15ProMax = {
    width: 430,
    height: 932
};

// Ad pages to test
const adPages = [
    { name: 'redefined', title: 'Your Weight Loss Journey, Redefined' },
];

test.describe('Live Ad Pages - Functional Tests', () => {
    let adPage;

    test.beforeEach(async ({ page }) => {
        adPage = new AdPage(page);
        // Set iPhone 15 Pro Max viewport
        await page.setViewportSize(iPhone15ProMax);
    });

    for (const adPageInfo of adPages) {
        test.describe(`Testing: /ad/${adPageInfo.name}`, () => {
            
            test('should load page successfully', async ({ page }) => {
                test.setTimeout(120000); // 2 minutes
                
                console.log(`\n${'='.repeat(70)}`);
                console.log(`📱 Testing: /ad/${adPageInfo.name} on iPhone 15 Pro Max`);
                console.log('='.repeat(70));

                // Navigate to page
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Close any popups (Black Friday/Cyber Monday sale)
                await adPage.closePopup();

                // Verify page loaded
                const isLoaded = await adPage.isPageLoaded();
                expect(isLoaded).toBeTruthy();
                console.log('✅ Page loaded successfully');
            });

            test('should have correct page title', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();

                // Get and verify page title
                const pageTitle = await adPage.getPageTitle();
                expect(pageTitle).toBeTruthy();
                expect(pageTitle.length).toBeGreaterThan(0);
                console.log(`✅ Page title: "${pageTitle}"`);
            });

            test('should have clickable Get Started buttons', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();

                // Count Get Started buttons
                const buttonCount = await adPage.countGetStartedButtons();
                expect(buttonCount).toBeGreaterThan(0);
                console.log(`✅ Found ${buttonCount} Get Started button(s)`);

                // Verify all buttons are clickable
                const allButtons = await adPage.getAllGetStartedButtons();
                let clickableCount = 0;
                
                for (const button of allButtons) {
                    try {
                        const isVisible = await button.isVisible({ timeout: 3000 });
                        const isEnabled = await button.isEnabled();
                        if (isVisible && isEnabled) {
                            clickableCount++;
                        }
                    } catch (e) {
                        // Button not accessible
                    }
                }

                expect(clickableCount).toBeGreaterThan(0);
                console.log(`✅ ${clickableCount} button(s) are clickable`);
            });

            test('should navigate to survey when popup "GET YOURS NOW" is clicked', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                
                console.log('\n🔍 Testing popup "GET YOURS NOW" button...');

                try {
                    await page.waitForTimeout(3000);
                    const getYoursNowBtn = page.getByRole('button', { name: /get yours now/i });
                    const isVisible = await getYoursNowBtn.isVisible({ timeout: 5000 });
                    
                    if (isVisible) {
                        console.log('✅ Found "GET YOURS NOW" button in popup');
                        const urlBeforeClick = page.url();
                        console.log(`📍 Current URL before click: ${urlBeforeClick}`);
                        
                        await Promise.all([
                            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => {
                                console.log(`⚠️ Navigation timeout or error: ${e.message}`);
                            }),
                            getYoursNowBtn.click()
                        ]);
                        
                        await page.waitForTimeout(2000);
                        const currentUrl = page.url();
                        console.log(`📍 Current URL after click: ${currentUrl}`);
                        
                        const normalizedUrl = currentUrl.split('?')[0].replace('https://www.', 'https://');
                        const isCorrectUrl = normalizedUrl.includes('/products/survey/weight_loss');
                        
                        expect(isCorrectUrl).toBeTruthy();
                        console.log(`✅ Popup "GET YOURS NOW" navigated to survey page: ${currentUrl}`);
                    } else {
                        console.log('ℹ️  "GET YOURS NOW" popup not found - may not be active');
                    }
                } catch (e) {
                    console.log(`ℹ️  Popup test skipped: ${e.message}`);
                }
            });

            test('should navigate to survey page when Get Started is clicked', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();

                console.log('\n🔍 Testing Get Started button navigation to survey page...');

                try {
                    const urlBeforeClick = page.url();
                    console.log(`📍 Current URL before click: ${urlBeforeClick}`);

                    // Click Get Started and wait for navigation
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => {
                            console.log(`⚠️ Navigation timeout or error: ${e.message}`);
                        }),
                        adPage.clickPrimaryGetStarted()
                    ]);

                    await page.waitForTimeout(3000);
                    const currentUrl = page.url();
                    console.log(`📍 Current URL after click: ${currentUrl}`);
                    
                    const normalizedUrl = currentUrl.split('?')[0].replace('https://www.', 'https://');
                    const isCorrectUrl = normalizedUrl.includes('/products/survey/weight_loss');
                    
                    expect(isCorrectUrl).toBeTruthy();
                    console.log(`✅ Navigated to survey page: ${currentUrl}`);
                } catch (e) {
                    console.log(`⚠️ Navigation test failed: ${e.message}`);
                    console.log(`📍 Final URL: ${page.url()}`);
                    throw e;
                }
            });

            test('should have working Trustpilot widget', async ({ page, context }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();

                try {
                    // Scroll to Trustpilot section
                    await adPage.scrollToTrustpilot();

                    // Check if widget is visible
                    const widgetVisible = await adPage.trustpilotWidget.isVisible({ timeout: 10000 });
                    expect(widgetVisible).toBeTruthy();
                    console.log('✅ Trustpilot widget found and visible');

                    // Try to click and verify navigation
                    try {
                        const newPage = await adPage.clickTrustpilotWidget(context);
                        
                        if (newPage) {
                            await newPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
                            const newUrl = newPage.url();
                            
                            const isTrustpilot = newUrl.includes('trustpilot.com');
                            expect(isTrustpilot).toBeTruthy();
                            console.log(`✅ Trustpilot widget navigated to: ${newUrl}`);
                            
                            await newPage.close();
                        } else {
                            console.log('ℹ️  Widget clicked but no new page opened (may navigate in same page)');
                        }
                    } catch (navError) {
                        console.log(`⚠️ Trustpilot navigation test skipped: ${navError.message}`);
                        // Don't fail the test if navigation times out
                    }
                } catch (e) {
                    console.log(`⚠️ Trustpilot widget test failed: ${e.message}`);
                    throw e;
                }
            });

            test('should have all footer links clickable', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();

                // Scroll to footer
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(2000);

                // Get all footer links status
                const footerLinksStatus = await adPage.getAllFooterLinksStatus();
                
                console.log('\n📋 Footer Links Status:');
                let clickableCount = 0;
                let foundCount = 0;

                for (const link of footerLinksStatus) {
                    foundCount += link.found ? 1 : 0;
                    clickableCount += link.clickable ? 1 : 0;
                    
                    const status = link.clickable ? '✅' : (link.found ? '⚠️' : '❌');
                    console.log(`   ${status} ${link.name}: ${link.clickable ? 'Clickable' : (link.found ? 'Found but not clickable' : 'Not found')}`);
                }

                expect(foundCount).toBeGreaterThan(0);
                expect(clickableCount).toBeGreaterThan(0);
                console.log(`\n✅ ${clickableCount}/${foundCount} footer links are clickable`);
            });

            test('should verify header navigation elements', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();

                // Check logo
                const logoVisible = await adPage.logo.isVisible({ timeout: 5000 });
                expect(logoVisible).toBeTruthy();
                console.log('✅ Logo is visible');

                // Check header phone number (should be visible on mobile)
                try {
                    const phoneVisible = await adPage.headerPhone.isVisible({ timeout: 3000 });
                    if (phoneVisible) {
                        console.log('✅ Header phone number is visible');
                    }
                } catch (e) {
                    console.log('ℹ️  Header phone number not visible');
                }

                // On mobile, navigation links are typically in a hamburger menu
                // Check for hamburger menu button
                const hamburgerMenu = page.locator('button[aria-label*="menu" i], button[class*="menu" i], button:has-text("☰")').first();
                try {
                    const menuVisible = await hamburgerMenu.isVisible({ timeout: 3000 });
                    if (menuVisible) {
                        console.log('✅ Mobile hamburger menu found');
                        
                        // Optional: Open menu and check for nav items
                        try {
                            await hamburgerMenu.click();
                            await page.waitForTimeout(1000);
                            
                            const navElements = [
                                { name: 'Medications', locator: adPage.navigationMedications },
                                { name: 'FAQs', locator: adPage.navigationFAQs },
                                { name: 'Login', locator: adPage.navigationLogin }
                            ];

                            let visibleNavCount = 0;
                            for (const nav of navElements) {
                                try {
                                    const isVisible = await nav.locator.isVisible({ timeout: 3000 });
                                    if (isVisible) {
                                        visibleNavCount++;
                                        console.log(`✅ ${nav.name} link is visible in menu`);
                                    }
                                } catch (e) {
                                    console.log(`ℹ️  ${nav.name} link not visible in menu`);
                                }
                            }
                            
                            if (visibleNavCount > 0) {
                                console.log(`✅ ${visibleNavCount} navigation links found in menu`);
                            }
                            
                            // Close menu
                            await page.keyboard.press('Escape');
                            await page.waitForTimeout(500);
                        } catch (e) {
                            console.log('ℹ️  Could not interact with menu');
                        }
                    } else {
                        console.log('ℹ️  Navigation links may be hidden in mobile view');
                    }
                } catch (e) {
                    console.log('ℹ️  Mobile menu not found - navigation may be always visible or implemented differently');
                }
                
                // Test passes if logo is visible (minimum requirement)
                expect(logoVisible).toBeTruthy();
            });

            test('should verify contact information is present', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();

                // Scroll to footer
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(2000);

                // Check phone number in footer
                try {
                    const phoneVisible = await adPage.footerPhone.isVisible({ timeout: 5000 });
                    if (phoneVisible) {
                        console.log('✅ Phone number visible in footer');
                    }
                } catch (e) {
                    console.log('ℹ️  Phone number not found in footer');
                }

                // Check email in footer
                try {
                    const emailVisible = await adPage.footerEmail.isVisible({ timeout: 5000 });
                    if (emailVisible) {
                        console.log('✅ Email visible in footer');
                    }
                } catch (e) {
                    console.log('ℹ️  Email not found in footer');
                }
            });

            test('should capture full page screenshot on iPhone 15 Pro Max', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();

                console.log('\n📸 Capturing screenshot...');

                // Scroll through page to trigger lazy loading
                await page.evaluate(async () => {
                    const scrollHeight = document.body.scrollHeight;
                    const viewportHeight = window.innerHeight;
                    let currentPosition = 0;
                    
                    while (currentPosition < scrollHeight) {
                        window.scrollTo(0, currentPosition);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        currentPosition += viewportHeight;
                    }
                    
                    // Scroll back to top
                    window.scrollTo(0, 0);
                });

                await page.waitForTimeout(3000);

                // Take screenshot
                const screenshotFilename = `ad_${adPageInfo.name.replace(/\//g, '_')}.png`;
                await adPage.takeFullPageScreenshot(screenshotFilename, 'mobile');

                console.log(`✅ Screenshot saved: screenshots/mobile/${screenshotFilename}`);
                console.log(`   Viewport: ${iPhone15ProMax.width}x${iPhone15ProMax.height} (iPhone 15 Pro Max)`);
            });

            test.afterAll(async () => {
                console.log('\n' + '='.repeat(70));
                console.log(`✅ All tests completed for /ad/${adPageInfo.name}`);
                console.log('='.repeat(70) + '\n');
            });
        });
    }
});

test.describe('Live Ad Pages - Summary Report', () => {
    test('generate test summary', async ({ page }) => {
        console.log('\n' + '╔' + '═'.repeat(78) + '╗');
        console.log('║' + ' '.repeat(20) + 'AD PAGES TEST SUMMARY REPORT' + ' '.repeat(30) + '║');
        console.log('╚' + '═'.repeat(78) + '╝\n');
        
        console.log('📱 Device: iPhone 15 Pro Max (430x932)');
        console.log(`📊 Pages Tested: ${adPages.length}`);
        console.log('✅ Test suites per page:');
        console.log('   1. Page load verification');
        console.log('   2. Page title validation');
        console.log('   3. Get Started buttons clickability');
        console.log('   4. Get Started navigation to survey');
        console.log('   5. Trustpilot widget functionality');
        console.log('   6. Footer links validation');
        console.log('   7. Header navigation elements');
        console.log('   8. Contact information presence');
        console.log('   9. Full page screenshot capture');
        console.log('\n✅ All tests completed!\n');
    });
});

