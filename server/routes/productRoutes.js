const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../Server/Controller/productController.jsx');

// Multer config — save to server/uploads with unique names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype.split('/')[1]);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Accepts one primary `image` and up to 10 gallery `images`
const MAX_GALLERY_IMAGES = 10;
const fieldsHandler = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: MAX_GALLERY_IMAGES },
]);

// Wrapper to catch multer errors and return proper JSON response
const handleUpload = (req, res, next) => {
  fieldsHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: `Too many gallery images. Limit is ${MAX_GALLERY_IMAGES}.` });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// GET /api/products/categories — must be before /:id
router.get('/categories', getCategories);

// GET /api/products
router.get('/', getAllProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

// POST /api/products — with image upload
router.post('/', handleUpload, addProduct);

// PUT /api/products/:id — with optional image upload
router.put('/:id', handleUpload, updateProduct);

// DELETE /api/products/:id
router.delete('/:id', deleteProduct);

module.exports = router;
