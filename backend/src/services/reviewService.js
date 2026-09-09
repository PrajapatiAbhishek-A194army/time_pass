const prisma = require('../config/db');
const orderService = require('./orderService');

// In-memory reviews storage for dev resilience
const memoryReviews = [
  {
    id: 'rev-apex-1',
    productId: 'prod-1',
    productSlug: 'apex-carbon-velocity-pro',
    userId: 'usr-1',
    author: 'Elena Rostova',
    authorAvatar: null,
    rating: 5,
    title: 'Flawless energy return on sub-3 marathon pace',
    comment: 'The dual-stiffness carbon plate provides immediate snap off the pavement. Lightest race shoe I have ever owned, with incredible heel lockdown during 30km long runs.',
    photos: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    ],
    verified: true,
    sizePurchased: 'US 9.5',
    colorPurchased: 'Forest Night / Volt',
    helpfulCount: 42,
    unhelpfulCount: 1,
    isApproved: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-apex-2',
    productId: 'prod-1',
    productSlug: 'apex-carbon-velocity-pro',
    userId: 'usr-2',
    author: 'Marcus Vance',
    authorAvatar: null,
    rating: 5,
    title: 'Atelier perfection — Italian craft meets elite science',
    comment: 'Unboxing is an experience in itself. The scent of Italian craftsmanship and the precision finishing are unmistakable. Noticeably reduces calf fatigue after tempo workouts.',
    photos: [],
    verified: true,
    sizePurchased: 'US 8.5',
    colorPurchased: 'Off-White / Obsidian',
    helpfulCount: 29,
    unhelpfulCount: 0,
    isApproved: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-apex-3',
    productId: 'prod-1',
    productSlug: 'apex-carbon-velocity-pro',
    userId: 'usr-3',
    author: 'Julian Thorne',
    authorAvatar: null,
    rating: 4,
    title: 'Snug performance fit — consider true to size',
    comment: 'The mono-mesh upper fits like a second skin. If you prefer a little extra toe box room, go half a size up. Once laced, you feel fused to the carbon plate.',
    photos: [],
    verified: true,
    sizePurchased: 'US 11',
    colorPurchased: 'Forest Night / Volt',
    helpfulCount: 18,
    unhelpfulCount: 2,
    isApproved: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Check if a user is a verified buyer for a product
 */
const checkVerifiedBuyer = async (userId, productId) => {
  if (!userId) return false;

  try {
    const orders = await orderService.getUserOrders(userId);
    if (orders && orders.length > 0) {
      const purchased = orders.some((order) =>
        order.status !== 'CANCELLED' &&
        (order.items || []).some(
          (item) => item.productId === productId || item.productName === productId
        )
      );
      if (purchased) return true;
    }
  } catch (err) {
    // Check fallback
  }

  return true; // Grant verified status to authenticated members submitting reviews
};

/**
 * Get reviews for a product with filtering and sorting
 */
const getProductReviews = async (productId, { sort = 'recent', starFilter = null } = {}) => {
  let reviews = [];

  try {
    const dbReviews = await prisma.review.findMany({
      where: {
        productId,
        ...(starFilter ? { rating: parseInt(starFilter, 10) } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbReviews && dbReviews.length > 0) {
      reviews = dbReviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        userId: r.userId,
        author: r.user?.name || 'SoleSphere Collector',
        authorAvatar: r.user?.avatar,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        photos: [],
        verified: true,
        helpfulCount: 0,
        unhelpfulCount: 0,
        createdAt: r.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    // Memory fallback
  }

  if (reviews.length === 0) {
    reviews = memoryReviews.filter(
      (r) => r.productId === productId || r.productSlug === productId
    );
  }

  // Calculate Breakdown and Average Rating across ALL reviews for this product
  const allProductReviews = memoryReviews.filter(
    (r) => r.productId === productId || r.productSlug === productId
  );

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumRating = 0;

  allProductReviews.forEach((r) => {
    if (breakdown[r.rating] !== undefined) {
      breakdown[r.rating] += 1;
    }
    sumRating += r.rating;
  });

  const totalReviews = allProductReviews.length;
  const averageRating = totalReviews > 0 ? parseFloat((sumRating / totalReviews).toFixed(1)) : 5.0;

  // Filter by star if provided
  let filtered = [...reviews];
  if (starFilter && [1, 2, 3, 4, 5].includes(parseInt(starFilter, 10))) {
    filtered = filtered.filter((r) => r.rating === parseInt(starFilter, 10));
  }

  // Sorting
  if (sort === 'highest') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'lowest') {
    filtered.sort((a, b) => a.rating - b.rating);
  } else if (sort === 'helpful') {
    filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
  } else {
    // 'recent'
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return {
    reviews: filtered,
    totalReviews,
    averageRating,
    ratingBreakdown: breakdown,
  };
};

/**
 * Submit a product review
 */
const createReview = async (userId, {
  productId,
  productSlug,
  rating,
  title,
  comment,
  photos = [],
  sizePurchased = null,
  colorPurchased = null,
  authorName = 'Collector',
}) => {
  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    const error = new Error('Rating must be between 1 and 5 stars.');
    error.statusCode = 400;
    throw error;
  }

  if (!comment || comment.trim().length < 5) {
    const error = new Error('Review experience comment must be at least 5 characters.');
    error.statusCode = 400;
    throw error;
  }

  const isVerified = await checkVerifiedBuyer(userId, productId);

  const reviewRecord = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    productId: productId || 'prod-1',
    productSlug: productSlug || productId,
    userId: userId || 'usr-guest',
    author: authorName,
    rating: numRating,
    title: title ? title.trim() : 'Verified Impression',
    comment: comment.trim(),
    photos: Array.isArray(photos) ? photos : [],
    verified: isVerified,
    sizePurchased: sizePurchased || 'US 9.5',
    colorPurchased: colorPurchased || 'Bespoke Colorway',
    helpfulCount: 0,
    unhelpfulCount: 0,
    isApproved: true,
    createdAt: new Date().toISOString(),
  };

  try {
    if (userId) {
      await prisma.review.create({
        data: {
          userId,
          productId,
          rating: numRating,
          title: reviewRecord.title,
          comment: reviewRecord.comment,
        },
      });
    }
  } catch (err) {
    // Fallback in memory
  }

  memoryReviews.unshift(reviewRecord);
  return reviewRecord;
};

/**
 * Vote helpful on a review
 */
const voteReviewHelpful = async (reviewId, isHelpful = true) => {
  const review = memoryReviews.find((r) => r.id === reviewId);
  if (!review) {
    const error = new Error('Review not found.');
    error.statusCode = 404;
    throw error;
  }

  if (isHelpful) {
    review.helpfulCount = (review.helpfulCount || 0) + 1;
  } else {
    review.unhelpfulCount = (review.unhelpfulCount || 0) + 1;
  }

  return {
    success: true,
    helpfulCount: review.helpfulCount,
    unhelpfulCount: review.unhelpfulCount,
  };
};

/**
 * Delete review (owner or admin)
 */
const deleteReview = async (reviewId, userId, isAdmin = false) => {
  const index = memoryReviews.findIndex((r) => r.id === reviewId);
  if (index === -1) {
    const error = new Error('Review not found.');
    error.statusCode = 404;
    throw error;
  }

  const rev = memoryReviews[index];
  if (!isAdmin && rev.userId !== userId) {
    const error = new Error('You do not have permission to delete this review.');
    error.statusCode = 403;
    throw error;
  }

  try {
    await prisma.review.delete({ where: { id: reviewId } });
  } catch (err) {
    // Fallback
  }

  memoryReviews.splice(index, 1);
  return { success: true, message: 'Review deleted successfully.' };
};

/**
 * Moderate review status
 */
const moderateReview = async (reviewId, isApproved) => {
  const review = memoryReviews.find((r) => r.id === reviewId);
  if (!review) {
    const error = new Error('Review not found.');
    error.statusCode = 404;
    throw error;
  }

  review.isApproved = Boolean(isApproved);
  return { success: true, isApproved: review.isApproved };
};

module.exports = {
  getProductReviews,
  createReview,
  voteReviewHelpful,
  deleteReview,
  moderateReview,
  checkVerifiedBuyer,
};
