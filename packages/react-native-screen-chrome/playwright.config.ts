import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './web-e2e',
    testMatch: '*.e2e.ts',
    outputDir: './node_modules/.cache/web-e2e-results',
    forbidOnly: true,
    retries: 0,
    reporter: 'list',
    use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 400, height: 600 },
        launchOptions: { args: ['--disable-lcd-text'] },
    },
    projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
