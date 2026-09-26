const express = require('express');
const {
  getReviewsForPlace,
  createReview,
  updateReview,
  deleteReview,
  replyToReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:placeId', getReviewsForPlace);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/reply', protect, replyToReview);

module.exports = router;
