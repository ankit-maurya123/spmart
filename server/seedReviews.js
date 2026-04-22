const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./Server/Model/product.jsx');
const Review = require('./Server/Model/review.jsx');

const reviewerNames = [
  'Aarav Sharma', 'Priya Patel', 'Rahul Verma', 'Sneha Gupta',
  'Vikram Singh', 'Ananya Joshi', 'Rohan Kumar', 'Meera Nair',
  'Aditya Rao', 'Pooja Mishra', 'Karan Malhotra', 'Divya Iyer',
];

const comments = {
  5: [
    'Absolutely love this product! Best quality I have found.',
    'Excellent quality, will definitely buy again. Highly recommend!',
    'Perfect product, exactly what I was looking for. Amazing!',
    'Top notch quality and great value for money. Super happy!',
  ],
  4: [
    'Very good product. Satisfied with the quality and price.',
    'Good quality product, fast delivery. Would recommend to others.',
    'Nice product, good value for money. Happy with my purchase.',
    'Really liked it! Slightly better packaging would be perfect.',
  ],
  3: [
    'Decent product. Does the job but nothing extraordinary.',
    'Average quality, expected a bit better for this price.',
    'It is okay, not bad but not the best either.',
  ],
};

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate() {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  return new Date(thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo));
}

async function seedReviews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Review.deleteMany({});
    console.log('Cleared existing reviews');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    const allReviews = [];

    for (const product of products) {
      // 2-4 reviews per product
      const reviewCount = 2 + Math.floor(Math.random() * 3);
      const usedNames = new Set();

      for (let i = 0; i < reviewCount; i++) {
        // Pick a unique reviewer name for this product
        let name;
        do {
          name = randomFrom(reviewerNames);
        } while (usedNames.has(name));
        usedNames.add(name);

        // Weighted rating: mostly 4-5 stars
        const ratingRoll = Math.random();
        const rating = ratingRoll < 0.45 ? 5 : ratingRoll < 0.85 ? 4 : 3;
        const comment = randomFrom(comments[rating]);

        allReviews.push({
          productId: product._id,
          name,
          rating,
          comment,
          createdAt: randomDate(),
          updatedAt: randomDate(),
        });
      }
    }

    await Review.insertMany(allReviews);
    console.log(`Seeded ${allReviews.length} reviews across ${products.length} products`);

    // Recalculate aggregate rating for each product
    for (const product of products) {
      const result = await Review.aggregate([
        { $match: { productId: product._id } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } },
      ]);

      if (result.length > 0) {
        product.rating = Math.round(result[0].avgRating * 10) / 10;
        await product.save();
      }
    }
    console.log('Updated all product aggregate ratings');

    await mongoose.disconnect();
    console.log('Done! Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seedReviews();
