const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const {
  createCorsOptions,
  createRateLimiter,
  errorHandler,
  getTrustedOrigins,
  notFoundHandler,
  securityHeaders,
} = require('./security');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const requestRoutes = require('./routes/requests');
const chatRoutes = require('./routes/chats');
const progressRoutes = require('./routes/progress');
const aiRoutes = require('./routes/ai');

function createApp(options = {}) {
  const app = express();
  app.disable('x-powered-by');

  if (options.trustProxy || process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }

  const frontendOrigins = getTrustedOrigins(options);
  const corsOptions = createCorsOptions(frontendOrigins);

  const authRateLimiter = createRateLimiter({
    windowMs: options.authRateLimitWindowMs || process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    max: options.authRateLimitMax || process.env.AUTH_RATE_LIMIT_MAX || 10,
    message: 'Too many authentication attempts, please try again later.',
  });

  const aiRateLimiter = createRateLimiter({
    windowMs: options.aiRateLimitWindowMs || process.env.AI_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    max: options.aiRateLimitMax || process.env.AI_RATE_LIMIT_MAX || 30,
    message: 'Too many AI requests, please try again later.',
  });

  const apiJsonLimit = options.apiJsonLimit || process.env.API_JSON_LIMIT || '100kb';
  const authJsonLimit = options.authJsonLimit || process.env.AUTH_JSON_LIMIT || '10kb';
  const aiJsonLimit = options.aiJsonLimit || process.env.AI_JSON_LIMIT || '25kb';

  app.use(securityHeaders);
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use('/api/auth', authRateLimiter, express.json({ limit: authJsonLimit }), authRoutes);
  app.use('/api/ai', aiRateLimiter, express.json({ limit: aiJsonLimit }), aiRoutes);
  app.use(express.json({ limit: apiJsonLimit }));

  app.use('/api/users', userRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/chats', chatRoutes);
  app.use('/api/progress', progressRoutes);

  app.get('/', (req, res) => res.json({ message: 'TL&E API is running 🚀' }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, corsOptions, frontendOrigins };
}

module.exports = { createApp };
