const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    Create review
// @route   POST /api/reviews/create
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const {
      vendorId,
      serviceId,
      bookingId,
      projectId,
      rating,
      title,
      comment,
      images,
      pros,
      cons,
      wouldRecommend
    } = req.body;

    // Verify booking/project ownership
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to review this booking'
        });
      }

      if (booking.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Can only review completed bookings'
        });
      }

      // Check if already reviewed
      if (booking.review) {
        return res.status(400).json({
          success: false,
          message: 'Booking already reviewed'
        });
      }
    }

    // Create review
    const review = await Review.create({
      userId: req.user.id,
      vendorId,
      serviceId,
      bookingId,
      projectId,
      rating,
      title,
      comment,
      images,
      pros,
      cons,
      wouldRecommend,
      isVerifiedPurchase: bookingId || projectId ? true : false
    });

    // Calculate trust impact
    review.calculateTrustImpact();
    await review.save();

    // Update vendor rating
    const vendor = await Vendor.findById(vendorId);
    vendor.updateRating(rating.overall);
    await vendor.save();

    // Update service rating
    const service = await Service.findById(serviceId);
    service.updateRating(rating.overall);
    await service.save();

    // Update user trust score
    const user = await User.findById(req.user.id);
    user.trustScore += review.trustImpact;
    user.updateTrustScore();
    await user.save();

    // Link review to booking
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { review: review._id });
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// @desc    Get reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { vendorId, serviceId, rating, page = 1, limit = 10 } = req.query;

    const query = { status: 'approved' };

    if (vendorId) query.vendorId = vendorId;
    if (serviceId) query.serviceId = serviceId;
    if (rating) query['rating.overall'] = parseInt(rating);

    const reviews = await Review.find(query)
      .populate('userId', 'name avatar trustBadge')
      .populate('serviceId', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments(query);

    // Calculate rating distribution
    const distribution = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$rating.overall',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: reviews,
      distribution,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'name avatar trustBadge')
      .populate('vendorId')
      .populate('serviceId');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const allowedUpdates = ['rating', 'title', 'comment', 'images', 'pros', 'cons', 'wouldRecommend'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });

    review.isEdited = true;
    review.editedAt = new Date();

    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.markHelpful(req.user.id);
    await review.save();

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulCount: review.helpfulCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking review as helpful',
      error: error.message
    });
  }
};

// @desc    Vendor response to review
// @route   POST /api/reviews/:id/response
// @access  Private
exports.vendorResponse = async (req, res) => {
  try {
    const { comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the vendor
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor || review.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    review.vendorResponse = {
      comment,
      respondedAt: new Date(),
      respondedBy: req.user.id
    };

    await review.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding response',
      error: error.message
    });
  }
};
