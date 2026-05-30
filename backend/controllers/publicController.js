const Invoice = require('../models/Invoice');
const PublicShare = require('../models/PublicShare');
const crypto = require('crypto');

exports.createShareLink = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoiceFilter = req.user.role === 'admin'
      ? { _id: invoiceId }
      : { _id: invoiceId, userId: req.user.id };
    const invoice = await Invoice.findOne(invoiceFilter);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    let share = await PublicShare.findOne({ invoiceId, isActive: true });
    if (!share) {
      const token = crypto.randomBytes(12).toString('hex');
      share = await PublicShare.create({ invoiceId, shareToken: token });
    }

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bill/${share.shareToken}`;
    res.json({
      shareToken: share.shareToken,
      shareUrl,
      viewCount: share.viewCount,
      downloads: share.downloads,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPublicInvoice = async (req, res) => {
  try {
    const { token } = req.params;
    const share = await PublicShare.findOne({ shareToken: token, isActive: true });
    if (!share) return res.status(404).json({ error: 'Link not found or expired' });

    share.viewCount += 1;
    await share.save();

    const invoice = await Invoice.findById(share.invoiceId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    res.json({ invoice, viewCount: share.viewCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.trackDownload = async (req, res) => {
  try {
    const { token } = req.params;
    await PublicShare.findOneAndUpdate(
      { shareToken: token },
      { $inc: { downloads: 1 } },
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getShareStats = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoiceFilter = req.user.role === 'admin'
      ? { _id: invoiceId }
      : { _id: invoiceId, userId: req.user.id };
    const invoice = await Invoice.findOne(invoiceFilter);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const share = await PublicShare.findOne({ invoiceId, isActive: true });
    if (!share) return res.json({ hasShare: false });

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bill/${share.shareToken}`;
    res.json({
      hasShare: true,
      shareToken: share.shareToken,
      shareUrl,
      viewCount: share.viewCount,
      downloads: share.downloads,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.revokeShare = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoiceFilter = req.user.role === 'admin'
      ? { _id: invoiceId }
      : { _id: invoiceId, userId: req.user.id };
    const invoice = await Invoice.findOne(invoiceFilter);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    await PublicShare.findOneAndUpdate({ invoiceId }, { isActive: false });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
