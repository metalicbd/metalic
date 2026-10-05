import { Cloudinary } from '@cloudinary/url-gen';

// এনভায়রনমেন্ট ভেরিয়েবল (.env) থেকে Cloudinary কনফিগারেশন লোড করা
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'metalic';
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'metalic_unsigned';
export const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '';

// ক্লায়েন্ট-সাইড Cloudinary ইনস্ট্যান্স (নিরাপদে কোনো গোপন সিক্রেট কি উন্মুক্ত না করে)
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME,
  },
  url: {
    secure: true,
  },
});

// লোকাল ডেভেলপমেন্টে সতর্কবার্তা
if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.DEV) {
  console.warn(
    '[Metalic Media] Cloudinary Cloud Name is not configured in .env. Please set VITE_CLOUDINARY_CLOUD_NAME.'
  );
}

export default cld;