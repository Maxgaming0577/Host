const express = require('express');
const router = express.Router();
const UserBalance = require('../models/UserBalance');
const { generalLimiter } = require('../middleware/rateLimiter');
const { sanitizeUserId } = require('../utils/sanitizer');

// GET /api/available-coins/:userId
router.get('/:userId', generalLimiter, async (req, res) => {
  const userId = sanitizeUserId(req.params.userId);
  if (!userId) return res.status(400).json({ success: false, error: 'Invalid user ID.' });
  try {
    let u = await UserBalance.findOne({ $or: [{ userId }, { discordId: userId }] }).lean();
    if (!u) u = { userId, balance: 0, lastDailyClaim: null, totalMessages: 0, totalInvites: 0, totalRedemptions: 0, updatedAt: new Date() };
    res.json({ success: true, balance: u.balance || 0, lastDailyClaim: u.lastDailyClaim, totalMessages: u.totalMessages || 0, totalInvites: u.totalInvites || 0, totalRedemptions: u.totalRedemptions || 0, updatedAt: u.updatedAt });
  } catch (e) {
    console.error('[BALANCE]', e);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// POST /api/daily-claim/:userId
router.post('/daily-claim/:userId', generalLimiter, async (req, res) => {
  const userId = sanitizeUserId(req.params.userId);
  if (!userId) return res.status(400).json({ success: false, error: 'Invalid user ID.' });
  try {
    const now = new Date();
    const u = await UserBalance.findOne({ $or: [{ userId }, { discordId: userId }] });
    if (u && u.lastDailyClaim) {
      const ms = now - new Date(u.lastDailyClaim);
      if (ms < 24 * 3600000) {
        const hLeft = Math.ceil((24 * 3600000 - ms) / 3600000);
        return res.status(429).json({ success: false, error: `Already claimed. Try again in ${hLeft} hour(s).`, nextClaimIn: hLeft, nextClaimAt: new Date(u.lastDailyClaim.getTime() + 24 * 3600000) });
      }
    }
    const updated = await UserBalance.findOneAndUpdate(
      { $or: [{ userId }, { discordId: userId }] },
      { $inc: { balance: 1000 }, $set: { lastDailyClaim: now, updatedAt: now } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[DAILY] ${userId} claimed 1000. Balance: ${updated.balance}`);
    res.json({ success: true, message: '+1,000 IQCoins added!', balance: updated.balance, claimedAt: now });
  } catch (e) {
    console.error('[DAILY]', e);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;
