const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Create order (authenticated user or guest)
router.post('/', optionalProtect, orderController.createOrder);

// Get current user's order history
router.get('/', protect, orderController.getUserOrders);

// Get single order details by orderNumber (public/accessible with order number)
router.get('/:orderNumber', optionalProtect, orderController.getOrderByNumber);

// Cancel order (requires auth or owner verification)
router.patch('/:orderNumber/cancel', optionalProtect, orderController.cancelOrder);

module.exports = router;
