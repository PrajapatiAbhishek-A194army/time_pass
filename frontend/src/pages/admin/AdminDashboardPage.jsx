import React, { useState, useEffect } from 'react';
import {
  FiDollarSign,
  FiShoppingBag,
  FiBox,
  FiUsers,
  FiTrendingUp,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronRight,
  FiArrowUpRight,
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import * as adminService from '../../services/adminService';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('monthly'); // 'monthly' | 'weekly'
  const [statusUpdating, setStatusUpdating] = useState({});
  const [updateFeedback, setUpdateFeedback] = useState(null);

  const loadDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminService.fetchAdminDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleStatusChange = async (orderNumber, newStatus) => {
    setStatusUpdating((prev) => ({ ...prev, [orderNumber]: true }));
    try {
      const res = await adminService.updateAdminOrderStatus(orderNumber, newStatus);
      if (res.success) {
        // Update local state instantly
        setData((prev) => ({
          ...prev,
          recentOrders: prev.recentOrders.map((o) =>
            o.orderNumber === orderNumber ? { ...o, status: newStatus } : o
          ),
        }));
        setUpdateFeedback(`Order ${orderNumber} updated to ${newStatus}`);
        setTimeout(() => setUpdateFeedback(null), 3500);
      }
    } catch (err) {
      alert('Could not update order status: ' + (err.message || 'Server error'));
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [orderNumber]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400 font-mono text-sm tracking-widest uppercase">
          Aggregating SoleSphere Intelligence...
        </p>
      </div>
    );
  }

  const { kpis, revenueTimeline, ordersByStatus, topSellingProducts, recentOrders, lowStockAlerts } = data || {};
  const activeTimeline = timeframe === 'monthly' ? revenueTimeline?.monthly : revenueTimeline?.weekly;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast feedback */}
      {updateFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-neutral-950 px-5 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 text-sm border border-emerald-400">
          <FiCheckCircle className="text-lg" />
          <span>{updateFeedback}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-400 font-mono text-xs uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Live Command Intelligence
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Real-time telemetry, revenue velocity, and fulfillment logistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 text-xs font-semibold tracking-wide transition-all shadow-sm disabled:opacity-50"
          >
            <FiRefreshCw className={`text-sm ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* 4 Luxury KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-mono tracking-wider uppercase">Gross Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              <FiDollarSign />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white font-mono tracking-tight">
            ${kpis?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-emerald-400">
            <FiTrendingUp />
            <span>+{kpis?.revenueGrowth}%</span>
            <span className="text-neutral-400 font-normal">vs last cycle</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-60" />
        </div>

        {/* Card 2: Orders */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-mono tracking-wider uppercase">Fulfilled Orders</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-lg">
              <FiShoppingBag />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white font-mono tracking-tight">
            {kpis?.totalOrders?.toLocaleString() || '0'}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-teal-400">
            <FiTrendingUp />
            <span>+{kpis?.ordersGrowth}%</span>
            <span className="text-neutral-400 font-normal">order velocity</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-60" />
        </div>

        {/* Card 3: Footwear Models */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-mono tracking-wider uppercase">Active Catalog</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              <FiBox />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white font-mono tracking-tight">
            {kpis?.totalProducts || 10} Silhouettes
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>100% In Stock & Live</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600 opacity-60" />
        </div>

        {/* Card 4: Customers */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-mono tracking-wider uppercase">Active Collectors</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-lg">
              <FiUsers />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white font-mono tracking-tight">
            {kpis?.totalCustomers?.toLocaleString() || '1,891'}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-cyan-400">
            <FiTrendingUp />
            <span>+{kpis?.customerGrowth}%</span>
            <span className="text-neutral-400 font-normal">registration growth</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-60" />
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Revenue & Sales Velocity</h2>
              <p className="text-xs text-neutral-400">Financial trajectories across verified buyer transactions</p>
            </div>
            {/* Monthly / Weekly toggle */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setTimeframe('monthly')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  timeframe === 'monthly'
                    ? 'bg-emerald-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Monthly Trend
              </button>
              <button
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  timeframe === 'weekly'
                    ? 'bg-emerald-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Weekly Velocity
              </button>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#525252" fontSize={11} tickLine={false} />
                <YAxis stroke="#525252" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#emeraldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Orders Breakdown (1 col) */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Fulfillment Pipeline</h2>
            <p className="text-xs text-neutral-400">Order distribution by logistical state</p>
          </div>

          <div className="h-[240px] w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ordersByStatus?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white font-mono">
                {ordersByStatus?.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
              <span className="text-[10px] uppercase font-mono text-neutral-400">Total Units</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/60">
            {ordersByStatus?.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-neutral-400">{item.name}</span>
                <span className="font-mono font-bold text-neutral-200 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Selling Footwear & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products (2 cols) */}
        <div className="lg:col-span-2 bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Best-Selling Silhouettes</h2>
              <p className="text-xs text-neutral-400">Footwear volume leaders ranked by gross revenue</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Top 5 Performers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Silhouette</th>
                  <th className="pb-3 font-semibold">Units Sold</th>
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {topSellingProducts?.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover bg-neutral-950 border border-neutral-800"
                        />
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <p className="text-xs text-neutral-400">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-neutral-300 font-semibold">{p.unitsSold} pairs</td>
                    <td className="py-3.5 font-mono">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          p.stockRemaining <= 5
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : p.stockRemaining <= 10
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {p.stockRemaining} left
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-right font-bold text-emerald-400">
                      ${p.revenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-amber-400">
              <FiAlertTriangle className="text-lg" />
              <h2 className="text-lg font-bold text-white tracking-tight">Stock Warnings</h2>
            </div>
            <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              &lt; 10 Pairs
            </span>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            Critical inventory thresholds requiring immediate supplier restocking.
          </p>

          <div className="space-y-3 flex-1">
            {lowStockAlerts?.map((alert) => (
              <div
                key={alert.id + alert.size}
                className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={alert.image}
                    alt={alert.name}
                    className="w-10 h-10 rounded-xl object-cover border border-neutral-800"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{alert.name}</p>
                    <p className="text-[11px] text-neutral-400 font-mono">Size: {alert.size}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-lg">
                    {alert.stock} pairs left
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-800 text-center">
            <span className="text-xs text-neutral-400 font-mono">
              Auto-restock triggers configured in Phase 11
            </span>
          </div>
        </div>
      </div>

      {/* Live Recent Orders Feed with Status Management */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Live Order Stream</h2>
            <p className="text-xs text-neutral-400">
              Inspect order consignments and update logistical fulfillment states in real-time
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">Showing 5 Most Recent Dispatch Queues</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">Order ID</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Items</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {recentOrders?.map((ord) => (
                <tr key={ord.id || ord.orderNumber} className="hover:bg-neutral-850/50 transition-colors">
                  <td className="py-4 font-mono font-bold text-emerald-400">
                    {ord.orderNumber}
                  </td>
                  <td className="py-4">
                    <p className="font-semibold text-white">{ord.customerName}</p>
                    <p className="text-xs text-neutral-400 font-mono">{ord.email}</p>
                  </td>
                  <td className="py-4 text-neutral-300 font-mono text-xs">
                    {ord.itemCount} {ord.itemCount === 1 ? 'pair' : 'pairs'}
                  </td>
                  <td className="py-4 font-mono font-bold text-white">
                    ${Number(ord.totalAmount).toFixed(2)}
                  </td>
                  <td className="py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold tracking-wider inline-flex items-center gap-1.5 ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ord.status === 'PROCESSING'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : ord.status === 'SHIPPED'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <select
                      value={ord.status}
                      disabled={statusUpdating[ord.orderNumber]}
                      onChange={(e) => handleStatusChange(ord.orderNumber, e.target.value)}
                      className="bg-neutral-950 border border-neutral-750 text-neutral-200 text-xs font-mono rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
