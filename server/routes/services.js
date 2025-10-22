const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByVendor
} = require('../controllers/serviceController');

// Public routes
router.get('/', optionalAuth, getServices);
router.get('/:id', optionalAuth, getServiceById);

// Protected routes
router.use(protect);

router.post('/', authorize('vendor'), createService);
router.put('/:id', authorize('vendor'), updateService);
router.delete('/:id', authorize('vendor'), deleteService);
router.get('/vendor/me', authorize('vendor'), getServicesByVendor);

module.exports = router;
