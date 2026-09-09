import React, { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiCalendar, FiPackage, FiShield } from 'react-icons/fi';
import * as adminService from '../../services/adminService';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Customer Roster</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Registered SoleSphere accounts, order frequencies, and verification privileges.
        </p>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Registered</th>
                <th className="pb-3 font-semibold text-right">Orders Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-850/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-200 flex items-center justify-center font-bold text-sm">
                        {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{c.name || 'Anonymous Collector'}</p>
                        <p className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                          <FiMail /> {c.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold inline-flex items-center gap-1 ${
                        c.role === 'ADMIN'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {c.role === 'ADMIN' && <FiShield />}
                      {c.role}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-neutral-400 text-xs">
                    {new Date(c.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-4 font-mono text-right font-bold text-emerald-400">
                    {c._count?.orders ?? c.orderCount ?? 0} orders
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
