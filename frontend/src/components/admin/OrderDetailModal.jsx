import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiPrinter,
  FiTruck,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
} from 'react-icons/fi';

const CARRIERS = ['FedEx Express', 'DHL Priority', 'UPS Worldwide', 'BlueDart Express', 'Royal Mail Special'];
const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetailModal({ isOpen, onClose, order, onUpdateFulfillment }) {
  const [status, setStatus] = useState('PENDING');
  const [carrier, setCarrier] = useState('FedEx Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'PENDING');
      setCarrier(order.carrier || 'FedEx Express');
      setTrackingNumber(order.trackingNumber || '');
      setNotes(order.notes || '');
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleFulfillmentSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await onUpdateFulfillment(order.orderNumber, {
        status,
        carrier,
        trackingNumber: trackingNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSuccessMsg(`Order updated to ${status}. Dispatch notification triggered.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update order fulfillment.');
    } finally {
      setSaving(false);
    }
  };

  const isDelivered = status === 'DELIVERED';
  const isShipped = status === 'SHIPPED' || isDelivered;
  const isProcessing = status === 'PROCESSING' || isShipped;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/95 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold">
              <FiPackage />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white">{order.orderNumber}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                    order.status === 'DELIVERED'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : order.status === 'SHIPPED'
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      : order.status === 'PROCESSING'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : order.status === 'CANCELLED'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400">
                Placed on {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold transition-colors"
              title="Print Packing Slip / Invoice"
            >
              <FiPrinter className="text-sm" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Printable Invoice Header (Hidden on screen, visible on print) */}
          <div className="hidden print:block text-black p-4 border-b border-black/20 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black font-serif uppercase tracking-widest">SOLESPHERE</h1>
                <p className="text-xs">Luxury Footwear Atelier & Dispatch Logistics</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">CONSIGNMENT INVOICE</p>
                <p className="text-xs font-mono">ORDER #{order.orderNumber}</p>
                <p className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Feedback alerts */}
          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 print:hidden">
              <FiCheckCircle className="text-base shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2 print:hidden">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Status Stepper Progression */}
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm">
                  1
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400">Order Placed</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                    isProcessing ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  2
                </div>
                <span className={`text-[11px] font-mono font-bold ${isProcessing ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  Processing
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                    isShipped ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  3
                </div>
                <span className={`text-[11px] font-mono font-bold ${isShipped ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  Dispatched
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                    isDelivered ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  4
                </div>
                <span className={`text-[11px] font-mono font-bold ${isDelivered ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  Delivered
                </span>
              </div>
            </div>
          </div>

          {/* Fulfillment Control Panel (Hidden on print) */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-5 print:hidden">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-mono text-xs uppercase tracking-wider">
              <FiTruck />
              <span>Consignment Dispatch Controls</span>
            </div>

            <form onSubmit={handleFulfillmentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Fulfillment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-750 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Carrier Logistics</label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-750 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {CARRIERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Waybill Tracking ID</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. SS-FEDEX-918239"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-750 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Internal Atelier Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Verified packaging seals; dispatched via expedited evening cargo."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-750 rounded-xl text-neutral-300 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-neutral-400 font-mono">
                  Setting status to <strong>SHIPPED</strong> triggers Brevo SMTP email notification to buyer.
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiSend className="text-xs" />
                      <span>Update &amp; Notify</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Two Columns: Destination & Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Destination Address */}
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 mb-2">
                <FiMapPin />
                <span>Shipping Destination</span>
              </div>
              <p className="text-sm font-bold text-white">{order.shippingAddress?.fullName || order.customerName}</p>
              <p className="text-xs text-neutral-300 mt-1">{order.shippingAddress?.street}</p>
              <p className="text-xs text-neutral-300">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              </p>
              <p className="text-xs text-neutral-400">{order.shippingAddress?.country || 'United States'}</p>
              <div className="mt-3 pt-3 border-t border-neutral-850 text-xs text-neutral-400 font-mono">
                <div>Email: <span className="text-neutral-200">{order.shippingAddress?.email || order.email}</span></div>
                <div>Phone: <span className="text-neutral-200">{order.shippingAddress?.phone || order.phone}</span></div>
              </div>
            </div>

            {/* Payment & Ledger */}
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 mb-2">
                <FiCreditCard />
                <span>Payment &amp; Settlement</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-850">
                  <span className="text-neutral-400">Payment Gateway:</span>
                  <span className="font-semibold text-white">{order.paymentMethod || 'Credit Card (Stripe)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-850">
                  <span className="text-neutral-400">Payment Status:</span>
                  <span className="font-bold text-emerald-400 font-mono">{order.paymentStatus || 'PAID'}</span>
                </div>
                {order.paymentId && (
                  <div className="flex justify-between py-1 border-b border-neutral-850">
                    <span className="text-neutral-400">Transaction Ref:</span>
                    <span className="font-mono text-neutral-400 text-[11px] truncate max-w-[170px]">{order.paymentId}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 pt-2 font-mono">
                  <span className="text-neutral-400">Total Settled:</span>
                  <span className="font-bold text-emerald-400 text-sm">${Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
              Enclosed Footwear Silhouettes ({order.items?.length || 0})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-mono uppercase">
                    <th className="pb-2">Silhouette</th>
                    <th className="pb-2">Size / Color</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                            />
                          )}
                          <div>
                            <p className="font-bold text-white text-xs">{item.name}</p>
                            <p className="text-[11px] text-neutral-400 font-mono">{item.sku || 'SS-ACVP'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-neutral-300">
                        {item.size || 'US 10'} / {item.color || 'Standard'}
                      </td>
                      <td className="py-3 font-mono text-neutral-300 font-bold">
                        &times; {item.quantity || 1}
                      </td>
                      <td className="py-3 font-mono text-right text-neutral-400">
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td className="py-3 font-mono text-right font-bold text-emerald-400">
                        ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity / Tracking Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 mb-3">
                <FiClock />
                <span>Logistical Event History</span>
              </div>
              <div className="space-y-3">
                {order.timeline.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-white">{evt.title}</p>
                      <p className="text-neutral-400">{evt.description}</p>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
