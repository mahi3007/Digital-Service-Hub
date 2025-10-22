const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    Create vendor profile
// @route   POST /api/vendors/profile
// @access  Private
exports.createVendorProfile = async (req, res) => {
  try {
    const { businessName, businessType, description, categories, serviceArea } = req.body;

    // Check if vendor profile already exists
    const existingVendor = await Vendor.findOne({ userId: req.user.id });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor profile already exists'
      });
    }

    // Update user role to vendor
    await User.findByIdAndUpdate(req.user.id, { role: 'vendor' });

    // Create vendor profile
    const vendor = await Vendor.create({
      userId: req.user.id,
      businessName,
      businessType,
      description,
      categories,
      serviceArea
    });

    res.status(201).json({
      success: true,
      message: 'Vendor profile created successfully',
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating vendor profile',
      error: error.message
    });
  }
};

// @desc    Get vendor profile
// @route   GET /api/vendors/profile/me
// @access  Private
exports.getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id })
      .populate('userId', 'name email phone avatar')
      .populate('services');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor profile',
      error: error.message
    });
  }
};

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private
exports.updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const allowedUpdates = [
      'businessName', 'description', 'categories', 'portfolio',
      'serviceArea', 'pricing', 'bankDetails', 'documents'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        vendor[field] = req.body[field];
      }
    });

    await vendor.save();

    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vendor profile',
      error: error.message
    });
  }
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
exports.getVendors = async (req, res) => {
  try {
    const {
      category,
      city,
      rating,
      priceRange,
      page = 1,
      limit = 10,
      sort = '-rating.average'
    } = req.query;

    const query = { isActive: true, verificationStatus: 'approved' };

    if (category) query.categories = category;
    if (city) query['serviceArea.cities'] = city;
    if (rating) query['rating.average'] = { $gte: parseFloat(rating) };

    const vendors = await Vendor.find(query)
      .populate('userId', 'name avatar trustBadge')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Vendor.countDocuments(query);

    res.json({
      success: true,
      data: vendors,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message
    });
  }
};

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('userId', 'name email phone avatar trustBadge trustScore')
      .populate('services');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Increment view count
    vendor.statistics.views += 1;
    await vendor.save();

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor',
      error: error.message
    });
  }
};

// @desc    Update vendor availability
// @route   PUT /api/vendors/availability
// @access  Private (Vendor)
exports.updateAvailability = async (req, res) => {
  try {
    const { status, schedule } = req.body;

    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    if (status) vendor.availability.status = status;
    if (schedule) vendor.availability.schedule = schedule;

    await vendor.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: vendor.availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
      error: error.message
    });
  }
};

// @desc    Get vendor statistics
// @route   GET /api/vendors/stats/me
// @access  Private (Vendor)
exports.getVendorStats = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const stats = {
      completedJobs: vendor.completedJobs,
      totalEarnings: vendor.totalEarnings,
      rating: vendor.rating,
      responseTime: vendor.responseTime,
      statistics: vendor.statistics,
      conversionRate: vendor.calculateConversionRate()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor stats',
      error: error.message
    });
  }
};
