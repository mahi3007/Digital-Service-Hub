const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const Project = require('../models/Project');
const User = require('../models/User');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripePaymentIntent,
  createRazorpayRefund
} = require('../utils/paymentGateway');

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, projectId, milestoneId, amount, paymentMethod, gateway = 'razorpay' } = req.body;

    let booking, project;

    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
    }

    if (projectId) {
      project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.user.id,
      vendorId: booking?.vendorId || project?.vendorId,
      bookingId,
      projectId,
      milestoneId,
      type: bookingId ? 'booking_payment' : 'milestone_payment',
      amount,
      paymentMethod,
      paymentGateway: gateway,
      status: 'pending',
      escrowStatus: {
        isEscrow: true,
        releaseCondition: 'service_completion'
      }
    });

    let orderData;

    // Create payment order based on gateway
    if (gateway === 'razorpay') {
      const result = await createRazorpayOrder(amount, 'INR', transaction.transactionId);
      if (!result.success) {
        return res.status(500).json({ success: false, message: 'Failed to create payment order' });
      }
      orderData = result.order;
      transaction.gatewayOrderId = orderData.id;
    } else if (gateway === 'stripe') {
      const result = await createStripePaymentIntent(amount, 'inr', {
        transactionId: transaction.transactionId
      });
      if (!result.success) {
        return res.status(500).json({ success: false, message: 'Failed to create payment intent' });
      }
      orderData = result.paymentIntent;
      transaction.gatewayOrderId = orderData.id;
    }

    await transaction.save();

    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        transaction,
        orderData,
        key: gateway === 'razorpay' ? process.env.RAZORPAY_KEY_ID : process.env.STRIPE_PUBLISHABLE_KEY
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId, gatewayPaymentId, gatewayOrderId, gatewaySignature } = req.body;

    const transaction = await Transaction.findOne({ transactionId });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    let isValid = false;

    // Verify based on gateway
    if (transaction.paymentGateway === 'razorpay') {
      isValid = await verifyRazorpayPayment(gatewayOrderId, gatewayPaymentId, gatewaySignature);
    }

    if (!isValid) {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update transaction
    transaction.status = 'completed';
    transaction.gatewayTransactionId = gatewayPaymentId;
    transaction.escrowStatus.isEscrow = true;
    transaction.escrowStatus.heldAt = new Date();
    await transaction.save();

    // Update booking/project payment status
    if (transaction.bookingId) {
      const booking = await Booking.findById(transaction.bookingId);
      booking.paymentStatus = 'held_in_escrow';
      booking.paymentId = transaction._id;
      booking.addTimelineEntry('payment_received', 'Payment held in escrow', req.user.id);
      await booking.save();
    }

    if (transaction.projectId) {
      const project = await Project.findById(transaction.projectId);
      if (transaction.milestoneId) {
        const milestone = project.milestones.id(transaction.milestoneId);
        milestone.paymentStatus = 'held_in_escrow';
        milestone.paymentId = transaction._id;
      }
      project.escrowBalance += transaction.amount;
      await project.save();
    }

    res.json({
      success: true,
      message: 'Payment verified and held in escrow',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// @desc    Process refund
// @route   POST /api/payments/refund/:transactionId
// @access  Private
exports.processRefund = async (req, res) => {
  try {
    const { reason, amount } = req.body;

    const transaction = await Transaction.findOne({ transactionId: req.params.transactionId });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status === 'refunded') {
      return res.status(400).json({ success: false, message: 'Transaction already refunded' });
    }

    const refundAmount = amount || transaction.amount;

    // Process refund based on gateway
    let refundResult;
    if (transaction.paymentGateway === 'razorpay') {
      refundResult = await createRazorpayRefund(transaction.gatewayTransactionId, refundAmount);
    }

    if (!refundResult.success) {
      return res.status(500).json({ success: false, message: 'Refund processing failed' });
    }

    // Update transaction
    transaction.status = 'refunded';
    transaction.refund = {
      refundId: refundResult.refund.id,
      refundAmount,
      refundReason: reason,
      refundedAt: new Date(),
      refundStatus: 'processed'
    };
    await transaction.save();

    // Update user wallet
    const user = await User.findById(transaction.userId);
    user.walletBalance += refundAmount;
    await user.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};

// @desc    Get transaction history
// @route   GET /api/payments/history
// @access  Private
exports.getTransactionHistory = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    const query = { userId: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('bookingId', 'bookingNumber serviceId')
      .populate('projectId', 'projectNumber title')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction history',
      error: error.message
    });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('vendorId')
      .populate('bookingId')
      .populate('projectId');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Check authorization
    if (transaction.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};
