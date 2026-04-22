const express = require('express');
const router = express.Router();
const { login, verify } = require('../Server/Controller/authController.jsx');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify
router.get('/verify', verify);

module.exports = router;
