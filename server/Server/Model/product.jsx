const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
  },
  image: {
    type: String,
    required: true,
  },
  imageKey: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
