import { CLOUDINARY_CLOUD_NAME } from './config';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'limit' | 'scale' | 'fit';
  quality?: 'auto' | 'auto:good' | 'auto:eco' | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
}

/**
 * যেকোনো ইমেজকে ক্লাউডিনারি থেকে কাটাকাটি ছাড়া ১০০% অরিজিনাল রূপে লোড করার নিরাপদ ফাংশন
 * (এখানে crop: 'fill' পুরোপুরি নিষিদ্ধ করা হয়েছে যাতে ছবির কোনো অংশ না কাটে)
 */
export function getOptimizedImageUrl(
  source: string,
  options: ImageTransformOptions = {}
): string {
  if (!source) return '';

  // লোকাল বা নন-ক্লাউডিনারি ছবি হলে সরাসরি রিটার্ন করা
  if (!source.includes('cloudinary.com') && !source.startsWith('metalic/')) {
    return source;
  }

  const {
    width,
    quality = 'auto',
    format = 'auto',
  } = options;

  // ছবির কোনো অংশ না কেটে শুধু কোয়ালিটি এবং ফরম্যাট অপ্টিমাইজ করা
  // c_limit নিশ্চিত করে যে ছবি কখনো কাটা পড়বে না (No Cropping)
  const transforms: string[] = [`f_${format}`, `q_${quality}`];

  if (width) {
    transforms.push(`w_${width}`, 'c_limit');
  }

  const transformString = transforms.join(',');

  // যদি সরাসরি সম্পূর্ণ ক্লাউডিনারি URL হয়
  if (source.includes('res.cloudinary.com')) {
    // আগের ভুল ট্রান্সফরমেশন থাকলে তা রিপ্লেস করা
    return source.replace(/\/upload\/(?:[a-zA-Z0-9_,:]+\/)?/, `/upload/${transformString}/`);
  }

  // যদি শুধুমাত্র public_id হয়
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}/${source}`;
}

/**
 * ক্যাটালগ ও কার্ডের জন্য ছবি (কোনো অংশ কাটা ছাড়া অরিজিনাল সম্পূর্ণ ছবি)
 */
export function getPosterThumbnailUrl(source: string): string {
  return getOptimizedImageUrl(source, {
    width: 800,
    quality: 'auto:good',
    format: 'auto',
  });
}

/**
 * ডিটেইলস পেজ ও ফুলস্ক্রিন জুমের জন্য হাই-রেজোলিউশন ছবি (কোনো অংশ কাটা ছাড়া)
 */
export function getPosterDetailUrl(source: string): string {
  return getOptimizedImageUrl(source, {
    width: 1600,
    quality: 'auto:good',
    format: 'auto',
  });
}

/**
 * ব্যানার ও হিরো ইমেজের অপ্টিমাইজেশন
 */
export function getBannerUrl(source: string): string {
  return getOptimizedImageUrl(source, {
    width: 1920,
    quality: 'auto',
    format: 'auto',
  });
}