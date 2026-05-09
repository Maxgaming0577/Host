function generateInvoiceNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WS-${ts}-${rand}`;
}

module.exports = { generateInvoiceNumber };
