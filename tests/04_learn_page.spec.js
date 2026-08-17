import { test, expect } from '@playwright/test';

test.describe('Learn Page & Create Request Modal Tests', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now() + Math.floor(Math.random() * 10000);
    const user = {
      name: 'Learner Tester',
      username: `learner_${timestamp}`,
      email: `learner_${timestamp}@test.com`,
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
    await page.goto('/learn');
  });

  test('should render Search bar and Teach Devta widget on Learn page', async ({ page }) => {
    await expect(page.locator('.page-header h1')).toContainText('Learn');
    await expect(page.locator('.search-bar')).toBeVisible();

    const searchInput = page.locator('.search-bar');
    await searchInput.fill('JavaScript');
    await expect(searchInput).toHaveValue('JavaScript');

    const teachDevta = page.locator('.teach-devta-widget');
    await expect(teachDevta).toBeVisible();
    await expect(teachDevta.locator('button')).toContainText('Ask Teach Devta');
  });

  test('should open Create Learning Request modal, fill details, and submit', async ({ page }) => {
    const createBtn = page.locator('button:has-text("+ Create Learning Request")');
    await createBtn.click();

    // Modal should be visible
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.modal-title')).toHaveText('Create Learning Request');

    // Fill form
    await modal.locator('input[placeholder*="loops work in C"]').fill('How to use Async/Await in JavaScript?');
    await modal.locator('textarea').fill('I want to understand promises and async/await syntax clearly.');
    await modal.locator('select').selectOption('JavaScript');

    // Submit
    await modal.locator('button[type="submit"]').click();

    // Toast should appear
    await expect(page.locator('.toast')).toBeVisible({ timeout: 10000 });
  });
});
