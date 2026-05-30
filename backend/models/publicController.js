const Invoice     = require('../models/Invoice');
const PublicShare = require('../models/PublicShare');
const crypto      = require('crypto');

// Create or get existing share link
exports.createShareLink = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Reuse existing share if present
    let share = await PublicShare.findOne({ invoiceId, isActive: true });
    if (!share) {
      const token = crypto.randomBytes(12).toString('hex');
      share = await PublicShare.create({ invoiceId, shareToken: token });
    }

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bill/${share.shareToken}`;
    res.json({ shareToken: share.shareToken, shareUrl, viewCount: share.viewCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get public invoice by token (no auth required)
exports.getPublicInvoice = async (req, res) => {
  try {
    const { token } = req.params;
    const share = await PublicShare.findOne({ shareToken: token, isActive: true });
    if (!share) return res.status(404).json({ error: 'Link not found or expired' });

    // Increment view count
    share.viewCount += 1;
    await share.save();

    const invoice = await Invoice.findById(share.invoiceId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    res.json({ invoice, viewCount: share.viewCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Track download
exports.trackDownload = async (req, res) => {
  try {
    const { token } = req.params;
    await PublicShare.findOneAndUpdate({ shareToken: token }, { $inc: { downloads: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get share stats for an invoice
exports.getShareStats = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const share = await PublicShare.findOne({ invoiceId, isActive: true });
    if (!share) return res.json({ hasShare: false });
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bill/${share.shareToken}`;
    res.json({ hasShare: true, shareToken: share.shareToken, shareUrl, viewCount: share.viewCount, downloads: share.downloads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deactivate share
exports.revokeShare = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    await PublicShare.findOneAndUpdate({ invoiceId }, { isActive: false });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};