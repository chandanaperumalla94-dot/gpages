const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const Place = require('../models/Place');
const { AppError } = require('../middleware/errorHandler');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, crypto.randomUUID() + extension);
  },
});

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
    return callback(new AppError('Only JPG, JPEG, PNG, and WebP images are allowed.', 400));
  }
  callback(null, true);
};

const imageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const ensureMediaOwner = async (req, res, next) => {
  try {
    const placeId = req.query.placeId;
    if (!placeId) return next();

    const place = await Place.findById(placeId).select('owner');
    if (!place) return next(new AppError('Listing not found.', 404));
    if (req.user.role !== 'admin' && String(place.owner) !== String(req.user._id)) {
      return next(new AppError('You do not have permission to upload media for this listing.', 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};

const uploadImage = (req, res, next) => {
  if (!req.file) return next(new AppError('An image file is required.', 400));
  const baseUrl = process.env.PUBLIC_API_URL?.replace(/\/+$/, '') || (req.protocol + '://' + req.get('host'));
  res.status(201).json({
    success: true,
    data: {
      url: baseUrl + '/uploads/' + req.file.filename,
      filename: req.file.originalname,
      size: req.file.size,
    },
  });
};

module.exports = { imageUpload, ensureMediaOwner, uploadImage, uploadDirectory };
