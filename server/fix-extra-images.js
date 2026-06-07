/**
 * Replace external image URLs on previously-seeded products with clean
 * labeled placeholder cards (placehold.co). The previous source
 * (loremflickr) returned unrelated photos.
 *
 * SAFE: only updates products in the 17 categories added by seed-extras.js.
 * Never touches Fruits / Vegetables / Milk.
 *
 * Run:   node fix-extra-images.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./Server/Model/product.jsx');

// Categories created by seed-extras.js
const SEEDED_CATEGORIES = [
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

// Brand-themed colors per category — bg, fg (hex without #)
const PALETTE = {
  'Milk Products':                 ['fff7ed', 'c2410c'],
  'Breads & Bakery':               ['fef3c7', '92400e'],
  'Chips & Namkeens':              ['fee2e2', 'b91c1c'],
  'Biscuits':                      ['fde68a', '78350f'],
  'Cold Drinks':                   ['dbeafe', '1e40af'],
  'Top Picks for Oral Care':       ['f0f9ff', '0c4a6e'],
  'Chocolate & Candies':           ['fde2c4', '78350f'],
  'Juices':                        ['ffedd5', 'c2410c'],
  'Energy Drinks':                 ['dcfce7', '166534'],
  'Noodles Pasta Vermicelli':      ['fef9c3', '854d0e'],
  'Top Picks for Skin & Hair Care':['fce7f3', 'be185d'],
  'Tea & Coffee':                  ['f5e6d3', '78350f'],
  'Ready To Cook & Eat':           ['ffe4d6', 'c2410c'],
  'Frozen':                        ['e0f2fe', '0369a1'],
  'Atta, Sooji & Flours':          ['fef3c7', '92400e'],
  'Sugar & Spices':                ['fde2c4', '9a3412'],
  'Oil & Ghee':                    ['fef9c3', '854d0e'],
};

// Short label per category to draw on the second/third gallery image.
const TAG = {
  'Milk Products':                  'DAIRY',
  'Breads & Bakery':                'BAKERY',
  'Chips & Namkeens':               'SNACKS',
  'Biscuits':                       'BISCUITS',
  'Cold Drinks':                    'COLD DRINK',
  'Top Picks for Oral Care':        'ORAL CARE',
  'Chocolate & Candies':            'CHOCOLATE',
  'Juices':                         'JUICE',
  'Energy Drinks':                  'ENERGY',
  'Noodles Pasta Vermicelli':       'NOODLES',
  'Top Picks for Skin & Hair Care': 'BEAUTY',
  'Tea & Coffee':                   'TEA / COFFEE',
  'Ready To Cook & Eat':            'READY MEAL',
  'Frozen':                         'FROZEN',
  'Atta, Sooji & Flours':           'ATTA',
  'Sugar & Spices':                 'SPICES',
  'Oil & Ghee':                     'OIL & GHEE',
};

const ph = (cat, text) => {
  const [bg, fg] = PALETTE[cat] || ['f1f5f9', '0f172a'];
  return `https://placehold.co/600x600/${bg}/${fg}?text=${encodeURIComponent(text)}&font=poppins`;
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  let totalUpdated = 0;

  for (const category of SEEDED_CATEGORIES) {
    const products = await Product.find({ category });
    if (products.length === 0) {
      console.log(`SKIP  ${category} — no products`);
      continue;
    }

    let updated = 0;
    for (const p of products) {
      const tag = TAG[category] || category;
      const brand = (p.brand || '').trim();
      const nameStripped = brand
        ? p.name.replace(new RegExp(`^${brand}\\s+`, 'i'), '').trim()
        : p.name;
      // Primary: brand on line 1, rest of product name on line 2
      const primaryText = brand && nameStripped
        ? `${brand}\n${nameStripped}`
        : (brand || p.name);
      // Secondary: name + weight
      const secondaryText = p.weight
        ? `${nameStripped || p.name}\n${p.weight}`
        : (nameStripped || p.name);
      // Tertiary: category label + brand
      const tertiaryText = brand ? `${tag}\n${brand}` : tag;

      const primary = ph(category, primaryText);
      const secondary = ph(category, secondaryText);
      const tertiary = ph(category, tertiaryText);

      p.image = primary;
      p.images = [primary, secondary, tertiary];
      await p.save();
      updated += 1;
    }
    console.log(`UPD   ${category} — ${updated} product(s)`);
    totalUpdated += updated;
  }

  console.log(`\nDone. Updated ${totalUpdated} product(s) across ${SEEDED_CATEGORIES.length} categories.`);
  console.log('Fruits / Vegetables / Milk were not touched.');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
