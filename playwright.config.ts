import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv'
dotenv.config()

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const btoa = (str: string) => Buffer.from(str).toString('base64')
const credentialsBase64 = btoa(`${process.env.HTTP_BASIC_AUTH || 'admin:password'}`)

export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: process.env.CI ? 'github' : 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://127.0.0.1:3002',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        extraHTTPHeaders: {
            Authorization: `Basic ${credentialsBase64}`,
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'global setup',
            testMatch: /global\.setup\.ts/,
        },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['global setup'],
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            dependencies: ['global setup'],
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            dependencies: ['global setup'],
        },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

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
    webServer: {
        command: 'npm run dev',
        url: 'http://127.0.0.1:3002',
        reuseExistingServer: !process.env.CI,
    },
})
