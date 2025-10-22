const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  businessType: {
    type: String,
    enum: ['individual', 'company', 'partnership'],
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  categories: [{
    type: String,
    required: true
  }],
  portfolio: [{
    title: String,
    description: String,
    images: [String],
    completedAt: Date
  }],
  documents: {
    businessLicense: {
      url: String,
      number: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    },
    taxId: {
      url: String,
      number: String,
      verified: { type: Boolean, default: false }
    },
    insurance: {
      url: String,
      provider: String,
      policyNumber: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    },
    certifications: [{
      name: String,
      url: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date
    }]
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    breakdown: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: Number, // in minutes
    default: 0
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available'
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      slots: [{
        startTime: String,
        endTime: String
      }]
    }]
  },
  serviceArea: {
    cities: [String],
    radius: Number, // in kilometers
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  pricing: {
    minimumCharge: Number,
    travelFee: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  subscriptionExpiry: Date,
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branch: String,
    upiId: String,
    verified: { type: Boolean, default: false }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  statistics: {
    views: { type: Number, default: 0 },
    contactClicks: { type: Number, default: 0 },
    bookingRequests: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Update rating
vendorSchema.methods.updateRating = function(newRating) {
  this.rating.breakdown[newRating] += 1;
  this.rating.count += 1;
  
  const totalPoints = 
    (this.rating.breakdown[5] * 5) +
    (this.rating.breakdown[4] * 4) +
    (this.rating.breakdown[3] * 3) +
    (this.rating.breakdown[2] * 2) +
    (this.rating.breakdown[1] * 1);
  
  this.rating.average = totalPoints / this.rating.count;
  return this.rating.average;
};

// Calculate conversion rate
vendorSchema.methods.calculateConversionRate = function() {
  if (this.statistics.bookingRequests === 0) return 0;
  this.statistics.conversionRate = (this.completedJobs / this.statistics.bookingRequests) * 100;
  return this.statistics.conversionRate;
};

module.exports = mongoose.model('Vendor', vendorSchema);
