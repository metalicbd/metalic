import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * একাধিক কন্ডিশনাল ক্লাসকে একত্রিত করতে এবং Tailwind CSS-এর 
 * ক্লাসের কনফ্লিক্ট দূর করতে এই ইউটিলিটি ফাংশনটি ব্যবহৃত হয়।
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}