
const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },

    icon: {
      type: String,
      default: null,
    },

    image: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: '',
    },

    // Category-specific filter definitions.
    // The frontend can use these definitions to build
    // filter panels dynamically.
    filters: [
      {
        key: {
          type: String,
          required: true,
        },

        label: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          enum: ['select', 'multiselect', 'range', 'boolean'],
          default: 'select',
        },

        options: [
          {
            type: String,
          },
        ],
      },
    ],

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically generate slug from category name
categorySchema.pre('validate', function (next) {
  if (this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

module.exports = mongoose.model('Category', categorySchema);

