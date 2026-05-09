const express = require('express');
const router = express.Router();
const Code = require('../models/Code');
const Invoice = require('../models/Invoice');
const UserBalance = require('../models/UserBalance');
const { redeemLimiter, checkLimiter } = require('../middleware/rateLimiter');
const { validateRedeemRequest } = require('../middleware/validator');
const { generateInvoiceNumber } = require('../utils/invoiceGenerator');
const { sanitizeCode, validateCodeFormat } = require('../utils/sanitizer');

// POST /api/redeem
router.post('/', redeemLimiter, validateRedeemRequest, async (req, res) => {
  const { sanitizedCode, sanitizedUserId } = req;
  console.log(`[REDEEM] ${sanitizedCode} by ${sanitizedUserId}`);
  try {
    const existing = await Code.findOne({ code: sanitizedCode });
    if (!existing) return res.status(404).json({ success: false, error: 'Invalid code. Please check and try again.' });
    if (existing.used) {
      const d = existing.usedAt ? new Date(existing.usedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'unknown date';
      return res.status(409).json({ success: false, error: `Code already redeemed on ${d}.` });
    }
    // Atomic update — race-condition safe
    const updated = await Code.findOneAndUpdate(
      { code: sanitizedCode, used: false },
      { $set: { used: true, userId: sanitizedUserId, usedAt: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(409).json({ success: false, error: 'Code was just redeemed by another request. Please try a different code.' });

    const invoiceNumber = generateInvoiceNumber();
    await Invoice.create({
      invoiceNumber,
      code: sanitizedCode,
      userId: sanitizedUserId,
      rewardName: updated.rewardName || 'Reward',
      rewardValue: updated.rewardValue || 'N/A',
      webKey: updated.webKey,
      redeemedAt: new Date(),
      status: 'processing'
    });

    await UserBalance.findOneAndUpdate(
      { $or: [{ userId: sanitizedUserId }, { discordId: sanitizedUserId }] },
      { $inc: { totalRedemptions: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[REDEEM] ✓ Invoice ${invoiceNumber} | ${sanitizedCode}`);
    res.json({
      success: true,
      invoiceNumber,
      reward: { name: updated.rewardName || 'Reward', value: updated.rewardValue || 'N/A', webKey: updated.webKey },
      message: 'Successfully redeemed! Your reward will be delivered within 72 hours.'
    });
  } catch (e) {
    console.error('[REDEEM]', e);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

// GET /api/check-code/:code
router.get('/check-code/:code', checkLimiter, async (req, res) => {
  const code = sanitizeCode(req.params.code);
  if (!code || !validateCodeFormat(code)) return res.status(400).json({ exists: false, error: 'Invalid format.' });
  try {
    const doc = await Code.findOne({ code }).lean();
    if (!doc) return res.json({ exists: false, used: false });
    res.json({ exists: true, used: doc.used, rewardName: doc.rewardName || 'Reward', rewardValue: doc.rewardValue || 'N/A' });
  } catch (e) {
    res.status(500).json({ exists: false, error: 'Server error.' });
  }
});

module.exports = router;
