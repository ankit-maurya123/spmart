const express = require('express');
const router = express.Router();
const {
  getReviewsByProduct,
  addReview,
  getLatestReviews,
} = require('../Server/Controller/reviewController.jsx');

// GET /api/reviews/latest — must be before /:productId
router.get('/latest', getLatestReviews);

// GET /api/reviews/:productId
router.get('/:productId', getReviewsByProduct);

// POST /api/reviews
router.post('/', addReview);

module.exports = router;
