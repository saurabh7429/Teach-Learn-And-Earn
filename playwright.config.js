import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    channel: 'chrome',
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: [
    {
      command: 'export PATH="/usr/lib/chatgpt/resources/cua_node/bin:$PATH" && cd server && npm run dev',
      url: 'http://localhost:5000',
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: 'export PATH="/usr/lib/chatgpt/resources/cua_node/bin:$PATH" && cd client && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 15000,
    },
  ],
});
