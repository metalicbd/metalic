export type PosterDimension = '20 × 30 cm' | '30 × 20 cm';
export type PosterOrientation = 'portrait' | 'landscape';
export type PosterFinish = 'High Gloss Metallic' | 'Matte Steel';
export type PosterImageRatio = '1:1' | '4:5';

/**
 * মেটাল পোস্টারের ফিজিক্যাল স্পেসিফিকেশন
 */
export interface PosterSpecifications {
  dimensions: PosterDimension; // '20 × 30 cm' অথবা '30 × 20 cm'
  thickness: '1 mm'; // ১ মিমি হাই-ডেনসিটি স্টিল
  material: string; // 'Industrial Grade Rust-Proof Steel'
  mounting: string; // '3 Pieces of Heavy-Duty Nano Tape Included (No Drilling Required)'
  imageRatio: PosterImageRatio; // ১:১ স্কয়ার অথবা ৪:৫ রেশিও
  weight?: string;
}

/**
 * মেটালিক পোস্টার প্রোডাক্টের মূল ইন্টারফেস
 * (হিরোর জন্য নির্দিষ্ট ছবি বাছাই করার heroCustomImage সহ)
 */
export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  featuredImage: string; // মূল ছবি
  gallery: string[]; // সব গ্যালারি ছবিসমূহ
  dimensions: PosterDimension; 
  orientation?: PosterOrientation; // ফিক্সড: WishlistPage এবং productService-এর জন্য যুক্ত করা হলো
  thickness: '1 mm';
  finish: PosterFinish;
  specifications: PosterSpecifications;
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  sortOrder?: number; // ১, ২, ৩ নাম্বারিং র্যাঙ্ক
  isFeatured: boolean;
  showInHero?: boolean; // হিরো সেকশনে প্রদর্শন করার সুইচ
  heroCustomImage?: string; // অ্যাডমিনের বিশেষভাবে নির্বাচিত হিরো ছবির URL
  showInHomepage?: boolean; // হোমপেজে প্রদর্শন করার সুইচ
  isNewArrival?: boolean; // NEW ব্যাজ
  isBestSeller?: boolean; // BEST SELLER ব্যাজ
  tags: string[];
  rating: number; // স্টার রেটিং
  reviewCount: number; // রিভিউ সংখ্যা
  createdAt: any;
  updatedAt: any;
}

/**
 * পোস্টার ক্যাটাগরি ইন্টারফেস
 */
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  productCount?: number;
}

/**
 * ফিল্টারিং ও সার্চ অপশনস
 */
export interface ProductFilterOptions {
  category?: string;
  dimensions?: PosterDimension;
  orientation?: PosterOrientation;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rank';
  onlyDiscounted?: boolean;
}