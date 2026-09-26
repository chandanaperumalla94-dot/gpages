
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,

      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email',
      ],
    },

    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,

      match: [
        /^[6-9]\d{9}$/,
        'Please provide a valid 10-digit mobile number',
      ],
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    passwordResetTokenHash: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

    role: {
      type: String,
      enum: ['user', 'business', 'admin'],
      default: 'user',
    },

    location: {
      state: {
        type: String,
        default: null,
        trim: true,
      },

      district: {
        type: String,
        default: null,
        trim: true,
      },

      city: {
        type: String,
        default: null,
        trim: true,
      },
    },

    avatar: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
      },
    ],

    recentlyViewed: [
      {
        place: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Place',
        },

        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },

  {
    timestamps: true,
  }
);


// ============================================================
// Password comparison
// ============================================================

userSchema.methods.comparePassword = function (
  candidatePassword
) {
  return bcrypt.compare(
    candidatePassword,
    this.passwordHash
  );
};


// ============================================================
// Safe user object
// ============================================================

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();

  delete obj.passwordHash;
  delete obj.__v;

  return obj;
};


// ============================================================
// Indexes
// ============================================================

userSchema.index({
  role: 1,
  status: 1,
});

module.exports = mongoose.model('User', userSchema);
