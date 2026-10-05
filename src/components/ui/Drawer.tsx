import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'left' | 'bottom';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = 'right',
  className,
}) => {
  // ড্রয়ার ওপেন থাকলে বডি স্ক্রলিং বন্ধ রাখা এবং Escape চাপলে ক্লোজ করা
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ডানপাশ, বামপাশ বা নিচ থেকে আসার পজিশনিং
  const positions = {
    right: 'inset-y-0 right-0 max-w-md w-full border-l border-border',
    left: 'inset-y-0 left-0 max-w-md w-full border-r border-border',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-2xl border-t border-border',
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex overflow-hidden"
    >
      {/* ব্যাকড্রপ */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* স্লাইড-ওভার কন্টেইনার */}
      <div
        className={cn(
          'fixed bg-white shadow-premium flex flex-col z-10 transition-transform duration-300 ease-in-out',
          positions[position],
          className
        )}
      >
        {/* ড্রয়ার হেডার */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
          <h2 className="text-xs sm:text-sm font-bold tracking-widest text-black uppercase font-mono">
            {title || ''}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-100 transition-standard cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ড্রয়ার বডি স্ক্রলেবল এরিয়া — মোবাইলের জন্য অপ্টিমাইজড প্যাডিং ও overflow-x-hidden */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 sm:px-6 py-4">
          {children}
        </div>

        {/* ফুটার */}
        {footer && (
          <div className="p-4 sm:p-6 border-t border-border bg-slate-50/70">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

Drawer.displayName = 'Drawer';
export default Drawer;