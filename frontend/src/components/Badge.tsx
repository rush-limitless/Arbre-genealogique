import React from 'react';
// @ts-nocheck

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md';
}

const variants = {
  success: 'border-emerald-200/50 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/70 dark:text-emerald-100',
  error: 'border-red-200/50 bg-red-50/80 text-red-900 dark:border-red-900/50 dark:bg-red-950/70 dark:text-red-100',
  warning: 'border-amber-200/50 bg-amber-50/80 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/70 dark:text-amber-100',
  info: 'border-[var(--color-line)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  default: 'border-[var(--color-line)] bg-white/40 text-[var(--color-muted)] dark:bg-white/5',
};

const sizes = {
  sm: 'px-2.5 py-1 text-[0.68rem] tracking-[0.16em]',
  md: 'px-3 py-1.5 text-xs tracking-[0.16em]',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border font-semibold uppercase ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
