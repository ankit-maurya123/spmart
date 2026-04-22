const Review = require('../Model/review.jsx');
const Product = require('../Model/product.jsx');

// Get all reviews for a product (newest first)
exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new review and recalculate product aggregate rating
exports.addReview = async (req, res) => {
  try {
    const { productId, name, rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = new Review({ productId, name, rating, comment });
    await review.save();

    // Recalculate aggregate rating
    const result = await Review.aggregate([
      { $match: { productId: product._id } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } },
    ]);

    const avgRating = result.length > 0
      ? Math.round(result[0].avgRating * 10) / 10
      : 0;

    product.rating = avgRating;
    await product.save();

    res.status(201).json({ review, avgRating });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get 4 latest reviews with rating >= 4 (for Home page)
exports.getLatestReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ rating: { $gte: 4 } })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('productId', 'name image imageKey category');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
