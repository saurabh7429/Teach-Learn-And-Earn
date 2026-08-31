const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const { createApp } = require('./app');

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

test('CORS allows trusted origins and rejects unknown origins', async () => {
  const server = await startServer({ frontendOrigins: ['http://allowed.test'] });

  try {
    const allowed = await request(server.baseUrl, '/', {
      headers: { Origin: 'http://allowed.test' },
    });

    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://allowed.test');
    assert.equal(allowed.headers.get('access-control-allow-credentials'), null);

    const rejected = await request(server.baseUrl, '/', {
      headers: { Origin: 'http://evil.test' },
    });

    assert.equal(rejected.headers.get('access-control-allow-origin'), null);
  } finally {
    await server.close();
  }
});

test('CORS preflight behaves for trusted and rejected origins', async () => {
  const server = await startServer({ frontendOrigins: ['http://allowed.test'] });

  try {
    const allowed = await request(server.baseUrl, '/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://allowed.test',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization',
      },
    });

    assert.ok([200, 204].includes(allowed.status));
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://allowed.test');
    assert.match(allowed.headers.get('access-control-allow-methods') || '', /POST/);

    const rejected = await request(server.baseUrl, '/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://evil.test',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization',
      },
    });

    assert.ok([200, 204].includes(rejected.status));
    assert.equal(rejected.headers.get('access-control-allow-origin'), null);
  } finally {
    await server.close();
  }
});

test('security headers are applied and HSTS is only sent for secure requests', async () => {
  const server = await startServer({ trustProxy: true });

  try {
    const plain = await request(server.baseUrl, '/');

    assert.equal(plain.headers.get('x-powered-by'), null);
    assert.equal(plain.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(plain.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.equal(plain.headers.get('x-frame-options'), 'DENY');
    assert.ok(plain.headers.get('content-security-policy'));
    assert.equal(plain.headers.get('strict-transport-security'), null);

    const secure = await request(server.baseUrl, '/', {
      headers: { 'X-Forwarded-Proto': 'https' },
    });

    assert.ok(secure.headers.get('strict-transport-security'));
  } finally {
    await server.close();
  }
});

test('malformed JSON returns 400 on auth and AI JSON endpoints', async () => {
  const server = await startServer({ frontendOrigins: ['http://allowed.test'] });

  try {
    for (const path of ['/api/auth/register', '/api/ai/ask']) {
      const res = await request(server.baseUrl, path, {
        method: 'POST',
        headers: {
          Origin: 'http://allowed.test',
          'Content-Type': 'application/json',
        },
        body: '{"broken":',
      });

      assert.equal(res.status, 400);
      const payload = await res.json();
      assert.equal(payload.message, 'Invalid JSON payload');
      assert.equal(Object.prototype.hasOwnProperty.call(payload, 'error'), false);
    }
  } finally {
    await server.close();
  }
});

test('oversized JSON returns 413 on auth and AI JSON endpoints', async () => {
  const server = await startServer({ frontendOrigins: ['http://allowed.test'] });
  const oversized = 'x'.repeat(40 * 1024);

  try {
    for (const path of ['/api/auth/register', '/api/ai/ask']) {
      const res = await request(server.baseUrl, path, {
        method: 'POST',
        headers: {
          Origin: 'http://allowed.test',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: oversized }),
      });

      assert.equal(res.status, 413);
      const payload = await res.json();
      assert.equal(payload.message, 'Request body too large');
    }
  } finally {
    await server.close();
  }
});

test('protected routes still return 401 when unauthenticated', async () => {
  const server = await startServer();

  try {
    const authMe = await request(server.baseUrl, '/api/auth/me');
    assert.equal(authMe.status, 401);
    assert.match((await authMe.json()).message, /Not authorized/i);

    const aiAsk = await request(server.baseUrl, '/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'How do I protect routes?' }),
    });
    assert.equal(aiAsk.status, 401);
  } finally {
    await server.close();
  }
});

test('auth and AI rate limits are enforced', async () => {
  const server = await startServer({
    frontendOrigins: ['http://allowed.test'],
    authRateLimitMax: 1,
    aiRateLimitMax: 1,
  });

  try {
    for (const path of ['/api/auth/login', '/api/ai/ask']) {
      const first = await request(server.baseUrl, path, {
        method: 'POST',
        headers: {
          Origin: 'http://allowed.test',
          'Content-Type': 'application/json',
        },
        body: '{"broken":',
      });
      assert.equal(first.status, 400);

      const second = await request(server.baseUrl, path, {
        method: 'POST',
        headers: {
          Origin: 'http://allowed.test',
          'Content-Type': 'application/json',
        },
        body: '{"broken":',
      });
      assert.equal(second.status, 429);
      assert.match((await second.json()).message, /Too many/i);
    }
  } finally {
    await server.close();
  }
});
