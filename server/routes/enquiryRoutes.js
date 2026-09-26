const express = require('express');
const {
  createEnquiry,
  getMyEnquiries,
  getBusinessEnquiries,
  updateEnquiryStatus,
} = require('../controllers/enquiryController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, createEnquiry); // guests can send enquiries too
router.get('/me', protect, getMyEnquiries);
router.get('/business', protect, authorize('business', 'admin'), getBusinessEnquiries);
router.put('/:id/status', protect, authorize('business', 'admin'), updateEnquiryStatus);

module.exports = router;
