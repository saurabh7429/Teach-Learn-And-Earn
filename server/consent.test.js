const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const { createApp } = require('./app');
const User = require('./models/User');

// JWT_SECRET must be set for generateToken() to work in the test environment.
// The value used here is test-only and is never deployed.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-do-not-use-in-production';

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

const CONSENT_VERSION = '1.0';

const basePayload = {
  name: 'QA Test User',
  username: `qa_consent_${Date.now()}`,
  email: `qa.consent.${Date.now()}@example.test`,
  password: 'SecurePass123!',
};

test('POST /api/auth/register — consent enforcement', async (t) => {
  const server = await startServer({ frontendOrigins: ['http://localhost:5173'] });
  const originalCreate = User.create;
  const originalFindOne = User.findOne;

  try {
    // 1. Missing consentGiven — should fail with 400
    await t.test('rejects when consentGiven is absent', async () => {
      User.create = async () => { throw new Error('Should not reach User.create'); };
      User.findOne = async () => null; // no existing user

      const res = await request(server.baseUrl, '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
        body: JSON.stringify({
          ...basePayload,
          username: `qa_no_consent_${Date.now()}`,
          email: `qa.no.consent.${Date.now()}@example.test`,
          // consentGiven deliberately omitted
          consentVersion: CONSENT_VERSION,
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.message, /Terms of Service and Privacy Policy/i);
    });

    // 2. consentGiven: false — should fail with 400
    await t.test('rejects when consentGiven is false', async () => {
      User.create = async () => { throw new Error('Should not reach User.create'); };
      User.findOne = async () => null;

      const res = await request(server.baseUrl, '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
        body: JSON.stringify({
          ...basePayload,
          username: `qa_false_consent_${Date.now()}`,
          email: `qa.false.consent.${Date.now()}@example.test`,
          consentGiven: false,
          consentVersion: CONSENT_VERSION,
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.message, /Terms of Service and Privacy Policy/i);
    });

    // 3. consentGiven: true but missing consentVersion — should fail with 400
    await t.test('rejects when consentVersion is missing', async () => {
      User.create = async () => { throw new Error('Should not reach User.create'); };
      User.findOne = async () => null;

      const res = await request(server.baseUrl, '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
        body: JSON.stringify({
          ...basePayload,
          username: `qa_no_ver_${Date.now()}`,
          email: `qa.no.ver.${Date.now()}@example.test`,
          consentGiven: true,
          // consentVersion deliberately omitted
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.message, /invalid or outdated consent version/i);
    });

    // 4. consentGiven: true but wrong consentVersion — should fail with 400
    await t.test('rejects when consentVersion is wrong', async () => {
      User.create = async () => { throw new Error('Should not reach User.create'); };
      User.findOne = async () => null;

      const res = await request(server.baseUrl, '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
        body: JSON.stringify({
          ...basePayload,
          username: `qa_bad_ver_${Date.now()}`,
          email: `qa.bad.ver.${Date.now()}@example.test`,
          consentGiven: true,
          consentVersion: '0.9',
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.message, /invalid or outdated consent version/i);
    });

    // 5. Valid consent fields — registration should succeed (mocked DB)
    await t.test('succeeds with valid consentGiven and consentVersion', async () => {
      let savedConsent = null;

      // Reset both mocks cleanly before this test
      User.findOne = async (_query) => null; // no existing user with this email/username

      User.create = async (payload) => {
        savedConsent = {
          consentGiven: payload.consentGiven,
          consentVersion: payload.consentVersion,
          consentAt: payload.consentAt,
        };
        // Return minimal Mongoose-like doc (only what the route accesses)
        return {
          _id: 'mock-user-id-001',
          name: payload.name,
          username: payload.username,
          email: payload.email,
          consentGiven: payload.consentGiven,
          consentVersion: payload.consentVersion,
          consentAt: payload.consentAt,
        };
      };

      const ts = Date.now();
      const res = await request(server.baseUrl, '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
        body: JSON.stringify({
          name: 'QA Test User',
          username: `qa_valid_${ts}`,
          email: `qa.valid.${ts}@example.test`,
          password: 'SecurePass123!',
          consentGiven: true,
          consentVersion: CONSENT_VERSION,
        }),
      });

      assert.equal(res.status, 201, `Expected 201 but got ${res.status}`);
      const data = await res.json();
      assert.ok(data.token, 'Response should include a JWT token');

      // Verify consent fields were stored
      assert.equal(savedConsent.consentGiven, true);
      assert.equal(savedConsent.consentVersion, CONSENT_VERSION);
      assert.ok(savedConsent.consentAt !== undefined, 'consentAt should be set');
    });

    // 6. Direct API bypass — send valid-looking payload but with consentGiven as string 'true'
    await t.test('rejects when consentGiven is string "true" (type coercion attack)', async () => {
      User.create = async () => { throw new Error('Should not reach User.create'); };
      User.findOne = async () => null;

      const res = await request(server.baseUrl, '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
        body: JSON.stringify({
          ...basePayload,
          username: `qa_str_${Date.now()}`,
          email: `qa.str.${Date.now()}@example.test`,
          consentGiven: 'true', // string, not boolean — should fail
          consentVersion: CONSENT_VERSION,
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.message, /Terms of Service and Privacy Policy/i);
    });
  } finally {
    User.create = originalCreate;
    User.findOne = originalFindOne;
    await server.close();
  }
});
