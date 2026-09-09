import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiExternalLink,
  FiLogOut,
  FiMenu,
  FiX,
  FiShield,
  FiClock,
  FiActivity,
  FiLayers,
} from 'react-icons/fi';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { label: 'Executive Dashboard', path: '/admin', icon: FiGrid, badge: 'Live' },
    { label: 'Product Inventory', path: '/admin/products', icon: FiBox, badge: 'Phase 11' },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: FiShoppingBag, badge: '5 Active' },
    { label: 'Customer Roster', path: '/admin/customers', icon: FiUsers },
    { label: 'Revenue Analytics', path: '/admin/analytics', icon: FiBarChart2 },
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-neutral-950">
      {/* Top Notification / System Ticker Bar */}
      <div className="bg-neutral-900/80 border-b border-neutral-800/80 px-4 sm:px-8 py-2 text-xs flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <FiActivity className="text-sm" />
            <span className="font-semibold tracking-wider">CLUSTER ONLINE</span>
          </div>
          <span className="hidden md:inline text-neutral-600">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-neutral-400 font-mono">
            <FiClock />
            <span>{currentTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-neutral-300 hover:text-emerald-400 transition-colors font-medium text-xs bg-neutral-800/60 hover:bg-neutral-800 px-3 py-1 rounded-lg border border-neutral-700/50"
          >
            <span>Live Storefront</span>
            <FiExternalLink className="text-xs" />
          </Link>
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="hidden sm:inline font-mono text-xs text-neutral-300">{user?.name || 'Administrator'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Luxury Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col bg-neutral-950 border-r border-neutral-850 p-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-neutral-800/80">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-neutral-950 text-xl font-extrabold shadow-lg shadow-emerald-500/20">
              <FiLayers />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif tracking-widest uppercase font-bold text-white text-base">SoleSphere</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">HQ</span>
              </div>
              <p className="text-[11px] text-neutral-400 tracking-wide font-mono">EXECUTIVE PORTAL</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-neutral-400 uppercase">Operations</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`text-lg ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-neutral-950/20 text-neutral-950'
                          : item.badge.includes('Phase')
                          ? 'bg-neutral-800 text-neutral-400 border border-neutral-700/60'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Session & Logout Card */}
          <div className="pt-6 mt-auto border-t border-neutral-850">
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-3.5 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[140px]">{user?.name || 'Admin Officer'}</p>
                  <p className="text-[11px] text-neutral-400 font-mono truncate max-w-[140px]">{user?.email}</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-red-400 bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800 transition-colors"
            >
              <FiLogOut />
              <span>Terminate Session</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800 w-full fixed top-[37px] z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold text-sm">
              SS
            </div>
            <span className="font-serif font-bold text-sm tracking-widest text-white">SOLESPHERE HQ</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-800"
          >
            {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 top-[88px] bg-neutral-950/95 z-40 p-6 flex flex-col space-y-3 backdrop-blur-xl animate-fadeIn">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-base font-semibold ${
                    isActive ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-300 bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-xl" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && <span className="text-xs font-mono">{item.badge}</span>}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="mt-6 flex items-center justify-center gap-2 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 font-semibold"
            >
              <FiLogOut />
              <span>Log Out</span>
            </button>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-neutral-950 p-4 sm:p-8 lg:p-10 pt-16 lg:pt-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
