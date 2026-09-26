
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },

    ownerReply: {
      text: {
        type: String,
        default: null,
        trim: true,
        maxlength: 1000,
      },

      repliedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per place.
reviewSchema.index(
  {
    user: 1,
    place: 1,
  },
  {
    unique: true,
  }
);

// Reviews for a place.
reviewSchema.index({
  place: 1,
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model('Review', reviewSchema);
