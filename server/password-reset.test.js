const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { once } = require('node:events');
const bcrypt = require('bcryptjs');

const { createApp } = require('./app');
const User = require('./models/User');

async function startServer(options = {}) {
  const { app } = createApp(options);
  const server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

async function request(baseUrl, path, options = {}) {
  return fetch(`${baseUrl}${path}`, options);
}

test('POST /api/auth/forgot-password handles validation and prevents account enumeration', async () => {
  const server = await startServer({ frontendOrigins: ['http://localhost:5173'] });

  // Mock User.findOne for testing
  const originalFindOne = User.findOne;

  try {
    // 1. Empty body
    const emptyRes = await request(server.baseUrl, '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({}),
    });
    assert.equal(emptyRes.status, 400);
    const emptyData = await emptyRes.json();
    assert.match(emptyData.message, /valid email/i);

    // 2. Malformed email
    const badEmailRes = await request(server.baseUrl, '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({ email: 'not-an-email' }),
    });
    assert.equal(badEmailRes.status, 400);

    // 3. Unknown email - returns 200 with anti-enumeration message
    User.findOne = async () => null;

    const unknownRes = await request(server.baseUrl, '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({ email: 'nonexistent@example.test' }),
    });
    assert.equal(unknownRes.status, 200);
    const unknownData = await unknownRes.json();
    assert.match(unknownData.message, /If an account with that email exists/i);

    // 4. Known email - returns identical 200 message and updates user with hashed token
    let savedUser = null;
    User.findOne = async () => ({
      _id: 'mock-user-1',
      name: 'QA Test User',
      email: 'qa.test@example.test',
      resetPasswordToken: null,
      resetPasswordExpires: null,
      save: async function () {
        savedUser = this;
      },
    });

    const knownRes = await request(server.baseUrl, '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({ email: 'qa.test@example.test' }),
    });
    assert.equal(knownRes.status, 200);
    const knownData = await knownRes.json();
    // Verify responses are identical
    assert.equal(knownData.message, unknownData.message);
    // Verify token was hashed with SHA-256 (64 hex characters)
    assert.ok(savedUser);
    assert.equal(typeof savedUser.resetPasswordToken, 'string');
    assert.equal(savedUser.resetPasswordToken.length, 64);
    assert.ok(savedUser.resetPasswordExpires > new Date());
  } finally {
    User.findOne = originalFindOne;
    await server.close();
  }
});

test('GET /api/auth/verify-reset-token/:token verifies active and rejects expired/invalid tokens', async () => {
  const server = await startServer({ frontendOrigins: ['http://localhost:5173'] });
  const originalFindOne = User.findOne;

  try {
    const rawToken = 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 1. Invalid short token
    const shortRes = await request(server.baseUrl, '/api/auth/verify-reset-token/short', {
      headers: { Origin: 'http://localhost:5173' },
    });
    assert.equal(shortRes.status, 400);
    const shortData = await shortRes.json();
    assert.equal(shortData.valid, false);

    // 2. Token not found or expired
    User.findOne = async () => null;
    const notFoundRes = await request(server.baseUrl, `/api/auth/verify-reset-token/${rawToken}`, {
      headers: { Origin: 'http://localhost:5173' },
    });
    assert.equal(notFoundRes.status, 400);
    const notFoundData = await notFoundRes.json();
    assert.equal(notFoundData.valid, false);

    // 3. Valid active token
    User.findOne = async ({ resetPasswordToken, resetPasswordExpires }) => {
      if (resetPasswordToken === hashedToken && resetPasswordExpires.$gt) {
        return { _id: 'mock-user-1', email: 'qa.test@example.test' };
      }
      return null;
    };

    const validRes = await request(server.baseUrl, `/api/auth/verify-reset-token/${rawToken}`, {
      headers: { Origin: 'http://localhost:5173' },
    });
    assert.equal(validRes.status, 200);
    const validData = await validRes.json();
    assert.equal(validData.valid, true);
  } finally {
    User.findOne = originalFindOne;
    await server.close();
  }
});

test('POST /api/auth/reset-password/:token securely resets password and invalidates token (single-use)', async () => {
  const server = await startServer({ frontendOrigins: ['http://localhost:5173'] });
  const originalFindOne = User.findOne;

  try {
    const rawToken = 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    let dbToken = hashedToken;
    let dbExpires = new Date(Date.now() + 3600000);
    let userPassword = 'oldHashedPassword123';

    const mockUserInstance = {
      _id: 'mock-user-1',
      email: 'qa.test@example.test',
      get password() {
        return userPassword;
      },
      set password(val) {
        userPassword = val;
      },
      get resetPasswordToken() {
        return dbToken;
      },
      set resetPasswordToken(val) {
        dbToken = val;
      },
      get resetPasswordExpires() {
        return dbExpires;
      },
      set resetPasswordExpires(val) {
        dbExpires = val;
      },
      save: async function () {
        return this;
      },
    };

    User.findOne = async ({ resetPasswordToken, resetPasswordExpires }) => {
      if (resetPasswordToken === dbToken && dbExpires && dbExpires > new Date()) {
        return mockUserInstance;
      }
      return null;
    };

    // 1. Password mismatch
    const mismatchRes = await request(server.baseUrl, `/api/auth/reset-password/${rawToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({ password: 'NewSecurePassword123!', confirmPassword: 'DifferentPassword123!' }),
    });
    assert.equal(mismatchRes.status, 400);
    assert.match((await mismatchRes.json()).message, /do not match/i);

    // 2. Password too short (< 6 chars)
    const shortPwRes = await request(server.baseUrl, `/api/auth/reset-password/${rawToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({ password: '123', confirmPassword: '123' }),
    });
    assert.equal(shortPwRes.status, 400);
    assert.match((await shortPwRes.json()).message, /at least 6 characters/i);

    // 3. Successful password reset
    const successRes = await request(server.baseUrl, `/api/auth/reset-password/${rawToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({ password: 'NewSecurePassword123!', confirmPassword: 'NewSecurePassword123!' }),
    });
    assert.equal(successRes.status, 200);
    const successData = await successRes.json();
    assert.match(successData.message, /successfully reset/i);

    // Verify token was cleared / consumed
    assert.equal(dbToken, undefined);
    assert.equal(dbExpires, undefined);
    assert.equal(userPassword, 'NewSecurePassword123!');

    // 4. Token reuse attempt (should fail immediately)
    const reuseRes = await request(server.baseUrl, `/api/auth/reset-password/${rawToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({ password: 'AnotherPassword123!', confirmPassword: 'AnotherPassword123!' }),
    });
    assert.equal(reuseRes.status, 400);
    assert.match((await reuseRes.json()).message, /invalid or expired/i);
  } finally {
    User.findOne = originalFindOne;
    await server.close();
  }
});
