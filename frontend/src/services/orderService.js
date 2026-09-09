import api from './api';

/**
 * Place a new order
 */
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

/**
 * Fetch a single order by order number or ID
 */
export const fetchOrderByNumber = async (orderNumber) => {
  const response = await api.get(`/orders/${orderNumber}`);
  return response.data;
};

/**
 * Fetch authenticated user's order history
 */
export const fetchUserOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};
