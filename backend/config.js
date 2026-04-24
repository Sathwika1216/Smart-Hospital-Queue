/**
 * Central configuration loaded from environment variables.
 * Fails fast if required values are missing so we never run with unsafe defaults.
 */
require('dotenv').config();

const required = (name) => {
  const value = process.env[name];
  if (!value || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

module.exports = {
  /** MongoDB connection string (keep in .env only) */
  mongoUri: required('MONGODB_URI'),
  /** Port for the HTTP server */
  port: Number(process.env.PORT) || 3000,
  /** Sliding window for rate limiting (milliseconds) */
  rateLimitWindowMs: 60 * 1000,
  /** Max requests per IP per window */
  rateLimitMax: 500,
};
