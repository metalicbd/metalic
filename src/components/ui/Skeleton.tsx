import React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * সাধারণ লোডিং এলিমেন্টের জন্য জেনেরিক স্কেলিটন
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-neutral-200/75',
        className
      )}
      {...props}
    />
  );
};

/**
 * মেটাল পোস্টার কার্ডের জন্য ডেডিকেটেড লোডিং স্কেলিটন
 * (প্রোডাক্ট কার্ডের ১:১ স্কয়ার অ্যাসপেক্ট রেশিও অনুযায়ী তৈরি)
 */
export const PosterCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col space-y-3 w-full bg-white border border-border p-3 rounded-xl shadow-subtle">
      {/* মেটাল পোস্টারের ১:১ স্কয়ার ফ্রেম */}
      <div className="relative w-full aspect-square bg-neutral-200/75 rounded-lg animate-pulse overflow-hidden" />
      
      {/* পোস্টার টাইটেল প্লেসহোল্ডার */}
      <div className="h-4 bg-neutral-200/75 rounded w-3/4 animate-pulse" />
      
      {/* ক্যাটাগরি এবং প্রাইস প্লেসহোল্ডার */}
      <div className="flex items-center justify-between pt-1">
        <div className="h-3.5 bg-neutral-200/75 rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-neutral-200/75 rounded w-1/4 animate-pulse" />
      </div>
    </div>
  );
};

Skeleton.displayName = 'Skeleton';