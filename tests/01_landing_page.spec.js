import { test, expect } from '@playwright/test';

test.describe('Public Landing Page Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display navbar with logo and Guest actions (Login/Signup)', async ({ page }) => {
    await expect(page.locator('.navbar-logo')).toBeVisible();
    await expect(page.locator('.logo-text')).toHaveText('Teach, Learn & Earn');

    const loginBtn = page.locator('.navbar-actions button:has-text("Login")');
    const signupBtn = page.locator('.navbar-actions button:has-text("Sign Up")');
    await expect(loginBtn).toBeVisible();
    await expect(signupBtn).toBeVisible();
  });

  test('should render hero section with taglines and main CTA buttons', async ({ page }) => {
    await expect(page.locator('.hero-greeting')).toContainText('Teach, Learn & Earn');
    await expect(page.locator('.hero-subtitle')).toContainText('Learn what you love. Teach what you know.');

    const getStartedBtn = page.locator('button:has-text("Get Started Free 🚀")');
    const loginWorkspaceBtn = page.locator('button:has-text("Login to Workspace 👋")');
    await expect(getStartedBtn).toBeVisible();
    await expect(loginWorkspaceBtn).toBeVisible();
  });

  test('should render LEARN and TEACH action cards', async ({ page }) => {
    const learnCard = page.locator('.action-card-learn');
    const teachCard = page.locator('.action-card-teach');

    await expect(learnCard).toBeVisible();
    await expect(learnCard.locator('.action-card-title')).toHaveText('LEARN');

    await expect(teachCard).toBeVisible();
    await expect(teachCard.locator('.action-card-title')).toHaveText('TEACH');
  });

  test('should render Teach Devta AI Showcase section', async ({ page }) => {
    const teachDevtaWidget = page.locator('.teach-devta-widget');
    await expect(teachDevtaWidget).toBeVisible();
    await expect(teachDevtaWidget.locator('.teach-devta-name')).toHaveText('Teach Devta AI Engine');
    await expect(teachDevtaWidget.locator('button:has-text("Try Teach Devta 🤖")')).toBeVisible();
  });

  test('should render Popular Skills preview section', async ({ page }) => {
    const skillsGrid = page.locator('.teaching-skills-grid');
    await expect(skillsGrid).toBeVisible();

    const skillCards = skillsGrid.locator('.skill-card');
    await expect(skillCards).toHaveCount(4);
    await expect(skillCards.nth(0)).toContainText('JavaScript');
    await expect(skillCards.nth(1)).toContainText('C Programming');
  });
});
