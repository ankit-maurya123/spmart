/**
 * One-time migration: grandfather all existing reviews into the new
 * moderation system by setting status='approved' on any review that doesn't
 * already have a status. Safe to re-run (idempotent).
 *
 * Run:  node migrate-review-status.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Review = require('./Server/Model/review.jsx');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await Review.updateMany(
    { status: { $in: [null, undefined, ''] } },
    { $set: { status: 'approved' } }
  );
  console.log(`Updated ${result.modifiedCount} legacy review(s) → status='approved'`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
