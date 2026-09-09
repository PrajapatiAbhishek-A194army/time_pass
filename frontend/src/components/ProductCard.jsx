import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar, FiCheck } from 'react-icons/fi';
import Badge from './Badge';
import { useCartWishlist } from '../context/CartWishlistContext';

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted: propIsWishlisted,
}) {
  const { addToCart, toggleWishlist, isInWishlist } = useCartWishlist();
  const wishlisted = propIsWishlisted !== undefined ? propIsWishlisted : isInWishlist(product?.id);
  const [added, setAdded] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product, !wishlisted);
    } else {
      toggleWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(
        product,
        1,
        product.sizes?.[0] || 'US 9',
        product.colors?.[0] || 'Default'
      );
    }
    setTimeout(() => setAdded(false), 2000);
  };


  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200/80 hover:border-brand-300 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Box */}
      <div className="relative w-full aspect-square bg-[#F5F8F6] rounded-xl sm:rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <Badge variant="dark" size="xs">
              {product.badge}
            </Badge>
          )}
          {discountPercent && (
            <Badge variant="accent" size="xs">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label="Add to Wishlist"
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md ${
            wishlisted
              ? 'bg-rose-50 text-rose-500 shadow-md scale-105'
              : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white shadow-sm'
          }`}
        >
          <FiHeart className={`w-4 h-4 transition-transform ${wishlisted ? 'fill-current scale-110' : ''}`} />
        </button>

        {/* Sneaker Image with Smooth Hover Zoom */}
        <Link to={`/products/${product.slug}`} className="w-full h-full block">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 hidden sm:block">
          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-premium transition-all duration-200 ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-900 hover:bg-brand-950 text-white'
            }`}
          >
            {added ? (
              <>
                <FiCheck className="w-4 h-4" /> Added to Bag
              </>
            ) : (
              <>
                <FiShoppingBag className="w-3.5 h-3.5" /> Quick Add to Bag
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
              <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg line-clamp-1 group-hover:text-brand-800 transition-colors mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Color preview count or tags */}
          {product.colors && (
            <p className="text-xs text-slate-500 line-clamp-1 mb-3">
              {product.colors.join(' • ')}
            </p>
          )}
        </div>

        {/* Pricing & Mobile Add Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Mobile Quick Action Button */}
          <div className="block sm:hidden">
            <button
              onClick={handleAddToCart}
              aria-label="Add to Bag"
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all ${
                added ? 'bg-emerald-600' : 'bg-brand-900 active:scale-95'
              }`}
            >
              {added ? <FiCheck className="w-4 h-4" /> : <FiShoppingBag className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
