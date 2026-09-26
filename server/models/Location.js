const mongoose = require('mongoose');
const slugify = require('slugify');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    level: {
      type: String,
      enum: ['state', 'district', 'city', 'area'],
      required: true,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

  },
  {
    timestamps: true,
  }
);

// Automatically generate slug when using save/create.
locationSchema.pre('validate', function (next) {
  if (this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

// Same slug is allowed in different branches,
// but not between siblings.
locationSchema.index(
  {
    parent: 1,
    level: 1,
    slug: 1,
  },
  {
    unique: true,
  }
);

// Useful for hierarchical location queries.
locationSchema.index({
  level: 1,
  parent: 1,
});

// Useful for finding locations by name.
locationSchema.index({
  name: 1,
});

module.exports = mongoose.model('Location', locationSchema);
