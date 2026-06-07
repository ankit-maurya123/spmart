const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Sub-schema for delivery addresses.
 * One user can have many — one of them can be flagged as default.
 */
const addressSchema = new mongoose.Schema(
  {
    label:    { type: String, default: 'Home', trim: true }, // Home / Work / Other
    name:     { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    address:  { type: String, required: true, trim: true }, // line 1 + 2
    city:     { type: String, required: true, trim: true },
    state:    { type: String, required: true, trim: true },
    pincode:  { type: String, required: true, trim: true },
    landmark: { type: String, default: '', trim: true },
    isDefault:{ type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Wallet transaction sub-schema. Append-only ledger — every credit/debit
 * pushes a new entry so the user can see their full history.
 */
const walletTxnSchema = new mongoose.Schema(
  {
    type:        { type: String, enum: ['credit', 'debit'], required: true },
    amount:      { type: Number, required: true, min: 0 },
    reason:      { type: String, required: true },
    orderNumber: { type: String, default: '' },
    method:      { type: String, default: '' }, // upi / card / netbanking / system
    status:      { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },

    // Profile extras
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    dob: {
      type: Date,
      default: null,
    },

    // Addresses
    addresses: { type: [addressSchema], default: [] },

    // Wishlist (Product ObjectIds)
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Notification preferences
    notifications: {
      email:     { type: Boolean, default: true },
      sms:       { type: Boolean, default: false },
      offers:    { type: Boolean, default: true },
      orderUpd:  { type: Boolean, default: true },
    },

    // Wallet — balance + transaction ledger.
    // New users get a ₹50 welcome bonus, recorded as their first credit.
    walletBalance: {
      type: Number,
      default: 50,
      min: 0,
    },
    walletTransactions: { type: [walletTxnSchema], default: [] },
  },
  { timestamps: true }
);

// Seed the welcome-bonus transaction on first save.
userSchema.pre('save', function (next) {
  if (this.isNew && (!this.walletTransactions || this.walletTransactions.length === 0)) {
    this.walletTransactions.push({
      type: 'credit',
      amount: 50,
      reason: 'Welcome bonus',
      method: 'system',
      status: 'success',
    });
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
