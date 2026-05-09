const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  used: { type: Boolean, default: false },
  webKey: { type: String, required: true, enum: ['mc', 'rb', 'rb100', 'xbox', 'nitro', 'nitroboost'] },
  userId: { type: String, default: null },
  usedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  rewardValue: { type: String },
  rewardName: { type: String }
});

codeSchema.index({ code: 1 });
codeSchema.index({ used: 1 });

module.exports = mongoose.model('Code', codeSchema);
