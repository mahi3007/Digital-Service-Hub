const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  getVendors,
  getVendorById,
  updateAvailability,
  getVendorStats
} = require('../controllers/vendorController');

// Public routes
router.get('/', getVendors);
router.get('/:id', getVendorById);

// Protected routes
router.use(protect);

router.post('/profile', createVendorProfile);
router.get('/profile/me', getVendorProfile);
router.put('/profile', updateVendorProfile);
router.put('/availability', authorize('vendor'), updateAvailability);
router.get('/stats/me', authorize('vendor'), getVendorStats);

module.exports = router;
