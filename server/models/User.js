const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['id_proof', 'address_proof', 'selfie']
    },
    url: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  trustBadge: {
    type: String,
    enum: ['none', 'bronze', 'silver', 'gold'],
    default: 'none'
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  fcmToken: String,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update trust score based on ratings and activity
userSchema.methods.updateTrustScore = function() {
  let score = 50; // Base score
  
  // Add points for verification
  if (this.isVerified) score += 20;
  
  // Add points based on total bookings
  score += Math.min(this.totalBookings * 2, 20);
  
  // Cap at 100
  this.trustScore = Math.min(score, 100);
  
  // Update badge
  if (this.trustScore >= 80) this.trustBadge = 'gold';
  else if (this.trustScore >= 60) this.trustBadge = 'silver';
  else if (this.trustScore >= 40) this.trustBadge = 'bronze';
  else this.trustBadge = 'none';
  
  return this.trustScore;
};

module.exports = mongoose.model('User', userSchema);
