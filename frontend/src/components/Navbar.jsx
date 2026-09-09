import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiArrowRight,
  FiZap,
  FiLogOut,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  cartCount = 2,
  wishlistCount = 3,
  onOpenCart,
  onOpenWishlist,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'All Footwear', href: '/catalog', isRoute: true },
    { name: 'Featured Drops', href: '/catalog?sort=featured', isRoute: true },
    { name: 'Running', href: '/catalog?category=performance-running', isRoute: true },
    { name: 'Streetwear', href: '/catalog?category=streetwear', isRoute: true },
    { name: 'Craftsmanship', href: '/#story', isRoute: false },
    { name: 'Reviews', href: '/#reviews', isRoute: false },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-brand-950 text-white text-[11px] sm:text-xs font-medium py-2 px-4 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-brand-400 font-semibold uppercase tracking-wider text-[10px]">
              <FiZap className="w-3 h-3 animate-pulse" /> Drop Alert
            </span>
            <span>Apex Carbon Velocity Pro now live in limited quantities.</span>
          </div>

          <div className="w-full sm:w-auto text-center flex items-center justify-center gap-4 mx-auto sm:mx-0">
            <span>Free Express Worldwide Shipping Over $150</span>
            <span className="hidden md:inline text-brand-700">•</span>
            <span className="hidden md:inline text-slate-300">30-Day Risk-Free Trial</span>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-slate-300 text-[11px]">
            <a href="#newsletter" className="hover:text-white transition-colors">VIP Access</a>
            <span>•</span>
            <a href="#support" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-soft border-b border-slate-200/80 py-3'
            : 'bg-white/95 backdrop-blur-sm border-b border-slate-100 py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Mobile Menu"
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 flex items-center justify-center text-white shadow-soft group-hover:shadow-premium transition-all duration-300 group-hover:scale-105">
                <span className="font-display font-extrabold text-xl tracking-tighter">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                  Sole<span className="text-brand-600">Sphere</span>
                </span>
                <span className="text-[9px] tracking-[0.25em] font-bold text-slate-400 uppercase mt-0.5">
                  Atelier & Sport
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-semibold text-slate-700 hover:text-brand-700 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 hover:after:w-full after:transition-all after:duration-200"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold text-slate-700 hover:text-brand-700 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 hover:after:w-full after:transition-all after:duration-200"
                >
                  {link.name}
                </a>
              )
            )}
          </nav>

          {/* Right: Actions (Search, Wishlist, Cart, Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search sneakers"
              className="p-2 sm:p-2.5 rounded-full text-slate-700 hover:text-brand-800 hover:bg-brand-50 transition-all active:scale-95"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              aria-label="Wishlist"
              className="relative p-2 sm:p-2.5 rounded-full text-slate-700 hover:text-brand-800 hover:bg-brand-50 transition-all active:scale-95"
            >
              <FiHeart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              aria-label="Shopping Bag"
              className="relative p-2 sm:p-2.5 rounded-full text-slate-700 hover:text-brand-800 hover:bg-brand-50 transition-all active:scale-95"
            >
              <FiShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account / User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-brand-50 hover:bg-brand-100/80 border border-brand-200/60 text-brand-900 text-xs font-bold transition-all active:scale-95"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-800 text-white flex items-center justify-center text-[11px] font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[90px] truncate hidden sm:inline">{user.name}</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-premium border border-slate-200/80 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-900 transition"
                    >
                      <FiUser className="w-3.5 h-3.5" />
                      <span>Atelier Profile</span>
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 transition border-y border-emerald-100/60"
                      >
                        <FiShield className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <FiLogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Account Profile"
                className="hidden sm:flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-brand-50 hover:bg-brand-100/80 border border-brand-200/60 text-brand-900 text-xs font-bold transition-all active:scale-95"
              >
                <div className="w-6 h-6 rounded-full bg-brand-700 text-white flex items-center justify-center text-[11px]">
                  <FiUser className="w-3.5 h-3.5" />
                </div>
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-8 animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto relative flex items-center">
              <FiSearch className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by sneaker model, silhouette, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-10 py-3 bg-[#F5F8F6] border border-slate-200 rounded-full text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 animate-slideRight">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <span className="font-display font-extrabold text-lg text-slate-900">
                    Sole<span className="text-brand-600">Sphere</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between text-base font-bold text-slate-800 hover:text-brand-700 py-2"
                  >
                    <span>{link.name}</span>
                    <FiArrowRight className="w-4 h-4 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-brand-800 text-white font-bold flex items-center justify-center">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs text-center hover:bg-slate-200 transition"
                  >
                    My Atelier Profile
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs text-center hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <FiShield className="text-sm" />
                      <span>Admin Executive Portal</span>
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      navigate('/');
                    }}
                    className="w-full py-2 rounded-full text-rose-600 font-semibold text-xs text-center hover:bg-rose-50 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-full bg-brand-900 text-white font-bold text-sm text-center shadow-soft hover:bg-brand-950 transition"
                >
                  Sign In to SoleSphere
                </Link>
              )}
              <p className="text-[11px] text-center text-slate-500">
                Complimentary shipping on orders $150+
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
