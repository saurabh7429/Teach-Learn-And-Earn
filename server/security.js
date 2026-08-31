const DEFAULT_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function normalizeOrigins(value) {
  if (Array.isArray(value)) {
    return value.map((origin) => String(origin).trim()).filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return String(value)
    .split(/[,\s]+/)
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function uniqueOrigins(origins) {
  return [...new Set(origins)];
}

function getTrustedOrigins(options = {}) {
  if (options.frontendOrigins) {
    return uniqueOrigins(normalizeOrigins(options.frontendOrigins));
  }

  const fromEnv = normalizeOrigins(process.env.FRONTEND_ORIGIN_ALLOWLIST);
  if (fromEnv.length > 0) {
    return uniqueOrigins(fromEnv);
  }

  if ((options.nodeEnv || process.env.NODE_ENV) === 'production') {
    return [];
  }

  return uniqueOrigins(DEFAULT_DEV_ORIGINS);
}

function createCorsOptions(frontendOrigins) {
  const allowedOrigins = uniqueOrigins(normalizeOrigins(frontendOrigins));

  return {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: false,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  };
}

function buildContentSecurityPolicy() {
  return [
    "default-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'",
    "object-src 'none'",
  ].join('; ');
}

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', buildContentSecurityPolicy());
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }

  next();
}

function createRateLimiter({ windowMs, max, message, keyGenerator } = {}) {
  const bucketWindowMs = Number(windowMs) > 0 ? Number(windowMs) : 15 * 60 * 1000;
  const maxRequests = Number(max) > 0 ? Number(max) : 10;
  const responseMessage = message || 'Too many requests, please try again later.';
  const buckets = new Map();

  return (req, res, next) => {
    const key = (keyGenerator && keyGenerator(req)) || req.ip || req.socket.remoteAddress || 'anonymous';
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + bucketWindowMs };
      buckets.set(key, bucket);
    }

    if (bucket.count >= maxRequests) {
      res.setHeader('Retry-After', Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ message: responseMessage });
    }

    bucket.count += 1;
    next();
  };
}

function isJsonParseError(err) {
  return (
    err &&
    (err.type === 'entity.parse.failed' ||
      err.type === 'entity.too.large' ||
      (err instanceof SyntaxError && err.status === 400 && Object.prototype.hasOwnProperty.call(err, 'body')))
  );
}

function jsonParseErrorResponse(err, res) {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' });
  }

  return res.status(400).json({ message: 'Invalid JSON payload' });
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Not found' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (isJsonParseError(err)) {
    console.error('Request body parsing failed:', err);
    return jsonParseErrorResponse(err, res);
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = {
  createCorsOptions,
  createRateLimiter,
  errorHandler,
  getTrustedOrigins,
  notFoundHandler,
  securityHeaders,
};
