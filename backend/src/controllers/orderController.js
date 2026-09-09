const orderService = require('../services/orderService');

/**
 * Place a new order
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const {
      shippingAddress,
      items,
      paymentMethod,
      paymentId,
      promoCode,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your shopping bag is empty. Please add items before checking out.',
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Full shipping address including name, street, and city is required.',
      });
    }

    const order = await orderService.createOrder({
      userId,
      shippingAddress,
      items,
      paymentMethod,
      paymentId,
      promoCode,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: order,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to place order.',
    });
  }
};

/**
 * Get user's order history
 * GET /api/orders
 */
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getUserOrders(userId);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order history.',
    });
  }
};

/**
 * Get single order details
 * GET /api/orders/:orderNumber
 */
const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await orderService.getOrderByNumber(orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderNumber} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Fetch order detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details.',
    });
  }
};

/**
 * Cancel order
 * PATCH /api/orders/:orderNumber/cancel
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user?.id || null;
    const order = await orderService.cancelOrder(userId, orderNumber);

    return res.status(200).json({
      success: true,
      message: `Order #${orderNumber} has been successfully cancelled.`,
      data: order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to cancel order.',
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderByNumber,
  cancelOrder,
};

