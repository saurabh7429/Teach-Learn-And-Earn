import { test, expect } from '@playwright/test';

test.describe('Logged-in Dashboard Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now() + Math.floor(Math.random() * 10000);
    const user = {
      name: 'Dashboard Tester',
      username: `dash_${timestamp}`,
      email: `dash_${timestamp}@test.com`,
      password: 'password123',
    };

    // Signup user and land on dashboard
    await page.goto('/signup');
    await page.fill('#name', user.name);
    await page.fill('#username', user.username);
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.fill('#confirm', user.password);
    await page.check('#agree');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display personalized greeting and dashboard elements', async ({ page }) => {
    await expect(page.locator('.hero-greeting')).toContainText('Dashboard');
    await expect(page.locator('.hero-subtitle')).toHaveText('What would you like to do today?');
  });

  test('should render Your Teaching section with Add Skill card', async ({ page }) => {
    await expect(page.locator('h2:has-text("Your Teaching")')).toBeVisible();

    const addSkillCard = page.locator('.skill-card-add');
    await expect(addSkillCard).toBeVisible();
    await expect(addSkillCard).toContainText('Add New Skill');
  });

  test('should render Recent Activity section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Recent Activity")')).toBeVisible();

    const activityItems = page.locator('.activity-item');
    await expect(activityItems).toHaveCount(3);
  });
});
