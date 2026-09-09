import api from './api';

export const fetchProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const fetchProductBySlug = async (slug) => {
  const response = await api.get(`/products/${slug}`);
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const fetchFilterOptions = async () => {
  const response = await api.get('/products/filter-options');
  return response.data;
};
