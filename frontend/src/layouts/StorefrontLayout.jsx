import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import WishlistDrawer from '../components/WishlistDrawer';
import { useCartWishlist } from '../context/CartWishlistContext';

export default function StorefrontLayout({ children }) {
  const {
    openCart,
    openWishlist,
    cartItemCount,
    wishlistItemCount,
    addToCart,
    toggleWishlist,
  } = useCartWishlist();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Global Storefront Navigation */}
      <Navbar
        cartCount={cartItemCount}
        wishlistCount={wishlistItemCount}
        onOpenCart={openCart}
        onOpenWishlist={openWishlist}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {children ? (
          React.cloneElement(children, {
            onAddToCart: addToCart,
            onToggleWishlist: toggleWishlist,
          })
        ) : (
          <Outlet context={{ onAddToCart: addToCart, onToggleWishlist: toggleWishlist }} />
        )}
      </main>

      {/* Global Drawers */}
      <CartDrawer />
      <WishlistDrawer />

      {/* Global Luxury Footer */}
      <Footer />
    </div>
  );
}

