const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  userId: { type: String, required: true },
  rewardName: { type: String },
  rewardValue: { type: String },
  webKey: { type: String },
  redeemedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'processing' }
});

invoiceSchema.index({ userId: 1 });
invoiceSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
