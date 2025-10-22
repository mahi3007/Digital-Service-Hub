const User = require('../models/User');

// @desc    Upload verification document
// @route   POST /api/users/verification/upload
// @access  Private
exports.uploadVerificationDocument = async (req, res) => {
  try {
    const { type, url } = req.body;

    const user = await User.findById(req.user.id);

    user.verificationDocuments.push({
      type,
      url,
      status: 'pending'
    });

    await user.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: user.verificationDocuments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// @desc    Get verification status
// @route   GET /api/users/verification/status
// @access  Private
exports.getVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        isVerified: user.isVerified,
        trustScore: user.trustScore,
        trustBadge: user.trustBadge,
        documents: user.verificationDocuments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching verification status',
      error: error.message
    });
  }
};

// @desc    Update wallet balance
// @route   PUT /api/users/wallet
// @access  Private
exports.updateWallet = async (req, res) => {
  try {
    const { amount, type } = req.body; // type: 'add' or 'deduct'

    const user = await User.findById(req.user.id);

    if (type === 'add') {
      user.walletBalance += amount;
    } else if (type === 'deduct') {
      if (user.walletBalance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }
      user.walletBalance -= amount;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Wallet updated successfully',
      data: {
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating wallet',
      error: error.message
    });
  }
};
