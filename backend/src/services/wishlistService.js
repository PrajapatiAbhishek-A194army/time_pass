const prisma = require('../config/db');
const { initialCatalog } = require('./productService');

// In-memory fallback store for development sessions
const memoryWishlists = {};

/**
 * Get user wishlist
 */
const getWishlist = async (userId) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });

    if (wishlist) {
      const items = wishlist.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        brand: item.product.brand,
        image: item.product.images?.[0]?.url || item.product.image,
        price: Number(item.product.price),
        originalPrice: item.product.discountPrice ? Number(item.product.discountPrice) : null,
        category: item.product.category?.name || 'Footwear',
      }));

      return { items, count: items.length, itemCount: items.length };
    }
  } catch (err) {
    // Database offline, use memory fallback
  }

  if (!memoryWishlists[userId]) {
    memoryWishlists[userId] = [];
  }

  const items = memoryWishlists[userId];
  return { items, count: items.length, itemCount: items.length };
};

/**
 * Toggle product in wishlist
 */
const toggleWishlist = async (userId, productId) => {
  const pid = typeof productId === 'object' && productId !== null ? (productId.id || productId.productId) : productId;

  try {
    let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId } });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: pid,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { inWishlist: false, ...(await getWishlist(userId)) };
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId: pid,
        },
      });
      return { inWishlist: true, ...(await getWishlist(userId)) };
    }
  } catch (err) {
    // Fallback in-memory
  }

  if (!memoryWishlists[userId]) {
    memoryWishlists[userId] = [];
  }

  const prod = initialCatalog.find((p) => p.id === pid || p.slug === pid) || initialCatalog[0];
  const existingIdx = memoryWishlists[userId].findIndex((item) => item.productId === prod.id);

  if (existingIdx > -1) {
    memoryWishlists[userId].splice(existingIdx, 1);
    return { inWishlist: false, ...(await getWishlist(userId)) };
  } else {
    memoryWishlists[userId].push({
      id: `wish-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: prod.id,
      name: prod.name,
      slug: prod.slug,
      brand: prod.brand,
      image: prod.image,
      price: prod.price,
      originalPrice: prod.originalPrice,
      category: prod.category,
    });
    return { inWishlist: true, ...(await getWishlist(userId)) };
  }
};

/**
 * Remove product from wishlist
 */
const removeFromWishlist = async (userId, productId) => {
  if (memoryWishlists[userId]) {
    memoryWishlists[userId] = memoryWishlists[userId].filter((p) => p.productId !== productId);
  }
  return await getWishlist(userId);
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
};
