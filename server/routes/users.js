const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  uploadVerificationDocument,
  getVerificationStatus,
  updateWallet
} = require('../controllers/userController');

router.use(protect);

router.post('/verification/upload', uploadVerificationDocument);
router.get('/verification/status', getVerificationStatus);
router.put('/wallet', updateWallet);

module.exports = router;
