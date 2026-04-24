const crypto = require('crypto');

/**
 * Generates a short, URL-safe queue token without external dependencies.
 */
function generateToken() {
  const part = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `T-${part}`;
}

module.exports = { generateToken };
