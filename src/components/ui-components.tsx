import React from 'react';
import { cn } from '@/lib/utils';

export function UIButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon,
  ...props
}: any) {
  const variants: any = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-100',
    outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
  };

  const sizes: any = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

export function UICard({ children, className, ...props }: any) {
  return (
    <div
      className={cn('bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function UIBadge({ children, variant = 'default', className }: any) {
  const variants: any = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    indigo: 'bg-indigo-100 text-indigo-700'
  };

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', variants[variant], className)}>
      {children}
    </span>
  );
}
