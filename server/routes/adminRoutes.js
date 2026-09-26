const express = require('express');
const {
  getUsers,
  getUserById,
  setUserStatus,
  setUserRole,
  deleteUser,
  getBusinesses,
  approveBusiness,
  rejectBusiness,
  suspendBusiness,
  deleteBusiness,
  getAnalytics,
} = require('../controllers/adminController');
const { getReportsAdmin, updateReportAdmin } = require('../controllers/reportController');
const { getAllReviewsAdmin, setReviewStatusAdmin } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const { importPlaces } = require('../controllers/adminController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// Every route below is admin-only.
router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.post('/import', upload.single('file'), importPlaces);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', setUserStatus);
router.put('/users/:id/role', setUserRole);
router.delete('/users/:id', deleteUser);

router.get('/businesses', getBusinesses);
router.put('/businesses/:id/approve', approveBusiness);
router.put('/businesses/:id/reject', rejectBusiness);
router.put('/businesses/:id/suspend', suspendBusiness);
router.delete('/businesses/:id', deleteBusiness);

router.get('/reviews', getAllReviewsAdmin);
router.put('/reviews/:id/status', setReviewStatusAdmin);

router.get('/reports', getReportsAdmin);
router.put('/reports/:id', updateReportAdmin);

module.exports = router;
