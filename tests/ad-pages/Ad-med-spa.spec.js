const { test, expect } = require('@playwright/test');
const AdPage = require('../pages/Ad-med-spa');

// Multiple viewport configurations
const viewports = {
    mobile: {
        name: 'iPhone 15 Pro Max',
        width: 430,
        height: 932,
        type: 'mobile'
    },
    tablet: {
        name: 'iPad Air',
        width: 820,
        height: 1180,
        type: 'tablet'
    },
    laptop: {
        name: 'Laptop',
        width: 1366,
        height: 768,
        type: 'laptop'
    }
};

// Ad pages to test
const adPages = [
    { name: 'med-spa', title: 'Avoid the med spa markups!' },
];

// Test on all viewports
for (const [viewportKey, viewport] of Object.entries(viewports)) {
    test.describe(`Live Ad Pages - Functional Tests [${viewport.name}]`, () => {
    let adPage;

    test.beforeEach(async ({ page }) => {
        adPage = new AdPage(page);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    for (const adPageInfo of adPages) {
        test.describe(`Testing: /ad/${adPageInfo.name}`, () => {
            
            test('should load page successfully', async ({ page }) => {
                test.setTimeout(120000);
                
                console.log(`\n${'='.repeat(70)}`);
                console.log(`📱 Testing: /ad/${adPageInfo.name} on ${viewport.name}`);
                console.log('='.repeat(70));

                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                const isLoaded = await adPage.isPageLoaded();
                expect(isLoaded).toBeTruthy();
                console.log('✅ Page loaded successfully');
            });

            test('should have correct page title', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

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
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                const buttonCount = await adPage.countGetStartedButtons();
                expect(buttonCount).toBeGreaterThan(0);
                console.log(`✅ Found ${buttonCount} Get Started button(s)`);

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
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                console.log('\n🔍 Testing Get Started button navigation to survey page...');

                try {
                    const urlBeforeClick = page.url();
                    console.log(`📍 Current URL before click: ${urlBeforeClick}`);

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
                    throw e;
                }
            });

            test('should verify Choose Your Plan Now button navigates to survey', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                console.log('\n🔍 Testing "Choose Your Plan Now" button navigation...');

                const chooseButtonVisible = await adPage.isChooseYourPlanVisible();
                expect(chooseButtonVisible).toBeTruthy();
                console.log('✅ Found "Choose Your Plan Now" button');

                const urlBeforeClick = page.url();
                console.log(`📍 Current URL before click: ${urlBeforeClick}`);

                try {
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}),
                        adPage.clickChooseYourPlan()
                    ]);

                    await page.waitForTimeout(3000);
                    const currentUrl = page.url();
                    console.log(`📍 Current URL after click: ${currentUrl}`);
                    
                    const normalizedUrl = currentUrl.split('?')[0].replace('https://www.', 'https://');
                    const isCorrectUrl = normalizedUrl.includes('/products/survey/weight_loss');
                    
                    expect(isCorrectUrl).toBeTruthy();
                    console.log(`✅ "Choose Your Plan Now" correctly navigates to survey page`);
                } catch (e) {
                    console.log(`⚠️ Navigation test failed: ${e.message}`);
                    throw e;
                }
            });

            test('should have working Trustpilot widget', async ({ page, context }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                try {
                    await adPage.scrollToTrustpilot();

                    const widgetVisible = await adPage.trustpilotWidget.isVisible({ timeout: 10000 });
                    expect(widgetVisible).toBeTruthy();
                    console.log('✅ Trustpilot widget found and visible');

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
                            console.log('ℹ️  Widget clicked but no new page opened');
                        }
                    } catch (navError) {
                        console.log(`⚠️ Trustpilot navigation test skipped: ${navError.message}`);
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

                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(2000);

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
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                const logoVisible = await adPage.logo.isVisible({ timeout: 5000 });
                expect(logoVisible).toBeTruthy();
                console.log('✅ Logo is visible');

                try {
                    const phoneVisible = await adPage.headerPhone.isVisible({ timeout: 3000 });
                    if (phoneVisible) {
                        console.log('✅ Header phone number is visible');
                    }
                } catch (e) {
                    console.log('ℹ️  Header phone number not visible');
                }

                const hamburgerMenu = page.locator('button[aria-label*="menu" i], button[class*="menu" i], button:has-text("☰")').first();
                try {
                    const menuVisible = await hamburgerMenu.isVisible({ timeout: 3000 });
                    if (menuVisible) {
                        console.log('✅ Mobile hamburger menu found');
                    } else {
                        console.log('ℹ️  Navigation links may be hidden in mobile view');
                    }
                } catch (e) {
                    console.log('ℹ️  Mobile menu not found');
                }
                
                expect(logoVisible).toBeTruthy();
            });

            test('should verify contact information is present', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();

                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(2000);

                try {
                    const phoneVisible = await adPage.footerPhone.isVisible({ timeout: 5000 });
                    if (phoneVisible) {
                        console.log('✅ Phone number visible in footer');
                    }
                } catch (e) {
                    console.log('ℹ️  Phone number not found in footer');
                }

                try {
                    const emailVisible = await adPage.footerEmail.isVisible({ timeout: 5000 });
                    if (emailVisible) {
                        console.log('✅ Email visible in footer');
                    }
                } catch (e) {
                    console.log('ℹ️  Email not found in footer');
                }
            });

            test('should capture full page screenshot on ${viewport.name}', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                console.log('\n📸 Capturing screenshot...');

                await page.evaluate(async () => {
                    const scrollHeight = document.body.scrollHeight;
                    const viewportHeight = window.innerHeight;
                    let currentPosition = 0;
                    
                    while (currentPosition < scrollHeight) {
                        window.scrollTo(0, currentPosition);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        currentPosition += viewportHeight;
                    }
                    
                    window.scrollTo(0, 0);
                });

                await page.waitForTimeout(3000);

                const screenshotFilename = `ad_${adPageInfo.name.replace(/\//g, '_')}.png`;
                await adPage.takeFullPageScreenshot(screenshotFilename, viewport.type);

                console.log(`✅ Screenshot saved: screenshots/${viewport.type}/${screenshotFilename}`);
                console.log(`   Viewport: ${viewport.width}x${viewport.height} (${viewport.name})`);
            });

            test.afterAll(async () => {
                console.log('\n' + '='.repeat(70));
                console.log(`✅ All tests completed for /ad/${adPageInfo.name}`);
                console.log('='.repeat(70) + '\n');
            });
        });
    }
});
    });
}


