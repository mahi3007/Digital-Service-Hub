const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
  rfqNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  category: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['wedding', 'birthday', 'corporate', 'conference', 'party', 'other']
  },
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventDuration: {
    value: Number,
    unit: String
  },
  location: {
    venue: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  guestCount: {
    type: Number,
    min: 0
  },
  requirements: [{
    service: String,
    details: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  proposals: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    quotedPrice: {
      type: Number,
      required: true
    },
    breakdown: [{
      item: String,
      quantity: Number,
      unitPrice: Number,
      total: Number
    }],
    description: String,
    deliverables: [String],
    timeline: String,
    termsAndConditions: String,
    attachments: [{
      name: String,
      url: String
    }],
    status: {
      type: String,
      enum: ['submitted', 'shortlisted', 'accepted', 'rejected'],
      default: 'submitted'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    validUntil: Date,
    notes: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'in_review', 'proposals_received', 'vendor_selected', 'closed', 'cancelled'],
    default: 'draft'
  },
  selectedProposal: {
    type: mongoose.Schema.Types.ObjectId
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invited_only'],
    default: 'public'
  },
  invitedVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }],
  expiresAt: {
    type: Date,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate RFQ number
rfqSchema.pre('save', async function(next) {
  if (!this.rfqNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.rfqNumber = `RFQ${timestamp}${random}`;
  }
  next();
});

// Get proposal count
rfqSchema.methods.getProposalCount = function() {
  return this.proposals.length;
};

// Get shortlisted proposals
rfqSchema.methods.getShortlistedProposals = function() {
  return this.proposals.filter(p => p.status === 'shortlisted');
};

module.exports = mongoose.model('RFQ', rfqSchema);
