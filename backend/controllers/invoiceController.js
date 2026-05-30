const Invoice = require('../models/Invoice');

exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber } = req.body;
    if (!invoiceNumber || !invoiceNumber.trim()) {
      return res.status(400).json({ error: 'Invoice number is required.' });
    }
    const invoice = new Invoice({
      ...req.body,
      userId: req.user.id,
      invoiceNumber: invoiceNumber.trim(),
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: `Invoice number "${req.body.invoiceNumber}" already exists. Use a different number.`,
      });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };
    const invoice = await Invoice.findOne(filter);
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.userId;
    if (updateData.invoiceNumber) {
      updateData.invoiceNumber = updateData.invoiceNumber.trim();
    }
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };
    const invoice = await Invoice.findOneAndUpdate(filter, updateData, {
      new: true,
      runValidators: true,
    });
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    res.json(invoice);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: `Invoice number "${req.body.invoiceNumber}" already exists. Use a different number.`,
      });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };
    const invoice = await Invoice.findOneAndDelete(filter);
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
