const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentReviews,
  getMonthlyReviews,
  getAllReviews,
  deleteReview,
  getCategoryStats,
  addCategory,
  deleteCategory,
  getTopProducts,
} = require('../Server/Controller/adminController.jsx');
const {
  getAllOrders,
  getOrderStats,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require('../Server/Controller/orderController.jsx');
const { getAnalytics } = require('../Server/Controller/analyticsController.jsx');
const {
  getAllUsers,
  getUserStats,
  getUserById,
  deleteUser,
} = require('../Server/Controller/userController.jsx');

// GET /api/admin/analytics
router.get('/analytics', getAnalytics);

// GET /api/admin/stats
router.get('/stats', getDashboardStats);

// GET /api/admin/reviews/monthly — must be before /reviews/:id
router.get('/reviews/monthly', getMonthlyReviews);

// GET /api/admin/reviews/recent — must be before /reviews/:id
router.get('/reviews/recent', getRecentReviews);

// GET /api/admin/reviews
router.get('/reviews', getAllReviews);

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', deleteReview);

// GET /api/admin/products/top
router.get('/products/top', getTopProducts);

// GET /api/admin/categories
router.get('/categories', getCategoryStats);

// POST /api/admin/categories
router.post('/categories', addCategory);

// DELETE /api/admin/categories/:name
router.delete('/categories/:name', deleteCategory);

// --- Orders ---
// GET /api/admin/orders/stats — must be before /orders/:id
router.get('/orders/stats', getOrderStats);

// GET /api/admin/orders
router.get('/orders', getAllOrders);

// GET /api/admin/orders/:id
router.get('/orders/:id', getOrderById);

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', updateOrderStatus);

// DELETE /api/admin/orders/:id
router.delete('/orders/:id', deleteOrder);

// --- Users ---
// GET /api/admin/users/stats — must be before /users/:id
router.get('/users/stats', getUserStats);

// GET /api/admin/users
router.get('/users', getAllUsers);

// GET /api/admin/users/:id
router.get('/users/:id', getUserById);

// DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

module.exports = router;
