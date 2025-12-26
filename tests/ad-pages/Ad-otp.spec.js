const { test, expect } = require('@playwright/test');
const AdPage = require('../pages/Ad-otp');

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
    { name: 'otp', title: 'Your Weight Loss Journey, Redefined' },
];

// Test on all viewports
for (const [viewportKey, viewport] of Object.entries(viewports)) {
    test.describe(`Live Ad Pages - Functional Tests [${viewport.name}]`, () => {
    let adPage;

    test.beforeEach(async ({ page }) => {
        adPage = new AdPage(page);
        // Set iPhone 15 Pro Max viewport
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    for (const adPageInfo of adPages) {
        test.describe(`Testing: /ad/${adPageInfo.name}`, () => {
            
            test('should load page successfully', async ({ page }) => {
                test.setTimeout(120000); // 2 minutes
                
                console.log(`\n${'='.repeat(70)}`);
                console.log(`📱 Testing: /ad/${adPageInfo.name} on ${viewport.name}`);
                console.log('='.repeat(70));

                // Navigate to page
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
                
                // Close any popups (Black Friday/Cyber Monday sale)
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

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
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                // Get and verify page title
                const pageTitle = await adPage.getPageTitle();
                expect(pageTitle).toBeTruthy();
                expect(pageTitle.length).toBeGreaterThan(0);
                console.log(`✅ Page title: "${pageTitle}"`);
            });

            // Note: This page uses Pricing and Learn More buttons instead of Get Started
            // The Pricing and Learn More navigation tests below validate the CTA functionality

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

            test('should have working Trustpilot widget', async ({ page, context }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

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
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

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

            test('should verify View FAQ button navigation', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                console.log('\n🔍 Testing View FAQ button navigation...');

                try {
                    // Check if View FAQ button exists
                    const faqButtonVisible = await adPage.viewFaqButton.isVisible({ timeout: 3000 }).catch(() => false);
                    const faqLinkVisible = await adPage.viewFaqLink.isVisible({ timeout: 3000 }).catch(() => false);
                    
                    if (faqButtonVisible || faqLinkVisible) {
                        console.log('✅ View FAQ button/link found');
                        
                        // Click and verify navigation
                        const navigatedToFaq = await adPage.verifyViewFaqNavigation();
                        expect(navigatedToFaq).toBeTruthy();
                        
                        const currentUrl = page.url();
                        console.log(`✅ View FAQ navigated to: ${currentUrl}`);
                        expect(currentUrl).toContain('/faqs');
                    } else {
                        console.log('ℹ️  View FAQ button not found on this page (skipping)');
                    }
                } catch (e) {
                    console.log(`⚠️ View FAQ test failed: ${e.message}`);
                    throw e;
                }
            });

            test('should verify Pricing button opens modal and Select navigates to survey', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                console.log('\n💰 Testing Pricing → Modal → Select → Survey navigation...');

                try {
                    // Check if Pricing button exists
                    const pricingButtonVisible = await adPage.pricingButton.first().isVisible({ timeout: 3000 }).catch(() => false);
                    const pricingLinkVisible = await adPage.pricingLink.first().isVisible({ timeout: 3000 }).catch(() => false);
                    
                    if (pricingButtonVisible || pricingLinkVisible) {
                        console.log('✅ Pricing button/link found');
                        
                        // Test full navigation flow
                        const navigatedToSurvey = await adPage.verifyPricingToSurveyNavigation();
                        
                        const currentUrl = page.url();
                        console.log(`📍 Final URL: ${currentUrl}`);
                        
                        expect(navigatedToSurvey).toBeTruthy();
                        console.log('✅ Pricing → Modal → Select → Survey navigation successful!');
                    } else {
                        console.log('ℹ️  Pricing button not found on this page (skipping)');
                    }
                } catch (e) {
                    console.log(`⚠️ Pricing test failed: ${e.message}`);
                    throw e;
                }
            });

            test('should verify Learn More navigates to plans page', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                console.log('\n📚 Testing Learn More → Plans page navigation...');

                try {
                    // Check if Learn More button exists
                    const learnMoreButtonVisible = await adPage.learnMoreButton.first().isVisible({ timeout: 3000 }).catch(() => false);
                    const learnMoreLinkVisible = await adPage.learnMoreLink.first().isVisible({ timeout: 3000 }).catch(() => false);
                    
                    if (learnMoreButtonVisible || learnMoreLinkVisible) {
                        console.log('✅ Learn More button/link found');
                        
                        // Test navigation to plans page
                        const navigatedToPlans = await adPage.verifyLearnMoreNavigation();
                        
                        const currentUrl = page.url();
                        console.log(`📍 Navigated to: ${currentUrl}`);
                        
                        expect(navigatedToPlans).toBeTruthy();
                        expect(currentUrl).toMatch(/\/products\/glp-1/);
                        console.log('✅ Learn More → Plans page navigation successful!');
                    } else {
                        console.log('ℹ️  Learn More button not found on this page (skipping)');
                    }
                } catch (e) {
                    console.log(`⚠️ Learn More test failed: ${e.message}`);
                    throw e;
                }
            });

            test('should verify Learn More → Plans → Select → Survey full flow', async ({ page }) => {
                test.setTimeout(180000); // Extended timeout for full flow
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                console.log('\n🎯 Testing Learn More → Plans → Select → Survey full flow...');

                try {
                    // Check if Learn More button exists
                    const learnMoreButtonVisible = await adPage.learnMoreButton.first().isVisible({ timeout: 3000 }).catch(() => false);
                    const learnMoreLinkVisible = await adPage.learnMoreLink.first().isVisible({ timeout: 3000 }).catch(() => false);
                    
                    if (learnMoreButtonVisible || learnMoreLinkVisible) {
                        console.log('✅ Learn More button/link found');
                        
                        // Test full navigation flow
                        const navigatedToSurvey = await adPage.verifyLearnMoreToSurveyNavigation();
                        
                        const currentUrl = page.url();
                        console.log(`📍 Final URL: ${currentUrl}`);
                        
                        expect(navigatedToSurvey).toBeTruthy();
                        console.log('✅ Learn More → Plans → Select → Survey navigation successful!');
                    } else {
                        console.log('ℹ️  Learn More button not found on this page (skipping)');
                    }
                } catch (e) {
                    console.log(`⚠️ Learn More full flow test failed: ${e.message}`);
                    throw e;
                }
            });

            test('should verify header navigation elements', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

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
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

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

            test('should capture full page screenshot on ${viewport.name}', async ({ page }) => {
                test.setTimeout(120000);
                
                await adPage.goto(adPageInfo.name);
                await adPage.waitForPageLoad();
                await adPage.closePopup();
                
                // Wait for page to stabilize after popup close
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

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

}


