const { sanitizeCode, validateCodeFormat, sanitizeUserId } = require('../utils/sanitizer');

function validateRedeemRequest(req, res, next) {
  const { code, userId } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'Code is required.' });
  if (!userId) return res.status(400).json({ success: false, error: 'User ID is required.' });

  const sanitizedCode = sanitizeCode(code);
  const sanitizedUserId = sanitizeUserId(userId);

  if (!sanitizedCode) return res.status(400).json({ success: false, error: 'Invalid code format.' });
  if (!validateCodeFormat(sanitizedCode)) {
    return res.status(400).json({ success: false, error: 'Code must be in format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX' });
  }
  if (!sanitizedUserId) return res.status(400).json({ success: false, error: 'Invalid user ID.' });

  req.sanitizedCode = sanitizedCode;
  req.sanitizedUserId = sanitizedUserId;
  next();
}

module.exports = { validateRedeemRequest };
