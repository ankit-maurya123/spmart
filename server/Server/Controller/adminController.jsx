const Product = require('../Model/product.jsx');
const Review = require('../Model/review.jsx');
const Category = require('../Model/category.jsx');
const Order = require('../Model/order.jsx');
const mongoose = require('mongoose');

// GET /api/admin/stats — Dashboard totals + avg rating + order stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalReviews, categories, avgResult, totalOrders, revenueResult] = await Promise.all([
      Product.countDocuments(),
      Review.countDocuments(),
      Product.distinct('category'),
      Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
    ]);

    res.status(200).json({
      totalProducts,
      totalReviews,
      totalCategories: categories.length,
      avgRating: avgResult.length > 0
        ? Math.round(avgResult[0].avgRating * 10) / 10
        : 0,
      totalOrders,
      totalRevenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/reviews/recent — 5 latest reviews (dashboard widget)
exports.getRecentReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('productId', 'name image imageKey category');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/reviews — All reviews (admin table)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('productId', 'name image imageKey category');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/admin/reviews/:id — Delete review + recalc product rating
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate product aggregate rating
    const result = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } },
    ]);

    const product = await Product.findById(productId);
    if (product) {
      product.rating = result.length > 0
        ? Math.round(result[0].avgRating * 10) / 10
        : 0;
      await product.save();
    }

    res.status(200).json({ message: 'Review deleted', avgRating: product?.rating ?? 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/reviews/monthly — Reviews aggregated by month (last 12 months)
exports.getMonthlyReviews = async (req, res) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const pipeline = await Review.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          reviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build full 12-month array, filling gaps with zeros
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-indexed
      const found = pipeline.find((p) => p._id.year === year && p._id.month === month);
      months.push({
        month,
        year,
        label: d.toLocaleString('default', { month: 'short' }),
        reviews: found ? found.reviews : 0,
        avgRating: found ? Math.round(found.avgRating * 10) / 10 : 0,
      });
    }

    res.status(200).json(months);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/products/top — Top 5 products by rating
exports.getTopProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ rating: -1, createdAt: -1 })
      .limit(5)
      .select('name image imageKey category rating price');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/categories — Category stats (merged from products + Category model)
exports.getCategoryStats = async (req, res) => {
  try {
    const [stats, savedCategories] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Category.find().sort({ name: 1 }),
    ]);

    // Build map from product stats
    const map = {};
    stats.forEach((s) => {
      map[s._id] = {
        name: s._id,
        count: s.count,
        avgRating: Math.round(s.avgRating * 10) / 10,
      };
    });

    // Merge standalone categories (0 products)
    savedCategories.forEach((c) => {
      if (!map[c.name]) {
        map[c.name] = { name: c.name, count: 0, avgRating: 0 };
      }
    });

    // Sort: categories with products first (by count desc), then empty ones alphabetically
    const categories = Object.values(map).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/admin/categories — Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const trimmed = name.trim();

    // Check if it already exists in either Category model or as a product category
    const [existing, productCat] = await Promise.all([
      Category.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, 'i') } }),
      Product.findOne({ category: { $regex: new RegExp(`^${trimmed}$`, 'i') } }),
    ]);

    if (existing || productCat) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const category = new Category({ name: trimmed });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/admin/categories/:name — Remove a standalone category
exports.deleteCategory = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);

    // Check if products use this category
    const productCount = await Product.countDocuments({ category: name });
    if (productCount > 0) {
      return res.status(400).json({
        error: `Cannot delete: ${productCount} product(s) use this category. Remove or reassign them first.`,
      });
    }

    const result = await Category.findOneAndDelete({ name });
    if (!result) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
