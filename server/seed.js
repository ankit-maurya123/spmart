const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Product = require('./Server/Model/product.jsx');
const Category = require('./Server/Model/category.jsx');

/**
 * Seed data — fresh start.
 *
 * Wipes:
 *   - All products
 *   - All categories
 *   - All non-avatar files in server/uploads/
 *
 * Inserts:
 *   - 20 curated categories (the SP Mart catalogue)
 *   - 10 Fruits products using /fruits/*.jpg images served from /public
 *
 * Remaining categories are added by the admin via the admin panel.
 */

const CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Milk',
  'Milk Products',
  'Breads & Bakery',
  'Chips & Namkeens',
  'Biscuits',
  'Cold Drinks',
  'Top Picks for Oral Care',
  'Chocolate & Candies',
  'Juices',
  'Energy Drinks',
  'Noodles Pasta Vermicelli',
  'Top Picks for Skin & Hair Care',
  'Tea & Coffee',
  'Ready To Cook & Eat',
  'Frozen',
  'Atta, Sooji & Flours',
  'Sugar & Spices',
  'Oil & Ghee',
];

const FRUITS = [
  {
    name: 'Fresh Bananas',
    description: 'Naturally ripened Robusta bananas — soft, sweet and packed with potassium.',
    price: 49, oldPrice: 65, weight: '1 kg (approx. 6-8 pcs)',
    brand: 'Farm Fresh', deliveryTime: '10 mins',
    tags: ['Bestseller', 'Fresh'], rating: 4.7,
    image: '/fruits/banana-1.jpg',
    images: ['/fruits/banana-1.jpg', '/fruits/banana-2.jpg'],
  },
  {
    name: 'Tender Coconut',
    description: 'Hand-picked tender coconuts full of refreshing water and soft malai.',
    price: 65, oldPrice: 80, weight: '1 pc',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Fresh', 'Hydrating'], rating: 4.5,
    image: '/fruits/coconut-1.jpg',
    images: ['/fruits/coconut-1.jpg', '/fruits/coconut-2.jpg'],
  },
  {
    name: 'Jumbo Guava',
    description: 'Premium jumbo-sized guavas — crunchy, juicy and packed with Vitamin C and fibre.',
    price: 89, oldPrice: 110, weight: '500 g (approx. 2-3 pcs)',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Premium', 'Healthy'], rating: 4.5,
    image: '/fruits/guava-1.jpg',
    images: ['/fruits/guava-1.jpg', '/fruits/guava-2.jpg'],
  },
  {
    name: 'Kiwi (Imported)',
    description: 'Premium imported kiwis loaded with antioxidants and Vitamin C.',
    price: 199, oldPrice: 240, weight: '3 pcs (approx. 250 g)',
    brand: 'Farm Fresh', deliveryTime: '15 mins',
    tags: ['Premium', 'Imported'], rating: 4.6,
    image: '/fruits/kiwi-1.jpg',
    images: ['/fruits/kiwi-1.jpg', '/fruits/kiwi-2.jpg'],
  },
  {
    name: 'Mandarin Oranges',
    description: 'Sweet, juicy mandarins — easy to peel and perfect for kids tiffins.',
    price: 129, oldPrice: 150, weight: '1 kg (approx. 7-9 pcs)',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Sweet', 'Trending'], rating: 4.5,
    image: '/fruits/mandarin-1.jpg',
    images: ['/fruits/mandarin-1.jpg', '/fruits/mandarin-2.jpg'],
  },
  {
    name: 'Mosambi (Sweet Lime)',
    description: 'Farm-fresh mosambi — best for refreshing juices and a daily dose of Vitamin C.',
    price: 89, oldPrice: 110, weight: '1 kg (approx. 5-7 pcs)',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Juicy', 'Fresh'], rating: 4.3,
    image: '/fruits/mosambi-1.jpg',
    images: ['/fruits/mosambi-1.jpg', '/fruits/mosambi-2.jpg'],
  },
  {
    name: 'Ripe Papaya',
    description: 'Naturally ripened papaya — buttery soft, sweet and full of fibre.',
    price: 69, oldPrice: 90, weight: '1 pc (approx. 1 kg)',
    brand: 'Farm Fresh', deliveryTime: '15 mins',
    tags: ['Healthy', 'Fresh'], rating: 4.4,
    image: '/fruits/papaya-1.jpg',
    images: ['/fruits/papaya-1.jpg', '/fruits/papaya-2.jpg'],
  },
  {
    name: 'Pineapple',
    description: 'Tangy, sweet and tropical — premium pineapples picked at peak ripeness.',
    price: 99, oldPrice: 130, weight: '1 pc (approx. 1.2 kg)',
    brand: 'Farm Fresh', deliveryTime: '15 mins',
    tags: ['Sweet', 'Tropical'], rating: 4.5,
    image: '/fruits/pineapple-1.jpg',
    images: ['/fruits/pineapple-1.jpg', '/fruits/pineapple-2.jpg'],
  },
  {
    name: 'Pomegranate Kesar',
    description: 'Premium Kesar pomegranates — plump, ruby-red arils that are sweet, antioxidant-rich and refreshing.',
    price: 169, oldPrice: 210, weight: '500 g (approx. 2 pcs)',
    brand: 'Farm Fresh', deliveryTime: '15 mins',
    tags: ['Premium', 'Antioxidants'], rating: 4.7,
    image: '/fruits/pomegranate-1.jpg',
    images: ['/fruits/pomegranate-1.jpg', '/fruits/pomegranate-2.jpg'],
  },
  {
    name: 'Watermelon',
    description: 'Juicy red watermelon — the perfect cooling summer fruit.',
    price: 79, oldPrice: 110, weight: '1 pc (approx. 2-3 kg)',
    brand: 'Farm Fresh', deliveryTime: '20 mins',
    tags: ['Summer', 'Hydrating'], rating: 4.4,
    image: '/fruits/watermelon-1.jpg',
    images: ['/fruits/watermelon-1.jpg', '/fruits/watermelon-2.jpg'],
  },
].map((p) => ({ ...p, category: 'Fruits' }));

const VEGETABLES = [
  {
    name: 'Big Coconut',
    description: 'Mature, full-sized brown coconuts — ideal for chutneys, curries and grating.',
    price: 59, oldPrice: 75, weight: '1 pc (approx. 500 g)',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Fresh'], rating: 4.4,
    image: '/vegetables/big-coconut-1.jpg',
    images: ['/vegetables/big-coconut-1.jpg', '/vegetables/big-coconut-2.jpg'],
  },
  {
    name: 'Button Mushroom',
    description: 'Fresh, firm button mushrooms — perfect for soups, sabzis and pasta.',
    price: 79, oldPrice: 99, weight: '200 g',
    brand: 'Farm Fresh', deliveryTime: '15 mins',
    tags: ['Premium', 'Fresh'], rating: 4.5,
    image: '/vegetables/button-mushroom-1.jpg',
    images: ['/vegetables/button-mushroom-1.jpg', '/vegetables/button-mushroom-2.jpg'],
  },
  {
    name: 'Cabbage',
    description: 'Crisp, tightly-packed green cabbage — great for sabzi, salads and rolls.',
    price: 35, oldPrice: 49, weight: '1 pc (approx. 700 g)',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Fresh'], rating: 4.2,
    image: '/vegetables/cabbage-1.jpg',
    images: ['/vegetables/cabbage-1.jpg', '/vegetables/cabbage-2.jpg'],
  },
  {
    name: 'Cauliflower',
    description: 'Snow-white, tight-curd cauliflower — ideal for gobi sabzis and pakoras.',
    price: 45, oldPrice: 60, weight: '1 pc (approx. 600 g)',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Fresh'], rating: 4.3,
    image: '/vegetables/cauliflower-1.jpg',
    images: ['/vegetables/cauliflower-1.jpg', '/vegetables/cauliflower-2.jpg'],
  },
  {
    name: 'Desi Tomato',
    description: 'Naturally ripened desi tomatoes — tangy, juicy and full of flavour.',
    price: 39, oldPrice: 55, weight: '500 g',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Bestseller', 'Fresh'], rating: 4.5,
    image: '/vegetables/desi-tomato-1.jpg',
    images: ['/vegetables/desi-tomato-1.jpg', '/vegetables/desi-tomato-2.jpg'],
  },
  {
    name: 'Green Chilli',
    description: 'Spicy, farm-fresh green chillies for tadkas, chutneys and pickles.',
    price: 19, oldPrice: 30, weight: '100 g',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Spicy', 'Fresh'], rating: 4.4,
    image: '/vegetables/green-chilli-1.jpg',
    images: ['/vegetables/green-chilli-1.jpg', '/vegetables/green-chilli-2.jpg'],
  },
  {
    name: 'Onion',
    description: 'Fresh, firm onions — the essential base for every Indian kitchen.',
    price: 35, oldPrice: 50, weight: '1 kg',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Daily Essential'], rating: 4.3,
    image: '/vegetables/onion-1.jpg',
    images: ['/vegetables/onion-1.jpg', '/vegetables/onion-2.jpg'],
  },
  {
    name: 'Potato',
    description: 'Farm-fresh potatoes — perfect for curries, fries and roasts.',
    price: 32, oldPrice: 45, weight: '1 kg',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Daily Essential'], rating: 4.4,
    image: '/vegetables/potato-1.jpg',
    images: ['/vegetables/potato-1.jpg'],
  },
  {
    name: 'Sweet Potato',
    description: 'Naturally sweet, fibre-rich sweet potatoes — great for chaat and roasting.',
    price: 49, oldPrice: 65, weight: '500 g',
    brand: 'Farm Fresh', deliveryTime: '12 mins',
    tags: ['Healthy'], rating: 4.3,
    image: '/vegetables/sweet-potato-1.jpg',
    images: ['/vegetables/sweet-potato-1.jpg', '/vegetables/sweet-potato-2.jpg'],
  },
  {
    name: 'Yam (Suran)',
    description: 'Fresh elephant-foot yam — perfect for traditional sabzis and curries.',
    price: 69, oldPrice: 90, weight: '500 g',
    brand: 'Farm Fresh', deliveryTime: '15 mins',
    tags: ['Traditional'], rating: 4.2,
    image: '/vegetables/yam-1.jpg',
    images: ['/vegetables/yam-1.jpg', '/vegetables/yam-2.jpg'],
  },
].map((p) => ({ ...p, category: 'Vegetables' }));

const MILK = [
  {
    name: 'Amul Taaza Homogenised Toned Milk',
    description: 'Amul Taaza homogenised toned milk in a convenient 200 ml tetra pack — long shelf life with no refrigeration needed.',
    price: 22, oldPrice: 25, weight: '200 ml (Tetra Pak)',
    brand: 'Amul', deliveryTime: '10 mins',
    tags: ['Bestseller', 'Daily Essential'], rating: 4.6,
    image: '/milk/amul-taaza-200ml-1.jpg',
    images: [
      '/milk/amul-taaza-200ml-1.jpg',
      '/milk/amul-taaza-200ml-2.jpg',
      '/milk/amul-taaza-200ml-3.jpg',
    ],
  },
  {
    name: 'Heritage Toned Milk',
    description: 'Heritage toned milk pouch — fresh, hygienically packed and rich in calcium and protein.',
    price: 27, oldPrice: 30, weight: '500 ml (Pouch)',
    brand: 'Heritage', deliveryTime: '10 mins',
    tags: ['Daily Essential', 'Fresh'], rating: 4.4,
    image: '/milk/heritage-toned-500ml-1.jpg',
    images: [
      '/milk/heritage-toned-500ml-1.jpg',
      '/milk/heritage-toned-500ml-2.jpg',
      '/milk/heritage-toned-500ml-3.jpg',
    ],
  },
  {
    name: 'Nandini GoodLife Toned Milk (Tetra Pak)',
    description: 'Nandini GoodLife UHT toned milk in a 1 L tetra pack — no need to boil, no refrigeration until opened.',
    price: 84, oldPrice: 95, weight: '1 L (Tetra Pak)',
    brand: 'Nandini', deliveryTime: '12 mins',
    tags: ['Premium', 'Long Life'], rating: 4.7,
    image: '/milk/nandini-goodlife-1l-1.jpg',
    images: [
      '/milk/nandini-goodlife-1l-1.jpg',
      '/milk/nandini-goodlife-1l-2.jpg',
      '/milk/nandini-goodlife-1l-3.jpg',
      '/milk/nandini-goodlife-1l-4.jpg',
      '/milk/nandini-goodlife-1l-5.jpg',
      '/milk/nandini-goodlife-1l-6.jpg',
    ],
  },
  {
    name: 'Nandini GoodLife Toned Milk (Fino Pouch)',
    description: 'Nandini GoodLife UHT toned milk in a 500 ml Fino pouch — long-life freshness in a convenient pack.',
    price: 44, oldPrice: 50, weight: '500 ml (Fino Pouch)',
    brand: 'Nandini', deliveryTime: '10 mins',
    tags: ['Long Life', 'Daily Essential'], rating: 4.5,
    image: '/milk/nandini-goodlife-500ml-1.jpg',
    images: [
      '/milk/nandini-goodlife-500ml-1.jpg',
      '/milk/nandini-goodlife-500ml-2.jpg',
      '/milk/nandini-goodlife-500ml-3.jpg',
    ],
  },
  {
    name: 'Nandini Homogenised Pasteurised Cow Milk',
    description: 'Pure, homogenised cow milk from Nandini — pasteurised for safety, perfect for daily consumption.',
    price: 30, oldPrice: 34, weight: '500 ml (Pouch)',
    brand: 'Nandini', deliveryTime: '10 mins',
    tags: ['Cow Milk', 'Fresh'], rating: 4.6,
    image: '/milk/nandini-cow-500ml-1.jpg',
    images: [
      '/milk/nandini-cow-500ml-1.jpg',
      '/milk/nandini-cow-500ml-2.jpg',
      '/milk/nandini-cow-500ml-3.avif',
    ],
  },
  {
    name: 'Nandini Pasteurised Toned Milk',
    description: 'Nandini pasteurised toned milk pouch — a staple for tea, coffee and everyday cooking.',
    price: 26, oldPrice: 30, weight: '500 ml (Pouch)',
    brand: 'Nandini', deliveryTime: '10 mins',
    tags: ['Bestseller', 'Daily Essential'], rating: 4.5,
    image: '/milk/nandini-toned-500ml-1.jpg',
    images: [
      '/milk/nandini-toned-500ml-1.jpg',
      '/milk/nandini-toned-500ml-2.jpg',
      '/milk/nandini-toned-500ml-3.jpg',
    ],
  },
  {
    name: 'Nandini Shubham Pasteurised Standardised Milk',
    description: 'Nandini Shubham standardised milk — thicker and creamier, ideal for sweets, curd and milkshakes.',
    price: 32, oldPrice: 36, weight: '500 ml (Pouch)',
    brand: 'Nandini', deliveryTime: '10 mins',
    tags: ['Premium', 'Creamy'], rating: 4.6,
    image: '/milk/nandini-shubham-500ml-1.jpg',
    images: [
      '/milk/nandini-shubham-500ml-1.jpg',
      '/milk/nandini-shubham-500ml-2.jpg',
      '/milk/nandini-shubham-500ml-3.jpg',
    ],
  },
].map((p) => ({ ...p, category: 'Milk' }));

function cleanUploads() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) return 0;

  let removed = 0;
  const files = fs.readdirSync(uploadsDir);
  for (const f of files) {
    // Preserve admin avatars; remove every other uploaded asset.
    if (f.startsWith('avatar-')) continue;
    try {
      fs.unlinkSync(path.join(uploadsDir, f));
      removed += 1;
    } catch (err) {
      console.warn(`  ! Could not delete ${f}: ${err.message}`);
    }
  }
  return removed;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const removedProducts = await Product.deleteMany({});
    console.log(`Cleared ${removedProducts.deletedCount} products`);

    const removedCategories = await Category.deleteMany({});
    console.log(`Cleared ${removedCategories.deletedCount} categories`);

    const removedFiles = cleanUploads();
    console.log(`Removed ${removedFiles} legacy upload(s) (avatars preserved)`);

    const categoryDocs = await Category.insertMany(
      CATEGORIES.map((name) => ({ name })),
      { ordered: false }
    );
    console.log(`Inserted ${categoryDocs.length} categories`);

    const fruitDocs = await Product.insertMany(FRUITS);
    console.log(`Inserted ${fruitDocs.length} Fruits products`);

    const vegDocs = await Product.insertMany(VEGETABLES);
    console.log(`Inserted ${vegDocs.length} Vegetables products`);

    const milkDocs = await Product.insertMany(MILK);
    console.log(`Inserted ${milkDocs.length} Milk products`);

    await mongoose.disconnect();
    console.log('Done! Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
