const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, optionalProtect, admin } = require('../middleware/authMiddleware');

// Public route to fetch reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);

// Submit review (supports logged in user or guest with optionalProtect)
router.post('/', optionalProtect, reviewController.createReview);

// Vote helpful on a review
router.post('/:reviewId/vote', reviewController.voteHelpful);

// Delete review (owner or admin)
router.delete('/:reviewId', protect, reviewController.deleteReview);

// Moderate review (admin only)
router.patch('/:reviewId/moderate', protect, admin, reviewController.moderateReview);

module.exports = router;
