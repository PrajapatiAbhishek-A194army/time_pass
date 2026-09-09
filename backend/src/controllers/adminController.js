const adminService = require('../services/adminService');

/**
 * @desc    Get complete analytics dashboard data for Admin
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboard = async (req, res, next) => {
  try {
    const analytics = await adminService.getDashboardAnalytics();
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/admin/orders/:orderNumber/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status field is required.',
      });
    }

    const updatedOrder = await adminService.updateOrderStatus(orderNumber, status);
    res.status(200).json({
      success: true,
      message: `Order ${orderNumber} status updated to ${status}.`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer list for admin
 * @route   GET /api/admin/customers
 * @access  Private/Admin
 */
const getCustomers = async (req, res, next) => {
  try {
    const customers = await adminService.getAdminCustomers();
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  updateOrderStatus,
  getCustomers,
};
