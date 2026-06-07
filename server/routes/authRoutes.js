const express = require('express');
const router = express.Router();
const { login, managerLogin, verify } = require('../Server/Controller/authController.jsx');

// POST /api/auth/login — admin
router.post('/login', login);

// POST /api/auth/manager-login — order manager
router.post('/manager-login', managerLogin);

// GET /api/auth/verify
router.get('/verify', verify);

module.exports = router;
