import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiCalendar, FiShield, FiLogOut, FiPackage, FiHeart } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Badge from '../components/Badge';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Please log in to view your profile.</h2>
        <Button variant="luxury" size="md" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-premium">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 text-white font-black text-2xl flex items-center justify-center shadow-soft">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl text-slate-900">{user.name}</h1>
                <Badge variant="emerald" size="xs">
                  {user.role || 'MEMBER'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<FiLogOut className="w-4 h-4" />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 border-b border-slate-100">
          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-700 shadow-sm">
              <FiMail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Email Address
              </span>
              <span className="text-sm font-semibold text-slate-900">{user.email}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-700 shadow-sm">
              <FiPhone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Phone Number
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {user.phone || 'Not configured'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-700 shadow-sm">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Account Status
              </span>
              <span className="text-sm font-semibold text-emerald-700">Verified Member</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-700 shadow-sm">
              <FiCalendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Member Tier
              </span>
              <span className="text-sm font-semibold text-slate-900">SoleSphere Atelier Gold</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Atelier Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200/80 hover:border-brand-300 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiPackage className="w-5 h-5 text-brand-700" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Order History</h4>
                  <p className="text-xs text-slate-500">Track and manage past shoe drops</p>
                </div>
              </div>
              <span className="text-xs font-bold text-brand-700">Coming Phase 8</span>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 hover:border-brand-300 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiHeart className="w-5 h-5 text-rose-500" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Saved Wishlist</h4>
                  <p className="text-xs text-slate-500">Your favorite silhouettes</p>
                </div>
              </div>
              <span className="text-xs font-bold text-brand-700">Coming Phase 6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
