const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      // LVHF Categories
      'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
      'appliance_repair', 'pest_control', 'gardening', 'ac_repair',
      // HVLF Categories
      'wedding_planning', 'catering', 'photography', 'videography',
      'decoration', 'dj_music', 'makeup_artist', 'venue_booking',
      'event_management', 'corporate_events'
    ]
  },
  serviceType: {
    type: String,
    enum: ['LVHF', 'HVLF'],
    required: true
  },
  industry: {
    type: String,
    enum: ['home_services', 'events', 'professional_services'],
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  pricingType: {
    type: String,
    enum: ['fixed', 'hourly', 'custom', 'package'],
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  priceRange: {
    min: Number,
    max: Number
  },
  duration: {
    value: Number,
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days']
    }
  },
  packages: [{
    name: String,
    description: String,
    price: Number,
    features: [String],
    duration: String
  }],
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  features: [String],
  requirements: [String],
  tags: [String],
  availability: {
    type: String,
    enum: ['immediate', 'scheduled', 'on_demand'],
    default: 'scheduled'
  },
  bookingType: {
    type: String,
    enum: ['instant', 'request', 'rfq'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  },
  refundPolicy: {
    type: String,
    maxlength: 500
  },
  metadata: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Create slug from name
serviceSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

// Update rating
serviceSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.rating.average;
};

module.exports = mongoose.model('Service', serviceSchema);
