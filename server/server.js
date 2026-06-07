const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const managerRoutes = require('./routes/managerRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userAuthRoutes = require('./routes/userAuthRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check (no DB needed)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB. In serverless (Vercel), reuse connection across invocations.
let dbReady;
function ensureDb() {
  if (!dbReady) {
    dbReady = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => { dbReady = null; console.error('MongoDB connection error:', err.message); throw err; });
  }
  return dbReady;
}

// Ensure DB is connected before any /api/* request (must come BEFORE the route registrations below)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  ensureDb().then(() => next()).catch((err) => res.status(503).json({ error: 'DB not ready: ' + err.message }));
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userAuthRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);

// Only start a listener when run directly (local dev). On Vercel, the app is imported.
if (require.main === module) {
  ensureDb().then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  });
}

module.exports = app;
