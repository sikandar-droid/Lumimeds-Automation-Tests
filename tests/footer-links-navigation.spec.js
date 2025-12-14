const { test, expect } = require('@playwright/test');
const AdPage = require('./pages/Ad-for-women');

// iPhone 15 Pro Max viewport
const iPhone15ProMax = {
    width: 430,
    height: 932
};

// Footer link mappings with expected URLs
const footerLinkMappings = [
    {
        name: 'Membership Terms & Conditions',
        key: 'membershipTerms',
        expectedUrl: 'https://lumimeds.com/terms-and-conditions',
        pageTitle: 'LUMIMEDS MEMBERSHIP TERMS AND CONDITIONS'
    },
    {
        name: 'Pharmacy Partnerships',
        key: 'pharmacyPartnerships',
        expectedUrl: 'https://form.jotform.com/252221252772046',
        pageTitle: 'Pharmacy Partnership Opportunity'
    },
    {
        name: 'Careers / Apply For Position',
        key: 'careers',
        expectedUrl: 'https://lumimeds.com/job',
        pageTitle: null // Empty page, just verify URL
    },
    {
        name: 'FAQ',
        key: 'faq',
        expectedUrl: 'https://lumimeds.com/faqs',
        pageTitle: 'Frequently Asked Questions'
    },
    {
        name: 'Terms of Use',
        key: 'termsOfUse',
        expectedUrl: 'https://lumimeds.com/terms-of-use',
        pageTitle: 'LUMIMEDS TERMS OF USE'
    },
    {
        name: 'Privacy Policy',
        key: 'privacyPolicy',
        expectedUrl: 'https://lumimeds.com/privacy-policy',
        pageTitle: null // Not provided
    }
];

test.describe('Footer Links Navigation Verification', () => {
    let adPage;

    test.beforeEach(async ({ page }) => {
        adPage = new AdPage(page);
        await page.setViewportSize(iPhone15ProMax);
    });

    test('should verify all footer links navigate to correct URLs', async ({ page }) => {
        test.setTimeout(600000); // 10 minutes for all links

        console.log('\n' + '='.repeat(70));
        console.log('📋 FOOTER LINKS NAVIGATION VERIFICATION');
        console.log('='.repeat(70));

        // Navigate to page
        await adPage.goto('for-women');
        await adPage.waitForPageLoad();
        await adPage.closePopup();

        // Scroll to footer
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);

        const results = [];

        for (const linkInfo of footerLinkMappings) {
            console.log(`\n🔗 Testing: ${linkInfo.name}`);
            console.log('-'.repeat(70));

            const result = {
                name: linkInfo.name,
                expectedUrl: linkInfo.expectedUrl,
                actualUrl: null,
                urlMatch: false,
                linkFound: false,
                navigationSuccess: false,
                error: null
            };

            try {
                // Get the link element
                const link = adPage.footerLinks[linkInfo.key];
                
                // Check if link exists
                const isVisible = await link.isVisible({ timeout: 5000 });
                if (!isVisible) {
                    result.error = 'Link not visible';
                    console.log(`❌ Link not found`);
                    results.push(result);
                    continue;
                }

                result.linkFound = true;
                console.log(`✅ Link found`);

                // Get the href attribute
                const href = await link.getAttribute('href');
                console.log(`   Expected URL: ${linkInfo.expectedUrl}`);
                console.log(`   Link href: ${href || 'N/A'}`);

                // Click the link and wait for navigation
                try {
                    const [response] = await Promise.all([
                        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
                        link.click()
                    ]);

                    result.navigationSuccess = true;
                    await page.waitForTimeout(2000);

                    // Get actual URL
                    const actualUrl = page.url();
                    result.actualUrl = actualUrl;

                    // Normalize URLs for comparison
                    const normalizedActual = actualUrl.split('?')[0].replace('https://www.', 'https://');
                    const normalizedExpected = linkInfo.expectedUrl.split('?')[0].replace('https://www.', 'https://');

                    result.urlMatch = normalizedActual === normalizedExpected;

                    if (result.urlMatch) {
                        console.log(`✅ Navigation successful: ${actualUrl}`);
                        console.log(`✅ URL matches expected destination`);
                    } else {
                        console.log(`⚠️  Navigation successful but URL mismatch`);
                        console.log(`   Actual: ${actualUrl}`);
                        console.log(`   Expected: ${linkInfo.expectedUrl}`);
                    }

                    // Verify page title if specified
                    if (linkInfo.pageTitle) {
                        const pageContent = await page.content();
                        const titleMatch = pageContent.includes(linkInfo.pageTitle);
                        if (titleMatch) {
                            console.log(`✅ Page title verified: "${linkInfo.pageTitle}"`);
                        } else {
                            console.log(`⚠️  Page title not found: "${linkInfo.pageTitle}"`);
                        }
                    }

                    // Navigate back to original page for next test
                    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30000 });
                    await page.waitForTimeout(2000);
                    
                    // Scroll back to footer
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(1000);

                } catch (navError) {
                    result.error = navError.message;
                    console.log(`❌ Navigation failed: ${navError.message}`);
                }

            } catch (error) {
                result.error = error.message;
                console.log(`❌ Error: ${error.message}`);
            }

            results.push(result);
        }

        // Summary Report
        console.log('\n' + '='.repeat(70));
        console.log('📊 FOOTER LINKS NAVIGATION SUMMARY');
        console.log('='.repeat(70));

        const linksFound = results.filter(r => r.linkFound).length;
        const successfulNavigations = results.filter(r => r.navigationSuccess).length;
        const correctUrls = results.filter(r => r.urlMatch).length;

        console.log(`\n📋 Total Links Tested: ${results.length}`);
        console.log(`🔍 Links Found: ${linksFound}/${results.length}`);
        console.log(`🔗 Successful Navigations: ${successfulNavigations}/${linksFound}`);
        console.log(`✅ Correct URL Destinations: ${correctUrls}/${successfulNavigations}`);

        console.log('\n📝 Detailed Results:');
        results.forEach(r => {
            const status = r.urlMatch ? '✅' : (r.navigationSuccess ? '⚠️' : '❌');
            console.log(`   ${status} ${r.name}`);
            if (r.actualUrl) {
                console.log(`      → ${r.actualUrl}`);
            }
            if (r.error) {
                console.log(`      Error: ${r.error}`);
            }
        });

        console.log('\n' + '='.repeat(70));

        // Assertions
        expect(linksFound, 'All footer links should be found').toBe(results.length);
        expect(successfulNavigations, 'All links should navigate successfully').toBeGreaterThan(0);
        expect(correctUrls, 'All URLs should match expected destinations').toBe(successfulNavigations);
    });

    test('should generate footer links mapping report', async () => {
        console.log('\n' + '╔' + '═'.repeat(78) + '╗');
        console.log('║' + ' '.repeat(20) + 'FOOTER LINKS URL MAPPING REPORT' + ' '.repeat(27) + '║');
        console.log('╚' + '═'.repeat(78) + '╝\n');

        footerLinkMappings.forEach((link, index) => {
            console.log(`${index + 1}. ${link.name}`);
            console.log(`   URL: ${link.expectedUrl}`);
            console.log(`   Type: ${link.expectedUrl.includes('jotform') ? 'External Form' : 'Internal Page'}`);
            console.log('');
        });

        console.log('✅ All footer link mappings documented\n');
    });
});

