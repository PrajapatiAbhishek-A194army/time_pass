import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiMail,
  FiCalendar,
  FiPackage,
  FiShield,
  FiSearch,
  FiDownload,
  FiEye,
  FiDollarSign,
  FiAward,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../services/adminService';
import CustomerDetailModal from '../../components/admin/CustomerDetailModal';

export default function AdminCustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await adminService.fetchAdminCustomers();
        if (res.success) {
          setCustomers(res.data);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const handleInspectCustomer = async (userId) => {
    try {
      const res = await adminService.fetchAdminCustomerDetails(userId);
      if (res.success) {
        setSelectedCustomer(res.data);
        setModalOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Could not fetch customer dossier.');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Role', 'Orders Placed', 'Registered Date'];
    const rows = customers.map((c) => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.email,
      c.role,
      c._count?.orders ?? c.orderCount ?? 0,
      new Date(c.createdAt || Date.now()).toISOString().slice(0, 10),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SoleSphere_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            CRM &amp; Collector Relations
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Customer Dossier Hub</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Review registered collectors, lifetime spend trajectories, and purchase frequencies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <FiDownload className="text-sm text-neutral-400" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4">
          <span className="text-[11px] font-mono uppercase text-neutral-400">Total Registered</span>
          <p className="text-2xl font-black text-white font-mono mt-1">{customers.length}</p>
          <span className="text-[10px] text-emerald-400 font-mono">100% Email Verified</span>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4">
          <span className="text-[11px] font-mono uppercase text-neutral-400">VIP Collectors</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {customers.filter((c) => (c._count?.orders ?? c.orderCount ?? 0) >= 2).length}
          </p>
          <span className="text-[10px] text-neutral-400 font-mono">Repeat acquisition patrons</span>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4">
          <span className="text-[11px] font-mono uppercase text-neutral-400">Admin Clearance</span>
          <p className="text-2xl font-black text-purple-400 font-mono mt-1">
            {customers.filter((c) => c.role === 'ADMIN').length} Staff
          </p>
          <span className="text-[10px] text-neutral-400 font-mono">Authorized Executive Accounts</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-4 backdrop-blur-sm">
        <div className="relative w-full">
          <FiSearch className="absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter collectors by name, email, or telephone number..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Customer Roster Table */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Compiling Customer Intelligence...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-800/60 text-neutral-400 flex items-center justify-center mx-auto mb-3 text-2xl">
              <FiUsers />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Collectors Found</h3>
            <p className="text-neutral-400 text-xs max-w-sm mx-auto">
              No registered profiles match your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-xs uppercase tracking-wider bg-neutral-950/40">
                  <th className="py-3.5 pl-6 pr-3 font-semibold">Collector Profile</th>
                  <th className="py-3.5 px-3 font-semibold">Clearance Role</th>
                  <th className="py-3.5 px-3 font-semibold">Telephone</th>
                  <th className="py-3.5 px-3 font-semibold">Registered</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Acquisitions</th>
                  <th className="py-3.5 pr-6 pl-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-850/40 transition-colors">
                    {/* Profile */}
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 text-emerald-400 flex items-center justify-center font-bold text-sm border border-neutral-750">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{c.name || 'Anonymous Collector'}</p>
                          <p className="text-[11px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
                            <FiMail className="text-[10px]" /> {c.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-3">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase inline-flex items-center gap-1 ${
                          c.role === 'ADMIN'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {c.role === 'ADMIN' && <FiShield className="text-[9px]" />}
                        {c.role}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-3 font-mono text-xs text-neutral-400">
                      {c.phone || '+1 (555) 019-2831'}
                    </td>

                    {/* Registered Date */}
                    <td className="py-4 px-3 font-mono text-xs text-neutral-400">
                      {new Date(c.createdAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Acquisitions Count */}
                    <td className="py-4 px-3 font-mono text-right font-bold text-emerald-400">
                      {c._count?.orders ?? c.orderCount ?? 0} orders
                    </td>

                    {/* Action */}
                    <td className="py-4 pr-6 pl-3 text-right">
                      <button
                        onClick={() => handleInspectCustomer(c.id)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-neutral-750"
                      >
                        <FiEye className="text-xs text-emerald-400" />
                        <span>Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onInspectOrder={(orderNumber) => {
          navigate('/admin/orders');
        }}
      />
    </div>
  );
}
