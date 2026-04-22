const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  removeAvatar,
  updateSettings,
  changePassword,
} = require('../Server/Controller/profileController.jsx');

// Auth middleware — extracts admin email from JWT
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype.split('/')[1]);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

const handleUpload = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 2MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// All routes require authentication
router.use(authMiddleware);

// GET /api/admin/profile
router.get('/', getProfile);

// PUT /api/admin/profile — with optional avatar upload
router.put('/', handleUpload, updateProfile);

// DELETE /api/admin/profile/avatar
router.delete('/avatar', removeAvatar);

// PUT /api/admin/profile/settings
router.put('/settings', updateSettings);

// PUT /api/admin/profile/password
router.put('/password', changePassword);

module.exports = router;
