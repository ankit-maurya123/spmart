const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verify,
  updateProfile,
  changePassword,
  // Addresses
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  // Wishlist
  getWishlist,
  toggleWishlist,
} = require('../Server/Controller/userAuthController.jsx');
const { getMyOrders } = require('../Server/Controller/orderController.jsx');
const { requireUser } = require('../Server/middleware/userAuth.jsx');

// ───── Auth ─────
router.post('/register', register);
router.post('/login', login);
router.get('/verify', verify);

// ───── Profile ─────
router.put('/profile', requireUser, updateProfile);
router.post('/change-password', requireUser, changePassword);

// ───── Orders (mine) ─────
router.get('/orders', requireUser, getMyOrders);

// ───── Addresses ─────
router.get('/addresses',                requireUser, listAddresses);
router.post('/addresses',               requireUser, addAddress);
router.put('/addresses/:addressId',     requireUser, updateAddress);
router.delete('/addresses/:addressId',  requireUser, deleteAddress);

// ───── Wishlist ─────
router.get('/wishlist',                 requireUser, getWishlist);
router.post('/wishlist/:productId',     requireUser, toggleWishlist);

module.exports = router;
