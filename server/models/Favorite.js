
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// A user can favorite a place only once.
favoriteSchema.index(
  { user: 1, place: 1 },
  { unique: true }
);

// Useful for displaying a user's recent favorites.
favoriteSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model('Favorite', favoriteSchema);
