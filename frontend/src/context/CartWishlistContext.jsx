import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartWishlistContext = createContext(null);

export function CartWishlistProvider({ children }) {
  const { isAuthenticated, token } = useAuth();

  // Load from local storage or defaults
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('solesphere_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem('solesphere_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0); // e.g. 0.15 for 15%
  const [promoMessage, setPromoMessage] = useState(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('solesphere_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('solesphere_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync with backend on auth
  useEffect(() => {
    if (isAuthenticated && token) {
      api.get('/cart').then((res) => {
        if (res.data?.data?.items?.length > 0) {
          setCart(res.data.data.items);
        }
      }).catch(() => {});

      api.get('/wishlist').then((res) => {
        if (res.data?.data?.items?.length > 0) {
          setWishlist(res.data.data.items);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, token]);

  // Cart operations
  const addToCart = async (product, arg2, arg3, arg4) => {
    let size = 'US 9';
    let color = 'Default';
    let quantity = 1;

    if (typeof arg2 === 'number') {
      // Signature: (product, quantity, size, color)
      quantity = arg2;
      size = typeof arg3 === 'string' ? arg3 : (product.selectedSize || product.size || 'US 9');
      color = typeof arg4 === 'string' ? arg4 : (product.selectedColor || product.color || 'Default');
    } else {
      // Signature: (product, size, color, quantity) or single object
      size = typeof arg2 === 'string' ? arg2 : (product.selectedSize || product.size || 'US 9');
      color = typeof arg3 === 'string' ? arg3 : (product.selectedColor || product.color || 'Default');
      quantity = typeof arg4 === 'number' ? arg4 : (product.quantity || 1);
    }

    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.size === size && item.color === color
    );

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
    } else {
      const newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        size,
        color,
        quantity,
      };
      updatedCart = [...cart, newItem];
    }

    setCart(updatedCart);
    setIsCartOpen(true);

    if (isAuthenticated) {
      try {
        await api.post('/cart', {
          productId: product.id,
          size,
          color,
          quantity,
        });
      } catch (err) {
        console.warn('Backend cart sync note:', err.message);
      }
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    const qty = Math.max(0, parseInt(newQty, 10));
    let updated;
    if (qty === 0) {
      updated = cart.filter((item) => item.id !== itemId);
    } else {
      updated = cart.map((item) => (item.id === itemId ? { ...item, quantity: qty } : item));
    }
    setCart(updated);

    if (isAuthenticated) {
      try {
        await api.put(`/cart/${itemId}`, { quantity: qty });
      } catch (err) {
        console.warn('Backend cart sync note:', err.message);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    await updateQuantity(itemId, 0);
  };

  const clearCart = async () => {
    setCart([]);
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.warn('Backend cart sync note:', err.message);
      }
    }
  };

  // Wishlist operations
  const toggleWishlist = async (product) => {
    const exists = wishlist.some((item) => item.productId === product.id || item.id === product.id);
    let updated;
    if (exists) {
      updated = wishlist.filter((item) => item.productId !== product.id && item.id !== product.id);
    } else {
      updated = [
        ...wishlist,
        {
          id: `wish-${Date.now()}`,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          image: product.image,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category,
        },
      ];
    }
    setWishlist(updated);

    if (isAuthenticated) {
      try {
        await api.post('/wishlist/toggle', { productId: product.id });
      } catch (err) {
        console.warn('Backend wishlist sync note:', err.message);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.productId === productId || item.id === productId);
  };

  // Promo Code Engine
  const applyPromoCode = (code) => {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === 'SOLEDROP15') {
      setPromoCode('SOLEDROP15');
      setDiscountRate(0.15);
      setPromoMessage({ success: true, text: '15% Atelier Discount Applied!' });
      return true;
    } else if (cleaned === 'ATELIER20') {
      setPromoCode('ATELIER20');
      setDiscountRate(0.20);
      setPromoMessage({ success: true, text: '20% VIP Atelier Discount Applied!' });
      return true;
    } else {
      setPromoMessage({ success: false, text: 'Invalid or expired promotion code.' });
      return false;
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountRate(0);
    setPromoMessage(null);
  };

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * discountRate;
  const freeShippingThreshold = 150.0;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0.0 : 15.0;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const taxAmount = (subtotal - discountAmount) * 0.08;
  const total = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

  return (
    <CartWishlistContext.Provider
      value={{
        cart,
        wishlist,
        cartItemCount,
        wishlistItemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        subtotal,
        discountAmount,
        discountRate,
        promoCode,
        promoMessage,
        applyPromoCode,
        removePromoCode,
        shippingFee,
        taxAmount,
        total,
        freeShippingThreshold,
        freeShippingRemaining,
        freeShippingPercent,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        isWishlistOpen,
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false),
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
}

export function useCartWishlist() {
  const context = useContext(CartWishlistContext);
  if (!context) {
    throw new Error('useCartWishlist must be used within a CartWishlistProvider');
  }
  return context;
}
