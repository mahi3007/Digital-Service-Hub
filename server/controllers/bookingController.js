const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Create booking (LVHF instant booking)
// @route   POST /api/bookings/create
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      location,
      customerNotes
    } = req.body;

    const service = await Service.findById(serviceId).populate('vendorId');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Service is not available'
      });
    }

    // Calculate pricing
    const basePrice = service.basePrice;
    const tax = basePrice * 0.18; // 18% GST
    const totalAmount = basePrice + tax;
    
    const commissionRate = service.serviceType === 'LVHF' 
      ? parseFloat(process.env.COMMISSION_RATE_LVHF || 0.10)
      : parseFloat(process.env.COMMISSION_RATE_HVLF || 0.15);
    
    const commission = totalAmount * commissionRate;
    const vendorPayout = totalAmount - commission;

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      vendorId: service.vendorId._id,
      serviceId: service._id,
      serviceType: service.serviceType,
      scheduledDate,
      scheduledTime,
      duration: service.duration,
      location,
      customerNotes,
      pricing: {
        basePrice,
        tax,
        totalAmount,
        commission,
        vendorPayout
      },
      status: 'pending',
      paymentStatus: 'pending',
      chatRoomId: `booking_${Date.now()}_${req.user.id}`
    });

    // Add timeline entry
    booking.addTimelineEntry('pending', 'Booking created', req.user.id);
    await booking.save();

    // Update service stats
    service.totalBookings += 1;
    service.metadata.conversions += 1;
    await service.save();

    // Update vendor stats
    const vendor = await Vendor.findById(service.vendorId._id);
    vendor.statistics.bookingRequests += 1;
    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    const { status, serviceType, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    // Filter based on user role
    if (req.user.role === 'user') {
      query.userId = req.user.id;
    } else if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.user.id });
      if (vendor) query.vendorId = vendor._id;
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone avatar')
      .populate('serviceId', 'name category images')
      .populate({
        path: 'vendorId',
        populate: { path: 'userId', select: 'name phone avatar' }
      })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone avatar')
      .populate('serviceId')
      .populate({
        path: 'vendorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate('paymentId')
      .populate('review');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const isAuthorized = 
      booking.userId.toString() === req.user.id ||
      (vendor && booking.vendorId._id.toString() === vendor._id.toString()) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const isVendor = vendor && booking.vendorId.toString() === vendor._id.toString();
    const isCustomer = booking.userId.toString() === req.user.id;

    if (!isVendor && !isCustomer && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    booking.addTimelineEntry(status, note, req.user.id);
    await booking.save();

    // Send notification (implement notification service)
    const io = req.app.get('io');
    io.to(booking.chatRoomId).emit('booking-status-updated', {
      bookingId: booking._id,
      status
    });

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }

    // Calculate refund based on cancellation policy
    let refundAmount = 0;
    const service = await Service.findById(booking.serviceId);
    
    if (service.cancellationPolicy === 'flexible') {
      refundAmount = booking.pricing.totalAmount;
    } else if (service.cancellationPolicy === 'moderate') {
      refundAmount = booking.pricing.totalAmount * 0.5;
    }
    // strict policy = no refund

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.user.id,
      reason,
      cancelledAt: new Date(),
      refundAmount,
      refundStatus: refundAmount > 0 ? 'pending' : 'not_applicable'
    };

    booking.addTimelineEntry('cancelled', `Cancelled: ${reason}`, req.user.id);
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking,
        refundAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// @desc    Complete booking
// @route   PUT /api/bookings/:id/complete
// @access  Private
exports.completeBooking = async (req, res) => {
  try {
    const { verificationCode, images, notes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be in progress to complete'
      });
    }

    booking.status = 'completed';
    booking.completion = {
      completedAt: new Date(),
      verificationCode,
      verifiedBy: req.user.id,
      images,
      notes
    };

    // Release payment from escrow
    if (booking.paymentStatus === 'held_in_escrow') {
      booking.paymentStatus = 'released';
      
      // Update vendor earnings
      const vendor = await Vendor.findById(booking.vendorId);
      vendor.completedJobs += 1;
      vendor.totalEarnings += booking.pricing.vendorPayout;
      await vendor.save();

      // Update user stats
      const user = await User.findById(booking.userId);
      user.totalBookings += 1;
      user.totalSpent += booking.pricing.totalAmount;
      user.updateTrustScore();
      await user.save();
    }

    booking.addTimelineEntry('completed', 'Booking completed', req.user.id);
    await booking.save();

    res.json({
      success: true,
      message: 'Booking completed successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing booking',
      error: error.message
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/user/me
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('serviceId', 'name category images')
      .populate({
        path: 'vendorId',
        populate: { path: 'userId', select: 'name phone avatar' }
      })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user bookings',
      error: error.message
    });
  }
};

// @desc    Get vendor bookings
// @route   GET /api/bookings/vendor/me
// @access  Private (Vendor)
exports.getVendorBookings = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { vendorId: vendor._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone avatar')
      .populate('serviceId', 'name category images')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor bookings',
      error: error.message
    });
  }
};
