import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingBag,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowRight,
  FiTruck,
  FiShield,
  FiRotateCcw,
  FiCheck,
  FiTag,
  FiX,
} from 'react-icons/fi';
import { useCartWishlist } from '../context/CartWishlistContext';
import Button from '../components/Button';

export default function CartPage() {
  const {
    cart,
    cartItemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    promoCode,
    promoMessage,
    applyPromoCode,
    removePromoCode,
    shippingFee,
    taxAmount,
    total,
    freeShippingRemaining,
    freeShippingPercent,
  } = useCartWishlist();

  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput) return;
    applyPromoCode(promoInput);
    setPromoInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-800 flex items-center justify-center mx-auto mb-6 shadow-soft">
          <FiShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-display font-black text-3xl text-slate-900 mb-2">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
          Explore the atelier archives for high-performance carbon-plated racers and handcrafted Italian lifestyle silhouettes.
        </p>
        <Link to="/catalog">
          <Button variant="luxury" size="lg" icon={<FiArrowRight className="w-4 h-4" />} iconPosition="right">
            Explore Footwear Collection
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Item Count */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-slate-200/80 gap-4">
        <div>
          <span className="luxury-badge mb-2">SoleSphere Checkout</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Shopping Bag
          </h1>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          <strong className="text-slate-900">{cartItemCount}</strong> {cartItemCount === 1 ? 'item' : 'items'} in your bag
        </div>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="mb-8 p-4 bg-brand-50/80 rounded-2xl border border-brand-200/80">
        <div className="flex items-center justify-between text-xs font-bold text-brand-900 mb-2">
          <div className="flex items-center gap-2">
            <FiTruck className="w-4 h-4 text-brand-700" />
            <span>
              {freeShippingRemaining > 0
                ? `Add $${freeShippingRemaining.toFixed(2)} more for Complimentary Express Shipping`
                : 'Free Express Worldwide Shipping Unlocked!'}
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

      {/* Layout Grid: Left Items, Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6">
                  {/* Thumbnail */}
                  <Link
                    to={`/products/${item.slug}`}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-50 overflow-hidden border border-slate-200/80 shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </Link>

                  {/* Item Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                            {item.brand}
                          </span>
                          <Link
                            to={`/products/${item.slug}`}
                            className="font-display font-bold text-base sm:text-lg text-slate-900 hover:text-brand-800 transition block"
                          >
                            {item.name}
                          </Link>
                        </div>
                        <span className="font-display font-extrabold text-lg text-slate-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span>Size: <strong className="text-slate-800">US {item.size}</strong></span>
                        {item.color && (
                          <>
                            <span>•</span>
                            <span>Color: <strong className="text-slate-800">{item.color}</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stepper and Delete */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500">Quantity:</span>
                        <div className="flex items-center border border-slate-200 rounded-full px-2.5 py-1 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-800 active:scale-95"
                          >
                            <FiMinus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-slate-800 active:scale-95"
                          >
                            <FiPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-600 transition"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <Link to="/catalog">
              <Button variant="ghost" size="sm">
                ← Continue Shopping
              </Button>
            </Link>

            <button
              onClick={clearCart}
              className="text-xs font-bold text-slate-400 hover:text-rose-600 transition"
            >
              Clear Entire Bag
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft sticky top-28 space-y-6">
            <h3 className="font-display font-black text-xl text-slate-900 pb-4 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Line Items */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <div className="flex items-center gap-1">
                    <FiTag className="w-3.5 h-3.5" />
                    <span>Promo Discount ({promoCode})</span>
                  </div>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Estimated Shipping</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `$${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-bold text-slate-900">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="font-display text-xl text-brand-950">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2">
              {promoCode ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-900">
                      Code {promoCode} applied!
                    </span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. SOLEDROP15)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs transition"
                    >
                      Apply
                    </button>
                  </div>

                  {promoMessage && (
                    <p
                      className={`text-[11px] font-semibold ${
                        promoMessage.success ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {promoMessage.text}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Checkout CTA */}
            <Button
              variant="luxury"
              size="lg"
              onClick={() => navigate('/checkout')}
              icon={<FiArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="w-full"
            >
              Proceed to Secure Checkout
            </Button>

            {/* Guarantees */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <FiShield className="w-3.5 h-3.5 text-brand-700" />
                <span>Encrypted 256-Bit SSL Checkout Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <FiRotateCcw className="w-3.5 h-3.5 text-brand-700" />
                <span>30-Day Risk-Free Wear Test Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
