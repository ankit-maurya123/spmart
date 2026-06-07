const express = require('express');
const router = express.Router();
const {
  getReviewsByProduct,
  addReview,
  getLatestReviews,
} = require('../Server/Controller/reviewController.jsx');
const { requireUser } = require('../Server/middleware/userAuth.jsx');

// GET /api/reviews/latest — must be before /:productId
router.get('/latest', getLatestReviews);

// GET /api/reviews/:productId
router.get('/:productId', getReviewsByProduct);

// POST /api/reviews — authenticated users only; queued for admin approval
router.post('/', requireUser, addReview);

module.exports = router;
