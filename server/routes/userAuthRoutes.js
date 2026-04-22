const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verify,
  updateProfile,
} = require('../Server/Controller/userAuthController.jsx');

// POST /api/user/register
router.post('/register', register);

// POST /api/user/login
router.post('/login', login);

// GET /api/user/verify
router.get('/verify', verify);

// PUT /api/user/profile
router.put('/profile', updateProfile);

module.exports = router;
