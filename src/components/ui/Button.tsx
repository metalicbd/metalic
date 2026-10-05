import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // মিনিমালিস্ট বেস স্টাইলিং ও টাচ ফিডব্যাক
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-standard focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    // মেটালিক ব্র্যান্ডের ৫টি কালার ভ্যারিয়েন্ট
    const variants = {
      primary: 'bg-primary text-white hover:bg-neutral-800 shadow-sm',
      secondary: 'bg-background-secondary text-primary hover:bg-[#EAEAEA] border border-border',
      outline: 'bg-transparent text-primary border border-border hover:bg-background-secondary',
      ghost: 'bg-transparent text-primary hover:bg-background-secondary',
      danger: 'bg-error text-white hover:bg-red-700 shadow-sm',
    };

    // মোবাইল ও ডেস্কটপ সাইজ
    const sizes = {
      sm: 'h-9 px-3 text-xs gap-1.5',
      md: 'h-11 px-5 text-sm gap-2',
      lg: 'h-12 px-7 text-base gap-2.5',
      icon: 'h-10 w-10 p-0',
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        )}
        {!isLoading && leftIcon && (
          <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';