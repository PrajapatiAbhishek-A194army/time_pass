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

/**
 * @desc    Get all products with admin filters & inventory metrics
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
const getProducts = async (req, res, next) => {
  try {
    const result = await adminService.getAdminProducts(req.query);
    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by id for admin
 * @route   GET /api/admin/products/:id
 * @access  Private/Admin
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await adminService.getAdminProductById(req.params.id);
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product silhouette
 * @route   POST /api/admin/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const newProduct = await adminService.createAdminProduct(req.body);
    res.status(201).json({
      success: true,
      message: `Product ${newProduct.name} created successfully.`,
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing product silhouette
 * @route   PUT /api/admin/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await adminService.updateAdminProduct(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: `Product ${updatedProduct.name} updated successfully.`,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product silhouette
 * @route   DELETE /api/admin/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const result = await adminService.deleteAdminProduct(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle product live / draft visibility
 * @route   PATCH /api/admin/products/:id/toggle-status
 * @access  Private/Admin
 */
const toggleProductStatus = async (req, res, next) => {
  try {
    const result = await adminService.toggleProductStatus(req.params.id);
    res.status(200).json({
      success: true,
      message: `Product ${result.name} is now ${result.isActive ? 'Active (Live)' : 'Draft (Hidden)'}.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick adjust stock for product size variant
 * @route   PATCH /api/admin/products/:id/stock
 * @access  Private/Admin
 */
const updateProductStock = async (req, res, next) => {
  try {
    const result = await adminService.updateProductStock(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Stock updated successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk actions (DELETE, ACTIVATE, DRAFT)
 * @route   POST /api/admin/products/bulk
 * @access  Private/Admin
 */
const bulkActions = async (req, res, next) => {
  try {
    const { action, productIds } = req.body;
    const result = await adminService.bulkProductActions(action, productIds);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  updateOrderStatus,
  getCustomers,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  updateProductStock,
  bulkActions,
};
