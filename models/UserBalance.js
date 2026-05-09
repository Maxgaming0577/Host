const mongoose = require('mongoose');

const userBalanceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  // Discord profile
  discordId: { type: String, default: null },
  discordUsername: { type: String, default: null },
  discordAvatar: { type: String, default: null },
  discordEmail: { type: String, default: null },
  // Coins
  balance: { type: Number, default: 0 },
  lastDailyClaim: { type: Date, default: null },
  totalMessages: { type: Number, default: 0 },
  totalInvites: { type: Number, default: 0 },
  totalRedemptions: { type: Number, default: 0 },
  // Auth
  lastLogin: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userBalanceSchema.index({ userId: 1 });
userBalanceSchema.index({ discordId: 1 });
userBalanceSchema.index({ balance: -1 });

module.exports = mongoose.model('UserBalance', userBalanceSchema);
