import { test, expect } from '@playwright/test';

test.describe('Authentication Component Tests (Signup, Login, Logout)', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Playwright User',
    username: `pw_user_${timestamp}`,
    email: `pw_user_${timestamp}@test.com`,
    password: 'password123',
  };

  test('should register a new account on Signup page', async ({ page }) => {
    await page.goto('/signup');

    // Verify signup layout
    await expect(page.locator('.auth-form-title')).toContainText('Create your account');

    // Fill form
    await page.fill('#name', testUser.name);
    await page.fill('#username', testUser.username);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#confirm', testUser.password);

    // Agree to terms
    await page.check('#agree');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard Home page
    await page.waitForURL('/');
    await expect(page.locator('.hero-greeting')).toContainText('Playwright');
  });

  test('should show validation error if passwords do not match during Signup', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('#name', 'Mismatched User');
    await page.fill('#username', `mismatch_${timestamp}`);
    await page.fill('#email', `mismatch_${timestamp}@test.com`);
    await page.fill('#password', 'pass123');
    await page.fill('#confirm', 'pass999');
    await page.check('#agree');

    await page.click('button[type="submit"]');

    await expect(page.locator('.form-error')).toContainText('Passwords do not match');
  });

  test('should toggle password visibility (eye button) on Login page', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('#password');
    const eyeBtn = page.locator('.input-eye');

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await eyeBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await eyeBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'nonexistent_user_9999@test.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.form-error')).toBeVisible();
  });

  test('should successfully login and logout', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/');
    await expect(page.locator('.hero-greeting')).toContainText('Playwright');

    // Logout
    const profileBtn = page.locator('.profile-btn');
    await profileBtn.click();

    // Should redirect to landing home
    await page.waitForURL('/');
    await expect(page.locator('.navbar-actions button:has-text("Login")')).toBeVisible();
  });
});
