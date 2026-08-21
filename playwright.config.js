// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120_000,          // 2 min per test step
  expect: { timeout: 10_000 },
  reporter: 'line',

  use: {
    /* ---- Use REAL installed Google Chrome (not headless Chromium) ---- */
    channel: 'chrome',       // tells Playwright to launch system Chrome
    headless: false,         // VISIBLE browser - you can watch every click

    viewport: null,          // full-screen size
    launchOptions: {
      args: ['--start-maximized'],
      slowMo: 300,           // 300 ms pause between every action - human-speed
    },
    video: 'off',
    screenshot: 'only-on-failure',
  },
});
