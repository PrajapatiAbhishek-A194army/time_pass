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
