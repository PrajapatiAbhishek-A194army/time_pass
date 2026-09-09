import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FiArrowRight,
  FiZap,
  FiShield,
  FiTruck,
  FiStar,
  FiCheck,
  FiActivity,
  FiFeather,
  FiTrendingUp,
} from 'react-icons/fi';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, PRODUCTS, TESTIMONIALS, BRAND_PERKS } from '../data/mockProducts';

export default function LandingPage({ onAddToCart, onToggleWishlist }) {
  // Use context if provided via router outlet, or fallback to direct props
  const context = useOutletContext();
  const handleAddToCart = onAddToCart || context?.onAddToCart;
  const handleToggleWishlist = onToggleWishlist || context?.onToggleWishlist;

  const [activeTab, setActiveTab] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const tabs = ['All', 'Performance Running', 'Streetwear & High-Tops', 'Court Classics'];

  const filteredProducts = activeTab === 'All'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeTab);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus({ error: true, message: 'Please provide a valid email address.' });
      return;
    }
    setNewsletterStatus({ error: false, message: 'Welcome to the SoleSphere Atelier. 15% discount code sent!' });
    setNewsletterEmail('');
    setTimeout(() => setNewsletterStatus(null), 6000);
  };

  return (
    <div className="w-full">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDF4]/70 via-[#F8FAF9] to-white pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-10 w-72 h-72 bg-brand-300/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              {/* Drop Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider mb-6">
                <FiZap className="w-3.5 h-3.5 text-brand-600 animate-bounce" />
                <span>Spring/Summer 2026 Collection</span>
              </div>

              {/* Headline */}
              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-6xl text-slate-900 tracking-tight leading-[1.08] mb-6">
                Engineered For <br />
                <span className="bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 bg-clip-text text-transparent">
                  Supremacy.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
                Where Olympic-caliber carbon propulsion technology converges with bespoke Italian craftsmanship. 
                Experience unprecedented energy return with zero compromise on luxury aesthetics.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
                <Button
                  variant="luxury"
                  size="lg"
                  icon={<FiArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() => {
                    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto"
                >
                  Explore Collection
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto"
                >
                  Atelier Craftsmanship
                </Button>
              </div>

              {/* Social Proof Strip */}
              <div className="pt-6 border-t border-slate-200/80 w-full flex items-center gap-6">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="Athlete"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                    alt="Runner"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                    alt="Sneakerhead"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-xs font-bold text-slate-900 ml-1">4.9/5</span>
                  </div>
                  <span className="text-xs text-slate-500">Over 15,000+ elite athletes & collectors</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Flagship Sneaker Showcase */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Visual Spotlight Container */}
              <div className="relative w-full max-w-lg aspect-square rounded-3xl bg-gradient-to-tr from-brand-900 via-brand-800 to-brand-700 p-1 shadow-2xl flex items-center justify-center group">
                <div className="w-full h-full bg-[#0A1D13] rounded-[22px] overflow-hidden relative flex items-center justify-center p-6">
                  {/* Internal Glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.2),transparent_70%)] pointer-events-none" />

                  {/* Flagship Sneaker Image */}
                  <img
                    src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80"
                    alt="Apex Carbon Velocity Pro Flagship Drop"
                    className="relative z-10 w-full h-auto object-cover transform -rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all duration-700 ease-out drop-shadow-2xl"
                  />

                  {/* Floating Spec 1: Carbon WavePlate */}
                  <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/40 shadow-premium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                        Full Carbon WavePlate™
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">100% Stiffness Energy Return</span>
                  </div>

                  {/* Floating Spec 2: Featherweight */}
                  <div className="absolute bottom-6 right-6 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/40 shadow-premium">
                    <div className="flex items-center gap-2">
                      <FiFeather className="w-3.5 h-3.5 text-brand-700" />
                      <span className="text-[11px] font-bold text-slate-900">
                        185g Ultralight
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">Nitrogen-Infused AeroFoam</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRAND PROMISE / PERKS STRIP */}
      <section className="bg-white py-8 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BRAND_PERKS.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 shrink-0">
                  <FiCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">{perk.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{perk.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SHOWCASE */}
      <section id="categories" className="py-16 sm:py-24 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="luxury-badge mb-3">Architected For Purpose</span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Curated Silhouettes
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base max-w-md mt-4 md:mt-0">
              Each discipline requires distinct geometry. Explore precision silhouettes tailored for competition, city, and trail.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.name);
                  document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative cursor-pointer h-96 rounded-3xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-premium transition-all duration-300"
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-300 mb-1">
                    {cat.itemCount}
                  </span>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white mb-2 leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-4 opacity-90">
                    {cat.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-300 group-hover:text-white transition-colors">
                    <span>Explore Models</span>
                    <FiArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED SNEAKERS & TABBED CATALOG */}
      <section id="featured" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="luxury-badge mb-3">Atelier Drops</span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Featured Sneakers
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 mt-6 md:mt-0 no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-brand-900 text-white shadow-soft'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. BRAND STORY & ATELIER CRAFTSMANSHIP */}
      <section id="story" className="py-20 sm:py-28 bg-[#0B2519] text-white relative overflow-hidden">
        {/* Subtle radial light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Editorial Visual */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-brand-800">
                <img
                  src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80"
                  alt="SoleSphere Atelier Craftsmanship"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-brand-950/90 backdrop-blur-md p-5 rounded-2xl border border-brand-700 shadow-premium max-w-xs">
                <div className="text-3xl font-black text-brand-400 font-display mb-1">+48%</div>
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Kinetic Energy Return
                </div>
                <div className="text-[11px] text-slate-400">
                  Validated against standard EVA foam in biomechanical laboratory trials.
                </div>
              </div>
            </div>

            {/* Right Story Description */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-800 text-brand-300 mb-4 border border-brand-700">
                The SoleSphere Philosophy
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight mb-6 leading-tight">
                Crafted in Milan. <br />
                Proven on Asphalt.
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-8">
                We reject the distinction between performance utility and high design. Every SoleSphere shoe begins in our Northern Italian design atelier, sculpted from buttery full-grain leathers and fused to aerospace-grade composite carbon plates.
              </p>

              {/* Key Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-8">
                <div className="border-l-2 border-brand-500 pl-4">
                  <h4 className="font-display font-bold text-lg text-white mb-1">
                    Bespoke Lasting
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sculpted over hand-carved beechwood lasts for anatomical arch contouring.
                  </p>
                </div>

                <div className="border-l-2 border-brand-500 pl-4">
                  <h4 className="font-display font-bold text-lg text-white mb-1">
                    Circular Chemistry
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Midsole components derived from non-food castor bean oil and recycled ocean polymers.
                  </p>
                </div>
              </div>

              <Button
                variant="white"
                size="md"
                onClick={() => {
                  document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Atelier Releases
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS */}
      <section id="reviews" className="py-16 sm:py-24 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="luxury-badge mb-3">Athletes & Collectors</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight mb-4">
              Voices of the Collective
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Real world impressions from the marathoners, creative directors, and purists who put our shoes to the test.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <FiStar key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic mb-6">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author info */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-100"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.role}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                      <FiCheck className="w-3 h-3" /> Verified: {t.verifiedPurchase}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. VIP DROP ACCESS / NEWSLETTER */}
      <section id="newsletter" className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 p-8 sm:p-14 text-white overflow-hidden shadow-2xl border border-brand-700">
            {/* Background Glow */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-800 text-brand-300 mb-4 border border-brand-600">
                VIP Access Only
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mb-4">
                Never Miss a Limited Drop.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
                Subscribe for private invitations to numbered atelier drops, secret archives, and receive 15% off your maiden acquisition.
              </p>

              {/* Form */}
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white/15 transition-all"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-full bg-white text-brand-950 font-bold text-sm hover:bg-slate-100 active:scale-98 transition-all shadow-soft shrink-0"
                >
                  Join Collective
                </button>
              </form>

              {/* Feedback Alert */}
              {newsletterStatus && (
                <div
                  className={`mt-4 text-xs font-semibold px-4 py-2 rounded-full inline-block ${
                    newsletterStatus.error
                      ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                      : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                  }`}
                >
                  {newsletterStatus.message}
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-4">
                We respect your privacy. Unsubscribe seamlessly at any time with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL HIGH-IMPACT CTA */}
      <section className="bg-[#F8FAF9] py-16 text-center border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-900 tracking-tight mb-6">
            Elevate Every Step.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Discover footwear engineered without compromise. Step into the future with SoleSphere.
          </p>
          <Button
            variant="luxury"
            size="lg"
            icon={<FiArrowRight className="w-4 h-4" />}
            iconPosition="right"
            onClick={() => {
              document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Shop The Entire Atelier
          </Button>
        </div>
      </section>
    </div>
  );
}
