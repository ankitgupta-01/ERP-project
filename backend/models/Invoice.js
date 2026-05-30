const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  description: String,
  hsnSacCode: String,
  sizeA: Number,
  sizeB: Number,
  sizeUnit: { type: String, default: 'ft' },
  qty: Number,
  nos: { type: Number, default: 1 },
  per: { type: String, default: 'SFT' },
  rate: Number,
  amount: Number,
});

const InvoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  invoiceNumber: { type: String, required: true, trim: true },
  type: { type: String, enum: ['INVOICE', 'QUOTATION'], default: 'INVOICE' },
  date: { type: Date, default: Date.now },
  company: {
    name: String,
    address: String,
    gstin: String,
    phone: String,
    email: String,
    logo: String,
  },
  client: {
    name: String,
    address: String,
    siteAt: String,
    gstin: String,
  },
  items: [ItemSchema],
  totalAmount: { type: Number, default: 0 },
  cgstPercent: { type: Number, default: 9 },
  sgstPercent: { type: Number, default: 9 },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  roundOff: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  amountInWords: String,
  notes: String,
  bankDetails: String,
}, { timestamps: true });

InvoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
