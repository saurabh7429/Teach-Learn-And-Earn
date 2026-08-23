const { chromium } = require('playwright');

const BASE = 'http://localhost:5174';

async function runHeadedTest() {
  console.log('🖥️ Launching VISIBLE Google Chrome on your screen (Headed Mode)...');

  let browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: false,       // 👈 VISIBLE BROWSER WINDOW
      slowMo: 500,           // 👈 Human-speed delay so you can watch every action
      args: ['--start-maximized'],
    });
  } catch (err) {
    console.log('Launching standard Chromium in headed mode...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 500,
      args: ['--start-maximized'],
    });
  }

  const context = await browser.newContext({
    viewport: null, // Full-screen
  });

  const page = await context.newPage();
  const ts = Date.now().toString().slice(-4);
  const testUser = {
    name: 'Headed Mode Tester',
    username: `tester_${ts}`,
    email: `tester_${ts}@example.com`,
    password: 'password123',
  };

  try {
    // 1. Visit Landing Page
    console.log('🌐 1. Navigating to Landing Page...');
    await page.goto(BASE);
    await page.waitForTimeout(1500);

    // 2. Toggle Theme (Dark -> Light -> Dark)
    console.log('☀️ 2. Switching to Light Mode...');
    await page.click('.theme-toggle-btn');
    await page.waitForTimeout(1500);

    console.log('🌙 3. Switching back to Dark Mode...');
    await page.click('.theme-toggle-btn');
    await page.waitForTimeout(1200);

    // 3. Open Teach Devta AI Drawer
    console.log('🤖 4. Opening Teach Devta AI Drawer...');
    await page.click('.ai-launcher-btn');
    await page.waitForSelector('.devta-drawer', { state: 'visible' });
    await page.waitForTimeout(1000);

    console.log('⚡ 5. Asking Teach Devta a question...');
    await page.click('.devta-chip:has-text("Props vs State")');
    await page.waitForSelector('.devta-bubble .markdown-content', { timeout: 15000 });
    await page.waitForTimeout(3000); // Let user view the formatted markdown

    console.log('✕ 6. Closing AI Drawer...');
    await page.click('.devta-drawer-close');
    await page.waitForTimeout(1000);

    // 4. Signup with Mouse Clicks
    console.log('📝 7. Navigating to Sign Up page...');
    await page.goto(`${BASE}/signup`);
    await page.waitForTimeout(1000);

    console.log('✍️ 8. Filling out 3D Signup Form...');
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirm"]', testUser.password);
    await page.waitForTimeout(1000);

    console.log('🖱️ 9. Clicking Submit button with mouse...');
    await page.click('button[type="submit"].neo-btn-primary');
    await page.waitForURL(`${BASE}/`, { timeout: 10000 });
    await page.waitForTimeout(1500);

    // 5. Teach Page & Dynamic AI Quiz
    console.log('🎓 10. Navigating to Teach Page...');
    await page.goto(`${BASE}/teach`);
    await page.waitForTimeout(1200);

    console.log('➕ 11. Adding a new Skill...');
    await page.click('button:has-text("＋ Add New Skill"), button:has-text("+ Add Teaching Skill")');
    await page.waitForSelector('.modal-content', { state: 'visible' });
    await page.fill('.modal-content input[type="text"]', 'React 19 & State Architecture');
    await page.fill('.modal-content textarea', 'Advanced React hooks, concurrent rendering, and global state management.');
    await page.waitForTimeout(1000);
    await page.click('.modal-content button[type="submit"]');
    await page.waitForTimeout(1500);

    console.log('🛡️ 12. Taking Dynamic AI Verification Quiz (Groq)...');
    await page.click('button:has-text("Take AI Verification Quiz")');
    await page.waitForSelector('.modal-content', { state: 'visible' });
    await page.waitForSelector('.badge-indigo:has-text("Question 1")', { timeout: 15000 });
    await page.waitForTimeout(1500);

    // Answer questions
    console.log('   Answering Question 1...');
    await page.click('.modal-content button.btn-secondary');
    await page.waitForTimeout(800);
    await page.click('button:has-text("Next Question")');

    console.log('   Answering Question 2...');
    await page.waitForTimeout(1000);
    await page.click('.modal-content button.btn-secondary');
    await page.waitForTimeout(800);
    await page.click('button:has-text("Next Question")');

    console.log('   Answering Question 3...');
    await page.waitForTimeout(1000);
    await page.click('.modal-content button.btn-secondary');
    await page.waitForTimeout(800);
    await page.click('button:has-text("Submit Assessment")');

    console.log('🏆 13. AI Assessment Completed!');
    await page.waitForTimeout(2500);
    await page.click('button:has-text("Done & Return to Teaching"), button:has-text("Close")');
    await page.waitForTimeout(1200);

    // 6. Learn Page & AI Doubt Modal
    console.log('📚 14. Navigating to Learn Page...');
    await page.goto(`${BASE}/learn`);
    await page.waitForTimeout(1500);

    console.log('📝 15. Posting a Learning Request...');
    await page.click('button:has-text("+ Create Learning Request")');
    await page.waitForSelector('.modal-content', { state: 'visible' });
    await page.fill('.modal-content input[placeholder*="Redux"]', 'How does React 19 useActionState work?');
    await page.fill('.modal-content input[placeholder*="React, JavaScript"]', 'React 19');
    await page.fill('.modal-content textarea', 'Looking for practical examples comparing useActionState vs useState.');
    await page.waitForTimeout(1000);
    await page.click('.modal-content button[type="submit"]');
    await page.waitForTimeout(1500);

    // 7. Test AI Tutor Modal on Learn Page
    console.log('🤖 16. Testing AI Doubt Solver on Learn Page...');
    await page.click('button:has-text("Ask Teach Devta AI"), button:has-text("Ask AI Now")');
    await page.waitForSelector('.modal-content', { state: 'visible' });
    await page.fill('.modal-content input[placeholder*="async/await"]', 'Explain React 19 Server Actions in 3 concise bullet points');
    await page.waitForTimeout(800);
    await page.click('.modal-content button[type="submit"]');
    await page.waitForSelector('.modal-content .markdown-content', { timeout: 15000 });
    await page.waitForTimeout(3500); // Allow user to view the formatted output

    // 8. View Progress Dashboard
    console.log('📊 17. Navigating to Progress Dashboard...');
    await page.goto(`${BASE}/progress`);
    await page.waitForTimeout(3000);

    console.log('\n🎉 HEADED MODE WALKTHROUGH FINISHED SUCCESSFULLY!');
    console.log('Leaving browser open for 10 seconds so you can inspect everything...');
    await page.waitForTimeout(10000);

  } catch (err) {
    console.error('❌ Headed test error:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

runHeadedTest();
