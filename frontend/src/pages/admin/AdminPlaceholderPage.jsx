import React from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiArrowLeft, FiClock } from 'react-icons/fi';

export default function AdminPlaceholderPage({ title, phase, description }) {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-12 text-center max-w-xl mx-auto my-12">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner">
        <FiLayers />
      </div>
      <div className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 mb-3 border border-neutral-750">
        <FiClock /> Scheduled for {phase}
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-neutral-400 text-sm leading-relaxed mb-8">{description}</p>
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition-all"
      >
        <FiArrowLeft /> Return to Executive Dashboard
      </Link>
    </div>
  );
}
