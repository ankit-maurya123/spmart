const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  subscribe,
} = require('../Server/Controller/contactController.jsx');

// POST /api/contact — save a contact form submission
router.post('/', submitContact);

// GET /api/contact — list all messages (admin)
router.get('/', getAllContacts);

// POST /api/contact/subscribe — newsletter subscribe
router.post('/subscribe', subscribe);

module.exports = router;
