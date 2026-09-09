import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiX,
  FiShoppingBag,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowRight,
  FiTruck,
  FiCheck,
} from 'react-icons/fi';
import { useCartWishlist } from '../context/CartWishlistContext';
import Button from './Button';

export default function CartDrawer() {
  const {
    cart,
    cartItemCount,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    total,
    freeShippingRemaining,
    freeShippingPercent,
  } = useCartWishlist();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-10 flex flex-col justify-between animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-800">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-900">
                Your Shopping Bag
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {cartItemCount} {cartItemCount === 1 ? 'silhouette' : 'silhouettes'} selected
              </p>
            </div>
          </div>

          <button
            onClick={closeCart}
            aria-label="Close Shopping Bag"
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="px-6 py-3 bg-brand-50/70 border-b border-brand-100">
          <div className="flex items-center justify-between text-xs font-bold text-brand-900 mb-1.5">
            <div className="flex items-center gap-1.5">
              <FiTruck className="w-4 h-4 text-brand-700" />
              <span>
                {freeShippingRemaining > 0
                  ? `Add $${freeShippingRemaining.toFixed(2)} more for Free Shipping`
                  : 'Free Express Shipping Unlocked!'}
              </span>
            </div>
            <span>{freeShippingPercent}%</span>
          </div>
          <div className="h-2 w-full bg-brand-200/80 rounded-full overflow-hidden">
            <div
              style={{ width: `${freeShippingPercent}%` }}
              className="h-full bg-brand-700 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <FiShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-lg text-slate-900 mb-1">
                Your bag is empty
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                Discover limited releases and high-performance racing footwear in the archive.
              </p>
              <Button
                variant="luxury"
                size="sm"
                onClick={() => {
                  closeCart();
                  navigate('/catalog');
                }}
              >
                Browse Collection
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                {/* Thumbnail */}
                <Link
                  to={`/products/${item.slug}`}
                  onClick={closeCart}
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
                        onClick={closeCart}
                        className="font-display font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-800 line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        aria-label="Remove item"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Size: US {item.size}
                      </span>
                      {item.color && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {item.color}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-full px-2 py-0.5 bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-slate-500 hover:text-slate-800 active:scale-95"
                      >
                        <FiMinus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-slate-500 hover:text-slate-800 active:scale-95"
                      >
                        <FiPlus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="font-bold text-sm text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated Shipping</span>
                <span className="font-bold text-emerald-700">
                  {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 font-bold text-slate-900">
                <span>Estimated Total</span>
                <span className="text-base font-extrabold font-display">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="luxury"
                size="md"
                onClick={() => {
                  closeCart();
                  navigate('/checkout');
                }}
                icon={<FiArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="w-full"
              >
                Instant Checkout
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  closeCart();
                  navigate('/cart');
                }}
                className="w-full text-xs"
              >
                View Full Bag & Voucher
              </Button>
            </div>

            <p className="text-[10px] text-center text-slate-400">
              Taxes and final duties calculated at checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
