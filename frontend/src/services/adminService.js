import api from './api';

/**
 * Fetch executive dashboard KPIs, charts, orders, and stock alerts
 */
export const fetchAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

/**
 * Update order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
 */
export const updateAdminOrderStatus = async (orderNumber, status) => {
  const response = await api.patch(`/admin/orders/${orderNumber}/status`, { status });
  return response.data;
};

/**
 * Fetch registered customer roster
 */
export const fetchAdminCustomers = async () => {
  const response = await api.get('/admin/customers');
  return response.data;
};

/**
 * Fetch product catalog with admin filters, inventory, and status
 */
export const fetchAdminProducts = async (params = {}) => {
  const response = await api.get('/admin/products', { params });
  return response.data;
};

/**
 * Fetch single product by id for admin editing
 */
export const fetchAdminProductById = async (id) => {
  const response = await api.get(`/admin/products/${id}`);
  return response.data;
};

/**
 * Create a new product silhouette
 */
export const createAdminProduct = async (productData) => {
  const response = await api.post('/admin/products', productData);
  return response.data;
};

/**
 * Update an existing product silhouette
 */
export const updateAdminProduct = async (id, productData) => {
  const response = await api.put(`/admin/products/${id}`, productData);
  return response.data;
};

/**
 * Delete a product silhouette
 */
export const deleteAdminProduct = async (id) => {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
};

/**
 * Toggle active / draft status for product
 */
export const toggleAdminProductStatus = async (id) => {
  const response = await api.patch(`/admin/products/${id}/toggle-status`);
  return response.data;
};

/**
 * Quick inline update stock for size variant
 */
export const updateAdminProductStock = async (id, { size, stock, delta }) => {
  const response = await api.patch(`/admin/products/${id}/stock`, { size, stock, delta });
  return response.data;
};

/**
 * Bulk actions (DELETE, ACTIVATE, DRAFT)
 */
export const bulkAdminProducts = async (action, productIds) => {
  const response = await api.post('/admin/products/bulk', { action, productIds });
  return response.data;
};

