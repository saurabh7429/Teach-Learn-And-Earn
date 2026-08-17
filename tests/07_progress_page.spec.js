import { test, expect } from '@playwright/test';

test.describe('Progress Page Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now() + Math.floor(Math.random() * 10000);
    const user = {
      name: 'Progress Tester',
      username: `prog_${timestamp}`,
      email: `prog_${timestamp}@test.com`,
      password: 'password123',
    };

    await page.goto('/signup');
    await page.fill('#name', user.name);
    await page.fill('#username', user.username);
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.fill('#confirm', user.password);
    await page.check('#agree');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.goto('/progress');
  });

  test('should render 4 summary statistics cards', async ({ page }) => {
    const header = page.locator('.page-header h1');
    await expect(header).toBeVisible({ timeout: 10000 });
    await expect(header).toContainText('Progress');

    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(4);

    await expect(statCards.nth(0)).toContainText('Skills Learning');
    await expect(statCards.nth(1)).toContainText('Skills Teaching');
    await expect(statCards.nth(2)).toContainText('Active Students');
    await expect(statCards.nth(3)).toContainText('Messages Sent');
  });

  test('should render Learning Progress and Teaching Progress sections', async ({ page }) => {
    const header = page.locator('.page-header h1');
    await expect(header).toBeVisible({ timeout: 10000 });

    await expect(page.locator('h2:has-text("Learning Progress")')).toBeVisible();
    await expect(page.locator('h2:has-text("Teaching Progress")')).toBeVisible();
  });
});
