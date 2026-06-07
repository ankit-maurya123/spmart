const express = require('express');
const router = express.Router();
const Product = require('../Server/Model/product.jsx');
const Order = require('../Server/Model/order.jsx');
const {
  getOrderById,
  updateOrderStatus,
} = require('../Server/Controller/orderController.jsx');
const { requireStaff } = require('../Server/middleware/staffAuth.jsx');

// Everything below requires admin OR manager token.
router.use(requireStaff);

/* ── "Real order" filter ──────────────────────────────────────────
   The order panel only shows orders the manager can actually act on:
     • COD orders — payment is collected on delivery, so we want them
       in the queue from creation.
     • Any prepaid order where paymentStatus === 'paid' — the gateway
       confirmed money was received.
   This intentionally hides abandoned online / UPI / card / wallet
   carts that never completed payment (the "fake orders" we used to
   see cluttering the panel).                                          */
const REAL_ORDER_FILTER = {
  $or: [
    { paymentMethod: 'cod' },
    { paymentStatus: 'paid' },
  ],
};

/* ── Manager Dashboard — quick stats just for the order panel ──
   All order counts/aggregations are wrapped in REAL_ORDER_FILTER so
   the dashboard reflects only orders the manager can act on (no
   abandoned online carts).                                          */
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const withStatus = (status) => ({ ...REAL_ORDER_FILTER, status });

    const [
      totalOrders,
      todayOrders,
      yesterdayOrders,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      revenueResult,
      todayRevenueResult,
      totalProducts,
      outOfStockCount,
    ] = await Promise.all([
      Order.countDocuments(REAL_ORDER_FILTER),
      Order.countDocuments({ ...REAL_ORDER_FILTER, createdAt: { $gte: today } }),
      Order.countDocuments({ ...REAL_ORDER_FILTER, createdAt: { $gte: yesterday, $lt: today } }),
      Order.countDocuments(withStatus('pending')),
      Order.countDocuments(withStatus('confirmed')),
      Order.countDocuments(withStatus('processing')),
      Order.countDocuments(withStatus('shipped')),
      Order.countDocuments(withStatus('delivered')),
      Order.countDocuments(withStatus('cancelled')),
      Order.aggregate([
        { $match: { ...REAL_ORDER_FILTER, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            ...REAL_ORDER_FILTER,
            status: { $ne: 'cancelled' },
            createdAt: { $gte: today },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
    ]);

    res.status(200).json({
      totalOrders,
      todayOrders,
      yesterdayOrders,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue: revenueResult[0]?.total || 0,
      todayRevenue: todayRevenueResult[0]?.total || 0,
      totalProducts,
      outOfStockCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ── Manager Order Stats — same shape as admin /orders/stats but
   scoped to real orders only. ─────────────────────────────────── */
router.get('/orders/stats', async (req, res) => {
  try {
    const [
      totalOrders,
      statusCounts,
      revenueResult,
      todayOrders,
    ] = await Promise.all([
      Order.countDocuments(REAL_ORDER_FILTER),
      Order.aggregate([
        { $match: REAL_ORDER_FILTER },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { ...REAL_ORDER_FILTER, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrder: { $avg: '$total' } } },
      ]),
      Order.countDocuments({
        ...REAL_ORDER_FILTER,
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
      pending:    statusMap.pending    || 0,
      confirmed:  statusMap.confirmed  || 0,
      processing: statusMap.processing || 0,
      shipped:    statusMap.shipped    || 0,
      delivered:  statusMap.delivered  || 0,
      cancelled:  statusMap.cancelled  || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ── Manager Orders list ──────────────────────────────────────────
   Same query shape as admin /orders, plus REAL_ORDER_FILTER and an
   optional ?payment= filter (cod | paid) so the manager can flip
   between "COD only" and "Prepaid only" tabs in the UI.            */
router.get('/orders', async (req, res) => {
  try {
    const { status, search, startDate, endDate, sort, payment } = req.query;
    const filter = { ...REAL_ORDER_FILTER };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (payment === 'cod') {
      // Override the $or — show only COD orders.
      delete filter.$or;
      filter.paymentMethod = 'cod';
    } else if (payment === 'paid') {
      delete filter.$or;
      filter.paymentStatus = 'paid';
    }

    if (search) {
      const searchOr = [
        { orderNumber:      { $regex: search, $options: 'i' } },
        { 'customer.name':  { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
      // If REAL_ORDER_FILTER's $or is still in the filter we need to
      // combine both ORs with $and so search doesn't override it.
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchOr }];
        delete filter.$or;
      } else {
        filter.$or = searchOr;
      }
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest')     sortOption = { createdAt: 1 };
    else if (sort === 'total_high') sortOption = { total: -1 };
    else if (sort === 'total_low')  sortOption = { total: 1 };

    const orders = await Order.find(filter).sort(sortOption);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

/* ── Products — VIEW only (no add/edit/delete for manager) ── */
router.get('/products', async (req, res) => {
  try {
    const { category, search, stock } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (stock === 'out') filter.stock = 0;
    if (stock === 'low') filter.stock = { $gt: 0, $lte: 5 };
    if (stock === 'in') filter.stock = { $gt: 5 };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/manager/products/:id/orders
 * Recent orders containing this product + aggregate stats:
 *   { unitsSold, revenue, ordersCount, lastSoldAt, orders: [...] }
 * Excludes cancelled orders from totals (but shows them in the list for context).
 */
router.get('/products/:id/orders', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).select('_id name price');
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Aggregate stats — only real, non-cancelled orders
    const aggResult = await Order.aggregate([
      { $match: { ...REAL_ORDER_FILTER, 'items.productId': product._id, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $match: { 'items.productId': product._id } },
      {
        $group: {
          _id: null,
          unitsSold:  { $sum: '$items.quantity' },
          revenue:    { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          ordersSet:  { $addToSet: '$_id' },
          lastSoldAt: { $max: '$createdAt' },
        },
      },
    ]);
    const agg = aggResult[0] || {};

    // Last 20 real orders (any status) containing this product, newest first
    const orders = await Order.find({ ...REAL_ORDER_FILTER, 'items.productId': product._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('orderNumber status paymentStatus paymentMethod total createdAt customer.name items');

    // Slim the items array to just the matching line for each order
    const trimmed = orders.map((o) => {
      const obj = o.toObject();
      const line = obj.items.find((it) => String(it.productId) === String(product._id));
      return {
        _id: obj._id,
        orderNumber: obj.orderNumber,
        status: obj.status,
        paymentStatus: obj.paymentStatus,
        paymentMethod: obj.paymentMethod,
        total: obj.total,
        createdAt: obj.createdAt,
        customer: { name: obj.customer?.name || '' },
        line: line
          ? { quantity: line.quantity, price: line.price, subtotal: line.price * line.quantity }
          : null,
      };
    });

    res.status(200).json({
      unitsSold:    agg.unitsSold   || 0,
      revenue:      agg.revenue     || 0,
      ordersCount:  (agg.ordersSet || []).length,
      lastSoldAt:   agg.lastSoldAt  || null,
      orders: trimmed,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products/meta/categories', async (req, res) => {
  try {
    const cats = await Product.distinct('category');
    res.status(200).json(cats.sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
