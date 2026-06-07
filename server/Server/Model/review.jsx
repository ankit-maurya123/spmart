const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  // Submitting user — required for new reviews. (Legacy reviews seeded without
  // a user may have this null, which is why it's not strictly `required`.)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    default: '',
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  // Moderation state. Public endpoints only return 'approved'.
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
