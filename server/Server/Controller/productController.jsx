const fs = require('fs');
const path = require('path');
const Product = require('../Model/product.jsx');
const Category = require('../Model/category.jsx');

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.image = '/uploads/' + req.file.filename;
    }

    if (data.price) data.price = Number(data.price);
    if (data.oldPrice) data.oldPrice = Number(data.oldPrice);

    const newProduct = new Product(data);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    // Clean up uploaded file on validation error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(400).json({ error: error.message });
  }
};

// Get all products with optional filtering and sorting
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    const filter = {};

    if (category) {
      const categories = category.split(',');
      filter.category = { $in: categories };
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'name') sortOption = { name: 1 };

    const products = await Product.find(filter).sort(sortOption);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get distinct categories (merged from products + Category model)
exports.getCategories = async (req, res) => {
  try {
    const [productCats, savedCats] = await Promise.all([
      Product.distinct('category'),
      Category.find().select('name'),
    ]);
    const set = new Set([...productCats, ...savedCats.map((c) => c.name)]);
    const categories = [...set].sort();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.image = '/uploads/' + req.file.filename;
    }

    if (data.price) data.price = Number(data.price);
    if (data.oldPrice) data.oldPrice = Number(data.oldPrice);

    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });

    // Delete old file if a new image was uploaded and old was a local upload
    if (req.file && oldProduct.image && oldProduct.image.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', '..', oldProduct.image);
      fs.unlink(oldPath, () => {});
    }

    res.status(200).json(product);
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(400).json({ error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete uploaded image file if it's a local upload
    if (product.image && product.image.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', '..', product.image);
      fs.unlink(filePath, () => {});
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
