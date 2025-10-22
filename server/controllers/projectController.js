const Project = require('../models/Project');
const Vendor = require('../models/Vendor');
const Transaction = require('../models/Transaction');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    // Filter based on user role
    if (req.user.role === 'user') {
      query.userId = req.user.id;
    } else if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.user.id });
      if (vendor) query.vendorId = vendor._id;
    }

    const projects = await Project.find(query)
      .populate('userId', 'name email avatar')
      .populate({
        path: 'vendorId',
        populate: { path: 'userId', select: 'name avatar' }
      })
      .populate('rfqId', 'title category')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('userId', 'name email phone avatar')
      .populate({
        path: 'vendorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate('rfqId')
      .populate('reviews');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const isAuthorized = 
      project.userId._id.toString() === req.user.id ||
      (vendor && project.vendorId._id.toString() === vendor._id.toString()) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project'
      });
    }

    // Calculate progress
    const progress = project.calculateProgress();

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        progress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// @desc    Update milestone
// @route   PUT /api/projects/:projectId/milestone/:milestoneId
// @access  Private
exports.updateMilestone = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const milestone = project.milestones.id(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Check authorization (vendor can update)
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor || project.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this milestone'
      });
    }

    milestone.status = status;
    if (notes) milestone.notes = notes;

    if (status === 'completed') {
      milestone.completedAt = new Date();
    }

    project.addTimelineEntry(milestone.name, status, notes, req.user.id);
    await project.save();

    // Send notification
    const io = req.app.get('io');
    io.to(project.chatRoomId).emit('milestone-updated', {
      projectId: project._id,
      milestoneId: milestone._id,
      status
    });

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating milestone',
      error: error.message
    });
  }
};

// @desc    Approve milestone and release payment
// @route   POST /api/projects/:projectId/milestone/:milestoneId/approve
// @access  Private
exports.approveMilestone = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization (only client can approve)
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this milestone'
      });
    }

    const milestone = project.milestones.id(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    if (milestone.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Milestone must be completed before approval'
      });
    }

    milestone.status = 'approved';
    milestone.approvedAt = new Date();

    // Release payment from escrow
    if (milestone.paymentStatus === 'held_in_escrow' && milestone.paymentId) {
      const transaction = await Transaction.findById(milestone.paymentId);
      if (transaction) {
        transaction.status = 'released';
        transaction.escrowStatus.releasedAt = new Date();
        await transaction.save();

        milestone.paymentStatus = 'released';
        project.escrowBalance -= milestone.amount;

        // Update vendor earnings
        const vendor = await Vendor.findById(project.vendorId);
        vendor.totalEarnings += (milestone.amount * (1 - parseFloat(process.env.COMMISSION_RATE_HVLF || 0.15)));
        await vendor.save();
      }
    }

    project.addTimelineEntry(milestone.name, 'approved', 'Milestone approved by client', req.user.id);
    await project.save();

    res.json({
      success: true,
      message: 'Milestone approved and payment released',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving milestone',
      error: error.message
    });
  }
};

// @desc    Upload deliverable
// @route   POST /api/projects/:projectId/milestone/:milestoneId/deliverable
// @access  Private
exports.uploadDeliverable = async (req, res) => {
  try {
    const { name, url } = req.body;

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const milestone = project.milestones.id(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Check authorization (vendor can upload)
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor || project.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload deliverables'
      });
    }

    milestone.deliverables.push({
      name,
      url,
      uploadedAt: new Date()
    });

    await project.save();

    res.json({
      success: true,
      message: 'Deliverable uploaded successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading deliverable',
      error: error.message
    });
  }
};

// @desc    Get user projects
// @route   GET /api/projects/user/me
// @access  Private
exports.getUserProjects = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user.id };
    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate({
        path: 'vendorId',
        populate: { path: 'userId', select: 'name avatar' }
      })
      .populate('rfqId', 'title category')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user projects',
      error: error.message
    });
  }
};

// @desc    Get vendor projects
// @route   GET /api/projects/vendor/me
// @access  Private
exports.getVendorProjects = async (req, res) => {
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

    const projects = await Project.find(query)
      .populate('userId', 'name email avatar')
      .populate('rfqId', 'title category')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor projects',
      error: error.message
    });
  }
};
