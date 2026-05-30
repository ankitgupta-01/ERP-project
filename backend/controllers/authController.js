const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-secret-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sendAuth(res, user) {
  res.json({
    token: signToken(user),
    user: user.toSafeObject ? user.toSafeObject() : user,
  });
}

exports.register = async (req, res) => {
  try {
    const { fullName, businessName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !businessName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const existing = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { phone: phone.trim() },
      ],
    });

    if (existing) {
      return res.status(409).json({ error: 'Email or phone number is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      businessName,
      email,
      phone,
      password: passwordHash,
    });

    res.status(201).json({
      message: 'Account created successfully. Please login.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required.' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.trim() },
      ],
    }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    sendAuth(res, user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.profile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: user.toSafeObject() });
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully.' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await User.findOne({
      $or: [
        { email: identifier?.toLowerCase().trim() },
        { phone: identifier?.trim() },
      ],
    });

    if (!user) {
      return res.json({ message: 'If the account exists, a reset link has been generated.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    res.json({
      message: 'Password reset token generated.',
      resetToken: token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ error: 'Reset token is invalid or expired.' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully. Please login.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users.map((user) => user.toSafeObject()));
};

exports.getAnalytics = async (req, res) => {
  const [users, documents, invoices, quotations, revenue] = await Promise.all([
    User.countDocuments(),
    Invoice.countDocuments(),
    Invoice.countDocuments({ type: 'INVOICE' }),
    Invoice.countDocuments({ type: 'QUOTATION' }),
    Invoice.aggregate([
      { $match: { type: 'INVOICE' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
  ]);

  res.json({
    users,
    documents,
    invoices,
    quotations,
    revenue: revenue[0]?.total || 0,
  });
};

exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }
  if (req.params.id === req.user.id && role !== 'admin') {
    return res.status(400).json({ error: 'You cannot remove your own admin role.' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true },
  );

  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user.toSafeObject());
};

exports.deleteUser = async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  await Invoice.deleteMany({ userId: req.params.id });
  res.json({ message: 'User and billing data deleted.' });
};
