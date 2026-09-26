
const mongoose = require('mongoose');

const businessRequestSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
    },

    // Snapshot of the place data at the time of submission.
    placeSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for admin pending-request lists
businessRequestSchema.index({
  status: 1,
  createdAt: -1,
});

// Useful for business-owner request history
businessRequestSchema.index({
  owner: 1,
  createdAt: -1,
});

// Useful for finding request history for a place
businessRequestSchema.index({
  place: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  'BusinessRequest',
  businessRequestSchema
);
