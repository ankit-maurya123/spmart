const express = require('express');
const router = express.Router();
const { placeOrder, trackOrder } = require('../Server/Controller/orderController.jsx');
const { optionalUser } = require('../Server/middleware/userAuth.jsx');

// POST /api/orders — Place a new order (links to user if logged in)
router.post('/', optionalUser, placeOrder);

// GET /api/orders/:orderNumber — Track order by order number
router.get('/:orderNumber', trackOrder);

module.exports = router;
