const express = require('express');
const {
  getPlaces,
  getPlaceById,
  getTrending,
  getMyPlaces,
  createPlace,
  updatePlace,
  deletePlace,
} = require('../controllers/placeController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/trending', getTrending);
router.get('/mine', protect, authorize('business', 'admin'), getMyPlaces);
router.get('/', getPlaces);
router.get('/:id', optionalAuth, getPlaceById);

router.post('/', protect, authorize('business', 'admin'), createPlace);
router.put('/:id', protect, updatePlace);
router.delete('/:id', protect, deletePlace);

module.exports = router;
