const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate JWT access token
 */
const generateToken = (userId, role = 'CUSTOMER') => {
  const secret = process.env.JWT_SECRET || 'solesphere_fallback_secret_key_2026';
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: '7d',
  });
};

/**
 * Generate cryptographically secure reset token and its sha256 hash
 */
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  return { resetToken, hashedToken, tokenExpiry };
};

module.exports = {
  generateToken,
  generateResetToken,
};
