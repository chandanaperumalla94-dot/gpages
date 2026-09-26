const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * Runs after express-validator's check(...) chains and turns any validation
 * failures into a single AppError with a clean, user-facing message rather
 * than exposing the raw validator error array.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return next(new AppError(message, 400));
  }
  next();
};

module.exports = validate;
