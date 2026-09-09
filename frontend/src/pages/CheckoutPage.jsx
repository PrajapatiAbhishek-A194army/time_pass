import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiLock,
  FiShield,
  FiTruck,
  FiCreditCard,
  FiAlertCircle,
  FiShoppingBag,
  FiTag,
  FiUser,
  FiMapPin,
  FiDollarSign,
} from 'react-icons/fi';
import { useCartWishlist } from '../context/CartWishlistContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import Button from '../components/Button';
import Badge from '../components/Badge';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    cartSubtotal,
    cartTotal,
    discountAmount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useCartWishlist();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Shipping Form State
  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    shippingSpeed: 'EXPRESS',
    saveAddress: true,
  });

  const [shippingErrors, setShippingErrors] = useState({});

  // Payment Form State
  const [payment, setPayment] = useState({
    method: 'CARD', // CARD | APPLE_PAY | COD
    cardNumber: '',
    cardHolder: user?.name || '',
    expiry: '',
    cvc: '',
  });

  const [paymentErrors, setPaymentErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  // Card brand detector
  const getCardBrand = (number) => {
    const clean = number.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'VISA';
    if (/^5[1-5]/.test(clean)) return 'MASTERCARD';
    if (/^3[47]/.test(clean)) return 'AMEX';
    return 'GENERIC';
  };

  // Format card number with spaces (#### #### #### ####)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPayment((prev) => ({ ...prev, cardNumber: formatted }));
    if (paymentErrors.cardNumber) {
      setPaymentErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  // Format expiry (MM/YY)
  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    let formatted = raw;
    if (raw.length >= 3) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setPayment((prev) => ({ ...prev, expiry: formatted }));
    if (paymentErrors.expiry) {
      setPaymentErrors((prev) => ({ ...prev, expiry: '' }));
    }
  };

  // Fill demo test card
  const fillDemoCard = () => {
    setPayment({
      method: 'CARD',
      cardNumber: '4242 4242 4242 4242',
      cardHolder: user?.name || 'Alexander Wright',
      expiry: '12/28',
      cvc: '888',
    });
    setPaymentErrors({});
  };

  // Validate Step 1: Shipping
  const validateShipping = () => {
    const errors = {};
    if (!shipping.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shipping.email.trim() || !/\S+@\S+\.\S+/.test(shipping.email)) {
      errors.email = 'Valid email address is required';
    }
    if (!shipping.phone.trim()) errors.phone = 'Phone number is required';
    if (!shipping.street.trim()) errors.street = 'Street address is required';
    if (!shipping.city.trim()) errors.city = 'City is required';
    if (!shipping.state.trim()) errors.state = 'State / Province is required';
    if (!shipping.postalCode.trim()) errors.postalCode = 'Postal / ZIP code is required';

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate Step 2: Payment
  const validatePayment = () => {
    if (payment.method !== 'CARD') return true;
    const errors = {};
    const cleanNum = payment.cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 15) errors.cardNumber = 'Valid 16-digit card number is required';
    if (!payment.cardHolder.trim()) errors.cardHolder = 'Cardholder name is required';
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) errors.expiry = 'Valid expiry MM/YY is required';
    if (payment.cvc.length < 3) errors.cvc = 'Valid 3-4 digit CVC is required';

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateShipping()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validatePayment()) setCurrentStep(3);
    }
  };

  // Promo Code handling
  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput.trim());
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoInput('');
    }
  };

  // Final Order Submission
  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const orderPayload = {
        shippingAddress: {
          fullName: shipping.fullName,
          email: shipping.email,
          phone: shipping.phone,
          street: shipping.street,
          apartment: shipping.apartment,
          city: shipping.city,
          state: shipping.state,
          postalCode: shipping.postalCode,
          country: shipping.country,
        },
        items: cart.map((item) => ({
          productId: item.productId || item.id,
          name: item.name,
          price: item.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          image: item.image,
        })),
        paymentMethod: payment.method,
        paymentId: `pay_sim_${Date.now()}`,
        promoCode: appliedPromo?.code || null,
        notes: `Courier speed: ${shipping.shippingSpeed}`,
      };

      const res = await createOrder(orderPayload);
      if (res?.data) {
        clearCart();
        navigate(`/order-confirmation/${res.data.orderNumber}`, {
          state: { order: res.data },
        });
      }
    } catch (err) {
      console.error('Order submission error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to process order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <FiShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-display font-black text-3xl text-slate-900 mb-3">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          You don't have any footwear in your checkout bag. Explore our curated archive of limited drops and performance icons.
        </p>
        <Link to="/catalog">
          <Button variant="primary" size="lg" icon={<FiArrowRight />}>
            Explore Footwear Archive
          </Button>
        </Link>
      </div>
    );
  }

  // Shipping cost: free over $150
  const shippingFee = (cartSubtotal - discountAmount) >= 150 ? 0 : 15;
  const estimatedTax = (Math.max(0, cartSubtotal - discountAmount) * 0.08);
  const finalTotal = Math.max(0, cartSubtotal - discountAmount) + shippingFee + estimatedTax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Checkout Progress Stepper */}
      <div className="mb-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-600 transition-all duration-300 z-0"
            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
          />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center">
            <button
              onClick={() => currentStep > 1 && setCurrentStep(1)}
              className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
                currentStep > 1
                  ? 'bg-brand-600 text-white shadow-soft'
                  : currentStep === 1
                  ? 'bg-brand-900 text-white ring-4 ring-brand-100 shadow-premium'
                  : 'bg-white text-slate-400 border-2 border-slate-300'
              }`}
            >
              {currentStep > 1 ? <FiCheck className="w-5 h-5" /> : '1'}
            </button>
            <span className={`text-xs font-bold mt-2 ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
              Shipping
            </span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center">
            <button
              onClick={() => currentStep > 2 && setCurrentStep(2)}
              className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
                currentStep > 2
                  ? 'bg-brand-600 text-white shadow-soft'
                  : currentStep === 2
                  ? 'bg-brand-900 text-white ring-4 ring-brand-100 shadow-premium'
                  : 'bg-white text-slate-400 border-2 border-slate-300'
              }`}
            >
              {currentStep > 2 ? <FiCheck className="w-5 h-5" /> : '2'}
            </button>
            <span className={`text-xs font-bold mt-2 ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
              Payment
            </span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
                currentStep === 3
                  ? 'bg-brand-900 text-white ring-4 ring-brand-100 shadow-premium'
                  : 'bg-white text-slate-400 border-2 border-slate-300'
              }`}
            >
              3
            </div>
            <span className={`text-xs font-bold mt-2 ${currentStep === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
              Review
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Form Flow, Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7">
          {/* STEP 1: SHIPPING DETAILS */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="font-display font-black text-xl text-slate-900">
                    Shipping & Destination
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the delivery address for your insured consignment.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                  <FiMapPin className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    placeholder="Alexander Wright"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                      shippingErrors.fullName ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {shippingErrors.fullName && (
                    <span className="text-[11px] text-rose-500 mt-1 block">{shippingErrors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address * (For Brevo order receipt)
                  </label>
                  <input
                    type="email"
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    placeholder="alex@example.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                      shippingErrors.email ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {shippingErrors.email && (
                    <span className="text-[11px] text-rose-500 mt-1 block">{shippingErrors.email}</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number * (Courier delivery updates)
                </label>
                <input
                  type="tel"
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                    shippingErrors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {shippingErrors.phone && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{shippingErrors.phone}</span>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={shipping.street}
                  onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                  placeholder="742 Evergreen Terrace"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                    shippingErrors.street ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {shippingErrors.street && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{shippingErrors.street}</span>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Apartment, Suite, Unit (Optional)
                </label>
                <input
                  type="text"
                  value={shipping.apartment}
                  onChange={(e) => setShipping({ ...shipping, apartment: e.target.value })}
                  placeholder="Penthouse 4B"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="Portland"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                      shippingErrors.city ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {shippingErrors.city && (
                    <span className="text-[11px] text-rose-500 mt-1 block">{shippingErrors.city}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">State / Region *</label>
                  <input
                    type="text"
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    placeholder="Oregon"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                      shippingErrors.state ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {shippingErrors.state && (
                    <span className="text-[11px] text-rose-500 mt-1 block">{shippingErrors.state}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Postal / ZIP Code *</label>
                  <input
                    type="text"
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                    placeholder="97201"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                      shippingErrors.postalCode ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {shippingErrors.postalCode && (
                    <span className="text-[11px] text-rose-500 mt-1 block">{shippingErrors.postalCode}</span>
                  )}
                </div>
              </div>

              {/* Delivery Speed Selector */}
              <div className="mb-6 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-3">
                  Select Courier Priority
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setShipping({ ...shipping, shippingSpeed: 'EXPRESS' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                      shipping.shippingSpeed === 'EXPRESS'
                        ? 'border-brand-600 bg-brand-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center">
                        <FiTruck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">SoleSphere Express</div>
                        <div className="text-xs text-slate-500">2-3 Business Days</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-brand-800">
                      {shippingFee === 0 ? 'FREE' : '$15.00'}
                    </span>
                  </div>

                  <div
                    onClick={() => setShipping({ ...shipping, shippingSpeed: 'STANDARD' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                      shipping.shippingSpeed === 'STANDARD'
                        ? 'border-brand-600 bg-brand-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                        <FiTruck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">Carbon-Neutral Ground</div>
                        <div className="text-xs text-slate-500">4-6 Business Days</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">FREE</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-4">
                <Link to="/cart" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
                  <FiArrowLeft className="w-4 h-4" /> Return to Cart
                </Link>
                <Button variant="primary" size="lg" onClick={handleNextStep} icon={<FiArrowRight />}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT GATEWAY (STRIPE UI SIMULATION) */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="font-display font-black text-xl text-slate-900">
                    Payment Gateway
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    End-to-end 256-bit encrypted simulated Stripe checkout.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full text-xs font-bold">
                  <FiLock className="w-3.5 h-3.5" /> 256-Bit SSL
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPayment({ ...payment, method: 'CARD' })}
                  className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-2 transition ${
                    payment.method === 'CARD'
                      ? 'border-brand-600 bg-brand-50 text-brand-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <FiCreditCard className="w-4 h-4" /> Credit Card
                </button>

                <button
                  type="button"
                  onClick={() => setPayment({ ...payment, method: 'APPLE_PAY' })}
                  className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-2 transition ${
                    payment.method === 'APPLE_PAY'
                      ? 'border-brand-600 bg-brand-50 text-brand-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span> Pay / GPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayment({ ...payment, method: 'COD' })}
                  className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-2 transition ${
                    payment.method === 'COD'
                      ? 'border-brand-600 bg-brand-50 text-brand-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <FiDollarSign className="w-4 h-4" /> Pay on Delivery
                </button>
              </div>

              {/* Credit Card Flow */}
              {payment.method === 'CARD' && (
                <div>
                  {/* Luxury Simulated Credit Card Mockup */}
                  <div className="relative aspect-[1.75/1] max-w-sm mx-auto mb-8 rounded-3xl bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 p-6 text-white shadow-premium overflow-hidden border border-brand-800">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-inner">
                          <div className="w-5 h-4 border border-amber-900/40 rounded-sm" />
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Contactless</span>
                      </div>
                      <span className="font-display font-extrabold text-sm tracking-widest text-emerald-400">
                        {getCardBrand(payment.cardNumber)}
                      </span>
                    </div>

                    <div className="font-mono text-lg sm:text-xl font-bold tracking-[0.2em] mb-6 text-slate-100">
                      {payment.cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex items-end justify-between text-xs">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Cardholder</div>
                        <div className="font-bold tracking-wide truncate max-w-[170px]">
                          {payment.cardHolder || 'ALEXANDER WRIGHT'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Expires</div>
                        <div className="font-mono font-bold">{payment.expiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Helper Test Autofill */}
                  <div className="flex justify-end mb-4">
                    <button
                      type="button"
                      onClick={fillDemoCard}
                      className="text-xs font-bold text-brand-700 hover:text-brand-900 underline flex items-center gap-1"
                    >
                      Use Demo Test Card (Auto-fill)
                    </button>
                  </div>

                  {/* Form Inputs */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={payment.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        className={`w-full pl-4 pr-12 py-3 rounded-xl border text-sm font-mono font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                          paymentErrors.cardNumber ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-700 font-mono">
                        {getCardBrand(payment.cardNumber)}
                      </div>
                    </div>
                    {paymentErrors.cardNumber && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{paymentErrors.cardNumber}</span>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={payment.cardHolder}
                      onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value })}
                      placeholder="Alexander Wright"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                        paymentErrors.cardHolder ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                    {paymentErrors.cardHolder && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{paymentErrors.cardHolder}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Expiration (MM/YY) *
                      </label>
                      <input
                        type="text"
                        value={payment.expiry}
                        onChange={handleExpiryChange}
                        placeholder="12/28"
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-mono font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                          paymentErrors.expiry ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                      {paymentErrors.expiry && (
                        <span className="text-[11px] text-rose-500 mt-1 block">{paymentErrors.expiry}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Security CVC *
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        value={payment.cvc}
                        onChange={(e) => setPayment({ ...payment, cvc: e.target.value.replace(/\D/g, '') })}
                        placeholder="888"
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-mono font-medium focus:ring-2 focus:ring-brand-500 outline-none transition ${
                          paymentErrors.cvc ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                      {paymentErrors.cvc && (
                        <span className="text-[11px] text-rose-500 mt-1 block">{paymentErrors.cvc}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {payment.method === 'APPLE_PAY' && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 mb-6">
                  <div className="text-3xl mb-2"> Pay / GPay</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    Biometric authentication will be simulated upon placing order. No card details required.
                  </p>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    Device Ready
                  </span>
                </div>
              )}

              {payment.method === 'COD' && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 mb-6">
                  <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center mx-auto mb-3">
                    <FiDollarSign className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Pay Upon Delivery</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Pay our courier directly via contactless card or cash at your doorstep.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <FiArrowLeft className="w-4 h-4" /> Back to Shipping
                </button>
                <Button variant="primary" size="lg" onClick={handleNextStep} icon={<FiArrowRight />}>
                  Review Consignment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & PLACE ORDER */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="font-display font-black text-xl text-slate-900">
                    Consignment Review
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please verify delivery destination and billing details before authorization.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                  <FiCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Shipping Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Destination
                    </span>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-brand-700 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="font-bold text-sm text-slate-900">{shipping.fullName}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {shipping.street} {shipping.apartment ? `, ${shipping.apartment}` : ''}
                  </div>
                  <div className="text-xs text-slate-600">
                    {shipping.city}, {shipping.state} {shipping.postalCode}, {shipping.country}
                  </div>
                  <div className="text-xs text-slate-500 mt-2 font-mono">{shipping.phone}</div>
                </div>

                {/* Payment Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Payment Mode
                    </span>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-brand-700 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FiCreditCard className="w-4 h-4 text-brand-700" />
                    {payment.method === 'CARD' ? `Stripe Card (${getCardBrand(payment.cardNumber)})` : payment.method === 'APPLE_PAY' ? 'Apple Pay / Google Pay' : 'Pay on Delivery'}
                  </div>
                  {payment.method === 'CARD' && (
                    <div className="text-xs text-slate-500 mt-1 font-mono">
                      Ending in •••• {payment.cardNumber.slice(-4) || '4242'}
                    </div>
                  )}
                  <div className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                    <FiShield className="w-3.5 h-3.5" /> 3D-Secure Authenticated
                  </div>
                </div>
              </div>

              {/* Items in Review */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Footwear Allocation ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                </h4>
                <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                  {cart.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-50"
                        />
                        <div>
                          <h5 className="font-bold text-sm text-slate-900">{item.name}</h5>
                          <div className="text-xs text-slate-500">
                            Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Authorize & Place Order CTA */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="xl"
                  onClick={handlePlaceOrder}
                  loading={submitting}
                  className="w-full py-4 text-base"
                >
                  Confirm & Authorize Payment (${finalTotal.toFixed(2)})
                </Button>
                <p className="text-center text-[11px] text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                  <FiLock className="w-3 h-3" /> By clicking confirm, you agree to SoleSphere terms of sale & warranty.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Order Summary (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft sticky top-28">
            <h3 className="font-display font-black text-lg text-slate-900 pb-4 border-b border-slate-100 mb-4">
              Order Breakdown
            </h3>

            {/* Quick Line Items list */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 mb-4 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate max-w-[220px]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-50 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-slate-400">{item.size} • Qty {item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Voucher */}
            <div className="mb-4 pt-3 border-t border-slate-100">
              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <FiTag className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 font-mono">
                        {appliedPromo.code}
                      </span>
                      <span className="text-[11px] text-emerald-700 block">
                        {appliedPromo.discountPercent}% VIP Discount Applied
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE (e.g. SOLEDROP15)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Apply
                  </Button>
                </form>
              )}
              {promoError && (
                <span className="text-[11px] text-rose-500 mt-1 block">{promoError}</span>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${cartSubtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>VIP Privilege Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Consignment Courier</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700">COMPLIMENTARY</span>
                  ) : (
                    `$${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Taxes (8%)</span>
                <span className="font-bold text-slate-900">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Consignment Total</span>
                <span className="font-display font-black text-2xl text-brand-900">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <FiShield className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                <span>SoleSphere 100% Certified Authenticity Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTruck className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                <span>Complimentary Express Shipping Over $150</span>
              </div>
              <div className="flex items-center gap-2">
                <FiLock className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                <span>Brevo SMTP Encrypted Transactional Invoicing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
