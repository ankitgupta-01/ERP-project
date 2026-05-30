const mongoose = require('mongoose');

const PublicShareSchema = new mongoose.Schema({
  invoiceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  shareToken: { type: String, unique: true, required: true },
  viewCount:  { type: Number, default: 0 },
  downloads:  { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
  expiresAt:  { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('PublicShare', PublicShareSchema);