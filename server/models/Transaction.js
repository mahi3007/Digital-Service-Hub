const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  milestoneId: mongoose.Schema.Types.ObjectId,
  type: {
    type: String,
    enum: ['booking_payment', 'milestone_payment', 'refund', 'wallet_topup', 'payout', 'commission'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  commission: {
    type: Number,
    default: 0
  },
  vendorPayout: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'wallet', 'netbanking', 'cash'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paytm', 'manual']
  },
  gatewayTransactionId: String,
  gatewayOrderId: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'held_in_escrow', 'released'],
    default: 'pending'
  },
  escrowStatus: {
    isEscrow: { type: Boolean, default: false },
    heldAt: Date,
    releasedAt: Date,
    releaseCondition: String
  },
  paymentDetails: {
    cardLast4: String,
    cardBrand: String,
    upiId: String,
    bankName: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String
  },
  invoice: {
    invoiceNumber: String,
    invoiceUrl: String,
    generatedAt: Date
  },
  refund: {
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  },
  payout: {
    payoutId: String,
    payoutAmount: Number,
    payoutMethod: String,
    payoutStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed']
    },
    processedAt: Date,
    failureReason: String
  },
  notes: String,
  adminNotes: String
}, {
  timestamps: true
});

// Generate transaction ID
transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const prefix = 'TXN';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.transactionId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Generate invoice number
transactionSchema.methods.generateInvoiceNumber = function() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  this.invoice.invoiceNumber = `INV${year}${month}${random}`;
  this.invoice.generatedAt = date;
  return this.invoice.invoiceNumber;
};

module.exports = mongoose.model('Transaction', transactionSchema);
