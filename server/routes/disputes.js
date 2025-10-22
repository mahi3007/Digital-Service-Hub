const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDispute,
  getDisputes,
  getDisputeById,
  addMessage,
  updateDisputeStatus,
  resolveDispute,
  escalateDispute
} = require('../controllers/disputeController');

router.use(protect);

router.post('/create', createDispute);
router.get('/', getDisputes);
router.get('/:id', getDisputeById);
router.post('/:id/message', addMessage);
router.put('/:id/status', updateDisputeStatus);
router.post('/:id/resolve', resolveDispute);
router.post('/:id/escalate', escalateDispute);

module.exports = router;
