const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectNumber: {
    type: String,
    unique: true,
    required: true
  },
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  commission: {
    type: Number,
    required: true
  },
  vendorPayout: {
    type: Number,
    required: true
  },
  milestones: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    amount: {
      type: Number,
      required: true
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'approved', 'disputed'],
      default: 'pending'
    },
    deliverables: [{
      name: String,
      url: String,
      uploadedAt: Date
    }],
    paymentStatus: {
      type: String,
      enum: ['pending', 'held_in_escrow', 'released', 'disputed'],
      default: 'pending'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    completedAt: Date,
    approvedAt: Date,
    notes: String
  }],
  escrowBalance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['initiated', 'in_progress', 'on_hold', 'completed', 'cancelled', 'disputed'],
    default: 'initiated'
  },
  startDate: {
    type: Date,
    required: true
  },
  expectedEndDate: {
    type: Date,
    required: true
  },
  actualEndDate: Date,
  timeline: [{
    milestone: String,
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  chatRoomId: {
    type: String,
    required: true
  },
  documents: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    type: String
  }],
  contract: {
    url: String,
    signedByClient: {
      signed: { type: Boolean, default: false },
      signedAt: Date,
      signature: String
    },
    signedByVendor: {
      signed: { type: Boolean, default: false },
      signedAt: Date,
      signature: String
    }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute'
  }
}, {
  timestamps: true
});

// Generate project number
projectSchema.pre('save', async function(next) {
  if (!this.projectNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.projectNumber = `PRJ${timestamp}${random}`;
  }
  next();
});

// Calculate project progress
projectSchema.methods.calculateProgress = function() {
  if (this.milestones.length === 0) return 0;
  const completedMilestones = this.milestones.filter(m => m.status === 'completed' || m.status === 'approved').length;
  return (completedMilestones / this.milestones.length) * 100;
};

// Get next milestone
projectSchema.methods.getNextMilestone = function() {
  return this.milestones.find(m => m.status === 'pending' || m.status === 'in_progress');
};

// Add timeline entry
projectSchema.methods.addTimelineEntry = function(milestone, status, note, userId) {
  this.timeline.push({
    milestone,
    status,
    note,
    updatedBy: userId,
    timestamp: new Date()
  });
};

module.exports = mongoose.model('Project', projectSchema);
