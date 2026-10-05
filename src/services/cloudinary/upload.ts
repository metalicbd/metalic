import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './config';

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

// সর্বোচ্চ ২০ মেগাবাইট পর্যন্ত হাই-ডেফিনিশন আর্টওয়ার্ক গ্রহণযোগ্য
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; 
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

/**
 * সরাসরি Cloudinary সিকিউর এন্ডপয়েন্টে ইমেজ আপলোড ফাংশন
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'metalic/general'
): Promise<CloudinaryUploadResponse> {
  // ফাইল ফরম্যাট ভ্যালিডেশন
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('শুধুমাত্র JPG, PNG অথবা WEBP ফরম্যাটের ছবি আপলোড করা যাবে।');
  }

  // ফাইল সাইজ ভ্যালিডেশন
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('ছবির সাইজ সর্বোচ্চ ২০ মেগাবাইট (20MB) হতে পারবে।');
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('[Cloudinary Upload Error]:', error);
    throw new Error(error.message || 'ক্লাউডে ছবি আপলোড ব্যর্থ হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।');
  }
}

/**
 * কাস্টমারদের কাস্টম পোস্টার আর্টওয়ার্ক আপলোড হেল্পার
 */
export async function uploadCustomArtwork(
  file: File,
  customerEmail?: string
): Promise<CloudinaryUploadResponse> {
  const folderName = customerEmail
    ? `metalic/custom_orders/${customerEmail.replace(/[^a-zA-Z0-9]/g, '_')}`
    : 'metalic/custom_orders';
  return uploadToCloudinary(file, folderName);
}

/**
 * অ্যাডমিন কর্তৃক প্রোডাক্ট ও পোস্টার ক্যাটালগ ইমেজ আপলোড হেল্পার
 */
export async function uploadProductImage(file: File): Promise<CloudinaryUploadResponse> {
  return uploadToCloudinary(file, 'metalic/products');
}