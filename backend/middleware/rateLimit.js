const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Global rate limiter applied to every API route.
 * Limits are fully driven by environment variables.
 */
function createApiRateLimiter() {
  return rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
}

module.exports = { createApiRateLimiter };
