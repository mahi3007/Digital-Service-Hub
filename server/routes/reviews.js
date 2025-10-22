const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  markHelpful,
  vendorResponse
} = require('../controllers/reviewController');

router.get('/', getReviews);
router.get('/:id', getReviewById);

router.use(protect);

router.post('/create', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', markHelpful);
router.post('/:id/response', vendorResponse);

module.exports = router;
