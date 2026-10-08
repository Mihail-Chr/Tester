import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 2,
    workers: 1,
    timeout: 60_000,              // ← ДОБАВИТЬ: 60 секунд на тест
    reporter: 'html',
    use: {
        baseURL: 'https://uchi.ru',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    ],
});