const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPaymentOrder,
  verifyPayment,
  processRefund,
  getTransactionHistory,
  getTransactionById
} = require('../controllers/paymentController');

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/refund/:transactionId', processRefund);
router.get('/history', getTransactionHistory);
router.get('/:id', getTransactionById);

module.exports = router;
