const Review = require('../models/Review');
const Place = require('../models/Place');
const Notification = require('../models/Notification');
const { AppError } = require('../middleware/errorHandler');

/** Recomputes and persists a place's aggregate rating from its approved reviews. */
async function recalculateRating(placeId) {
  const stats = await Review.aggregate([
    { $match: { place: placeId, status: 'approved' } },
    { $group: { _id: '$place', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { average = 0, count = 0 } = stats[0] || {};
  await Place.findByIdAndUpdate(placeId, {
    'rating.average': Math.round(average * 10) / 10,
    'rating.count': count,
  });
}

/** GET /api/reviews/:placeId */
const getReviewsForPlace = async (req, res, next) => {
  try {
    const reviews = await Review.find({ place: req.params.placeId, status: 'approved' })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/reviews
 * One review per user per place is enforced by a unique index on the model,
 * so a duplicate attempt fails cleanly via the centralized error handler.
 */
const createReview = async (req, res, next) => {
  try {
    const { place, rating, comment } = req.body;

    const placeDoc = await Place.findById(place);
    if (!placeDoc || placeDoc.status !== 'approved') {
      return next(new AppError('You can only review a live listing.', 400));
    }

    const review = await Review.create({ user: req.user._id, place, rating, comment });
    await recalculateRating(place);

    await Notification.create({
      user: placeDoc.owner,
      title: 'New review received',
      message: `${req.user.name} left a ${rating}-star review on ${placeDoc.name}.`,
      type: 'review_activity',
      link: `/places/${placeDoc._id}`,
    });

    res.status(201).json({ success: true, message: 'Review submitted.', data: review });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/reviews/:id — the review author can edit their own review. */
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found.', 404));
    if (review.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own review.', 403));
    }

    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.comment) review.comment = req.body.comment;
    await review.save();
    await recalculateRating(review.place);

    res.status(200).json({ success: true, message: 'Review updated.', data: review });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/reviews/:id — author or admin. */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found.', 404));
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to delete this review.', 403));
    }

    const placeId = review.place;
    await review.deleteOne();
    await recalculateRating(placeId);

    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

/** POST /api/reviews/:id/reply — business owner replies to a review on their listing. */
const replyToReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate('place');
    if (!review) return next(new AppError('Review not found.', 404));
    if (review.place.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the business owner can reply to this review.', 403));
    }

    review.ownerReply = { text: req.body.text, repliedAt: new Date() };
    await review.save();

    res.status(200).json({ success: true, message: 'Reply posted.', data: review });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/reviews — moderation queue for reported/pending reviews. */
const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('place', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/admin/reviews/:id/status */
const setReviewStatusAdmin = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!review) return next(new AppError('Review not found.', 404));
    await recalculateRating(review.place);
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviewsForPlace,
  createReview,
  updateReview,
  deleteReview,
  replyToReview,
  getAllReviewsAdmin,
  setReviewStatusAdmin,
};
