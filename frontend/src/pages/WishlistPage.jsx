import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiHeart,
  FiShoppingBag,
  FiTrash2,
  FiArrowRight,
  FiCheck,
  FiStar,
  FiZap,
} from 'react-icons/fi';
import { useCartWishlist } from '../context/CartWishlistContext';
import { fetchProducts } from '../services/catalogService';
import Button from '../components/Button';
import Badge from '../components/Badge';

export default function WishlistPage() {
  const {
    wishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    wishlistItemCount,
  } = useCartWishlist();

  const [recommended, setRecommended] = useState([]);
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadRecommended = async () => {
      try {
        const res = await fetchProducts({ limit: 4 });
        if (res?.data) {
          setRecommended(res.data);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      }
    };
    loadRecommended();
  }, []);

  const handleMove = (item) => {
    setMovingId(item.id);
    moveToCart(item);
    setTimeout(() => {
      setMovingId(null);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200/80 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
            <Link to="/" className="hover:text-brand-800 transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Wishlist</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
              Curated Archive
            </h1>
            <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-900 font-bold text-xs">
              {wishlistItemCount} {wishlistItemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Personalized showcase of saved silhouettes and limited editions.
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FiTrash2 className="w-3.5 h-3.5" /> Clear Wishlist
          </button>
        )}
      </div>

      {/* Main Wishlist Content */}
      {wishlist.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 shadow-soft max-w-2xl mx-auto px-6 mb-16">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <FiHeart className="w-10 h-10" />
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">
            Your Archive is Empty
          </h2>
          <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
            You haven't saved any sneakers yet. Discover performance icons, luxury collaborations, and heritage classics to add to your wishlist.
          </p>
          <Link to="/catalog">
            <Button variant="primary" size="lg" icon={<FiArrowRight />}>
              Explore Footwear Archive
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {wishlist.map((item) => {
            const isMoving = movingId === item.id;
            return (
              <div
                key={item.id}
                className="group bg-white rounded-3xl p-4 border border-slate-200/80 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Section */}
                <div className="relative w-full aspect-square bg-[#F5F8F6] rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-soft transition active:scale-95"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>

                  <Link to={`/products/${item.slug}`} className="w-full h-full block">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {item.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge variant="dark" size="xs">
                        {item.badge}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                        {item.brand}
                      </span>
                      {item.rating && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                          <FiStar className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{item.rating}</span>
                        </div>
                      )}
                    </div>

                    <Link to={`/products/${item.slug}`}>
                      <h3 className="font-display font-bold text-slate-900 text-base group-hover:text-brand-800 transition line-clamp-1 mb-2">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-extrabold text-slate-900">
                        ${item.price?.toFixed(2)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ${item.originalPrice?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleMove(item)}
                      disabled={isMoving}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${
                        isMoving
                          ? 'bg-emerald-600 text-white'
                          : 'bg-brand-900 hover:bg-brand-950 text-white active:scale-95'
                      }`}
                    >
                      {isMoving ? (
                        <>
                          <FiCheck className="w-4 h-4" /> Added to Bag
                        </>
                      ) : (
                        <>
                          <FiShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Curated Recommendations */}
      {recommended.length > 0 && (
        <section className="pt-12 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-brand-700 text-xs font-bold uppercase tracking-wider mb-1">
                <FiZap className="w-3.5 h-3.5" /> Curated Suggestions
              </div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900">
                You May Also Like
              </h2>
            </div>
            <Link
              to="/catalog"
              className="text-xs font-bold text-brand-800 hover:text-brand-950 flex items-center gap-1 group"
            >
              View All{' '}
              <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((prod) => (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft hover:shadow-premium transition flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-[#F5F8F6] rounded-xl overflow-hidden mb-3">
                  <Link to={`/products/${prod.slug}`}>
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                    {prod.brand}
                  </span>
                  <Link to={`/products/${prod.slug}`}>
                    <h4 className="font-display font-bold text-slate-900 text-sm line-clamp-1 mb-1 group-hover:text-brand-800">
                      {prod.name}
                    </h4>
                  </Link>
                  <span className="font-black text-slate-900 text-sm">
                    ${prod.price?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
