const express = require('express');
const router = express.Router();
const UserBalance = require('../models/UserBalance');
const Code = require('../models/Code');
const Invoice = require('../models/Invoice');
const { generalLimiter } = require('../middleware/rateLimiter');

// GET /api/leaderboard
router.get('/', generalLimiter, async (req, res) => {
  try {
    const [topCoins, topInvites, topMessages, topRedemptions] = await Promise.all([
      UserBalance.find({}).sort({ balance: -1 }).limit(10).lean(),
      UserBalance.find({}).sort({ totalInvites: -1 }).limit(10).lean(),
      UserBalance.find({}).sort({ totalMessages: -1 }).limit(10).lean(),
      UserBalance.find({}).sort({ totalRedemptions: -1 }).limit(10).lean(),
    ]);
    res.json({ success: true, topCoins, topInvites, topMessages, topRedemptions });
  } catch (e) {
    console.error('[LB]', e);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// GET /api/stats  (mounted at /api/stats via server.js router)
router.get('/stats', generalLimiter, async (req, res) => {
  try {
    const [totalMembers, activeRewards, totalRedeemed] = await Promise.all([
      UserBalance.countDocuments(),
      Code.countDocuments({ used: false }),
      Invoice.countDocuments(),
    ]);
    res.json({ success: true, totalMembers, activeRewards, totalRedeemed });
  } catch (e) {
    console.error('[STATS]', e);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;
