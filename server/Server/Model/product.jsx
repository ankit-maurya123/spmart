const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    // Pricing
    price: { type: Number, required: true },
    oldPrice: { type: Number },

    // Images — primary + multi-image carousel
    image: { type: String, required: true },     // primary (legacy)
    imageKey: { type: String },                  // primary key (client maps to bundled asset)
    images: { type: [String], default: [] },     // multi-image carousel (URLs or imageKeys)

    // Catalog meta
    category: { type: String, required: true },
    brand: { type: String, default: '' },
    weight: { type: String, default: '' },       // e.g. "1 L", "5 kg", "200 g"

    // Quick-commerce signals
    deliveryTime: { type: String, default: '10 mins' }, // e.g. "8 mins", "12 mins"
    tags: { type: [String], default: [] },              // e.g. ["Bestseller", "Trending"]

    // Reviews
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
