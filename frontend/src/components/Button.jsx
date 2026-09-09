import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 focus:ring-brand-500',
    md: 'text-sm px-5 py-2.5 gap-2 focus:ring-brand-600',
    lg: 'text-base px-7 py-3.5 gap-2.5 focus:ring-brand-700',
  };

  const variantStyles = {
    primary: 'bg-brand-900 text-white hover:bg-brand-950 shadow-soft hover:shadow-premium focus:ring-brand-800',
    emerald: 'bg-brand-700 text-white hover:bg-brand-800 shadow-soft hover:shadow-premium focus:ring-brand-600',
    secondary: 'bg-brand-50 text-brand-900 hover:bg-brand-100 border border-brand-200/80 focus:ring-brand-500',
    outline: 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm focus:ring-slate-400',
    ghost: 'bg-transparent text-slate-700 hover:bg-brand-50/60 hover:text-brand-900 focus:ring-brand-400',
    white: 'bg-white text-brand-950 hover:bg-slate-100 shadow-soft hover:shadow-premium focus:ring-white',
    luxury: 'bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white hover:opacity-95 shadow-premium hover:shadow-glow focus:ring-brand-500',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}
