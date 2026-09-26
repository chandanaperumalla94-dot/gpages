const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { AppError } = require('../middleware/errorHandler');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: (Number(process.env.COOKIE_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000,
};

/**
 * POST /api/auth/register
 * Enforces uniqueness on email/mobile at the database layer (see User model
 * indexes) — the duplicate-key error is translated into a friendly message
 * by the centralized error handler, but we also do a pre-check here so we
 * can return the exact copy the product spec requires.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, state, district, city, role } = req.body;

    // Public registration may only self-select 'user' or 'business' — 'admin'
    // can never be granted through this endpoint, regardless of what's sent.
    const safeRole = role === 'business' ? 'business' : 'user';

    const existing = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existing) {
      return next(
        new AppError('This account already exists. Please login instead.', 409)
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      mobile,
      passwordHash,
      role: safeRole,
      location: { state, district, city },
    });

    await Notification.create({
      user: user._id,
      title: 'Welcome to Google Pages',
      message: `Hi ${name}, your account has been created successfully.`,
      type: 'registration',
    });

    const token = generateToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Accepts either email or mobile number as the identifier.
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }],
    }).select('+passwordHash');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid login credentials.', 401));
    }

    if (user.status === 'blocked') {
      return next(new AppError('This account has been blocked. Contact support.', 403));
    }

    const token = generateToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/auth/google — verifies a Google Identity Services credential. */
const googleLogin = async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return next(new AppError('Google sign-in is not configured on the server.', 503));
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();
    if (!profile?.email || !profile.email_verified) {
      return next(new AppError('Google account email could not be verified.', 401));
    }

    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      let mobile = '';
      let attempt = 0;
      do {
        const suffix = crypto.createHash('sha256').update(`${profile.sub}:${attempt}`).digest('hex').replace(/\D/g, '').slice(0, 9).padEnd(9, '0');
        mobile = `6${suffix}`;
        attempt += 1;
      } while (await User.exists({ mobile }));

      user = await User.create({
        name: profile.name || profile.email.split('@')[0],
        email: profile.email.toLowerCase(),
        mobile,
        passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12),
        avatar: profile.picture || null,
      });

      await Notification.create({
        user: user._id,
        title: 'Welcome to Google Pages',
        message: `Hi ${user.name}, your account has been created successfully.`,
        type: 'registration',
      });
    }

    if (user.status === 'blocked') {
      return next(new AppError('This account has been blocked. Contact support.', 403));
    }

    const token = generateToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({ success: true, message: 'Logged in with Google successfully.', token, user: user.toSafeObject() });
  } catch (error) {
    next(new AppError('Unable to sign in with Google. Please try again.', 401));
  }
};

/** POST /api/auth/forgot-password */
const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt');

    // Do not reveal whether an email belongs to an account.
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a password reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset your Google Pages password',
      text: `Hi ${user.name},\n\nUse this link to create a new password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.`,
      html: `<p>Hi ${user.name},</p><p>Use the button below to create a new Google Pages password.</p><p><a href="${resetUrl}">Create a new password</a></p><p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>`,
    });

    res.json({ success: true, message: 'If an account exists, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

/** POST /api/auth/reset-password */
const resetPassword = async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpiresAt');

    if (!user) return next(new AppError('This password reset link is invalid or has expired.', 400));

    user.passwordHash = await bcrypt.hash(req.body.password, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

/** GET /api/auth/me — returns the currently authenticated user. */
const getMe = async (req, res, next) => {
  try {
    const user = await req.user.populate({
      path: 'recentlyViewed.place',
      select: 'name slug images',
    });
    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

/** POST /api/auth/logout */
const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, googleLogin, forgotPassword, resetPassword, getMe, logout };
