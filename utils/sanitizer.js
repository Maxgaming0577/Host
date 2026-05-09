function sanitizeCode(code) {
  if (!code || typeof code !== 'string') return null;
  return code.toUpperCase().trim().replace(/\s+/g, '');
}

function validateCodeFormat(code) {
  const pattern = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
  return pattern.test(code);
}

function sanitizeUserId(userId) {
  if (!userId || typeof userId !== 'string') return null;
  return userId.trim().substring(0, 100);
}

module.exports = { sanitizeCode, validateCodeFormat, sanitizeUserId };
