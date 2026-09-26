const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, googleLogin, forgotPassword, resetPassword, getMe, logout } = require('../controllers/authController');
const { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Slow down brute-force attempts against login specifically
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

router.post('/register', registerValidator, validate, register);
router.post('/login', loginLimiter, loginValidator, validate, login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', logout);

module.exports = router;
