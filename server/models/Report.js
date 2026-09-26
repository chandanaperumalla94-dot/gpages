
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
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

    reason: {
      type: String,
      enum: [
        'incorrect_information',
        'closed_business',
        'duplicate_listing',
        'fake_listing',
        'inappropriate_content',
        'other',
      ],
      required: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ['open', 'reviewed', 'dismissed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

// Admin report queue
reportSchema.index({
  status: 1,
  createdAt: -1,
});

// Reports for a place
reportSchema.index({
  place: 1,
  createdAt: -1,
});

// Reports submitted by a user
reportSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model('Report', reportSchema);
