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

module.exports = router;
