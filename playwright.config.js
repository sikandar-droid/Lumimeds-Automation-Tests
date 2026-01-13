// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry failed tests up to 2 times */
  retries: 2,
  /* Optimal workers for CI - 3 workers for stable, reliable execution */
  workers: process.env.CI ? 3 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  /* Global timeout for each test */
  timeout: 120000, // 2 minutes per test
  /* Expect timeout for assertions */
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video recording - enable via RECORD_VIDEO env var */
    video: process.env.RECORD_VIDEO === 'true' ? 'on' : 'off',
    /* Action timeout */
    actionTimeout: 30000, // 30 seconds for actions
    /* Navigation timeout */
    navigationTimeout: 60000, // 60 seconds for navigation
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-notifications',
            '--disable-popup-blocking',
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports - iPhone 15 Pro Max */
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 15 Pro Max'],
        // iPhone 15 Pro Max uses WebKit (Safari)
      },
    },
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['iPhone 15 Pro Max'],
        // Override to use Chromium engine
        channel: undefined,
        launchOptions: {
          args: [
            '--disable-notifications',
            '--disable-popup-blocking',
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
    },
    {
      name: 'mobile-firefox',
      use: { 
        ...devices['iPhone 15 Pro Max'],
        // Override to use Firefox engine  
        defaultBrowserType: 'firefox',
      },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

