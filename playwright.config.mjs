import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'test/browser', testMatch: '*.spec.mjs', fullyParallel: false,
  timeout: 30000, workers: 1, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:19314', viewport: { width: 1200, height: 800 }, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1200, height: 800 } } }],
  webServer: { command: 'node dist/server/app.js', url: 'http://127.0.0.1:19314/-/healthy', reuseExistingServer: false,
    env: { NODE_ENV: 'test', PORT: '19314', IP: '127.0.0.1', GOOGLE_FONTS_API_KEY: 'test-fixture', GOOGLE_FONTS_USE_TEST_JSON: 'true' } }
});
