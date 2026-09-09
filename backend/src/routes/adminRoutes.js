const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes here require valid JWT and ADMIN role
router.use(protect);
router.use(admin);

// GET /api/admin/dashboard
router.get('/dashboard', adminController.getDashboard);

// PATCH /api/admin/orders/:orderNumber/status
router.patch('/orders/:orderNumber/status', adminController.updateOrderStatus);

// GET /api/admin/customers
router.get('/customers', adminController.getCustomers);

// Product & Inventory Management
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.post('/products/bulk', adminController.bulkActions);
router.get('/products/:id', adminController.getProductById);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.patch('/products/:id/toggle-status', adminController.toggleProductStatus);
router.patch('/products/:id/stock', adminController.updateProductStock);

module.exports = router;

