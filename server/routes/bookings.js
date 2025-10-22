const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  completeBooking,
  getUserBookings,
  getVendorBookings
} = require('../controllers/bookingController');

router.use(protect);

router.post('/create', createBooking);
router.get('/', getBookings);
router.get('/user/me', getUserBookings);
router.get('/vendor/me', authorize('vendor'), getVendorBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/complete', completeBooking);

module.exports = router;
