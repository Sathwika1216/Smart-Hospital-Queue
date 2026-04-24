const mongoSanitize = require('express-mongo-sanitize');

/**
 * Removes keys that start with `$` or contain `.` from req.body/query/params
 * to reduce NoSQL injection risk when values are used in MongoDB queries.
 */
function mongoSanitizeMiddleware() {
  return mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(`Sanitized suspicious key in request: ${key} (${req.method} ${req.path})`);
      }
    },
  });
}

module.exports = { mongoSanitizeMiddleware };
