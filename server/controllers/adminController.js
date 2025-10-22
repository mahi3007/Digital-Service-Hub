const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Dispute = require('../models/Dispute');
const Service = require('../models/Service');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Transaction.aggregate([
      { $match: { type: 'commission' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const activeDisputes = await Dispute.countDocuments({ 
      status: { $in: ['open', 'under_review', 'mediation'] } 
    });

    const recentBookings = await Booking.find()
      .populate('userId', 'name')
      .populate('serviceId', 'name')
      .sort('-createdAt')
      .limit(10);

    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          type: 'commission',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVendors,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          activeDisputes
        },
        recentBookings,
        monthlyRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isVerified, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Verify vendor
// @route   PUT /api/admin/vendors/:id/verify
// @access  Private (Admin)
exports.verifyVendor = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.verificationStatus = status;
    if (status === 'rejected') {
      vendor.rejectionReason = rejectionReason;
    }

    await vendor.save();

    // Update user verification status
    if (status === 'approved') {
      await User.findByIdAndUpdate(vendor.userId, { isVerified: true });
    }

    res.json({
      success: true,
      message: `Vendor ${status} successfully`,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying vendor',
      error: error.message
    });
  }
};

// @desc    Verify document
// @route   PUT /api/admin/documents/:userId/verify
// @access  Private (Admin)
exports.verifyDocument = async (req, res) => {
  try {
    const { documentId, status } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const document = user.verificationDocuments.id(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    document.status = status;

    // Check if all documents are approved
    const allApproved = user.verificationDocuments.every(doc => doc.status === 'approved');
    if (allApproved) {
      user.isVerified = true;
      user.updateTrustScore();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Document verification updated',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying document',
      error: error.message
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin)
exports.getAllTransactions = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('vendorId')
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
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    Get dispute statistics
// @route   GET /api/admin/disputes/stats
// @access  Private (Admin)
exports.getDisputeStats = async (req, res) => {
  try {
    const totalDisputes = await Dispute.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'open' });
    const resolvedDisputes = await Dispute.countDocuments({ status: 'resolved' });

    const disputesByCategory = await Dispute.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const avgResolutionTime = await Dispute.aggregate([
      { $match: { status: 'resolved' } },
      {
        $project: {
          resolutionTime: {
            $subtract: ['$resolution.resolvedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalDisputes,
        openDisputes,
        resolvedDisputes,
        disputesByCategory,
        avgResolutionTimeHours: avgResolutionTime[0]?.avgTime 
          ? (avgResolutionTime[0].avgTime / (1000 * 60 * 60)).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dispute stats',
      error: error.message
    });
  }
};

// @desc    Manage service categories
// @route   POST /api/admin/categories
// @access  Private (Admin)
exports.manageServiceCategories = async (req, res) => {
  try {
    // This is a placeholder for category management
    // You can implement CRUD operations for service categories
    res.json({
      success: true,
      message: 'Category management endpoint'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error managing categories',
      error: error.message
    });
  }
};
