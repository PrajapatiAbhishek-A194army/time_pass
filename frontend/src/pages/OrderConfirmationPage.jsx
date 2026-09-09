import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiMail,
  FiCopy,
  FiCheck,
  FiPrinter,
  FiArrowRight,
  FiShield,
  FiMapPin,
  FiCreditCard,
  FiClock,
} from 'react-icons/fi';
import { fetchOrderByNumber } from '../services/orderService';
import Button from '../components/Button';
import Badge from '../components/Badge';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [copiedTrack, setCopiedTrack] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!order && orderNumber) {
      const loadOrder = async () => {
        setLoading(true);
        try {
          const res = await fetchOrderByNumber(orderNumber);
          if (res?.data) {
            setOrder(res.data);
          }
        } catch (err) {
          console.error('Failed to load order:', err);
        } finally {
          setLoading(false);
        }
      };
      loadOrder();
    }
  }, [orderNumber]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'track') {
      setCopiedTrack(true);
      setTimeout(() => setCopiedTrack(false), 2000);
    } else {
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-700 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-600">Retrieving Consignment Ledger...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="font-display font-black text-2xl text-slate-900 mb-2">
          Consignment Not Found
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Unable to locate order #{orderNumber}. Please verify the order number or check your confirmation email.
        </p>
        <Link to="/catalog">
          <Button variant="primary" size="md">
            Explore Footwear Archive
          </Button>
        </Link>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};
  const items = order.items || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Printable Receipt Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft print:border-none print:shadow-none print:p-0">
        {/* Celebration Header */}
        <div className="text-center pb-8 border-b border-slate-100 mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50 shadow-inner">
            <FiCheckCircle className="w-10 h-10 animate-bounce" />
          </div>

          <Badge variant="accent" size="sm" className="mb-3">
            Acquisition Confirmed
          </Badge>

          <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-900 tracking-tight mb-2">
            Thank You For Your Order
          </h1>

          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your limited silhouette allocation has been registered in our atelier and is being prepped for express dispatch.
          </p>

          {/* Email Notification Alert */}
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
            <FiMail className="w-4 h-4 text-brand-600" />
            <span>
              Confirmation invoice dispatched via Brevo SMTP to{' '}
              <strong className="text-slate-900">{shipping.email || 'your email'}</strong>
            </span>
          </div>
        </div>

        {/* Order Meta Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#F5F8F6] border border-brand-100 mb-8">
          {/* Order Number */}
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              Order Number
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-slate-900">
                {order.orderNumber}
              </span>
              <button
                onClick={() => copyToClipboard(order.orderNumber, 'order')}
                className="text-slate-400 hover:text-slate-700"
                title="Copy Order Number"
              >
                {copiedOrder ? <FiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <FiCopy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Tracking Number */}
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              Courier Tracking Code
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-brand-800 bg-white px-2 py-0.5 rounded border border-brand-200">
                {order.trackingNumber || 'Pending Dispatch'}
              </span>
              {order.trackingNumber && (
                <button
                  onClick={() => copyToClipboard(order.trackingNumber, 'track')}
                  className="text-slate-400 hover:text-slate-700"
                  title="Copy Tracking Number"
                >
                  {copiedTrack ? <FiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <FiCopy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Estimated Delivery */}
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              Estimated Delivery
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <FiClock className="w-3.5 h-3.5 text-brand-600" />
              <span>3&ndash;5 Business Days</span>
            </div>
          </div>
        </div>

        {/* Itemized Breakdown Table */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Footwear Allocation ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h3>

          <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
            {items.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {item.productImage || item.image ? (
                    <img
                      src={item.productImage || item.image}
                      alt={item.productName || item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <FiPackage className="w-6 h-6 text-slate-400" />
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {item.productName || item.name}
                    </h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Size: {item.size} • Color: {item.color}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Quantity: {item.quantity} &times; ${Number(item.price).toFixed(2)}
                    </div>
                  </div>
                </div>

                <span className="font-bold text-base text-slate-900">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Destination & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-slate-100">
          {/* Shipping Address */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <FiMapPin className="w-3.5 h-3.5" /> Consignment Destination
            </h4>
            <div className="text-xs text-slate-700 leading-relaxed font-medium">
              <div className="font-bold text-slate-900 text-sm">{shipping.fullName}</div>
              <div>{shipping.street} {shipping.apartment ? `, ${shipping.apartment}` : ''}</div>
              <div>{shipping.city}, {shipping.state} {shipping.postalCode}</div>
              <div>{shipping.country}</div>
              <div className="text-slate-400 font-mono mt-1">{shipping.phone}</div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <FiCreditCard className="w-3.5 h-3.5" /> Payment & Invoicing
            </h4>
            <div className="text-xs text-slate-700 leading-relaxed font-medium">
              <div className="font-bold text-slate-900 text-sm">
                {order.paymentMethod === 'CASH_ON_DELIVERY' || order.paymentMethod === 'COD'
                  ? 'Pay Upon Delivery'
                  : 'Stripe Simulated Card'}
              </div>
              <div className="text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <FiShield className="w-3.5 h-3.5" /> Status: Verified & Paid
              </div>
              <div className="text-slate-400 font-mono mt-1">
                Transaction ID: {order.paymentId || 'TXN_SIMULATED_2026'}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Totals */}
        <div className="max-w-xs ml-auto space-y-2 text-xs mb-8">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">${Number(order.subtotal).toFixed(2)}</span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>VIP Privilege Discount</span>
              <span>-${Number(order.discountAmount).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Consignment Courier</span>
            <span className="font-bold text-slate-900">
              {Number(order.shippingFee) === 0 ? 'COMPLIMENTARY' : `$${Number(order.shippingFee).toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Estimated Taxes</span>
            <span className="font-bold text-slate-900">${Number(order.tax).toFixed(2)}</span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Authorized</span>
            <span className="font-display font-black text-xl text-brand-900">
              ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions (Hidden during browser print) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 print:hidden">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 font-bold text-xs text-slate-700 flex items-center justify-center gap-2 transition hover:bg-slate-50 active:scale-95"
          >
            <FiPrinter className="w-4 h-4" /> Print / Save Invoice
          </button>

          <Link to="/catalog" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full" icon={<FiArrowRight />}>
              Continue Exploring Archive
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
