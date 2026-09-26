const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/**
 * Signs a JWT carrying the minimum claims needed to identify and authorize
 * the user. Never embed sensitive data (password hash, etc.) in the payload
 * since JWTs are only signed, not encrypted.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
