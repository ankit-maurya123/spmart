const fs = require('fs');
const path = require('path');
const AdminProfile = require('../Model/adminProfile.jsx');

// GET /api/admin/profile — Get admin profile (auto-creates if missing)
exports.getProfile = async (req, res) => {
  try {
    const email = req.adminEmail;
    let profile = await AdminProfile.findOne({ email });

    if (!profile) {
      profile = await AdminProfile.create({ email, name: 'Admin' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/admin/profile — Update profile info + optional avatar
exports.updateProfile = async (req, res) => {
  try {
    const email = req.adminEmail;
    const { name, phone, bio } = req.body;

    let profile = await AdminProfile.findOne({ email });
    if (!profile) {
      profile = await AdminProfile.create({ email });
    }

    if (name !== undefined) profile.name = name;
    if (phone !== undefined) profile.phone = phone;
    if (bio !== undefined) profile.bio = bio;

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar file if it exists
      if (profile.avatar && profile.avatar.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', '..', profile.avatar);
        fs.unlink(oldPath, () => {});
      }
      profile.avatar = '/uploads/' + req.file.filename;
    }

    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/admin/profile/avatar — Remove avatar
exports.removeAvatar = async (req, res) => {
  try {
    const email = req.adminEmail;
    const profile = await AdminProfile.findOne({ email });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (profile.avatar && profile.avatar.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', '..', profile.avatar);
      fs.unlink(filePath, () => {});
    }

    profile.avatar = '';
    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/admin/profile/settings — Update settings
exports.updateSettings = async (req, res) => {
  try {
    const email = req.adminEmail;
    let profile = await AdminProfile.findOne({ email });

    if (!profile) {
      profile = await AdminProfile.create({ email });
    }

    const { emailNotifications, orderAlerts, reviewAlerts, lowStockAlerts, language, timezone } = req.body;

    if (emailNotifications !== undefined) profile.settings.emailNotifications = emailNotifications;
    if (orderAlerts !== undefined) profile.settings.orderAlerts = orderAlerts;
    if (reviewAlerts !== undefined) profile.settings.reviewAlerts = reviewAlerts;
    if (lowStockAlerts !== undefined) profile.settings.lowStockAlerts = lowStockAlerts;
    if (language !== undefined) profile.settings.language = language;
    if (timezone !== undefined) profile.settings.timezone = timezone;

    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /api/admin/profile/password — Change password (updates .env is not practical, so we validate old + store hash)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Verify current password against .env
    if (currentPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Since password is stored in .env, we can't update it at runtime
    // Return success message guiding the user
    res.status(200).json({ message: 'Password verified. To change it, update ADMIN_PASSWORD in your .env file and restart the server.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
