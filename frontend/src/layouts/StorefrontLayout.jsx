import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiCheckCircle } from 'react-icons/fi';

export default function StorefrontLayout({ children }) {
  const [cartCount, setCartCount] = useState(2);
  const [wishlistCount, setWishlistCount] = useState(3);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddToCart = (product) => {
    setCartCount((prev) => prev + 1);
    showNotification(`Added "${product.name}" to your shopping bag.`);
  };

  const handleToggleWishlist = (product, isWishlisted) => {
    setWishlistCount((prev) => (isWishlisted ? prev + 1 : Math.max(0, prev - 1)));
    showNotification(
      isWishlisted
        ? `Saved "${product.name}" to your wishlist.`
        : `Removed "${product.name}" from your wishlist.`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Dynamic Toast Feedback */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-brand-950 text-white shadow-premium border border-brand-800 animate-slideUp">
          <FiCheckCircle className="w-5 h-5 text-brand-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Global Storefront Navigation */}
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onOpenCart={() => showNotification('Cart drawer will open in Phase 6: Wishlist & Cart.')}
        onOpenWishlist={() => showNotification('Wishlist drawer will open in Phase 6: Wishlist & Cart.')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {children ? (
          React.cloneElement(children, {
            onAddToCart: handleAddToCart,
            onToggleWishlist: handleToggleWishlist,
          })
        ) : (
          <Outlet context={{ onAddToCart: handleAddToCart, onToggleWishlist: handleToggleWishlist }} />
        )}
      </main>

      {/* Global Luxury Footer */}
      <Footer />
    </div>
  );
}
