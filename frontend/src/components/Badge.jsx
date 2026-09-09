import React from 'react';

export default function Badge({
  children,
  variant = 'brand',
  size = 'sm',
  className = '',
  icon,
}) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full uppercase tracking-wider select-none';

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const variantStyles = {
    brand: 'bg-brand-50 text-brand-800 border border-brand-200/70',
    emerald: 'bg-brand-700 text-white shadow-sm',
    accent: 'bg-brand-500 text-white font-bold shadow-sm',
    dark: 'bg-brand-950 text-white border border-brand-800',
    light: 'bg-white text-slate-800 border border-slate-200 shadow-sm',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size] || sizeStyles.sm} ${variantStyles[variant] || variantStyles.brand} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
