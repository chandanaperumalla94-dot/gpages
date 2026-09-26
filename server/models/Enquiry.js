
const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ['new', 'responded', 'closed'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

// Place enquiries
enquirySchema.index({
  place: 1,
  createdAt: -1,
});

// User enquiries
enquirySchema.index({
  user: 1,
  createdAt: -1,
});

// Admin can quickly find new enquiries
enquirySchema.index({
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model('Enquiry', enquirySchema);
