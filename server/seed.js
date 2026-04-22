const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./Server/Model/product.jsx');

const products = [
  // ===== Original 8 products =====
  {
    name: 'Premium Cooking Oil',
    description: 'High-quality refined cooking oil for everyday use.',
    price: 199,
    oldPrice: 249,
    category: 'Oil',
    rating: 4.5,
    imageKey: 'product1',
    image: '/assets/images/images (5).jpg',
  },
  {
    name: 'Premium Maggi',
    description: 'Instant noodles with rich masala flavour.',
    price: 56,
    oldPrice: 70,
    category: 'Noodles',
    rating: 4.8,
    imageKey: 'product2',
    image: '/assets/images/images (9).jpg',
  },
  {
    name: 'Fresh Potatoes',
    description: 'Farm-fresh potatoes, perfect for curries and fries.',
    price: 40,
    oldPrice: 55,
    category: 'Vegetables',
    rating: 4.3,
    imageKey: 'product3',
    image: '/assets/images/images (7).jpg',
  },
  {
    name: 'Mast Makhana',
    description: 'Crunchy roasted makhana, a healthy snack option.',
    price: 120,
    oldPrice: 150,
    category: 'Snacks',
    rating: 4.6,
    imageKey: 'product4',
    image: '/assets/images/images (8).jpg',
  },
  {
    name: 'Sunflower Oil',
    description: 'Light and heart-healthy sunflower cooking oil.',
    price: 180,
    oldPrice: 220,
    category: 'Oil',
    rating: 4.4,
    imageKey: 'product5',
    image: '/assets/images/images (9).jpg',
  },
  {
    name: 'Classic Maggi',
    description: 'The classic 2-minute noodles loved by all.',
    price: 48,
    oldPrice: 60,
    category: 'Noodles',
    rating: 4.7,
    imageKey: 'product6',
    image: '/assets/images/images (13).jpg',
  },
  {
    name: 'Baby Potatoes',
    description: 'Small tender baby potatoes for roasting and curries.',
    price: 50,
    oldPrice: 65,
    category: 'Vegetables',
    rating: 4.2,
    imageKey: 'product7',
    image: '/assets/images/images (12).jpg',
  },
  {
    name: 'Roasted Makhana',
    description: 'Premium roasted makhana with mild seasoning.',
    price: 135,
    oldPrice: 170,
    category: 'Snacks',
    rating: 4.5,
    imageKey: 'product8',
    image: '/assets/images/images (14).jpg',
  },
  // ===== 8 Kirana products =====
  {
    name: 'Amul Pure Ghee',
    description: 'Pure cow ghee for authentic Indian cooking.',
    price: 560,
    oldPrice: 650,
    category: 'Dairy',
    rating: 4.9,
    imageKey: 'product9',
    image: '/assets/img/amul-pure-ghee.webp',
  },
  {
    name: 'Aashirvaad Atta',
    description: 'Shudh chakki atta for soft rotis, 5kg pack.',
    price: 280,
    oldPrice: 320,
    category: 'Flour',
    rating: 4.7,
    imageKey: 'product10',
    image: '/assets/img/aashirvaad-shudh-chakki-atta-5-kg.webp',
  },
  {
    name: 'Everest Chilli Powder',
    description: 'Tikhalal chilli powder for spicy dishes.',
    price: 95,
    oldPrice: 120,
    category: 'Spices',
    rating: 4.6,
    imageKey: 'product11',
    image: '/assets/img/everest-tikhalal-chilli-powder.webp',
  },
  {
    name: 'Fortune Mustard Oil',
    description: 'Premium kachi ghani pure mustard oil, 1L.',
    price: 190,
    oldPrice: 230,
    category: 'Oil',
    rating: 4.5,
    imageKey: 'product12',
    image: '/assets/img/fortune-premium-kachi-ghani-pure-mustard-oil-1-l-product-images-o490000525-p490000525-0-202303181434.webp',
  },
  {
    name: 'Fortune Soyabean Oil',
    description: 'Refined soyabean oil for healthy cooking.',
    price: 170,
    oldPrice: 210,
    category: 'Oil',
    rating: 4.4,
    imageKey: 'product13',
    image: '/assets/img/fortune-refined-soyabean.webp',
  },
  {
    name: 'Fortune Suji',
    description: 'Fine semolina for halwa, upma, and more.',
    price: 45,
    oldPrice: 55,
    category: 'Flour',
    rating: 4.3,
    imageKey: 'product14',
    image: '/assets/img/fortune-suji-semolina-500.webp',
  },
  {
    name: 'Good Life Sugar',
    description: 'Refined white sugar for everyday sweetening.',
    price: 48,
    oldPrice: 58,
    category: 'Essentials',
    rating: 4.5,
    imageKey: 'product15',
    image: '/assets/img/good-life-sugar.jpg',
  },
  {
    name: 'Tata Iodised Salt',
    description: 'Iodised salt for healthy, flavourful cooking.',
    price: 25,
    oldPrice: 30,
    category: 'Essentials',
    rating: 4.8,
    imageKey: 'product16',
    image: '/assets/img/tata-iodised-salt.webp',
  },
  // ===== 8 New products =====
  {
    name: 'Tata Tea Gold',
    description: 'Rich, aromatic blend of premium Assam tea leaves.',
    price: 320,
    oldPrice: 380,
    category: 'Beverages',
    rating: 4.7,
    imageKey: 'product17',
    image: '/assets/images/images (1).jpg',
  },
  {
    name: 'Nescafe Classic Coffee',
    description: 'Instant coffee with smooth, rich flavour.',
    price: 250,
    oldPrice: 310,
    category: 'Beverages',
    rating: 4.6,
    imageKey: 'product18',
    image: '/assets/images/images (2).jpg',
  },
  {
    name: 'Parle-G Biscuits',
    description: 'India\'s favourite glucose biscuits, family pack.',
    price: 35,
    oldPrice: 45,
    category: 'Snacks',
    rating: 4.8,
    imageKey: 'product19',
    image: '/assets/images/images (3).jpg',
  },
  {
    name: 'Basmati Rice Premium',
    description: 'Long grain aged basmati rice, 5kg pack.',
    price: 450,
    oldPrice: 520,
    category: 'Essentials',
    rating: 4.7,
    imageKey: 'product20',
    image: '/assets/images/images (4).jpg',
  },
  {
    name: 'Haldi Powder',
    description: 'Pure turmeric powder for curries and health drinks.',
    price: 75,
    oldPrice: 95,
    category: 'Spices',
    rating: 4.5,
    imageKey: 'product21',
    image: '/assets/images/images (6).jpg',
  },
  {
    name: 'Fresh Onions',
    description: 'Firm, fresh onions essential for every kitchen.',
    price: 35,
    oldPrice: 50,
    category: 'Vegetables',
    rating: 4.1,
    imageKey: 'product22',
    image: '/assets/images/images (10).jpg',
  },
  {
    name: 'Moong Dal',
    description: 'Premium split moong dal, easy to cook and nutritious.',
    price: 140,
    oldPrice: 175,
    category: 'Essentials',
    rating: 4.4,
    imageKey: 'product23',
    image: '/assets/images/images (11).jpg',
  },
  {
    name: 'Chana Dal',
    description: 'High-protein chana dal for dals and snacks.',
    price: 120,
    oldPrice: 155,
    category: 'Essentials',
    rating: 4.3,
    imageKey: 'product24',
    image: '/assets/images/images (15).jpg',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products`);

    await mongoose.disconnect();
    console.log('Done! Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
