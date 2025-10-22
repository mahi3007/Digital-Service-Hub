const Service = require('../models/Service');
const Vendor = require('../models/Vendor');

// @desc    Create service
// @route   POST /api/services
// @access  Private (Vendor)
exports.createService = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    if (vendor.verificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Vendor must be verified to create services'
      });
    }

    const serviceData = {
      ...req.body,
      vendorId: vendor._id
    };

    const service = await Service.create(serviceData);

    // Add service to vendor's services array
    vendor.services.push(service._id);
    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const {
      category,
      serviceType,
      industry,
      city,
      priceMin,
      priceMax,
      rating,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (serviceType) query.serviceType = serviceType;
    if (industry) query.industry = industry;
    if (rating) query['rating.average'] = { $gte: parseFloat(rating) };
    
    if (priceMin || priceMax) {
      query.basePrice = {};
      if (priceMin) query.basePrice.$gte = parseFloat(priceMin);
      if (priceMax) query.basePrice.$lte = parseFloat(priceMax);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const services = await Service.find(query)
      .populate('vendorId', 'businessName rating userId')
      .populate({
        path: 'vendorId',
        populate: {
          path: 'userId',
          select: 'name avatar trustBadge'
        }
      })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Service.countDocuments(query);

    res.json({
      success: true,
      data: services,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('vendorId')
      .populate({
        path: 'vendorId',
        populate: {
          path: 'userId',
          select: 'name email phone avatar trustBadge trustScore'
        }
      });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Increment view count
    service.metadata.views += 1;
    await service.save();

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: error.message
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Vendor)
exports.updateService = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check ownership
    if (service.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    const allowedUpdates = [
      'name', 'description', 'pricingType', 'basePrice', 'priceRange',
      'duration', 'packages', 'images', 'features', 'requirements',
      'tags', 'availability', 'isActive', 'cancellationPolicy', 'refundPolicy'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    await service.save();

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Vendor)
exports.deleteService = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check ownership
    if (service.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    // Soft delete
    service.isActive = false;
    await service.save();

    // Remove from vendor's services array
    vendor.services = vendor.services.filter(s => s.toString() !== service._id.toString());
    await vendor.save();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
};

// @desc    Get services by vendor
// @route   GET /api/services/vendor/me
// @access  Private (Vendor)
exports.getServicesByVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const services = await Service.find({ vendorId: vendor._id });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};
