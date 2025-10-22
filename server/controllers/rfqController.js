const RFQ = require('../models/RFQ');
const Vendor = require('../models/Vendor');
const Project = require('../models/Project');

// @desc    Create RFQ (HVLF)
// @route   POST /api/rfq/create
// @access  Private
exports.createRFQ = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      eventType,
      budget,
      eventDate,
      eventDuration,
      location,
      guestCount,
      requirements,
      attachments,
      visibility,
      invitedVendors
    } = req.body;

    // Set expiry date (default 30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const rfq = await RFQ.create({
      userId: req.user.id,
      title,
      description,
      category,
      eventType,
      budget,
      eventDate,
      eventDuration,
      location,
      guestCount,
      requirements,
      attachments,
      visibility: visibility || 'public',
      invitedVendors,
      status: 'published',
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: rfq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating RFQ',
      error: error.message
    });
  }
};

// @desc    Get all RFQs
// @route   GET /api/rfq
// @access  Private
exports.getRFQs = async (req, res) => {
  try {
    const { category, eventType, status, page = 1, limit = 10 } = req.query;

    const query = { isActive: true, status: { $in: ['published', 'proposals_received'] } };

    // Vendors see public RFQs or ones they're invited to
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.user.id });
      if (vendor) {
        query.$or = [
          { visibility: 'public' },
          { invitedVendors: vendor._id }
        ];
      }
    }

    if (category) query.category = category;
    if (eventType) query.eventType = eventType;
    if (status) query.status = status;

    const rfqs = await RFQ.find(query)
      .populate('userId', 'name avatar trustBadge')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await RFQ.countDocuments(query);

    res.json({
      success: true,
      data: rfqs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching RFQs',
      error: error.message
    });
  }
};

// @desc    Get RFQ by ID
// @route   GET /api/rfq/:id
// @access  Private
exports.getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('userId', 'name email phone avatar trustBadge')
      .populate({
        path: 'proposals.vendorId',
        populate: { path: 'userId', select: 'name avatar trustBadge' }
      });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Increment view count
    rfq.views += 1;
    await rfq.save();

    // Filter proposals based on user role
    let filteredRFQ = rfq.toObject();
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.user.id });
      if (vendor) {
        // Vendors only see their own proposals
        filteredRFQ.proposals = rfq.proposals.filter(
          p => p.vendorId._id.toString() === vendor._id.toString()
        );
      }
    }

    res.json({
      success: true,
      data: filteredRFQ
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching RFQ',
      error: error.message
    });
  }
};

// @desc    Update RFQ
// @route   PUT /api/rfq/:id
// @access  Private
exports.updateRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Check ownership
    if (rfq.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this RFQ'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'budget', 'eventDate', 'location',
      'guestCount', 'requirements', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        rfq[field] = req.body[field];
      }
    });

    await rfq.save();

    res.json({
      success: true,
      message: 'RFQ updated successfully',
      data: rfq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating RFQ',
      error: error.message
    });
  }
};

// @desc    Submit proposal
// @route   POST /api/rfq/:id/proposal
// @access  Private (Vendor)
exports.submitProposal = async (req, res) => {
  try {
    const {
      quotedPrice,
      breakdown,
      description,
      deliverables,
      timeline,
      termsAndConditions,
      attachments,
      validUntil
    } = req.body;

    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.status === 'closed' || rfq.status === 'vendor_selected') {
      return res.status(400).json({
        success: false,
        message: 'RFQ is no longer accepting proposals'
      });
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Check if vendor already submitted a proposal
    const existingProposal = rfq.proposals.find(
      p => p.vendorId.toString() === vendor._id.toString()
    );

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a proposal for this RFQ'
      });
    }

    // Add proposal
    rfq.proposals.push({
      vendorId: vendor._id,
      quotedPrice,
      breakdown,
      description,
      deliverables,
      timeline,
      termsAndConditions,
      attachments,
      validUntil: validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      status: 'submitted'
    });

    rfq.status = 'proposals_received';
    await rfq.save();

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      data: rfq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting proposal',
      error: error.message
    });
  }
};

// @desc    Update proposal status
// @route   PUT /api/rfq/:rfqId/proposal/:proposalId
// @access  Private
exports.updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const rfq = await RFQ.findById(req.params.rfqId);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Check ownership
    if (rfq.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update proposals'
      });
    }

    const proposal = rfq.proposals.id(req.params.proposalId);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    proposal.status = status;
    await rfq.save();

    res.json({
      success: true,
      message: 'Proposal status updated successfully',
      data: rfq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating proposal status',
      error: error.message
    });
  }
};

// @desc    Select proposal and create project
// @route   POST /api/rfq/:rfqId/select/:proposalId
// @access  Private
exports.selectProposal = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.rfqId).populate('proposals.vendorId');

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Check ownership
    if (rfq.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to select proposals'
      });
    }

    const proposal = rfq.proposals.id(req.params.proposalId);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Update proposal status
    proposal.status = 'accepted';
    rfq.selectedProposal = proposal._id;
    rfq.status = 'vendor_selected';

    // Create project from RFQ and proposal
    const commissionRate = parseFloat(process.env.COMMISSION_RATE_HVLF || 0.15);
    const commission = proposal.quotedPrice * commissionRate;
    const vendorPayout = proposal.quotedPrice - commission;

    const project = await Project.create({
      rfqId: rfq._id,
      userId: rfq.userId,
      vendorId: proposal.vendorId._id,
      title: rfq.title,
      description: rfq.description,
      totalAmount: proposal.quotedPrice,
      commission,
      vendorPayout,
      milestones: req.body.milestones || [],
      startDate: new Date(),
      expectedEndDate: rfq.eventDate,
      chatRoomId: `project_${Date.now()}_${rfq.userId}`
    });

    rfq.projectId = project._id;
    await rfq.save();

    res.status(201).json({
      success: true,
      message: 'Proposal selected and project created successfully',
      data: {
        rfq,
        project
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error selecting proposal',
      error: error.message
    });
  }
};

// @desc    Get user RFQs
// @route   GET /api/rfq/user/me
// @access  Private
exports.getUserRFQs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user.id };
    if (status) query.status = status;

    const rfqs = await RFQ.find(query)
      .populate('proposals.vendorId', 'businessName rating')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await RFQ.countDocuments(query);

    res.json({
      success: true,
      data: rfqs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user RFQs',
      error: error.message
    });
  }
};

// @desc    Get vendor RFQs (where vendor submitted proposals)
// @route   GET /api/rfq/vendor/me
// @access  Private (Vendor)
exports.getVendorRFQs = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const rfqs = await RFQ.find({
      'proposals.vendorId': vendor._id
    })
      .populate('userId', 'name avatar')
      .sort('-createdAt');

    // Filter to show only vendor's proposals
    const filteredRFQs = rfqs.map(rfq => {
      const rfqObj = rfq.toObject();
      rfqObj.proposals = rfq.proposals.filter(
        p => p.vendorId.toString() === vendor._id.toString()
      );
      return rfqObj;
    });

    res.json({
      success: true,
      data: filteredRFQs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor RFQs',
      error: error.message
    });
  }
};
