const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { generalLimiter } = require('../middleware/rateLimiter');
const { sanitizeUserId } = require('../utils/sanitizer');

// GET /api/invoices/find/:invoiceNumber  — MUST be before /:userId
router.get('/find/:invoiceNumber', generalLimiter, async (req, res) => {
  const inv = req.params.invoiceNumber.toUpperCase().trim();
  try {
    const doc = await Invoice.findOne({ invoiceNumber: inv }).lean();
    if (!doc) return res.status(404).json({ success: false, error: 'Invoice not found.' });
    const hrs = Math.max(0, 72 - (Date.now() - new Date(doc.redeemedAt)) / 3600000);
    res.json({ success: true, invoice: { ...doc, hoursRemaining: Math.ceil(hrs), deliveryStatus: 'processing' } });
  } catch (e) {
    console.error('[INV FIND]', e);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// GET /api/invoices/:userId
router.get('/:userId', generalLimiter, async (req, res) => {
  const userId = sanitizeUserId(req.params.userId);
  if (!userId) return res.status(400).json({ success: false, error: 'Invalid user ID.' });
  try {
    const docs = await Invoice.find({ userId }).sort({ redeemedAt: -1 }).limit(50).lean();
    const now = Date.now();
    const invoices = docs.map(d => ({
      ...d,
      hoursRemaining: Math.ceil(Math.max(0, 72 - (now - new Date(d.redeemedAt)) / 3600000)),
      deliveryStatus: 'processing'
    }));
    res.json({ success: true, invoices });
  } catch (e) {
    console.error('[INV LIST]', e);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;
