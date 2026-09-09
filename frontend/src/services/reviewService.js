import api from './api';

/**
 * Fetch reviews for a product with optional sorting and star filtering
 */
export const fetchProductReviews = async (productId, params = {}) => {
  const response = await api.get(`/reviews/product/${productId}`, { params });
  return response.data;
};

/**
 * Submit a new customer review
 */
export const submitReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

/**
 * Vote helpful or unhelpful on a review
 */
export const voteReviewHelpful = async (reviewId, isHelpful = true) => {
  const response = await api.post(`/reviews/${reviewId}/vote`, { isHelpful });
  return response.data;
};

/**
 * Delete review (owner or admin)
 */
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};
