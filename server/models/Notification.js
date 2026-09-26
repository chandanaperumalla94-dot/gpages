
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: [
        'registration',
        'listing_approved',
        'listing_rejected',
        'review_activity',
        'enquiry',
        'account',
      ],
      required: true,
    },

    link: {
      type: String,
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// User notification list
notificationSchema.index({
  user: 1,
  createdAt: -1,
});

// Unread notification queries
notificationSchema.index({
  user: 1,
  read: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  'Notification',
  notificationSchema
);
