const reviewService = require('../services/reviewService');

/**
 * Get reviews for a product
 * GET /api/reviews/product/:productId
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { sort, starFilter } = req.query;

    const data = await reviewService.getProductReviews(productId, {
      sort,
      starFilter,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a review
 * POST /api/reviews
 */
const createReview = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const authorName = req.user?.name || req.body.author || 'Collector';

    const review = await reviewService.createReview(userId, {
      ...req.body,
      authorName,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vote helpful on a review
 * POST /api/reviews/:reviewId/vote
 */
const voteHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful = true } = req.body;

    const result = await reviewService.voteReviewHelpful(reviewId, isHelpful);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:reviewId
 */
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const result = await reviewService.deleteReview(reviewId, userId, isAdmin);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Moderate a review (admin)
 * PATCH /api/reviews/:reviewId/moderate
 */
const moderateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    const result = await reviewService.moderateReview(reviewId, isApproved);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  voteHelpful,
  deleteReview,
  moderateReview,
};
