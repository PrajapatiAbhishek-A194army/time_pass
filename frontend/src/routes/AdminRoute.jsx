import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function AdminRoute({ children }) {
  const { user, loading, login } = useAuth();
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [quickLoginError, setQuickLoginError] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 font-mono text-sm tracking-wider uppercase">
          Verifying Security Clearance...
        </p>
      </div>
    );
  }

  // Handle 1-click demo admin login for instant access
  const handleQuickAdminLogin = async () => {
    setQuickLoginLoading(true);
    setQuickLoginError(null);
    try {
      await login('admin@solesphere.com', 'Admin@2026!');
    } catch (err) {
      setQuickLoginError(err.message || 'Could not authenticate as admin.');
    } finally {
      setQuickLoginLoading(false);
    }
  };

  // If user is authenticated and has ADMIN role, grant access
  if (user && user.role === 'ADMIN') {
    return children;
  }

  // If not admin, render luxury security checkpoint with 1-click demo access
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner">
          <FiShield />
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
          Administrator Command Gate
        </h1>
        <p className="text-neutral-400 text-sm leading-relaxed mb-6">
          Access to the SoleSphere Executive Command Center requires verified staff privileges (<code className="text-emerald-400 font-mono">role: ADMIN</code>).
        </p>

        {quickLoginError && (
          <div className="p-3 mb-6 bg-red-950/50 border border-red-800/60 rounded-xl text-red-300 text-xs text-left">
            {quickLoginError}
          </div>
        )}

        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-2">
            <span>PRE-CONFIGURED DEMO CREDENTIALS</span>
            <span className="text-emerald-400 flex items-center gap-1"><FiCheckCircle /> ACTIVE</span>
          </div>
          <div className="text-sm font-mono text-neutral-200">
            <span className="text-neutral-500">EMAIL:</span> admin@solesphere.com
          </div>
          <div className="text-sm font-mono text-neutral-200">
            <span className="text-neutral-500">KEY:</span> Admin@2026!
          </div>
        </div>

        <button
          onClick={handleQuickAdminLogin}
          disabled={quickLoginLoading}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
        >
          {quickLoginLoading ? (
            <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FiLock className="text-base" /> Authenticate as Admin
            </>
          )}
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <FiArrowLeft /> Return to Storefront
        </Link>
      </div>
    </div>
  );
}
