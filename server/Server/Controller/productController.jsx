const fs = require('fs');
const path = require('path');
const Product = require('../Model/product.jsx');
const Category = require('../Model/category.jsx');

// ─── Helpers ──────────────────────────────────────────────────────────

const fileToUrl = (file) => '/uploads/' + file.filename;

const cleanupAllUploads = (req) => {
  const all = [];
  if (req.files?.image) all.push(...req.files.image);
  if (req.files?.images) all.push(...req.files.images);
  for (const f of all) {
    fs.unlink(f.path, () => {});
  }
};

const removeUploadedFile = (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) return;
  const filePath = path.join(__dirname, '..', '..', url);
  fs.unlink(filePath, () => {});
};

// Parse `existingImages` from FormData (sent as JSON string) — used during edit
// to tell us which already-uploaded URLs to keep.
const parseExistingImages = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// Tags can arrive as:
//   - undefined (untouched on edit -> leave alone)
//   - a single string ("Fresh") OR a JSON-stringified array ('[]' / '["Fresh","New"]')
//   - an actual array (when multer collected multiple same-name fields)
// Returns: string[] when defined, undefined when caller should skip.
const normaliseTags = (raw) => {
  if (raw === undefined) return undefined;
  if (Array.isArray(raw)) {
    return raw
      .flatMap((v) => normaliseTags(v) ?? [])
      .map((t) => String(t).trim())
      .filter(Boolean);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((t) => String(t).trim()).filter(Boolean);
        }
      } catch {
        /* fall through */
      }
    }
    return [trimmed];
  }
  return [];
};

const coerceNumericFields = (data) => {
  if (data.price !== undefined && data.price !== '') data.price = Number(data.price);
  if (data.oldPrice !== undefined && data.oldPrice !== '') data.oldPrice = Number(data.oldPrice);
  if (data.rating !== undefined && data.rating !== '') data.rating = Number(data.rating);
  if (data.stock !== undefined && data.stock !== '') data.stock = Math.max(0, Math.floor(Number(data.stock)));

  // Discard empty-string scalars so they don't overwrite valid DB values with NaN/""
  if (data.oldPrice === '' || Number.isNaN(data.oldPrice)) delete data.oldPrice;
  if (data.rating === '' || Number.isNaN(data.rating)) delete data.rating;
  if (data.stock === '' || Number.isNaN(data.stock)) delete data.stock;
};

// ─── Add a new product ────────────────────────────────────────────────
exports.addProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    // Primary image — required for new products
    const primary = req.files?.image?.[0];
    if (primary) {
      data.image = fileToUrl(primary);
    }

    // Gallery images — optional
    const gallery = req.files?.images || [];
    if (gallery.length) {
      data.images = gallery.map(fileToUrl);
    } else {
      delete data.images;
    }

    // existingImages doesn't apply on add — strip it out so it isn't saved
    delete data.existingImages;

    const tags = normaliseTags(data.tags);
    if (tags !== undefined) data.tags = tags;

    coerceNumericFields(data);

    const newProduct = new Product(data);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    cleanupAllUploads(req);
    res.status(400).json({ error: error.message });
  }
};

// ─── Get all products ─────────────────────────────────────────────────
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

// ─── Categories ───────────────────────────────────────────────────────
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

// ─── Get one ──────────────────────────────────────────────────────────
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

// ─── Update ───────────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      cleanupAllUploads(req);
      return res.status(404).json({ error: 'Product not found' });
    }

    // Primary image — replace if a new file was uploaded
    const primary = req.files?.image?.[0];
    if (primary) {
      data.image = fileToUrl(primary);
    }

    // Gallery: keep the URLs the client says to keep + append any newly uploaded
    const newGallery = (req.files?.images || []).map(fileToUrl);
    const kept = parseExistingImages(req.body.existingImages);
    delete data.existingImages;

    if (kept !== null || newGallery.length) {
      const previous = Array.isArray(oldProduct.images) ? oldProduct.images : [];
      const keepList = kept !== null ? kept : previous;
      data.images = [...keepList, ...newGallery];

      // Delete files for any old gallery image that the client removed
      for (const url of previous) {
        if (!keepList.includes(url)) removeUploadedFile(url);
      }
    }

    const tags = normaliseTags(data.tags);
    if (tags !== undefined) data.tags = tags;

    coerceNumericFields(data);

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });

    // If primary was replaced, remove the old primary file
    if (primary && oldProduct.image && oldProduct.image.startsWith('/uploads/') && oldProduct.image !== data.image) {
      removeUploadedFile(oldProduct.image);
    }

    res.status(200).json(product);
  } catch (error) {
    cleanupAllUploads(req);
    res.status(400).json({ error: error.message });
  }
};

// ─── Delete ───────────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    removeUploadedFile(product.image);
    if (Array.isArray(product.images)) {
      for (const url of product.images) removeUploadedFile(url);
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
