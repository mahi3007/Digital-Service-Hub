const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  verifyVendor,
  verifyDocument,
  getAllTransactions,
  getDisputeStats,
  manageServiceCategories
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/vendors/:id/verify', verifyVendor);
router.put('/documents/:userId/verify', verifyDocument);
router.get('/transactions', getAllTransactions);
router.get('/disputes/stats', getDisputeStats);
router.post('/categories', manageServiceCategories);

module.exports = router;
