import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'discount' | 'success' | 'warning';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  className,
  children,
  ...props
}) => {
  // মিনিমালিস্ট বেস ব্যাজ স্টাইল
  const baseStyles =
    'inline-flex items-center justify-center font-semibold tracking-wider uppercase rounded-full select-none transition-standard';

  // পোস্টার ও স্ট্যাটাসের বিভিন্ন ভ্যারিয়েন্ট
  const variants = {
    default: 'bg-primary text-white',
    secondary: 'bg-background-secondary text-primary border border-border',
    outline: 'bg-transparent text-primary border border-border',
    discount: 'bg-error text-white font-bold tracking-normal',
    success: 'bg-emerald-50 text-success border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-normal',
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';