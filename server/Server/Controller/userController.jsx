const User = require('../Model/user.jsx');
const Order = require('../Model/order.jsx');

// GET /api/admin/users/stats
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    // New users last month (for growth %)
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    const lastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfMonth },
    });

    // Users who placed at least one order
    const usersWithOrders = await Order.distinct('customer.email');

    res.json({
      totalUsers,
      newThisMonth,
      lastMonth,
      activeUsers: usersWithOrders.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { search, sort = 'newest', page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'name') sortObj = { name: 1 };
    if (sort === 'email') sortObj = { email: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get order counts for each user by email
    const emails = users.map((u) => u.email);
    const orderCounts = await Order.aggregate([
      { $match: { 'customer.email': { $in: emails } } },
      { $group: { _id: '$customer.email', count: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
    ]);
    const orderMap = {};
    orderCounts.forEach((o) => {
      orderMap[o._id] = { orders: o.count, totalSpent: o.totalSpent };
    });

    const enriched = users.map((u) => ({
      ...u,
      orders: orderMap[u.email]?.orders || 0,
      totalSpent: orderMap[u.email]?.totalSpent || 0,
    }));

    res.json({
      users: enriched,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get user's orders
    const orders = await Order.find({ 'customer.email': user.email })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const orderStats = await Order.aggregate([
      { $match: { 'customer.email': user.email } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          avgOrder: { $avg: '$total' },
        },
      },
    ]);

    res.json({
      user,
      orders,
      stats: orderStats[0] || { totalOrders: 0, totalSpent: 0, avgOrder: 0 },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
