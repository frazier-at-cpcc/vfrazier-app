import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  retries: 0,
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    command: 'npx serve dist/client --listen 4321 --no-clipboard',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
