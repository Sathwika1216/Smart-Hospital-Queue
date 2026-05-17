/**
 * Hospital queue API — Express + MongoDB (Mongoose).
 * Loads config from environment, applies security middleware, mounts routes.
 */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');
const patientRoutes = require('./routes/patientRoutes');
const { createApiRateLimiter } = require('./middleware/rateLimit');
const { mongoSanitizeMiddleware } = require('./middleware/sanitize');

const app = express();
app.set('trust proxy',1);

// Allow the React dev server (different port) to call this API from the browser
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : true,
    credentials: false,
  })
);

// Parse JSON bodies with a reasonable cap to reduce abuse
app.use(express.json({ limit: '32kb' }));

// Strip Mongo operators from user-controlled keys/values
app.use(mongoSanitizeMiddleware());

// Apply the same rate limit to every route under `/`
app.use(createApiRateLimiter());

// All patient/queue endpoints live under `/` (e.g. POST /register)
app.use('/', patientRoutes);

// Central error handler for unexpected failures in middleware
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  await mongoose.connect(config.mongoUri);
  // eslint-disable-next-line no-console
  console.log('Connected to MongoDB');

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Hospital queue API listening on port ${config.port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
