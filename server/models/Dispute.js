const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  disputeNumber: {
    type: String,
    unique: true,
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  raisedAgainst: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: [
      'service_not_provided',
      'poor_quality',
      'delayed_service',
      'payment_issue',
      'communication_issue',
      'cancellation_dispute',
      'refund_request',
      'other'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'document', 'video', 'audio']
    },
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  amount: {
    disputed: Number,
    claimed: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  status: {
    type: String,
    enum: ['open', 'under_review', 'mediation', 'arbitration', 'resolved', 'closed', 'escalated'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tier: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
    description: 'Tier 1: Automated, Tier 2: Mediation, Tier 3: Arbitration'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  conversation: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    attachments: [{
      url: String,
      type: String
    }],
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  resolution: {
    type: {
      type: String,
      enum: ['refund', 'partial_refund', 'rework', 'compensation', 'no_action', 'other']
    },
    description: String,
    refundAmount: Number,
    compensationAmount: Number,
    actionTaken: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  timeline: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  sla: {
    responseTime: Number, // in hours
    resolutionTime: Number, // in hours
    dueDate: Date
  },
  satisfaction: {
    raisedByRating: {
      type: Number,
      min: 1,
      max: 5
    },
    raisedAgainstRating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },
  isEscalated: {
    type: Boolean,
    default: false
  },
  escalationReason: String,
  closedAt: Date
}, {
  timestamps: true
});

// Generate dispute number
disputeSchema.pre('save', async function(next) {
  if (!this.disputeNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.disputeNumber = `DSP${timestamp}${random}`;
  }
  next();
});

// Add conversation message
disputeSchema.methods.addMessage = function(from, message, attachments = [], isInternal = false) {
  this.conversation.push({
    from,
    message,
    attachments,
    isInternal,
    timestamp: new Date()
  });
};

// Add timeline entry
disputeSchema.methods.addTimelineEntry = function(action, performedBy, notes) {
  this.timeline.push({
    action,
    performedBy,
    notes,
    timestamp: new Date()
  });
};

// Escalate dispute
disputeSchema.methods.escalate = function(reason) {
  this.tier = Math.min(this.tier + 1, 3);
  this.isEscalated = true;
  this.escalationReason = reason;
  this.priority = 'high';
};

module.exports = mongoose.model('Dispute', disputeSchema);
