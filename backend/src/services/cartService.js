const prisma = require('../config/db');
const { initialCatalog } = require('./productService');

// In-memory fallback store for development sessions
const memoryCarts = {};

/**
 * Get user cart
 */
const getCart = async (userId) => {
  try {
    const cart = await prisma.cart.findUnique({
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

    if (cart) {
      const items = cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        brand: item.product.brand,
        image: item.product.images?.[0]?.url || item.product.image,
        price: Number(item.product.price),
        originalPrice: item.product.discountPrice ? Number(item.product.discountPrice) : null,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }));

      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

      return {
        items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        total: parseFloat(subtotal.toFixed(2)),
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      };
    }
  } catch (err) {
    // Database offline or unmigrated, use memory fallback
  }

  if (!memoryCarts[userId]) {
    memoryCarts[userId] = [];
  }

  const items = memoryCarts[userId];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    total: parseFloat(subtotal.toFixed(2)),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
};

/**
 * Add item to user cart
 */
const addToCart = async (userId, { productId, size, color, quantity = 1 }) => {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  try {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_size_color: {
          cartId: cart.id,
          productId,
          size,
          color,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + qty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          size,
          color,
          quantity: qty,
        },
      });
    }

    return await getCart(userId);
  } catch (err) {
    // Fallback in-memory
  }

  if (!memoryCarts[userId]) {
    memoryCarts[userId] = [];
  }

  // Find product details
  const prod = initialCatalog.find((p) => p.id === productId || p.slug === productId) || initialCatalog[0];

  const existingIdx = memoryCarts[userId].findIndex(
    (item) => item.productId === prod.id && item.size === size && item.color === color
  );

  if (existingIdx > -1) {
    memoryCarts[userId][existingIdx].quantity += qty;
  } else {
    memoryCarts[userId].push({
      id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: prod.id,
      name: prod.name,
      slug: prod.slug,
      brand: prod.brand,
      image: prod.image,
      price: prod.price,
      originalPrice: prod.originalPrice,
      size,
      color,
      quantity: qty,
    });
  }

  return await getCart(userId);
};

/**
 * Update item quantity in cart
 */
const updateQuantity = async (userId, itemId, quantity) => {
  const qty = parseInt(quantity, 10);

  try {
    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: qty },
      });
    }
    return await getCart(userId);
  } catch (err) {
    // Fallback
  }

  if (memoryCarts[userId]) {
    if (qty <= 0) {
      memoryCarts[userId] = memoryCarts[userId].filter((i) => i.id !== itemId);
    } else {
      const item = memoryCarts[userId].find((i) => i.id === itemId);
      if (item) item.quantity = qty;
    }
  }

  return await getCart(userId);
};

/**
 * Remove item from cart
 */
const removeFromCart = async (userId, itemId) => {
  return await updateQuantity(userId, itemId, 0);
};

/**
 * Clear all items in cart
 */
const clearCart = async (userId) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  } catch (err) {
    // Fallback
  }

  memoryCarts[userId] = [];
  return { items: [], subtotal: 0, itemCount: 0 };
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
