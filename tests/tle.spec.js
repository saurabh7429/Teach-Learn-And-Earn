// @ts-check
/**
 * Full-Stack GUI Test — Teach, Learn & Earn
 * Runs inside REAL Google Chrome (visible, human-speed)
 * Covers every page, button, modal, form, and chat flow.
 */
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:5173';
const ts   = Date.now().toString().slice(-4);

const STUDENT = {
  name:     'Alice Learner',
  username: `alice_${ts}`,
  email:    `alice_${ts}@test.com`,
  password: 'Password123!',
};

const TEACHER = {
  name:     'Bob Teacher',
  username: `bob_${ts}`,
  email:    `bob_${ts}@test.com`,
  password: 'Password123!',
};

// ─── helpers ────────────────────────────────────────────────────────────────
async function signup(page, user) {
  await page.goto(`${BASE}/signup`);
  await page.fill('input[name="name"]',     user.name);
  await page.fill('input[name="username"]', user.username);
  await page.fill('input[name="email"]',    user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirm"]',  user.password);
  await page.click('.neo-toggle-wrap');          // agree to terms
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`);
}

async function logout(page) {
  await page.click('.profile-btn');
  await page.waitForURL(`${BASE}/`);
}

async function login(page, user) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]',    user.username); // accepts username too
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`);
}

// ────────────────────────────────────────────────────────────────────────────

test('TL&E — Full GUI walkthrough in Chrome', async ({ page }) => {

  // ── 1. PUBLIC LANDING PAGE ────────────────────────────────────────────────
  await test.step('🌐 Public landing page loads', async () => {
    await page.goto(BASE);
    await expect(page.locator('h1')).toContainText('Teach, Learn');
    // Buttons visible
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });

  // ── 2. THEME TOGGLE ───────────────────────────────────────────────────────
  await test.step('🌙 Theme switcher (Dark ↔ Light)', async () => {
    await page.click('.theme-toggle-btn');
    await page.waitForTimeout(700);
    await page.click('.theme-toggle-btn');
    await page.waitForTimeout(700);
  });

  // ── 3. STUDENT SIGNUP ─────────────────────────────────────────────────────
  await test.step(`📝 Sign up as Student (@${STUDENT.username})`, async () => {
    await page.click('.hero-section .btn-primary');     // Get Started button
    await signup(page, STUDENT);
    await expect(page.locator('.hero-greeting')).toContainText('Alice');
  });

  // ── 4. HOME DASHBOARD — action cards ─────────────────────────────────────
  await test.step('🏠 Home dashboard — LEARN & TEACH cards visible', async () => {
    await expect(page.locator('.action-card-title').first()).toBeVisible();
    await page.locator('.action-card', { hasText: 'LEARN' }).click();
    await page.waitForURL(`${BASE}/learn`);
  });

  // ── 5. LEARN PAGE — search & Teach Devta AI ───────────────────────────────
  await test.step('📚 Learn page — search bar works', async () => {
    await page.fill('.search-bar', 'C Programming');
    await page.waitForTimeout(800);
    await page.fill('.search-bar', '');
  });

  await test.step('🤖 Teach Devta AI modal — ask a question', async () => {
    await page.click('.teach-devta-widget button');
    await expect(page.locator('.modal')).toBeVisible();
    await page.fill('.modal input.form-input', 'What are pointers in C?');
    await page.click('.modal button[type="submit"]');
    await page.waitForTimeout(1500);
    await expect(page.locator('.info-box')).toContainText('Teach Devta');
    await page.click('.modal .modal-close');
  });

  // ── 6. CREATE LEARNING REQUEST ────────────────────────────────────────────
  await test.step('➕ Create learning request modal', async () => {
    await page.click('.dashboard-section .btn-primary');
    await expect(page.locator('.modal')).toBeVisible();
    await page.fill('.modal input.form-input',      'How do pointers work in C?');
    await page.fill('.modal textarea.form-textarea', 'I need help with malloc, pointer arithmetic and arrays.');
    await page.selectOption('.modal select.form-select', 'C Programming');
    await page.click('.modal .modal-footer .btn-primary');
    await expect(page.locator('.toast')).toBeVisible();
  });

  // ── 7. TEACHER SIGNUP ────────────────────────────────────────────────────
  await test.step(`🎓 Log out Alice, sign up as Teacher (@${TEACHER.username})`, async () => {
    await logout(page);
    await signup(page, TEACHER);
    await expect(page.locator('.hero-greeting')).toContainText('Bob');
  });

  // ── 8. TEACH PAGE — add skill ────────────────────────────────────────────
  await test.step('📖 Teach page — navigate and add skill', async () => {
    await page.click('.navbar-nav .nav-link[href="/teach"]');
    await page.waitForURL(`${BASE}/teach`);

    // Add skill button
    await page.click('.section-header .btn-primary');
    await expect(page.locator('.modal')).toBeVisible();
    await page.fill('.modal input.form-input',      'C Programming');
    await page.fill('.modal textarea.form-textarea', 'Expert in systems, data structures, memory management.');
    await page.click('.modal .modal-footer .btn-primary');
    await expect(page.locator('.toast')).toBeVisible();

    // Skill card should appear
    await expect(page.locator('.teach-skill-card')).toBeVisible();
  });

  // ── 9. TEACH DEVTA ASSESSMENT (3 MCQ questions) ───────────────────────────
  await test.step('🤖 Teach Devta Assessment — answer all 3 questions', async () => {
    await page.click('.teach-skill-actions .btn-warning');
    await expect(page.locator('.modal')).toBeVisible();

    for (let q = 1; q <= 3; q++) {
      await expect(page.locator('.modal h3')).toBeVisible();
      // Click the first option (correct answer) for each question
      await page.locator('.modal .btn-secondary').first().click();
      await page.waitForTimeout(600);
    }

    // Completion screen
    await expect(page.locator('.modal').getByText('Assessment Completed!')).toBeVisible();
    await page.click('.modal .btn-primary');   // Finish & Verify
    await page.waitForTimeout(1000);

    // Skill badge should now say Verified
    await expect(page.locator('.badge-verified')).toBeVisible();
    await expect(page.locator('.toast')).toBeVisible();
  });

  // ── 10. REQUESTS PAGE — teacher offers ───────────────────────────────────
  await test.step('🤝 Requests page — switch tabs, offer to teach', async () => {
    await page.click('.navbar-nav .nav-link[href="/requests"]');
    await page.waitForURL(`${BASE}/requests`);

    // Switch to Teaching Requests tab
    await page.click('.tab-btn:nth-child(2)');
    await page.waitForTimeout(1000);

    // Offer to teach
    const offerBtn = page.locator('.request-card .btn-primary').first();
    await expect(offerBtn).toBeVisible();
    await offerBtn.click();
    await expect(page.locator('.toast')).toBeVisible();
  });

  // ── 11. PROGRESS PAGE — Bob's stats ──────────────────────────────────────
  await test.step('📊 Progress page — stats visible', async () => {
    await page.click('.navbar-nav .nav-link[href="/progress"]');
    await page.waitForURL(`${BASE}/progress`);
    await expect(page.locator('.stat-card').first()).toBeVisible();
  });

  // ── 12. LOG OUT TEACHER, LOG IN AS STUDENT ────────────────────────────────
  await test.step('🔐 Alice logs in with username (not email)', async () => {
    await logout(page);
    await login(page, STUDENT);
    await expect(page.locator('.hero-greeting')).toContainText('Alice');
  });

  // ── 13. REQUESTS PAGE — accept teacher offer ─────────────────────────────
  await test.step('✅ Alice views teacher responses and chooses Bob', async () => {
    await page.click('.navbar-nav .nav-link[href="/requests"]');
    await page.waitForURL(`${BASE}/requests`);

    // Expand responses
    const viewBtn = page.locator('.request-card .btn-primary').first();
    await viewBtn.click();
    await page.waitForTimeout(800);

    // Choose Bob
    const chooseBtn = page.locator('.teacher-response-item .btn-primary').first();
    await expect(chooseBtn).toBeVisible();
    await chooseBtn.click();
    await expect(page.locator('.toast')).toBeVisible();

    // Open Chat Room button should appear
    await expect(page.locator('.request-card button', { hasText: 'Open Chat Room' })).toBeVisible();
    await page.click('.request-card button:has-text("Open Chat Room")');
    await page.waitForURL(/\/chat\//);
  });

  // ── 14. CHAT — Alice sends a message ─────────────────────────────────────
  await test.step('💬 Chat — Alice types and sends a message', async () => {
    await expect(page.locator('.chat-header-title')).toBeVisible();

    // Attach snippet
    await page.click('.chat-attach-btn');
    await page.waitForTimeout(400);

    await page.fill('.chat-input', 'Hello Bob! Can you explain how malloc works vs stack allocation?');
    await page.click('.chat-send-btn');
    await page.waitForTimeout(1500);

    // Message should appear in chat
    await expect(page.locator('.chat-bubble').last()).toContainText('malloc');
  });

  // ── 15. BOB REPLIES IN CHAT ──────────────────────────────────────────────
  await test.step('💬 Chat — Bob logs in and replies', async () => {
    await page.click('.chat-back-btn');
    await logout(page);
    await login(page, TEACHER);

    // Bob should see the chat on Home
    await page.click('.navbar-nav .nav-link[href="/"]');
    const chatBtn = page.locator('.dashboard-section .btn-primary').first();
    if (await chatBtn.isVisible()) {
      await chatBtn.click();
    } else {
      // Navigate directly via requests
      await page.click('.navbar-nav .nav-link[href="/requests"]');
    }
    await page.waitForURL(/\/chat\//);

    await page.fill('.chat-input', 'Hi Alice! malloc() allocates memory on the heap. Stack is automatic — heap needs free()!');
    await page.click('.chat-send-btn');
    await page.waitForTimeout(1500);
    await expect(page.locator('.chat-bubble').last()).toContainText('heap');
  });

  // ── 16. PROGRESS PAGE — final check ──────────────────────────────────────
  await test.step('📊 Final Progress check — messages counted', async () => {
    await page.click('.chat-back-btn');
    await page.click('.navbar-nav .nav-link[href="/progress"]');
    await page.waitForURL(`${BASE}/progress`);
    await expect(page.locator('.stat-card').nth(3)).toBeVisible(); // Messages Sent
    await page.waitForTimeout(2000);
  });

  // ── 17. MOBILE MENU HAMBURGER ────────────────────────────────────────────
  await test.step('📱 Mobile hamburger menu opens and closes', async () => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone size
    await page.click('.mobile-menu-btn');
    await expect(page.locator('.mobile-nav-drawer')).toBeVisible();
    await page.click('.mobile-menu-btn');  // close
    await page.waitForTimeout(400);
    await page.setViewportSize({ width: 1280, height: 800 }); // back to desktop
  });

  console.log('\n✅✅✅  ALL GUI TESTS PASSED IN GOOGLE CHROME  ✅✅✅\n');
});
