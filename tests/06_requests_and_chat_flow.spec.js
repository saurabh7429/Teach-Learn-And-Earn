import { test, expect } from '@playwright/test';

test.describe('End-to-End P2P Request, Offer, Select & Chat Flow', () => {
  test('should complete end-to-end flow: request → offer → select teacher → chat messaging', async ({ page }) => {
    test.setTimeout(90000); // 90s for multi-user lifecycle

    const timestamp = Date.now() + Math.floor(Math.random() * 10000);
    const student = {
      name: 'Student Alice',
      username: `alice_${timestamp}`,
      email: `alice_${timestamp}@test.com`,
      password: 'password123',
    };

    const teacher = {
      name: 'Teacher Bob',
      username: `bob_${timestamp}`,
      email: `bob_${timestamp}@test.com`,
      password: 'password123',
    };

    // ── STEP 1: Student creates a Learning Request ──
    await page.goto('/signup');
    await page.fill('#name', student.name);
    await page.fill('#username', student.username);
    await page.fill('#email', student.email);
    await page.fill('#password', student.password);
    await page.fill('#confirm', student.password);
    await page.check('#agree');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await page.goto('/learn');
    await page.click('button:has-text("+ Create Learning Request")');
    const requestModal = page.locator('.modal');
    await requestModal.locator('input[placeholder*="loops work in C"]').fill('How do memory pointers work in C?');
    await requestModal.locator('textarea').fill('I want to understand stack vs heap and pointer dereferencing.');
    await requestModal.locator('select').selectOption('C Programming');
    await requestModal.locator('button[type="submit"]').click();
    await expect(page.locator('.toast')).toBeVisible({ timeout: 8000 });

    // Logout Student
    await page.click('.profile-btn');
    await expect(page.locator('.navbar-actions button:has-text("Login")')).toBeVisible({ timeout: 8000 });

    // ── STEP 2: Teacher adds verified skill & offers to teach ──
    await page.goto('/signup');
    await page.fill('#name', teacher.name);
    await page.fill('#username', teacher.username);
    await page.fill('#email', teacher.email);
    await page.fill('#password', teacher.password);
    await page.fill('#confirm', teacher.password);
    await page.check('#agree');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Add and verify skill
    await page.goto('/teach');
    await page.click('button:has-text("Add Skill")');
    const skillModal = page.locator('.modal');
    await skillModal.locator('input[placeholder*="Python"]').fill('C Programming');
    await skillModal.locator('textarea').fill('Expert in C pointers, memory management, and data structures.');
    await skillModal.locator('button[type="submit"]').click();
    await page.click('.teach-skill-card:has-text("C Programming") button:has-text("Get Verified")');

    // Offer to teach
    await page.goto('/requests');
    await page.click('button:has-text("Teaching Requests")');
    const matchingCard = page.locator('.request-card:has-text("pointers work in C")');
    await expect(matchingCard).toBeVisible();
    await matchingCard.locator('button:has-text("I Can Teach This")').click();
    await expect(page.locator('.toast')).toBeVisible({ timeout: 8000 });

    // Logout Teacher
    await page.click('.profile-btn');
    await expect(page.locator('.navbar-actions button:has-text("Login")')).toBeVisible({ timeout: 8000 });

    // ── STEP 3: Student accepts Teacher offer ──
    await page.goto('/login');
    await page.fill('#email', student.email);
    await page.fill('#password', student.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await page.goto('/requests');
    const myReqCard = page.locator('.request-card:has-text("pointers work in C")');
    await expect(myReqCard).toBeVisible();
    await myReqCard.locator('button:has-text("View Responses")').click();

    const responseItem = myReqCard.locator('.teacher-response-item:has-text("Teacher Bob")');
    await expect(responseItem).toBeVisible();
    await responseItem.locator('button:has-text("Choose")').click();
    await expect(page.locator('.toast')).toBeVisible({ timeout: 8000 });

    // ── STEP 4: Chat Messaging ──
    await page.goto('/learn');
    const activeLearningCard = page.locator('.card:has-text("pointers work in C")');
    await expect(activeLearningCard).toBeVisible();

    const chatBtn = activeLearningCard.locator('button:has-text("Chat with Teacher")');
    await expect(chatBtn).toBeVisible();
    await chatBtn.click();

    // Verify Chat Page
    await page.waitForURL(/\/chat\//);
    await expect(page.locator('.chat-header-title')).toContainText('C Programming');
    await expect(page.locator('.chat-header-sub')).toContainText('Teacher Bob');

    // Send a message
    const chatInput = page.locator('.chat-input');
    await chatInput.fill('Hello Teacher Bob! I have a question about memory allocation.');
    await page.click('.chat-send-btn');

    // Message bubble should appear
    const messageBubble = page.locator('.chat-msg.me .chat-bubble');
    await expect(messageBubble).toContainText('Hello Teacher Bob!');
  });
});
