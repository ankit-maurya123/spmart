const express = require('express');
const router = express.Router();
const { placeOrder, trackOrder } = require('../Server/Controller/orderController.jsx');

// POST /api/orders — Place a new order
router.post('/', placeOrder);

// GET /api/orders/:orderNumber — Track order by order number
router.get('/:orderNumber', trackOrder);

module.exports = router;
