const express = require('express');
const {
  getStates,
  getDistricts,
  getCities,
  getAreas,
  resolveBySlug,
  createLocation,
  updateLocation,
  deleteLocation,
} = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/states', getStates);
router.get('/districts/:stateId', getDistricts);
router.get('/cities/:districtId', getCities);
router.get('/areas/:cityId', getAreas);
router.get('/resolve', resolveBySlug);

router.post('/', protect, authorize('admin'), createLocation);
router.put('/:id', protect, authorize('admin'), updateLocation);
router.delete('/:id', protect, authorize('admin'), deleteLocation);

module.exports = router;
