import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
}) => {
  // মোডাল ওপেন থাকলে পেজ স্ক্রলিং বন্ধ রাখা এবং Escape কী চাপলে ক্লোজ করা
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
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

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto overflow-x-hidden"
    >
      {/* ব্যাকড্রপ ও হালকা ব্লার এফেক্ট */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* মোডাল কনটেন্ট বক্স — পিসির স্টাইল অক্ষুণ্ণ রেখে মোবাইলে স্ক্রিনের ভেতর সম্পূর্ণ সুরক্ষিত */}
      <div
        className={cn(
          'relative w-full max-h-[88vh] sm:max-h-[90vh] bg-white border border-border rounded-2xl sm:rounded-3xl shadow-premium z-10 flex flex-col my-auto transition-all duration-200 ease-out overflow-hidden',
          maxWidths[maxWidth],
          className
        )}
      >
        {/* হেডার (টাইটেল এবং ক্লোজ বাটন) */}
        {(title || onClose) && (
          <div className="flex items-start justify-between px-5 sm:px-6 pt-4 sm:pt-6 pb-2.5 sm:pb-3 border-b border-border/80 shrink-0">
            <div>
              {title && (
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-primary uppercase font-sans">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-[10.5px] sm:text-xs text-muted mt-0.5 leading-snug">
                  {description}
                </p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-muted hover:text-primary hover:bg-background-secondary transition-colors cursor-pointer shrink-0 -mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* বডি কনটেন্ট — স্ক্রলেবল এরিয়া */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-left">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

Modal.displayName = 'Modal';
export default Modal;