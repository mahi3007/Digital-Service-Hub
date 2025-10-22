const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createRFQ,
  getRFQs,
  getRFQById,
  updateRFQ,
  submitProposal,
  updateProposalStatus,
  selectProposal,
  getUserRFQs,
  getVendorRFQs
} = require('../controllers/rfqController');

router.use(protect);

router.post('/create', createRFQ);
router.get('/', getRFQs);
router.get('/user/me', getUserRFQs);
router.get('/vendor/me', authorize('vendor'), getVendorRFQs);
router.get('/:id', getRFQById);
router.put('/:id', updateRFQ);
router.post('/:id/proposal', authorize('vendor'), submitProposal);
router.put('/:rfqId/proposal/:proposalId', updateProposalStatus);
router.post('/:rfqId/select/:proposalId', selectProposal);

module.exports = router;
