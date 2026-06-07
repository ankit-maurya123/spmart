/**
 * Additive seed — fills empty categories with 10 sample products each.
 *
 * SAFE: does NOT delete or modify any existing products. Skips any category
 * that already has products (so your Fruits / Vegetables / Milk data is
 * untouched).
 *
 * Images are external URLs (loremflickr.com with locked seeds → stable,
 * category-themed photos). Schema allows full URLs in `image` / `images`,
 * and the client's resolveProductImage() returns external URLs as-is.
 *
 * Run:   node seed-extras.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./Server/Model/product.jsx');

// Build a category-themed image URL with a stable lock seed.
const img = (keywords, lock) =>
  `https://loremflickr.com/600/600/${encodeURIComponent(keywords)}?lock=${lock}`;

// Build a product object from a row + a per-category image keyword pool.
let _lockCounter = 1000;
const make = (keywords, row) => {
  const lockA = ++_lockCounter;
  const lockB = ++_lockCounter;
  const lockC = ++_lockCounter;
  return {
    name: row.name,
    description: row.description,
    price: row.price,
    oldPrice: row.oldPrice,
    weight: row.weight,
    brand: row.brand,
    deliveryTime: row.deliveryTime || '10 mins',
    tags: row.tags || ['Daily Essential'],
    rating: row.rating ?? 4.4,
    category: row.category,
    image: img(keywords, lockA),
    images: [img(keywords, lockA), img(keywords, lockB), img(keywords, lockC)],
  };
};

// ─── Catalog ─────────────────────────────────────────────────────────────
// Each entry: { category, keywords (for image), products: [...] }
const CATALOG = [
  {
    category: 'Milk Products',
    keywords: 'paneer,curd,dairy',
    products: [
      { name: 'Amul Fresh Paneer',                 brand: 'Amul',       price: 92,  oldPrice: 105, weight: '200 g',   rating: 4.6, tags: ['Bestseller'] },
      { name: 'Mother Dairy Classic Curd',         brand: 'Mother Dairy', price: 45, oldPrice: 50,  weight: '400 g',   rating: 4.5, tags: ['Daily Essential'] },
      { name: 'Amul Salted Butter',                brand: 'Amul',       price: 60,  oldPrice: 65,  weight: '100 g',   rating: 4.7, tags: ['Bestseller'] },
      { name: 'Britannia Cheese Slices',           brand: 'Britannia',  price: 130, oldPrice: 150, weight: '200 g (10 slices)', rating: 4.4, tags: ['Trending'] },
      { name: 'Amul Masti Dahi',                   brand: 'Amul',       price: 35,  oldPrice: 40,  weight: '400 g',   rating: 4.5 },
      { name: 'Amul Pure Ghee Jar',                brand: 'Amul',       price: 320, oldPrice: 360, weight: '500 ml',  rating: 4.8, tags: ['Premium'] },
      { name: 'Mother Dairy Lassi',                brand: 'Mother Dairy', price: 25, oldPrice: 30,  weight: '200 ml',  rating: 4.3 },
      { name: 'Amul Mozzarella Cheese Block',      brand: 'Amul',       price: 195, oldPrice: 220, weight: '200 g',   rating: 4.5 },
      { name: 'Nestle a+ Greek Yogurt',            brand: 'Nestle',     price: 55,  oldPrice: 65,  weight: '100 g',   rating: 4.4 },
      { name: 'Amul Buttermilk Spiced',            brand: 'Amul',       price: 15,  oldPrice: 20,  weight: '200 ml',  rating: 4.3 },
    ],
  },
  {
    category: 'Breads & Bakery',
    keywords: 'bread,bakery',
    products: [
      { name: 'Britannia Brown Bread',             brand: 'Britannia',  price: 45,  oldPrice: 50,  weight: '400 g',  rating: 4.4 },
      { name: 'Modern Milk Bread Loaf',            brand: 'Modern',     price: 40,  oldPrice: 45,  weight: '350 g',  rating: 4.3 },
      { name: 'Harvest Gold Multigrain Bread',     brand: 'Harvest Gold', price: 60, oldPrice: 70, weight: '400 g',  rating: 4.5, tags: ['Healthy'] },
      { name: 'English Oven Whole Wheat Bread',    brand: 'English Oven', price: 55, oldPrice: 60, weight: '400 g',  rating: 4.5 },
      { name: 'Britannia Atta Pav (6 pcs)',        brand: 'Britannia',  price: 35,  oldPrice: 40,  weight: '300 g',  rating: 4.4 },
      { name: 'Modern Burger Buns (4 pcs)',        brand: 'Modern',     price: 40,  oldPrice: 45,  weight: '200 g',  rating: 4.3 },
      { name: 'English Oven Veg Sandwich Slice',   brand: 'English Oven', price: 50, oldPrice: 55, weight: '400 g',  rating: 4.4 },
      { name: 'Britannia Fruit Cake Slice',        brand: 'Britannia',  price: 30,  oldPrice: 35,  weight: '75 g',   rating: 4.4, tags: ['Snack'] },
      { name: 'Theobroma Brownie',                 brand: 'Theobroma',  price: 90,  oldPrice: 110, weight: '85 g',   rating: 4.7, tags: ['Premium'] },
      { name: 'Britannia Croissant Original',      brand: 'Britannia',  price: 35,  oldPrice: 40,  weight: '50 g',   rating: 4.3 },
    ],
  },
  {
    category: 'Chips & Namkeens',
    keywords: 'chips,snack',
    products: [
      { name: "Lay's Classic Salted Chips",        brand: "Lay's",      price: 20,  oldPrice: 25,  weight: '52 g',  rating: 4.5, tags: ['Bestseller'] },
      { name: "Lay's Magic Masala Chips",          brand: "Lay's",      price: 20,  oldPrice: 25,  weight: '52 g',  rating: 4.6, tags: ['Trending'] },
      { name: 'Kurkure Masala Munch',              brand: 'Kurkure',    price: 20,  oldPrice: 25,  weight: '85 g',  rating: 4.5 },
      { name: 'Haldiram Aloo Bhujia',              brand: 'Haldiram',   price: 50,  oldPrice: 60,  weight: '200 g', rating: 4.6, tags: ['Bestseller'] },
      { name: 'Bingo Mad Angles Tomato',           brand: 'Bingo',      price: 20,  oldPrice: 25,  weight: '70 g',  rating: 4.3 },
      { name: 'Balaji Wafers Simply Salted',       brand: 'Balaji',     price: 15,  oldPrice: 20,  weight: '65 g',  rating: 4.4 },
      { name: 'Too Yumm Multigrain Chips Veggie',  brand: 'Too Yumm',   price: 30,  oldPrice: 35,  weight: '54 g',  rating: 4.3, tags: ['Healthy'] },
      { name: 'Haldiram Moong Dal Namkeen',        brand: 'Haldiram',   price: 60,  oldPrice: 70,  weight: '200 g', rating: 4.5 },
      { name: 'Bikaji Bhujia Sev',                 brand: 'Bikaji',     price: 55,  oldPrice: 65,  weight: '200 g', rating: 4.5 },
      { name: 'Doritos Cheese Tortilla Chips',     brand: 'Doritos',    price: 30,  oldPrice: 35,  weight: '60 g',  rating: 4.4 },
    ],
  },
  {
    category: 'Biscuits',
    keywords: 'biscuit,cookie',
    products: [
      { name: 'Parle-G Original Biscuit',          brand: 'Parle',      price: 10,  oldPrice: 12,  weight: '100 g', rating: 4.7, tags: ['Bestseller'] },
      { name: 'Britannia Good Day Cashew',         brand: 'Britannia',  price: 30,  oldPrice: 35,  weight: '100 g', rating: 4.6 },
      { name: 'Britannia Bourbon Choco Cream',     brand: 'Britannia',  price: 35,  oldPrice: 40,  weight: '120 g', rating: 4.5, tags: ['Trending'] },
      { name: 'Sunfeast Dark Fantasy Choco Fills', brand: 'Sunfeast',   price: 35,  oldPrice: 40,  weight: '75 g',  rating: 4.7, tags: ['Bestseller'] },
      { name: 'Britannia Marie Gold',              brand: 'Britannia',  price: 20,  oldPrice: 25,  weight: '120 g', rating: 4.5 },
      { name: 'Parle Hide & Seek Choco Chip',      brand: 'Parle',      price: 30,  oldPrice: 35,  weight: '100 g', rating: 4.6 },
      { name: 'Britannia Treat Jim Jam Cream',     brand: 'Britannia',  price: 25,  oldPrice: 30,  weight: '100 g', rating: 4.4 },
      { name: 'Oreo Vanilla Cream Biscuit',        brand: 'Oreo',       price: 30,  oldPrice: 35,  weight: '120 g', rating: 4.6 },
      { name: 'Unibic Anzac Oatmeal Cookies',      brand: 'Unibic',     price: 60,  oldPrice: 70,  weight: '150 g', rating: 4.4, tags: ['Healthy'] },
      { name: 'Britannia Nutri Choice Digestive',  brand: 'Britannia',  price: 40,  oldPrice: 45,  weight: '150 g', rating: 4.5, tags: ['Healthy'] },
    ],
  },
  {
    category: 'Cold Drinks',
    keywords: 'soda,cola',
    products: [
      { name: 'Coca-Cola Original Bottle',         brand: 'Coca-Cola',  price: 40,  oldPrice: 45,  weight: '750 ml', rating: 4.7, tags: ['Bestseller'] },
      { name: 'Thums Up Bold Cola',                brand: 'Thums Up',   price: 40,  oldPrice: 45,  weight: '750 ml', rating: 4.6 },
      { name: 'Sprite Lime Refresher',             brand: 'Sprite',     price: 40,  oldPrice: 45,  weight: '750 ml', rating: 4.5 },
      { name: 'Pepsi Bottle',                      brand: 'Pepsi',      price: 40,  oldPrice: 45,  weight: '750 ml', rating: 4.5 },
      { name: 'Mountain Dew',                      brand: 'Mountain Dew', price: 40, oldPrice: 45, weight: '750 ml', rating: 4.4 },
      { name: 'Limca Lemon Drink',                 brand: 'Limca',      price: 40,  oldPrice: 45,  weight: '750 ml', rating: 4.4 },
      { name: 'Fanta Orange',                      brand: 'Fanta',      price: 40,  oldPrice: 45,  weight: '750 ml', rating: 4.4 },
      { name: 'Coca-Cola Diet Coke Can',           brand: 'Coca-Cola',  price: 40,  oldPrice: 45,  weight: '300 ml', rating: 4.3 },
      { name: '7Up Lemon Lime',                    brand: '7Up',        price: 40,  oldPrice: 45,  weight: '750 ml', rating: 4.3 },
      { name: 'Mirinda Orange',                    brand: 'Mirinda',    price: 40,  oldPrice: 45,  weight: '750 ml', rating: 4.3 },
    ],
  },
  {
    category: 'Top Picks for Oral Care',
    keywords: 'toothpaste,dental',
    products: [
      { name: 'Colgate MaxFresh Spicy Fresh',      brand: 'Colgate',    price: 95,  oldPrice: 110, weight: '150 g', rating: 4.5, tags: ['Bestseller'] },
      { name: 'Sensodyne Repair & Protect',        brand: 'Sensodyne',  price: 175, oldPrice: 200, weight: '70 g',  rating: 4.6, tags: ['Premium'] },
      { name: 'Pepsodent Germicheck Cavity Fighter', brand: 'Pepsodent', price: 85, oldPrice: 95, weight: '150 g',  rating: 4.4 },
      { name: 'Colgate Visible White Toothpaste',  brand: 'Colgate',    price: 130, oldPrice: 145, weight: '100 g', rating: 4.5 },
      { name: 'Dabur Red Toothpaste',              brand: 'Dabur',      price: 75,  oldPrice: 85,  weight: '150 g', rating: 4.5 },
      { name: 'Oral-B Pro Health Toothbrush',      brand: 'Oral-B',     price: 60,  oldPrice: 70,  weight: '1 pc',  rating: 4.5 },
      { name: 'Colgate Slim Soft Toothbrush',      brand: 'Colgate',    price: 65,  oldPrice: 75,  weight: '1 pc',  rating: 4.4 },
      { name: 'Listerine Cool Mint Mouthwash',     brand: 'Listerine',  price: 175, oldPrice: 195, weight: '250 ml', rating: 4.5 },
      { name: 'Closeup Red Hot Gel',               brand: 'Closeup',    price: 70,  oldPrice: 80,  weight: '150 g', rating: 4.3 },
      { name: 'Patanjali Dant Kanti Toothpaste',   brand: 'Patanjali',  price: 75,  oldPrice: 85,  weight: '200 g', rating: 4.4 },
    ],
  },
  {
    category: 'Chocolate & Candies',
    keywords: 'chocolate,candy',
    products: [
      { name: 'Cadbury Dairy Milk Silk',           brand: 'Cadbury',    price: 90,  oldPrice: 100, weight: '60 g',  rating: 4.8, tags: ['Bestseller'] },
      { name: 'KitKat 4 Finger',                   brand: 'KitKat',     price: 45,  oldPrice: 50,  weight: '37.3 g', rating: 4.7 },
      { name: 'Cadbury 5 Star',                    brand: 'Cadbury',    price: 20,  oldPrice: 25,  weight: '40 g',  rating: 4.5 },
      { name: "Ferrero Rocher T16 Box",            brand: 'Ferrero',    price: 525, oldPrice: 600, weight: '200 g', rating: 4.8, tags: ['Premium'] },
      { name: 'Cadbury Perk Wafer',                brand: 'Cadbury',    price: 10,  oldPrice: 12,  weight: '13 g',  rating: 4.4 },
      { name: "Hershey's Kisses Milk Chocolate",   brand: "Hershey's",  price: 350, oldPrice: 400, weight: '100 g', rating: 4.6 },
      { name: 'Snickers Peanut Bar',               brand: 'Snickers',   price: 50,  oldPrice: 60,  weight: '45 g',  rating: 4.6 },
      { name: 'Mentos Mint Roll Pack of 4',        brand: 'Mentos',     price: 40,  oldPrice: 45,  weight: '4 x 29 g', rating: 4.4 },
      { name: 'Alpenliebe Original Candy Jar',     brand: 'Alpenliebe', price: 100, oldPrice: 120, weight: '100 pcs', rating: 4.5 },
      { name: 'Cadbury Gems Surprise',             brand: 'Cadbury',    price: 30,  oldPrice: 35,  weight: '17 g',  rating: 4.4 },
    ],
  },
  {
    category: 'Juices',
    keywords: 'juice,fruit',
    products: [
      { name: 'Real Mixed Fruit Juice',            brand: 'Real',       price: 110, oldPrice: 130, weight: '1 L',   rating: 4.5, tags: ['Bestseller'] },
      { name: 'Tropicana 100% Orange',             brand: 'Tropicana',  price: 130, oldPrice: 150, weight: '1 L',   rating: 4.6, tags: ['Trending'] },
      { name: 'Real Activ Coconut Water',          brand: 'Real',       price: 99,  oldPrice: 110, weight: '500 ml', rating: 4.4, tags: ['Healthy'] },
      { name: 'Tropicana Apple Delight',           brand: 'Tropicana',  price: 130, oldPrice: 150, weight: '1 L',   rating: 4.5 },
      { name: 'Paper Boat Aamras Mango',           brand: 'Paper Boat', price: 30,  oldPrice: 35,  weight: '200 ml', rating: 4.6 },
      { name: 'B Natural Cranberry',               brand: 'B Natural',  price: 90,  oldPrice: 100, weight: '1 L',   rating: 4.3 },
      { name: 'Real Litchi Juice',                 brand: 'Real',       price: 110, oldPrice: 130, weight: '1 L',   rating: 4.4 },
      { name: 'Tropicana Guava Delight',           brand: 'Tropicana',  price: 130, oldPrice: 150, weight: '1 L',   rating: 4.4 },
      { name: 'Paper Boat Jaljeera',               brand: 'Paper Boat', price: 30,  oldPrice: 35,  weight: '250 ml', rating: 4.4 },
      { name: "Patanjali Amla Juice",              brand: 'Patanjali',  price: 110, oldPrice: 130, weight: '1 L',   rating: 4.3, tags: ['Healthy'] },
    ],
  },
  {
    category: 'Energy Drinks',
    keywords: 'energy,drink',
    products: [
      { name: 'Red Bull Energy Drink',             brand: 'Red Bull',   price: 125, oldPrice: 135, weight: '250 ml', rating: 4.6, tags: ['Bestseller'] },
      { name: 'Sting Energy Red',                  brand: 'Sting',      price: 20,  oldPrice: 25,  weight: '250 ml', rating: 4.4 },
      { name: 'Monster Energy Original',           brand: 'Monster',    price: 125, oldPrice: 140, weight: '350 ml', rating: 4.5 },
      { name: 'Red Bull Sugar Free',               brand: 'Red Bull',   price: 125, oldPrice: 135, weight: '250 ml', rating: 4.5 },
      { name: 'Cloud9 Charged Cola',               brand: 'Cloud9',     price: 95,  oldPrice: 110, weight: '250 ml', rating: 4.3 },
      { name: 'Hell Energy Strong',                brand: 'Hell',       price: 110, oldPrice: 120, weight: '250 ml', rating: 4.3 },
      { name: 'Mountain Dew Game Fuel',            brand: 'Mountain Dew', price: 40, oldPrice: 45, weight: '250 ml', rating: 4.2 },
      { name: 'Gatorade Lemon Ice',                brand: 'Gatorade',   price: 95,  oldPrice: 110, weight: '500 ml', rating: 4.4, tags: ['Sports'] },
      { name: 'Tzinga Tropical Trip',              brand: 'Tzinga',     price: 25,  oldPrice: 30,  weight: '250 ml', rating: 4.2 },
      { name: 'Sting Gold Pineapple',              brand: 'Sting',      price: 20,  oldPrice: 25,  weight: '250 ml', rating: 4.3 },
    ],
  },
  {
    category: 'Noodles Pasta Vermicelli',
    keywords: 'noodles,pasta',
    products: [
      { name: 'Maggi 2-Minute Masala Noodles',     brand: 'Maggi',      price: 14,  oldPrice: 16,  weight: '70 g',  rating: 4.7, tags: ['Bestseller'] },
      { name: 'Yippee Magic Masala Noodles',       brand: 'Yippee',     price: 14,  oldPrice: 16,  weight: '70 g',  rating: 4.5 },
      { name: 'Top Ramen Smoodles Curry',          brand: 'Top Ramen',  price: 14,  oldPrice: 16,  weight: '70 g',  rating: 4.4 },
      { name: 'Maggi Atta Noodles Masala',         brand: 'Maggi',      price: 17,  oldPrice: 20,  weight: '80 g',  rating: 4.6, tags: ['Healthy'] },
      { name: 'Bambino Roasted Vermicelli',        brand: 'Bambino',    price: 50,  oldPrice: 60,  weight: '400 g', rating: 4.4 },
      { name: 'Del Monte Penne Pasta',             brand: 'Del Monte',  price: 120, oldPrice: 140, weight: '500 g', rating: 4.5 },
      { name: 'Maggi Pazzta Cheese Macaroni',      brand: 'Maggi',      price: 50,  oldPrice: 60,  weight: '64 g',  rating: 4.4 },
      { name: 'Wai Wai Quick Chicken Noodles',     brand: 'Wai Wai',    price: 20,  oldPrice: 22,  weight: '75 g',  rating: 4.3 },
      { name: 'Knorr Soupy Noodles Tomato',        brand: 'Knorr',      price: 25,  oldPrice: 30,  weight: '70 g',  rating: 4.3 },
      { name: 'Borges Spaghetti Pasta',            brand: 'Borges',     price: 175, oldPrice: 200, weight: '500 g', rating: 4.5, tags: ['Premium'] },
    ],
  },
  {
    category: 'Top Picks for Skin & Hair Care',
    keywords: 'cosmetics,skincare',
    products: [
      { name: 'Dove Beauty Bathing Bar',           brand: 'Dove',       price: 75,  oldPrice: 85,  weight: '125 g', rating: 4.6, tags: ['Bestseller'] },
      { name: "Pond's White Beauty Face Wash",     brand: "Pond's",     price: 130, oldPrice: 145, weight: '100 g', rating: 4.5 },
      { name: 'Nivea Soft Light Moisturiser',      brand: 'Nivea',      price: 175, oldPrice: 195, weight: '100 ml', rating: 4.6 },
      { name: "Garnier Men Power White Face Wash", brand: 'Garnier',    price: 99,  oldPrice: 110, weight: '100 g', rating: 4.4 },
      { name: 'Head & Shoulders Anti-Dandruff',    brand: 'Head & Shoulders', price: 210, oldPrice: 240, weight: '340 ml', rating: 4.6 },
      { name: 'Pantene Hair Fall Control Shampoo', brand: 'Pantene',    price: 195, oldPrice: 220, weight: '340 ml', rating: 4.5 },
      { name: 'Parachute Coconut Hair Oil',        brand: 'Parachute',  price: 130, oldPrice: 150, weight: '300 ml', rating: 4.7, tags: ['Bestseller'] },
      { name: 'Bajaj Almond Drops Hair Oil',       brand: 'Bajaj',      price: 110, oldPrice: 130, weight: '300 ml', rating: 4.5 },
      { name: 'Himalaya Purifying Neem Face Wash', brand: 'Himalaya',   price: 110, oldPrice: 125, weight: '150 ml', rating: 4.6 },
      { name: 'Lakme Sun Expert Sunscreen SPF50',  brand: 'Lakme',      price: 225, oldPrice: 250, weight: '50 g',  rating: 4.5, tags: ['Premium'] },
    ],
  },
  {
    category: 'Tea & Coffee',
    keywords: 'tea,coffee',
    products: [
      { name: 'Tata Tea Premium',                  brand: 'Tata Tea',   price: 280, oldPrice: 320, weight: '500 g', rating: 4.7, tags: ['Bestseller'] },
      { name: 'Red Label Natural Care Tea',        brand: 'Red Label',  price: 270, oldPrice: 305, weight: '500 g', rating: 4.6 },
      { name: 'Taj Mahal Tea Bags',                brand: 'Taj Mahal',  price: 175, oldPrice: 200, weight: '100 bags', rating: 4.5 },
      { name: 'Nescafe Classic Coffee',            brand: 'Nescafe',    price: 320, oldPrice: 360, weight: '100 g', rating: 4.7, tags: ['Bestseller'] },
      { name: 'Bru Instant Coffee',                brand: 'Bru',        price: 280, oldPrice: 320, weight: '100 g', rating: 4.5 },
      { name: 'Tata Tea Gold',                     brand: 'Tata Tea',   price: 320, oldPrice: 360, weight: '500 g', rating: 4.7 },
      { name: 'Davidoff Rich Aroma Coffee',        brand: 'Davidoff',   price: 700, oldPrice: 800, weight: '100 g', rating: 4.7, tags: ['Premium'] },
      { name: 'Wagh Bakri Premium Leaf Tea',       brand: 'Wagh Bakri', price: 290, oldPrice: 320, weight: '500 g', rating: 4.6 },
      { name: 'Lipton Green Tea Bags',             brand: 'Lipton',     price: 175, oldPrice: 200, weight: '25 bags', rating: 4.5, tags: ['Healthy'] },
      { name: 'Continental Premium Instant Coffee', brand: 'Continental', price: 260, oldPrice: 290, weight: '100 g', rating: 4.4 },
    ],
  },
  {
    category: 'Ready To Cook & Eat',
    keywords: 'ready,meal,food',
    products: [
      { name: 'MTR Ready-to-Eat Palak Paneer',     brand: 'MTR',        price: 110, oldPrice: 125, weight: '300 g', rating: 4.5, tags: ['Bestseller'] },
      { name: 'Haldiram Dal Makhani',              brand: 'Haldiram',   price: 95,  oldPrice: 110, weight: '300 g', rating: 4.6 },
      { name: "Gits Gulab Jamun Mix",              brand: 'Gits',       price: 110, oldPrice: 125, weight: '200 g', rating: 4.6 },
      { name: 'MTR Rava Idli Mix',                 brand: 'MTR',        price: 95,  oldPrice: 110, weight: '500 g', rating: 4.5 },
      { name: 'Knorr Classic Tomato Soup',         brand: 'Knorr',      price: 55,  oldPrice: 65,  weight: '53 g',  rating: 4.4 },
      { name: 'Haldiram Chole Masala',             brand: 'Haldiram',   price: 95,  oldPrice: 110, weight: '300 g', rating: 4.5 },
      { name: 'MTR 3-Minute Khichdi',              brand: 'MTR',        price: 85,  oldPrice: 95,  weight: '70 g',  rating: 4.3 },
      { name: 'Tasty Bite Madras Lentils',         brand: 'Tasty Bite', price: 130, oldPrice: 150, weight: '285 g', rating: 4.5, tags: ['Premium'] },
      { name: 'Gits Dosai Mix',                    brand: 'Gits',       price: 95,  oldPrice: 110, weight: '500 g', rating: 4.4 },
      { name: 'Maggi Hot & Sweet Tomato Ketchup',  brand: 'Maggi',      price: 110, oldPrice: 125, weight: '500 g', rating: 4.6 },
    ],
  },
  {
    category: 'Frozen',
    keywords: 'frozen,ice',
    products: [
      { name: 'Amul Vanilla Ice Cream Tub',        brand: 'Amul',       price: 175, oldPrice: 200, weight: '1 L',   rating: 4.6, tags: ['Bestseller'] },
      { name: 'Kwality Walls Cornetto Choco',      brand: 'Kwality Walls', price: 45, oldPrice: 50, weight: '110 ml', rating: 4.5 },
      { name: 'Magnum Almond Stick',               brand: 'Magnum',     price: 110, oldPrice: 125, weight: '74 ml', rating: 4.7, tags: ['Premium'] },
      { name: 'McCain French Fries',               brand: 'McCain',     price: 130, oldPrice: 150, weight: '420 g', rating: 4.5, tags: ['Trending'] },
      { name: 'McCain Smiles Potato',              brand: 'McCain',     price: 110, oldPrice: 125, weight: '415 g', rating: 4.5 },
      { name: 'ITC Master Chef Veg Spring Roll',   brand: 'ITC',        price: 175, oldPrice: 200, weight: '300 g', rating: 4.4 },
      { name: 'Sumeru Frozen Green Peas',          brand: 'Sumeru',     price: 65,  oldPrice: 75,  weight: '500 g', rating: 4.5 },
      { name: 'Mother Dairy Kulfi Pista',          brand: 'Mother Dairy', price: 30, oldPrice: 35, weight: '60 ml', rating: 4.5 },
      { name: 'Baskin Robbins Family Pack Strawberry', brand: 'Baskin Robbins', price: 320, oldPrice: 360, weight: '500 ml', rating: 4.6 },
      { name: 'Vadilal Quick Treat Cheese Pizza',  brand: 'Vadilal',    price: 195, oldPrice: 220, weight: '300 g', rating: 4.3 },
    ],
  },
  {
    category: 'Atta, Sooji & Flours',
    keywords: 'flour,atta,wheat',
    products: [
      { name: 'Aashirvaad Shudh Chakki Atta',      brand: 'Aashirvaad', price: 280, oldPrice: 320, weight: '5 kg',  rating: 4.7, tags: ['Bestseller'] },
      { name: 'Pillsbury Chakki Fresh Atta',       brand: 'Pillsbury',  price: 265, oldPrice: 300, weight: '5 kg',  rating: 4.5 },
      { name: 'Fortune Chakki Fresh Atta',         brand: 'Fortune',    price: 270, oldPrice: 310, weight: '5 kg',  rating: 4.6 },
      { name: 'Aashirvaad Multigrains Atta',       brand: 'Aashirvaad', price: 350, oldPrice: 395, weight: '5 kg',  rating: 4.6, tags: ['Healthy'] },
      { name: 'Fortune Sooji Premium',             brand: 'Fortune',    price: 50,  oldPrice: 60,  weight: '500 g', rating: 4.5 },
      { name: 'Bansi Maida All-Purpose Flour',     brand: 'Bansi',      price: 45,  oldPrice: 50,  weight: '500 g', rating: 4.4 },
      { name: 'Aashirvaad Besan',                  brand: 'Aashirvaad', price: 110, oldPrice: 125, weight: '1 kg',  rating: 4.5 },
      { name: '24 Mantra Organic Ragi Flour',      brand: '24 Mantra',  price: 95,  oldPrice: 110, weight: '500 g', rating: 4.4, tags: ['Healthy'] },
      { name: "Tata Sampann Bajra Flour",          brand: 'Tata Sampann', price: 75, oldPrice: 85, weight: '500 g', rating: 4.4 },
      { name: 'Annapurna Atta',                    brand: 'Annapurna',  price: 260, oldPrice: 295, weight: '5 kg',  rating: 4.5 },
    ],
  },
  {
    category: 'Sugar & Spices',
    keywords: 'spices,sugar,salt',
    products: [
      { name: 'Tata Salt Iodised',                 brand: 'Tata',       price: 28,  oldPrice: 30,  weight: '1 kg',  rating: 4.8, tags: ['Bestseller'] },
      { name: 'Madhur Pure Sugar',                 brand: 'Madhur',     price: 50,  oldPrice: 55,  weight: '1 kg',  rating: 4.6 },
      { name: 'Everest Tikhalal Red Chilli Powder', brand: 'Everest',   price: 110, oldPrice: 125, weight: '200 g', rating: 4.6, tags: ['Bestseller'] },
      { name: 'MDH Garam Masala',                  brand: 'MDH',        price: 95,  oldPrice: 110, weight: '100 g', rating: 4.7 },
      { name: 'Catch Hing Powder',                 brand: 'Catch',      price: 65,  oldPrice: 75,  weight: '50 g',  rating: 4.4 },
      { name: 'Tata Sampann Turmeric Powder',      brand: 'Tata Sampann', price: 95, oldPrice: 110, weight: '200 g', rating: 4.6 },
      { name: 'Everest Cumin Seeds Whole',         brand: 'Everest',    price: 65,  oldPrice: 75,  weight: '100 g', rating: 4.5 },
      { name: 'MDH Chana Masala',                  brand: 'MDH',        price: 65,  oldPrice: 75,  weight: '100 g', rating: 4.6 },
      { name: 'Catch Black Pepper Powder',         brand: 'Catch',      price: 130, oldPrice: 145, weight: '100 g', rating: 4.5 },
      { name: 'Daawat Basmati Sugar (Sulphurless)', brand: 'Daawat',    price: 55,  oldPrice: 65,  weight: '1 kg',  rating: 4.4 },
    ],
  },
  {
    category: 'Oil & Ghee',
    keywords: 'oil,cooking',
    products: [
      { name: 'Fortune Sunlite Refined Sunflower Oil', brand: 'Fortune', price: 175, oldPrice: 195, weight: '1 L (Pouch)', rating: 4.6, tags: ['Bestseller'] },
      { name: 'Saffola Gold Edible Oil',           brand: 'Saffola',    price: 220, oldPrice: 250, weight: '1 L',   rating: 4.6, tags: ['Healthy'] },
      { name: 'Fortune Premium Kachi Ghani Mustard Oil', brand: 'Fortune', price: 165, oldPrice: 185, weight: '1 L', rating: 4.5 },
      { name: 'Amul Pure Cow Ghee',                brand: 'Amul',       price: 620, oldPrice: 700, weight: '1 L',   rating: 4.8, tags: ['Premium'] },
      { name: 'Patanjali Cow Desi Ghee',           brand: 'Patanjali',  price: 575, oldPrice: 650, weight: '1 L',   rating: 4.6 },
      { name: 'Fortune Soyabean Refined Oil',      brand: 'Fortune',    price: 160, oldPrice: 180, weight: '1 L',   rating: 4.5 },
      { name: 'Figaro Olive Oil',                  brand: 'Figaro',     price: 525, oldPrice: 600, weight: '500 ml', rating: 4.6, tags: ['Premium'] },
      { name: 'Dabur Cold Pressed Mustard Oil',    brand: 'Dabur',      price: 175, oldPrice: 200, weight: '1 L',   rating: 4.5 },
      { name: 'Sundrop Heart Refined Oil',         brand: 'Sundrop',    price: 195, oldPrice: 220, weight: '1 L',   rating: 4.5 },
      { name: 'Aashirvaad Svasti Ghee',            brand: 'Aashirvaad', price: 595, oldPrice: 670, weight: '1 L',   rating: 4.7 },
    ],
  },
];

async function seedExtras() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  let totalAdded = 0;
  let totalSkipped = 0;

  for (const block of CATALOG) {
    const existing = await Product.countDocuments({ category: block.category });
    if (existing > 0) {
      console.log(`SKIP  ${block.category} — already has ${existing} product(s)`);
      totalSkipped++;
      continue;
    }

    const docs = block.products.map((row) => {
      const description =
        row.description ||
        `${row.brand} ${row.name.replace(new RegExp(`^${row.brand}\\s*`, 'i'), '')} — premium ${block.category.toLowerCase()} delivered fresh to your door.`;
      return make(block.keywords, {
        ...row,
        description,
        category: block.category,
      });
    });

    await Product.insertMany(docs);
    console.log(`ADD   ${block.category} — inserted ${docs.length} product(s)`);
    totalAdded += docs.length;
  }

  console.log(`\nDone. Added ${totalAdded} product(s) across ${CATALOG.length - totalSkipped} categories. Skipped ${totalSkipped} categories.`);

  await mongoose.disconnect();
  process.exit(0);
}

seedExtras().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
