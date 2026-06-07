const mongoose = require('mongoose');
const Review = require('../Model/review.jsx');
const Product = require('../Model/product.jsx');
const User = require('../Model/user.jsx');

// Recompute a product's aggregate rating from its approved reviews.
async function recalcProductRating(productId) {
  const result = await Review.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: 'approved',
      },
    },
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } },
  ]);
  const avgRating = result.length > 0
    ? Math.round(result[0].avgRating * 10) / 10
    : 0;
  await Product.findByIdAndUpdate(productId, { rating: avgRating });
  return avgRating;
}

// GET /api/reviews/:productId — only approved reviews
exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      status: 'approved',
    }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/reviews — authenticated users only; created as 'pending'
exports.addReview = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'You must be signed in to submit a review' });
    }

    const { productId, rating, comment, title } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'productId, rating and comment are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const user = await User.findById(req.userId).select('name');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const review = new Review({
      productId,
      userId: req.userId,
      name: user.name,
      rating,
      title: title || '',
      comment,
      status: 'pending', // requires admin approval
    });
    await review.save();

    res.status(201).json({
      review,
      message: 'Thanks! Your review has been submitted and is awaiting approval.',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET /api/reviews/latest — 4 latest approved reviews ≥ 4★ (home page)
exports.getLatestReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ rating: { $gte: 4 }, status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('productId', 'name image imageKey category');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Exported so admin controller can call after approve/reject/delete.
exports.recalcProductRating = recalcProductRating;
