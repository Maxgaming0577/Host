const rateLimit = require('express-rate-limit');

const redeemLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many redemption attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const resetTime = Math.ceil((req.rateLimit.resetTime - Date.now()) / 60000);
    res.status(429).json({
      success: false,
      error: `Too many attempts. Try again in ${resetTime} minute(s).`,
      retryAfter: resetTime
    });
  }
});

const checkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: 'Too many code checks. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { redeemLimiter, checkLimiter, generalLimiter };
