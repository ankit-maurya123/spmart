const jwt = require('jsonwebtoken');
const User = require('../Model/user.jsx');

// Shape the user payload sent back to the client (no password)
const sanitize = (u) => ({
  _id:           u._id,
  name:          u.name,
  email:         u.email,
  phone:         u.phone,
  avatar:        u.avatar,
  gender:        u.gender || '',
  dob:           u.dob || null,
  addresses:     u.addresses || [],
  wishlist:      u.wishlist || [],
  notifications: u.notifications || { email: true, sms: false, offers: true, orderUpd: true },
  walletBalance: u.walletBalance || 0,
  createdAt:     u.createdAt,
});

// POST /api/user/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || '',
    });

    const token = jwt.sign(
      { userId: user._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({ token, user: sanitize(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/user/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({ token, user: sanitize(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/user/verify
exports.verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'user') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: sanitize(user) });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// PUT /api/user/profile (protected) — name, phone, gender, dob, avatar
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, gender, dob, avatar, notifications } = req.body;
    const update = {};
    if (typeof name === 'string')   update.name = name.trim();
    if (typeof phone === 'string')  update.phone = phone.trim();
    if (typeof avatar === 'string') update.avatar = avatar;
    if (typeof gender === 'string') update.gender = gender;
    if (dob !== undefined)          update.dob = dob ? new Date(dob) : null;
    if (notifications && typeof notifications === 'object') {
      update.notifications = notifications;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      update,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user: sanitize(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/user/change-password (protected)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ───────────────────── ADDRESSES ───────────────────── */

// GET /api/user/addresses
exports.listAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('addresses');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/user/addresses — add address
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const a = req.body || {};
    if (!a.name || !a.phone || !a.address || !a.city || !a.state || !a.pincode) {
      return res.status(400).json({ error: 'Name, phone, address, city, state, and pincode are required' });
    }

    // If this is the first address OR explicitly default, ensure only one default
    const makeDefault = a.isDefault || user.addresses.length === 0;
    if (makeDefault) user.addresses.forEach((x) => { x.isDefault = false; });

    user.addresses.push({
      label:     a.label || 'Home',
      name:      a.name.trim(),
      phone:     a.phone.trim(),
      address:   a.address.trim(),
      city:      a.city.trim(),
      state:     a.state.trim(),
      pincode:   a.pincode.trim(),
      landmark:  (a.landmark || '').trim(),
      isDefault: makeDefault,
    });

    await user.save();
    res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/user/addresses/:addressId — update address
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ error: 'Address not found' });

    const a = req.body || {};
    ['label', 'name', 'phone', 'address', 'city', 'state', 'pincode', 'landmark']
      .forEach((k) => { if (typeof a[k] === 'string') addr[k] = a[k].trim(); });

    if (a.isDefault === true) {
      user.addresses.forEach((x) => { x.isDefault = false; });
      addr.isDefault = true;
    }

    await user.save();
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/user/addresses/:addressId
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ error: 'Address not found' });

    const wasDefault = addr.isDefault;
    addr.deleteOne();

    // If we removed the default, promote the first remaining
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ───────────────────── WISHLIST ───────────────────── */

// GET /api/user/wishlist — populated product list
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('wishlist');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ products: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/user/wishlist/:productId — toggle (add if missing, remove if present)
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const id = req.params.productId;
    const idx = user.wishlist.findIndex((p) => p.toString() === id);

    let added;
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      added = false;
    } else {
      user.wishlist.push(id);
      added = true;
    }

    await user.save();
    res.status(200).json({ added, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ───────────────────── WALLET ───────────────────── */

// GET /api/user/wallet — balance + transaction history (newest first)
exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      'walletBalance walletTransactions'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    const txns = (user.walletTransactions || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({
      balance: user.walletBalance || 0,
      transactions: txns,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/user/wallet/topup — add money (simulated payment success)
// Body: { amount, method } where method ∈ upi | card | netbanking
exports.topupWallet = async (req, res) => {
  try {
    const amountNum = Math.floor(Number(req.body?.amount));
    const method = ['upi', 'card', 'netbanking'].includes(req.body?.method)
      ? req.body.method
      : 'upi';

    if (!Number.isFinite(amountNum) || amountNum < 10) {
      return res.status(400).json({ error: 'Minimum top-up amount is ₹10.' });
    }
    if (amountNum > 50000) {
      return res.status(400).json({ error: 'Maximum single top-up is ₹50,000.' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.walletBalance = (user.walletBalance || 0) + amountNum;
    user.walletTransactions.push({
      type: 'credit',
      amount: amountNum,
      reason: `Money added via ${method.toUpperCase()}`,
      method,
      status: 'success',
    });
    await user.save();

    res.status(200).json({
      balance: user.walletBalance,
      transactions: user.walletTransactions
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
