import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function read(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

test('App renders a semantic main landmark', () => {
  const app = read('src/App.jsx');
  assert.match(app, /<main[^>]*id="main-content"/);
});

test('Navbar uses semantic logo and profile controls', () => {
  const navbar = read('src/components/Navbar.jsx');
  assert.match(navbar, /<NavLink[^>]*className="navbar-logo"/);
  assert.match(navbar, /<button[\s\S]*className="profile-btn"/);
  assert.match(navbar, /aria-label="View notifications"|aria-label="Open profile menu"/);
});

test('Shared modal has dialog semantics and keyboard handling', () => {
  const modal = read('src/components/Modal.jsx');
  assert.match(modal, /role="dialog"/);
  assert.match(modal, /aria-modal="true"/);
  assert.match(modal, /aria-labelledby=\{titleId\}/);
  assert.match(modal, /event\.key === 'Escape'/);
  assert.match(modal, /event\.key !== 'Tab'/);
  assert.match(modal, /setAttribute\('inert', ''\)/);
  assert.match(modal, /previouslyFocusedRef\.current/);
});

test('Core auth forms expose labels and alert semantics', () => {
  const login = read('src/pages/Login.jsx');
  const signup = read('src/pages/Signup.jsx');
  const forgot = read('src/pages/ForgotPassword.jsx');
  const reset = read('src/pages/ResetPassword.jsx');

  assert.match(login, /<label htmlFor="login-email" className="sr-only">/);
  assert.match(login, /role="alert"/);
  assert.match(signup, /<label htmlFor="signup-name" className="sr-only">/);
  assert.match(signup, /role="alert"/);
  assert.match(forgot, /<label htmlFor="forgot-email" className="sr-only">/);
  assert.match(forgot, /role="alert"/);
  assert.match(forgot, /role="status"/);
  assert.match(reset, /<label htmlFor="reset-password" className="sr-only">/);
  assert.match(reset, /<label htmlFor="reset-confirm" className="sr-only">/);
  assert.match(reset, /role="alert"/);
  assert.match(reset, /role="status"/);
});

test('Learn, Teach, Chat and AI drawer inputs have accessible names and live regions', () => {
  const learn = read('src/pages/Learn.jsx');
  const teach = read('src/pages/Teach.jsx');
  const chat = read('src/pages/Chat.jsx');
  const drawer = read('src/components/TeachDevtaDrawer.jsx');

  assert.match(learn, /<label htmlFor="learn-search" className="sr-only">/);
  assert.match(learn, /aria-live="polite"/);
  assert.match(teach, /htmlFor="teach-skill-name"/);
  assert.match(chat, /aria-label="Go back"/);
  assert.match(chat, /aria-describedby="chat-message-help"/);
  assert.match(drawer, /role="log"/);
  assert.match(drawer, /aria-label="Send question to Teach Devta"/);
});
