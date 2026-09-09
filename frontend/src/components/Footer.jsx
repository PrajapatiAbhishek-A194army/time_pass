import React, { useState } from 'react';
import {
  FiArrowRight,
  FiCheck,
  FiShield,
  FiTruck,
  FiRotateCcw,
  FiGlobe,
} from 'react-icons/fi';
import {
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaDiscord,
} from 'react-icons/fa';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  const footerLinks = {
    collections: [
      { name: 'Apex Carbon Series', href: '#featured' },
      { name: 'Performance Running', href: '#categories' },
      { name: 'Streetwear & High-Tops', href: '#categories' },
      { name: 'Court Classics', href: '#categories' },
      { name: 'All-Terrain Trail', href: '#categories' },
      { name: 'Release Calendar', href: '#featured' },
    ],
    clientService: [
      { name: 'Track Order', href: '#orders' },
      { name: 'Shipping & Delivery', href: '#shipping' },
      { name: '30-Day Returns & Exchanges', href: '#returns' },
      { name: 'Comprehensive Size Guide', href: '#sizes' },
      { name: 'Product Authenticity Check', href: '#authentic' },
      { name: 'Customer Concierge', href: '#contact' },
    ],
    brandLab: [
      { name: 'SoleSphere Atelier', href: '#story' },
      { name: 'Carbon Plate Engineering', href: '#tech' },
      { name: 'Sustainable Ocean Polymers', href: '#sustainability' },
      { name: 'Athlete Partnerships', href: '#athletes' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press & Media', href: '#press' },
    ],
  };

  return (
    <footer className="bg-brand-950 text-slate-300 pt-16 pb-12 border-t border-brand-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-brand-900 text-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-900/80 flex items-center justify-center text-brand-400">
              <FiTruck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free Express Shipping</h4>
              <p className="text-xs text-slate-400">On all orders over $150</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-900/80 flex items-center justify-center text-brand-400">
              <FiRotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">30-Day Wear Trial</h4>
              <p className="text-xs text-slate-400">Risk-free returns worldwide</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-900/80 flex items-center justify-center text-brand-400">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Verified Authentic</h4>
              <p className="text-xs text-slate-400">Serialized atelier seal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-900/80 flex items-center justify-center text-brand-400">
              <FiGlobe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Sustainable Footprint</h4>
              <p className="text-xs text-slate-400">Circular materials mission</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-brand-900">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center text-white font-black text-xl">
                  S
                </div>
                <span className="font-display font-black text-2xl tracking-tight text-white">
                  Sole<span className="text-brand-400">Sphere</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
                Engineered at the intersection of haute couture aesthetics and Olympic-caliber propulsion. 
                SoleSphere redefines the modern sneaker paradigm.
              </p>
            </div>

            {/* Socials */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Join the SoleSphere Collective
              </h5>
              <div className="flex items-center gap-3">
                <a
                  href="#instagram"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-brand-900 hover:bg-brand-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <FaInstagram className="w-4 h-4" />
                </a>
                <a
                  href="#twitter"
                  aria-label="Twitter"
                  className="w-9 h-9 rounded-full bg-brand-900 hover:bg-brand-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <FaTwitter className="w-4 h-4" />
                </a>
                <a
                  href="#youtube"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-brand-900 hover:bg-brand-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <FaYoutube className="w-4 h-4" />
                </a>
                <a
                  href="#discord"
                  aria-label="Discord"
                  className="w-9 h-9 rounded-full bg-brand-900 hover:bg-brand-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <FaDiscord className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Links 1: Collections */}
          <div>
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">
              Collections
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {footerLinks.collections.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2: Client Service */}
          <div>
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">
              Client Care
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {footerLinks.clientService.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 3: Innovation */}
          <div>
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">
              Innovation & Atelier
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {footerLinks.brandLab.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Payment Systems */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} SoleSphere Inc. Engineered with precision. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-300 transition">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-slate-300 transition">Terms of Service</a>
            <span>•</span>
            <a href="#cookies" className="hover:text-slate-300 transition">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
