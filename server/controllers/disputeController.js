const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');
const Project = require('../models/Project');
const Transaction = require('../models/Transaction');
const { createRazorpayRefund } = require('../utils/paymentGateway');

// @desc    Create dispute
// @route   POST /api/disputes/create
// @access  Private
exports.createDispute = async (req, res) => {
  try {
    const {
      bookingId,
      projectId,
      raisedAgainst,
      category,
      title,
      description,
      evidence,
      amount
    } = req.body;

    // Verify booking/project
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

    // Set SLA based on priority
    const sla = {
      responseTime: 24, // 24 hours
      resolutionTime: 72, // 72 hours
      dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000)
    };

    const dispute = await Dispute.create({
      bookingId,
      projectId,
      raisedBy: req.user.id,
      raisedAgainst,
      category,
      title,
      description,
      evidence,
      amount,
      priority: 'medium',
      tier: 1,
      sla
    });

    // Update booking/project status
    if (booking) {
      booking.status = 'disputed';
      booking.dispute = dispute._id;
      await booking.save();
    }

    if (project) {
      project.status = 'disputed';
      project.dispute = dispute._id;
      await project.save();
    }

    // Add initial timeline entry
    dispute.addTimelineEntry('Dispute created', req.user.id, 'Dispute raised by user');
    await dispute.save();

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating dispute',
      error: error.message
    });
  }
};

// @desc    Get disputes
// @route   GET /api/disputes
// @access  Private
exports.getDisputes = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filter based on user role
    if (req.user.role === 'admin') {
      // Admin sees all disputes
      if (status) query.status = status;
      if (category) query.category = category;
    } else {
      // Users see disputes they're involved in
      query.$or = [
        { raisedBy: req.user.id },
        { raisedAgainst: req.user.id }
      ];
      if (status) query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate('raisedBy', 'name email avatar')
      .populate('raisedAgainst', 'name email avatar')
      .populate('bookingId', 'bookingNumber')
      .populate('projectId', 'projectNumber title')
      .populate('assignedTo', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Dispute.countDocuments(query);

    res.json({
      success: true,
      data: disputes,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching disputes',
      error: error.message
    });
  }
};

// @desc    Get dispute by ID
// @route   GET /api/disputes/:id
// @access  Private
exports.getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('raisedBy', 'name email phone avatar')
      .populate('raisedAgainst', 'name email phone avatar')
      .populate('bookingId')
      .populate('projectId')
      .populate('assignedTo', 'name email')
      .populate('conversation.from', 'name avatar');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check authorization
    const isInvolved = 
      dispute.raisedBy._id.toString() === req.user.id ||
      dispute.raisedAgainst._id.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!isInvolved) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this dispute'
      });
    }

    res.json({
      success: true,
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dispute',
      error: error.message
    });
  }
};

// @desc    Add message to dispute
// @route   POST /api/disputes/:id/message
// @access  Private
exports.addMessage = async (req, res) => {
  try {
    const { message, attachments, isInternal } = req.body;

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check authorization
    const isInvolved = 
      dispute.raisedBy.toString() === req.user.id ||
      dispute.raisedAgainst.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!isInvolved) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add messages to this dispute'
      });
    }

    dispute.addMessage(req.user.id, message, attachments, isInternal);
    await dispute.save();

    res.json({
      success: true,
      message: 'Message added successfully',
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
};

// @desc    Update dispute status
// @route   PUT /api/disputes/:id/status
// @access  Private (Admin)
exports.updateDisputeStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    dispute.status = status;
    if (assignedTo) dispute.assignedTo = assignedTo;

    dispute.addTimelineEntry(`Status changed to ${status}`, req.user.id, '');
    await dispute.save();

    res.json({
      success: true,
      message: 'Dispute status updated successfully',
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating dispute status',
      error: error.message
    });
  }
};

// @desc    Resolve dispute
// @route   POST /api/disputes/:id/resolve
// @access  Private (Admin)
exports.resolveDispute = async (req, res) => {
  try {
    const {
      resolutionType,
      description,
      refundAmount,
      compensationAmount,
      actionTaken
    } = req.body;

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    dispute.status = 'resolved';
    dispute.resolution = {
      type: resolutionType,
      description,
      refundAmount,
      compensationAmount,
      actionTaken,
      resolvedBy: req.user.id,
      resolvedAt: new Date()
    };
    dispute.closedAt = new Date();

    // Process refund if applicable
    if (refundAmount > 0 && dispute.bookingId) {
      const booking = await Booking.findById(dispute.bookingId).populate('paymentId');
      if (booking && booking.paymentId) {
        const transaction = booking.paymentId;
        const refundResult = await createRazorpayRefund(
          transaction.gatewayTransactionId,
          refundAmount
        );

        if (refundResult.success) {
          transaction.status = 'refunded';
          transaction.refund = {
            refundId: refundResult.refund.id,
            refundAmount,
            refundReason: 'Dispute resolution',
            refundedAt: new Date(),
            refundStatus: 'processed'
          };
          await transaction.save();

          booking.status = 'refunded';
          await booking.save();
        }
      }
    }

    dispute.addTimelineEntry('Dispute resolved', req.user.id, description);
    await dispute.save();

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving dispute',
      error: error.message
    });
  }
};

// @desc    Escalate dispute
// @route   POST /api/disputes/:id/escalate
// @access  Private
exports.escalateDispute = async (req, res) => {
  try {
    const { reason } = req.body;

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    dispute.escalate(reason);
    dispute.addTimelineEntry('Dispute escalated', req.user.id, reason);
    await dispute.save();

    res.json({
      success: true,
      message: 'Dispute escalated successfully',
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error escalating dispute',
      error: error.message
    });
  }
};
