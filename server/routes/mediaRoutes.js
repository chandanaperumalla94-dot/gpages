const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { imageUpload, ensureMediaOwner, uploadImage } = require('../controllers/mediaController');

const router = express.Router();

router.post('/upload', protect, authorize('business', 'admin'), ensureMediaOwner, imageUpload.single('image'), uploadImage);

module.exports = router;
