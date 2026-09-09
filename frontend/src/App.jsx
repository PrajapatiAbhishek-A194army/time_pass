import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FiCheckCircle, FiServer, FiLayers, FiDatabase, FiShield, FiArrowRight } from 'react-icons/fi';

function FoundationHome() {
  const [apiHealth, setApiHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setApiHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('API health check error (expected if backend offline):', err);
        setApiHealth({ status: 'offline', message: 'Backend not running or proxy not connected' });
        setLoading(false);
      });
  }, []);

  const foundations = [
    {
      icon: <FiLayers className="w-5 h-5 text-brand-700" />,
      title: 'Frontend Architecture',
      desc: 'React 18 + Vite with Tailwind CSS (Green & White luxury theme tokens) and React Router.',
      status: 'Ready',
    },
    {
      icon: <FiServer className="w-5 h-5 text-brand-700" />,
      title: 'Backend API Foundation',
      desc: 'Express.js modular structure, global error handling, Morgan logging, and CORS.',
      status: 'Ready',
    },
    {
      icon: <FiDatabase className="w-5 h-5 text-brand-700" />,
      title: 'PostgreSQL & Prisma ORM',
      desc: 'Complete relational domain models: Users, Products, Categories, Inventory, Orders, Cart, Wishlist.',
      status: 'Ready',
    },
    {
      icon: <FiShield className="w-5 h-5 text-brand-700" />,
      title: 'Security & Environment',
      desc: 'Protected .env configuration, .gitignore rules, and zero secrets committed.',
      status: 'Ready',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-800 to-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              S
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900">
                Sole<span className="text-brand-600">Sphere</span>
              </span>
              <span className="block text-[10px] tracking-widest uppercase font-semibold text-slate-400">
                Luxury Footwear
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-brand-800">
                Phase 1: Project Foundation Verified
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="luxury-badge mb-4">Foundation Complete</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Production-Grade Footwear Platform <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 bg-clip-text text-transparent">
              Engineered for Scale
            </span>
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            SoleSphere architecture initialized with React, Vite, Node.js, Express, PostgreSQL, and Prisma ORM.
            Prepared for Phase 2: Landing Page & Design System.
          </p>
        </div>

        {/* Foundation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {foundations.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    {item.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Backend API Connectivity Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-900">Backend API Status Check</h4>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  GET /api/health
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Vite proxy forwards <code className="text-brand-700 font-semibold">/api/*</code> requests directly to Express port 5000.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {loading ? (
                <div className="text-xs text-slate-500 animate-pulse">Checking endpoint...</div>
              ) : apiHealth?.status === 'healthy' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <FiCheckCircle className="w-4 h-4" />
                  API Online: {apiHealth.platform}
                </div>
              ) : (
                <div className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                  {apiHealth?.message || 'Ready to connect'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} SoleSphere Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Phase 1 — Project Foundation</span>
            <span>•</span>
            <span className="text-brand-700 font-semibold">Ready for Phase 2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FoundationHome />} />
      </Routes>
    </Router>
  );
}

export default App;
