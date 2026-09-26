const express = require('express');
const { getMyFavorites, toggleFavorite } = require('../controllers/placeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getMyFavorites);
router.post('/:placeId', protect, toggleFavorite);

module.exports = router;
