import { test, expect } from '@playwright/test';

test.describe('Teach Page & Skill Verification Tests', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now() + Math.floor(Math.random() * 10000);
    const user = {
      name: 'Teacher Tester',
      username: `teacher_${timestamp}`,
      email: `teacher_${timestamp}@test.com`,
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
    await page.goto('/teach');
  });

  test('should render Teach page and Teach Devta Assessment widget', async ({ page }) => {
    await expect(page.locator('.page-header h1')).toContainText('Teach');
    const devtaAssessment = page.locator('.teach-devta-assessment');
    await expect(devtaAssessment).toBeVisible();
    await expect(devtaAssessment.locator('.teach-devta-name')).toHaveText('Teach Devta Assessment');
  });

  test('should add a new teaching skill and verify it via Teach Devta', async ({ page }) => {
    const addSkillBtn = page.locator('button:has-text("Add Skill")');
    await addSkillBtn.click();

    // Modal
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();
    await modal.locator('input[placeholder*="Python"]').fill('Node.js Backend');
    await modal.locator('textarea').fill('Building REST APIs and server architecture.');
    await modal.locator('button[type="submit"]').click();

    // Skill card should appear in list
    const skillCard = page.locator('.teach-skill-card:has-text("Node.js Backend")');
    await expect(skillCard).toBeVisible();
    await expect(skillCard.locator('.badge')).toContainText('Pending');

    // Click Get Verified
    const verifyBtn = skillCard.locator('button:has-text("Get Verified")');
    await verifyBtn.click();

    // Badge should update to Verified
    await expect(skillCard.locator('.badge')).toContainText('Verified');
  });
});
