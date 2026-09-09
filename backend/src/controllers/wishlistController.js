const wishlistService = require('../services/wishlistService');

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.id);
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const result = await wishlistService.toggleWishlist(req.user.id, productId);
    res.status(200).json({
      success: true,
      message: result.inWishlist ? 'Added to wishlist' : 'Removed from wishlist',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const result = await wishlistService.removeFromWishlist(req.user.id, productId);
    res.status(200).json({ success: true, message: 'Removed from wishlist', data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
};
