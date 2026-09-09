import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';
import * as adminService from '../../services/adminService';
import OrderDetailModal from '../../components/admin/OrderDetailModal';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Consignments' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Dispatched' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.fetchAdminOrders({
        status: activeTab !== 'ALL' ? activeTab : undefined,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setOrders(res.data);
        setCounts(res.counts || {});
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleInspect = async (orderNumber) => {
    try {
      const res = await adminService.fetchAdminOrderDetails(orderNumber);
      if (res.success) {
        setSelectedOrder(res.data);
        setModalOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Could not load order details.');
    }
  };

  const handleUpdateFulfillment = async (orderNumber, data) => {
    const res = await adminService.updateAdminOrderFulfillment(orderNumber, data);
    if (res.success) {
      showToast(`Consignment #${orderNumber} updated to ${res.data.status}`);
      // Refresh current list and selected order
      loadOrders();
      setSelectedOrder(res.data);
    }
  };

  const handleExportOrdersCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Date', 'Customer', 'Email', 'Total Amount', 'Status', 'Payment Method', 'Carrier', 'Tracking ID'];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toISOString().slice(0, 10),
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      o.email || '',
      o.totalAmount,
      o.status,
      `"${o.paymentMethod || 'Stripe'}"`,
      `"${o.carrier || ''}"`,
      o.trackingNumber || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SoleSphere_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported orders CSV successfully.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-neutral-950 px-5 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 text-sm border border-emerald-400">
          <FiCheckCircle className="text-lg" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Consignment &amp; Dispatch Logistics
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Order Fulfillment</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Track customer acquisitions, assign courier waybills, and trigger Brevo dispatch notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportOrdersCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <FiDownload className="text-sm text-neutral-400" />
            <span>Export Orders</span>
          </button>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <FiRefreshCw className={`text-sm ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Status Pills / Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-850 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const countKey = tab.key.toLowerCase();
          const count = counts[countKey] ?? (tab.key === 'ALL' ? counts.all : 0);

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800'
              }`}
            >
              <span>{tab.label}</span>
              {typeof count === 'number' && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Toolbar */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-4 backdrop-blur-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <FiSearch className="absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # (e.g. SS-2026-928174), customer name, email, or tracking ID..."
            className="w-full pl-10 pr-24 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-4 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Data Table */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Retrieving Logistics Manifest...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-800/60 text-neutral-400 flex items-center justify-center mx-auto mb-3 text-2xl">
              <FiShoppingBag />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Orders Found</h3>
            <p className="text-neutral-400 text-xs max-w-sm mx-auto mb-4">
              No consignments match the selected status filter or search parameters.
            </p>
            <button
              onClick={() => {
                setActiveTab('ALL');
                setSearch('');
              }}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold"
            >
              Show All Orders
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-xs uppercase tracking-wider bg-neutral-950/40">
                  <th className="py-3.5 pl-6 pr-3 font-semibold">Order Reference</th>
                  <th className="py-3.5 px-3 font-semibold">Collector</th>
                  <th className="py-3.5 px-3 font-semibold">Footwear Enclosed</th>
                  <th className="py-3.5 px-3 font-semibold">Total Amount</th>
                  <th className="py-3.5 px-3 font-semibold">Status</th>
                  <th className="py-3.5 px-3 font-semibold">Courier Logistics</th>
                  <th className="py-3.5 pr-6 pl-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {orders.map((o) => (
                  <tr key={o.orderNumber} className="hover:bg-neutral-850/40 transition-colors">
                    {/* Order Reference */}
                    <td className="py-4 pl-6 pr-3">
                      <button
                        onClick={() => handleInspect(o.orderNumber)}
                        className="font-mono font-bold text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1.5"
                      >
                        <span>{o.orderNumber}</span>
                      </button>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-3">
                      <p className="font-semibold text-white text-xs">{o.customerName}</p>
                      <p className="text-[11px] text-neutral-400 font-mono truncate max-w-[160px]">{o.email}</p>
                    </td>

                    {/* Footwear items preview */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        {o.items?.[0]?.image && (
                          <img
                            src={o.items[0].image}
                            alt="Footwear preview"
                            className="w-9 h-9 rounded-lg object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                          />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-neutral-200 truncate max-w-[150px]">
                            {o.items?.[0]?.name || 'Luxury Footwear'}
                          </p>
                          <p className="text-[10px] text-neutral-500 font-mono">
                            {o.items?.length > 1 ? `+${o.items.length - 1} more item(s)` : `${o.items?.[0]?.size || 'US 10'} (${o.items?.[0]?.color || 'Core'})`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-4 px-3 font-mono">
                      <div className="font-bold text-white text-sm">
                        ${Number(o.totalAmount).toFixed(2)}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                        {o.paymentStatus || 'PAID'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : o.status === 'SHIPPED'
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                            : o.status === 'PROCESSING'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : o.status === 'CANCELLED'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{o.status}</span>
                      </span>
                    </td>

                    {/* Logistics Courier / Tracking */}
                    <td className="py-4 px-3">
                      {o.trackingNumber ? (
                        <div>
                          <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                            <FiTruck className="text-emerald-400" />
                            <span>{o.carrier || 'FedEx'}</span>
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[140px] block">
                            {o.trackingNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-neutral-500 italic">
                          Awaiting Waybill
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 pl-3 text-right">
                      <button
                        onClick={() => handleInspect(o.orderNumber)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-neutral-750"
                      >
                        <FiEye className="text-xs text-emerald-400" />
                        <span>Fulfill</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onUpdateFulfillment={handleUpdateFulfillment}
      />
    </div>
  );
}
