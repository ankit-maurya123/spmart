const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      default: 'Admin',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    settings: {
      emailNotifications: { type: Boolean, default: true },
      orderAlerts: { type: Boolean, default: true },
      reviewAlerts: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminProfile', adminProfileSchema);
