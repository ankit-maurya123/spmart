const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./Server/Model/product.jsx');

/**
 * Seed data — 24 products with full Zepto-style metadata:
 *   - images[] : 3 imageKeys per product so the client renders a multi-image slider
 *   - brand, weight, deliveryTime, tags
 *
 * The client maps each imageKey to a Vite-bundled asset via lib/imageMap.js
 * (so the slider works whether the file lives in /uploads/, /assets/, or is bundled).
 */
const products = [
  // ===== Original 8 products =====
  {
    name: 'Premium Cooking Oil',
    description: 'High-quality refined cooking oil for everyday use. Light, flavour-neutral and rich in vitamins.',
    price: 199, oldPrice: 249,
    category: 'Oil', brand: 'SP Mart',
    weight: '1 L', deliveryTime: '12 mins',
    tags: ['Bestseller'], rating: 4.5,
    imageKey: 'product1', image: '/assets/images/images (5).jpg',
    images: ['product1', 'product5', 'product13'],
  },
  {
    name: 'Premium Maggi',
    description: 'Instant noodles with rich masala flavour, ready in 2 minutes.',
    price: 56, oldPrice: 70,
    category: 'Noodles', brand: 'Maggi',
    weight: '280 g', deliveryTime: '8 mins',
    tags: ['Trending'], rating: 4.8,
    imageKey: 'product2', image: '/assets/images/images (9).jpg',
    images: ['product2', 'product6', 'product19'],
  },
  {
    name: 'Fresh Potatoes',
    description: 'Farm-fresh potatoes, perfect for curries, fries and roasts.',
    price: 40, oldPrice: 55,
    category: 'Vegetables', brand: 'Farm Fresh',
    weight: '1 kg', deliveryTime: '15 mins',
    tags: ['Fresh'], rating: 4.3,
    imageKey: 'product3', image: '/assets/images/images (7).jpg',
    images: ['product3', 'product7', 'product22'],
  },
  {
    name: 'Mast Makhana',
    description: 'Crunchy roasted makhana — a healthy protein-rich snack.',
    price: 120, oldPrice: 150,
    category: 'Snacks', brand: 'SP Mart',
    weight: '100 g', deliveryTime: '10 mins',
    tags: ['Healthy'], rating: 4.6,
    imageKey: 'product4', image: '/assets/images/images (8).jpg',
    images: ['product4', 'product8', 'product19'],
  },
  {
    name: 'Sunflower Oil',
    description: 'Light and heart-healthy sunflower cooking oil, low cholesterol.',
    price: 180, oldPrice: 220,
    category: 'Oil', brand: 'SP Mart',
    weight: '1 L', deliveryTime: '12 mins',
    tags: ['Heart Healthy'], rating: 4.4,
    imageKey: 'product5', image: '/assets/images/images (9).jpg',
    images: ['product5', 'product12', 'product13'],
  },
  {
    name: 'Classic Maggi',
    description: 'The classic 2-minute noodles — loved by every household.',
    price: 48, oldPrice: 60,
    category: 'Noodles', brand: 'Maggi',
    weight: '280 g', deliveryTime: '8 mins',
    tags: ['Bestseller'], rating: 4.7,
    imageKey: 'product6', image: '/assets/images/images (13).jpg',
    images: ['product6', 'product2', 'product19'],
  },
  {
    name: 'Baby Potatoes',
    description: 'Tender baby potatoes — ideal for roasting and gravies.',
    price: 50, oldPrice: 65,
    category: 'Vegetables', brand: 'Farm Fresh',
    weight: '500 g', deliveryTime: '15 mins',
    tags: ['Fresh'], rating: 4.2,
    imageKey: 'product7', image: '/assets/images/images (12).jpg',
    images: ['product7', 'product3', 'product22'],
  },
  {
    name: 'Roasted Makhana',
    description: 'Premium roasted makhana with mild seasoning.',
    price: 135, oldPrice: 170,
    category: 'Snacks', brand: 'SP Mart',
    weight: '100 g', deliveryTime: '10 mins',
    tags: ['Premium'], rating: 4.5,
    imageKey: 'product8', image: '/assets/images/images (14).jpg',
    images: ['product8', 'product4', 'product19'],
  },

  // ===== 8 Kirana products =====
  {
    name: 'Amul Pure Ghee',
    description: 'Pure cow ghee for authentic Indian cooking — rich aroma and taste.',
    price: 560, oldPrice: 650,
    category: 'Dairy', brand: 'Amul',
    weight: '1 L', deliveryTime: '12 mins',
    tags: ['Bestseller', 'Pure'], rating: 4.9,
    imageKey: 'product9', image: '/assets/img/amul-pure-ghee.webp',
    images: ['product9', 'product10', 'product15'],
  },
  {
    name: 'Aashirvaad Atta',
    description: 'Shudh chakki atta for soft, fluffy rotis — 5 kg pack.',
    price: 280, oldPrice: 320,
    category: 'Flour', brand: 'Aashirvaad',
    weight: '5 kg', deliveryTime: '12 mins',
    tags: ['Top Pick'], rating: 4.7,
    imageKey: 'product10', image: '/assets/img/aashirvaad-shudh-chakki-atta-5-kg.webp',
    images: ['product10', 'product14', 'product20'],
  },
  {
    name: 'Everest Chilli Powder',
    description: 'Tikhalal chilli powder — adds vibrant colour and heat to any dish.',
    price: 95, oldPrice: 120,
    category: 'Spices', brand: 'Everest',
    weight: '100 g', deliveryTime: '8 mins',
    tags: ['Spicy'], rating: 4.6,
    imageKey: 'product11', image: '/assets/img/everest-tikhalal-chilli-powder.webp',
    images: ['product11', 'product21', 'product16'],
  },
  {
    name: 'Fortune Mustard Oil',
    description: 'Premium kachi ghani pure mustard oil — 1 L bottle.',
    price: 190, oldPrice: 230,
    category: 'Oil', brand: 'Fortune',
    weight: '1 L', deliveryTime: '10 mins',
    tags: ['Premium'], rating: 4.5,
    imageKey: 'product12',
    image: '/assets/img/fortune-premium-kachi-ghani-pure-mustard-oil-1-l-product-images-o490000525-p490000525-0-202303181434.webp',
    images: ['product12', 'product13', 'product1'],
  },
  {
    name: 'Fortune Soyabean Oil',
    description: 'Refined soyabean oil — perfect for healthy daily cooking.',
    price: 170, oldPrice: 210,
    category: 'Oil', brand: 'Fortune',
    weight: '1 L', deliveryTime: '10 mins',
    tags: ['Heart Healthy'], rating: 4.4,
    imageKey: 'product13', image: '/assets/img/fortune-refined-soyabean.webp',
    images: ['product13', 'product12', 'product5'],
  },
  {
    name: 'Fortune Suji',
    description: 'Fine semolina for halwa, upma and other delicious recipes.',
    price: 45, oldPrice: 55,
    category: 'Flour', brand: 'Fortune',
    weight: '500 g', deliveryTime: '10 mins',
    tags: ['Trending'], rating: 4.3,
    imageKey: 'product14', image: '/assets/img/fortune-suji-semolina-500.webp',
    images: ['product14', 'product10', 'product20'],
  },
  {
    name: 'Good Life Sugar',
    description: 'Refined white sugar for everyday sweetening.',
    price: 48, oldPrice: 58,
    category: 'Essentials', brand: 'Good Life',
    weight: '1 kg', deliveryTime: '8 mins',
    tags: ['Daily Essential'], rating: 4.5,
    imageKey: 'product15', image: '/assets/img/good-life-sugar.jpg',
    images: ['product15', 'product16', 'product20'],
  },
  {
    name: 'Tata Iodised Salt',
    description: 'Iodised salt for healthy, well-seasoned cooking.',
    price: 25, oldPrice: 30,
    category: 'Essentials', brand: 'Tata',
    weight: '1 kg', deliveryTime: '8 mins',
    tags: ['Essential'], rating: 4.8,
    imageKey: 'product16', image: '/assets/img/tata-iodised-salt.webp',
    images: ['product16', 'product15', 'product23'],
  },

  // ===== 8 New products =====
  {
    name: 'Tata Tea Gold',
    description: 'Rich, aromatic blend of premium Assam tea leaves.',
    price: 320, oldPrice: 380,
    category: 'Beverages', brand: 'Tata',
    weight: '500 g', deliveryTime: '10 mins',
    tags: ['Premium'], rating: 4.7,
    imageKey: 'product17', image: '/assets/images/images (1).jpg',
    images: ['product17', 'product18', 'product19'],
  },
  {
    name: 'Nescafe Classic Coffee',
    description: 'Smooth, rich-flavoured instant coffee — pure intensity.',
    price: 250, oldPrice: 310,
    category: 'Beverages', brand: 'Nescafe',
    weight: '100 g', deliveryTime: '8 mins',
    tags: ['Trending'], rating: 4.6,
    imageKey: 'product18', image: '/assets/images/images (2).jpg',
    images: ['product18', 'product17', 'product19'],
  },
  {
    name: 'Parle-G Biscuits',
    description: "India's favourite glucose biscuits — family pack.",
    price: 35, oldPrice: 45,
    category: 'Snacks', brand: 'Parle',
    weight: '800 g', deliveryTime: '8 mins',
    tags: ['Bestseller'], rating: 4.8,
    imageKey: 'product19', image: '/assets/images/images (3).jpg',
    images: ['product19', 'product4', 'product8'],
  },
  {
    name: 'Basmati Rice Premium',
    description: 'Long-grain aged basmati rice — 5 kg pack.',
    price: 450, oldPrice: 520,
    category: 'Essentials', brand: 'Daawat',
    weight: '5 kg', deliveryTime: '12 mins',
    tags: ['Premium'], rating: 4.7,
    imageKey: 'product20', image: '/assets/images/images (4).jpg',
    images: ['product20', 'product10', 'product23'],
  },
  {
    name: 'Haldi Powder',
    description: 'Pure turmeric powder for curries, drinks and beauty rituals.',
    price: 75, oldPrice: 95,
    category: 'Spices', brand: 'SP Mart',
    weight: '100 g', deliveryTime: '8 mins',
    tags: ['Pure'], rating: 4.5,
    imageKey: 'product21', image: '/assets/images/images (6).jpg',
    images: ['product21', 'product11', 'product16'],
  },
  {
    name: 'Fresh Onions',
    description: 'Firm, fresh onions — essential for every Indian kitchen.',
    price: 35, oldPrice: 50,
    category: 'Vegetables', brand: 'Farm Fresh',
    weight: '1 kg', deliveryTime: '15 mins',
    tags: ['Fresh'], rating: 4.1,
    imageKey: 'product22', image: '/assets/images/images (10).jpg',
    images: ['product22', 'product3', 'product7'],
  },
  {
    name: 'Moong Dal',
    description: 'Premium split moong dal — easy to cook and packed with protein.',
    price: 140, oldPrice: 175,
    category: 'Essentials', brand: 'Tata',
    weight: '1 kg', deliveryTime: '10 mins',
    tags: ['Healthy'], rating: 4.4,
    imageKey: 'product23', image: '/assets/images/images (11).jpg',
    images: ['product23', 'product24', 'product20'],
  },
  {
    name: 'Chana Dal',
    description: 'High-protein chana dal for dals, snacks and traditional sweets.',
    price: 120, oldPrice: 155,
    category: 'Essentials', brand: 'Tata',
    weight: '1 kg', deliveryTime: '10 mins',
    tags: ['Protein'], rating: 4.3,
    imageKey: 'product24', image: '/assets/images/images (15).jpg',
    images: ['product24', 'product23', 'product20'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products with multi-image + Zepto-style metadata`);

    await mongoose.disconnect();
    console.log('Done! Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
