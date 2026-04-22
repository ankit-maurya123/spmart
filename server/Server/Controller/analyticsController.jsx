const Order = require('../Model/order.jsx');
const Product = require('../Model/product.jsx');
const Review = require('../Model/review.jsx');
const Category = require('../Model/category.jsx');

// GET /api/admin/analytics — Comprehensive analytics from real DB data
exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

    // ═══════ STAT CARDS ═══════
    // Current month
    const [
      totalCustomers,
      totalOrders,
      revenueAgg,
      thisMonthOrders,
      thisMonthCustomers,
      lastMonthOrders,
      lastMonthCustomers,
      thisMonthRevenue,
      lastMonthRevenue,
      totalProducts,
      totalReviews,
      avgRatingAgg,
    ] = await Promise.all([
      Order.distinct('customer.email').then((arr) => arr.length),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' }, avg: { $avg: '$total' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Order.distinct('customer.email', { createdAt: { $gte: startOfThisMonth } }).then((arr) => arr.length),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Order.distinct('customer.email', { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }).then((arr) => arr.length),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Product.countDocuments(),
      Review.countDocuments(),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const avgOrderValue = revenueAgg[0]?.avg ? Math.round(revenueAgg[0].avg) : 0;
    const thisMonthRev = thisMonthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;

    const calcGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 1000) / 10;
    };

    const stats = {
      totalCustomers,
      totalOrders,
      totalRevenue,
      avgOrderValue,
      totalProducts,
      totalReviews,
      avgRating: avgRatingAgg[0]?.avg ? Math.round(avgRatingAgg[0].avg * 10) / 10 : 0,
      customerGrowth: calcGrowth(thisMonthCustomers, lastMonthCustomers),
      orderGrowth: calcGrowth(thisMonthOrders, lastMonthOrders),
      revenueGrowth: calcGrowth(thisMonthRev, lastMonthRev),
      avgOrderGrowth: 0,
    };

    // ═══════ ORDER GROWTH (last 6 months) ═══════
    const orderTrendPipeline = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
          customers: { $addToSet: '$customer.email' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const orderTrend = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = orderTrendPipeline.find((p) => p._id.year === year && p._id.month === month);
      orderTrend.push({
        label: d.toLocaleString('default', { month: 'short' }),
        month,
        year,
        orders: found ? found.orders : 0,
        revenue: found ? Math.round(found.revenue) : 0,
        customers: found ? found.customers.length : 0,
      });
    }

    // ═══════ DAILY REVENUE (last 7 days) ═══════
    const dailyPipeline = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const dailyRevenue = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i);
      const found = dailyPipeline.find(
        (p) => p._id.year === d.getFullYear() && p._id.month === d.getMonth() + 1 && p._id.day === d.getDate()
      );
      dailyRevenue.push({
        label: d.toLocaleString('default', { weekday: 'short' }),
        date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        revenue: found ? Math.round(found.revenue) : 0,
        orders: found ? found.orders : 0,
      });
    }

    // ═══════ CATEGORY SALES (pie chart) ═══════
    const categorySales = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          count: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]);

    const categoryData = categorySales.map((c) => ({
      name: c._id || 'Other',
      value: Math.round(c.revenue),
      count: c.count,
    }));

    // ═══════ SALES FUNNEL ═══════
    const totalItemsSold = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.quantity' } } },
    ]);

    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    const funnel = {
      totalProducts,
      totalOrders,
      totalItemsSold: totalItemsSold[0]?.total || 0,
      deliveredOrders,
      totalRevenue,
    };

    // ═══════ PAYMENT METHOD DISTRIBUTION ═══════
    const paymentMethods = await Order.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
    ]);

    const paymentData = paymentMethods.map((p) => ({
      name: p._id === 'cod' ? 'Cash on Delivery' : 'Online Payment',
      value: p.count,
      revenue: Math.round(p.revenue),
    }));

    // ═══════ ORDER STATUS DISTRIBUTION ═══════
    const statusDist = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusData = statusDist.map((s) => ({
      name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
      value: s.count,
    }));

    // ═══════ TOP SELLING PRODUCTS ═══════
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          category: { $first: '$items.category' },
          image: { $first: '$items.image' },
          sold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 6 },
    ]);

    // ═══════ RECENT ORDERS (last 5) ═══════
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customer.name total status createdAt items');

    res.status(200).json({
      stats,
      orderTrend,
      dailyRevenue,
      categorySales: categoryData,
      funnel,
      paymentMethods: paymentData,
      statusDistribution: statusData,
      topProducts,
      recentOrders: recentOrders.map((o) => ({
        orderNumber: o.orderNumber,
        customer: o.customer.name,
        total: o.total,
        status: o.status,
        date: o.createdAt,
        itemCount: o.items.length,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
