import api from './api';

/**
 * Fetch all saved shipping addresses for authenticated user
 */
export const fetchAddresses = async () => {
  const response = await api.get('/addresses');
  return response.data;
};

/**
 * Add a new shipping address
 */
export const createAddress = async (addressData) => {
  const response = await api.post('/addresses', addressData);
  return response.data;
};

/**
 * Update an existing shipping address
 */
export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(`/addresses/${addressId}`, addressData);
  return response.data;
};

/**
 * Delete a shipping address
 */
export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/addresses/${addressId}`);
  return response.data;
};

/**
 * Set an address as default
 */
export const setDefaultAddress = async (addressId) => {
  const response = await api.patch(`/addresses/${addressId}/default`);
  return response.data;
};
