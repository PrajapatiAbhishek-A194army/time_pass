import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiHeart, FiShoppingBag, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useCartWishlist } from '../context/CartWishlistContext';
import Button from './Button';

export default function WishlistDrawer() {
  const {
    wishlist,
    wishlistItemCount,
    isWishlistOpen,
    closeWishlist,
    toggleWishlist,
    addToCart,
  } = useCartWishlist();

  const navigate = useNavigate();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={closeWishlist}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-10 flex flex-col justify-between animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <FiHeart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-900">
                Saved Silhouettes
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {wishlistItemCount} {wishlistItemCount === 1 ? 'pair' : 'pairs'} on your wishlist
              </p>
            </div>
          </div>

          <button
            onClick={closeWishlist}
            aria-label="Close Wishlist"
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-100">
          {wishlist.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <FiHeart className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-lg text-slate-900 mb-1">
                Your wishlist is empty
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                Save your favorite sneakers for future drops and private sales.
              </p>
              <Button
                variant="luxury"
                size="sm"
                onClick={() => {
                  closeWishlist();
                  navigate('/catalog');
                }}
              >
                Browse Collection
              </Button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                {/* Thumbnail */}
                <Link
                  to={`/products/${item.slug}`}
                  onClick={closeWishlist}
                  className="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden border border-slate-200/80 shrink-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-center"
                  />
                </Link>

                {/* Info & Actions */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/products/${item.slug}`}
                        onClick={closeWishlist}
                        className="font-display font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-800 line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        aria-label="Remove item"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs font-bold text-slate-900 mt-1">
                      ${item.price?.toFixed(2)}
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => {
                        addToCart(item, '9', 'Default', 1);
                        toggleWishlist(item);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-brand-50 hover:bg-brand-100/80 border border-brand-200 text-brand-900 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <FiShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {wishlist.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-white">
            <Link
              to="/wishlist"
              onClick={closeWishlist}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50 transition"
            >
              <span>View Full Wishlist Page</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
