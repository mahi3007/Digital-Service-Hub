const Razorpay = require('razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
exports.createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    return { success: true, order };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return { success: false, error: error.message };
  }
};

// Verify Razorpay payment
exports.verifyRazorpayPayment = async (orderId, paymentId, signature) => {
  try {
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return false;
  }
};

// Create Stripe payment intent
exports.createStripePaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in paise/cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true
      }
    });

    return { success: true, paymentIntent };
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return { success: false, error: error.message };
  }
};

// Create Razorpay refund
exports.createRazorpayRefund = async (paymentId, amount) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100,
      speed: 'normal'
    });

    return { success: true, refund };
  } catch (error) {
    console.error('Razorpay refund error:', error);
    return { success: false, error: error.message };
  }
};

// Create Stripe refund
exports.createStripeRefund = async (paymentIntentId, amount) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount * 100
    });

    return { success: true, refund };
  } catch (error) {
    console.error('Stripe refund error:', error);
    return { success: false, error: error.message };
  }
};

// Create payout (transfer to vendor)
exports.createPayout = async (vendorAccountId, amount, currency = 'INR') => {
  try {
    // This is a placeholder - implement based on your payment gateway
    // For Razorpay, you'd use their Payout API
    // For Stripe, you'd use Connect transfers
    
    return { success: true, payoutId: `payout_${Date.now()}` };
  } catch (error) {
    console.error('Payout error:', error);
    return { success: false, error: error.message };
  }
};
