import React from 'react';
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiDollarSign,
  FiShoppingBag,
  FiMapPin,
  FiShield,
  FiExternalLink,
  FiAward,
} from 'react-icons/fi';

export default function CustomerDetailModal({ isOpen, onClose, customer, onInspectOrder }) {
  if (!isOpen || !customer) return null;

  const { metrics, orders = [], addresses = [] } = customer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold">
              <FiUser />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{customer.name || 'SoleSphere Collector'}</h2>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    customer.role === 'ADMIN'
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {customer.role}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono flex items-center gap-2 mt-0.5">
                <span>{customer.email}</span>
                <span>&bull;</span>
                <span>Joined {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* LTV & Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
                <span>LIFETIME SPEND</span>
                <FiDollarSign className="text-emerald-400" />
              </div>
              <div className="text-2xl font-mono font-black text-white">
                ${metrics?.totalSpent?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <FiAward />
                <span>{metrics?.vipStatus || 'Verified Collector'}</span>
              </div>
            </div>

            <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
                <span>ACQUISITIONS</span>
                <FiShoppingBag className="text-teal-400" />
              </div>
              <div className="text-2xl font-mono font-black text-white">
                {metrics?.totalOrders || 0} Orders
              </div>
              <div className="text-[10px] text-neutral-400 font-mono mt-1">
                Fulfilled through Atelier
              </div>
            </div>

            <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
                <span>AVG ORDER VALUE</span>
                <FiShield className="text-cyan-400" />
              </div>
              <div className="text-2xl font-mono font-black text-white">
                ${metrics?.averageOrderValue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
              </div>
              <div className="text-[10px] text-neutral-400 font-mono mt-1">
                Per checkout average
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4">
            <h3 className="text-xs font-mono uppercase text-emerald-400 mb-3 tracking-widest">
              Contact &amp; Communications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <FiMail className="text-neutral-500 shrink-0" />
                <span className="font-mono text-white">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <FiPhone className="text-neutral-500 shrink-0" />
                <span className="font-mono text-white">{customer.phone || 'Not Specified'}</span>
              </div>
            </div>
          </div>

          {/* Acquisition Order History */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4">
            <h3 className="text-xs font-mono uppercase text-emerald-400 mb-3 tracking-widest">
              Collector Acquisition History ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No orders registered for this user profile yet.</p>
            ) : (
              <div className="divide-y divide-neutral-850">
                {orders.map((ord) => (
                  <div key={ord.id || ord.orderNumber} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{ord.orderNumber}</span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : ord.status === 'SHIPPED'
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString()} &bull; {ord.itemCount || 1} item(s)
                        {ord.trackingNumber && ` &bull; ${ord.trackingNumber}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-emerald-400">
                        ${Number(ord.totalAmount).toFixed(2)}
                      </p>
                      {onInspectOrder && (
                        <button
                          onClick={() => {
                            onClose();
                            onInspectOrder(ord.orderNumber);
                          }}
                          className="text-[11px] text-neutral-400 hover:text-white inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>Inspect Order</span>
                          <FiExternalLink className="text-[10px]" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Addresses */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 mb-3 tracking-widest">
              <FiMapPin />
              <span>Saved Shipping Addresses</span>
            </div>
            {addresses.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No saved addresses on file.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                    <p className="font-bold text-white">{addr.fullName}</p>
                    <p className="text-neutral-300 mt-1">{addr.street}</p>
                    <p className="text-neutral-300">{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p className="text-neutral-400 font-mono text-[11px]">{addr.country || 'United States'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
