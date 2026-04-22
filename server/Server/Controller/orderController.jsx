const Order = require('../Model/order.jsx');
const Product = require('../Model/product.jsx');

// POST /api/orders — Place a new order (public)
exports.placeOrder = async (req, res) => {
  try {
    const { customer, shippingAddress, items, paymentMethod, notes } = req.body;

    // Validate required fields
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({ error: 'Customer name, email, and phone are required.' });
    }
    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode) {
      return res.status(400).json({ error: 'Complete shipping address is required.' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    // Validate items against actual products and build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }

      const orderItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || '',
        imageKey: product.imageKey || '',
        category: product.category || '',
      };

      orderItems.push(orderItem);
      subtotal += product.price * item.quantity;
    }

    const deliveryFee = subtotal >= 499 ? 0 : 40;
    const total = subtotal + deliveryFee;

    const order = new Order({
      customer,
      shippingAddress,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      notes: notes || '',
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/orders/:orderNumber — Track order (public)
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======= ADMIN ENDPOINTS =======

// GET /api/admin/orders — All orders with filters
exports.getAllOrders = async (req, res) => {
  try {
    const { status, search, startDate, endDate, sort } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'total_high') sortOption = { total: -1 };
    else if (sort === 'total_low') sortOption = { total: 1 };

    const orders = await Order.find(filter).sort(sortOption);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/orders/stats — Order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const [
      totalOrders,
      statusCounts,
      revenueResult,
      todayOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrder: { $avg: '$total' } } },
      ]),
      Order.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    const statusMap = {};
    statusCounts.forEach((s) => { statusMap[s._id] = s.count; });

    res.status(200).json({
      totalOrders,
      todayOrders,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      avgOrderValue: revenueResult[0]?.avgOrder ? Math.round(revenueResult[0].avgOrder) : 0,
      pending: statusMap.pending || 0,
      confirmed: statusMap.confirmed || 0,
      processing: statusMap.processing || 0,
      shipped: statusMap.shipped || 0,
      delivered: statusMap.delivered || 0,
      cancelled: statusMap.cancelled || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/orders/:id — Single order detail
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/admin/orders/:id/status — Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Auto-update payment status when delivered (COD)
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }

    // Refund on cancellation if already paid
    if (status === 'cancelled' && order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/admin/orders/:id — Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
