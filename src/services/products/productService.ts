import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { COLLECTIONS } from '@/services/firebase/firestore';
import { Product, ProductFilterOptions } from '@/types/product';

/**
 * প্রাথমিক স্যাম্পল মেটাল পোস্টার (১:১ স্কয়ার রেশিও ও নাম্বারিং র্যাঙ্ক সহ)
 */
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'metalic-poster-1',
    title: 'Mercedes Petronas W13',
    slug: 'mercedes-petronas-w13',
    description: 'Mercedes Petronas Formula 1 Championship racing poster. Crafted on 1mm high-density steel with metallic chrome finish. Includes 3 pieces of damage-free nano tape.',
    category: 'Cars',
    price: 850,
    discountPrice: 749,
    featuredImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80'],
    dimensions: '30 × 20 cm',
    orientation: 'landscape',
    thickness: '1 mm',
    finish: 'High Gloss Metallic',
    specifications: {
      dimensions: '30 × 20 cm',
      thickness: '1 mm',
      material: 'Industrial Grade Rust-Proof Steel',
      mounting: '3 Pieces of Heavy-Duty Nano Tape Included (No Drilling Required)',
      imageRatio: '1:1',
      weight: '420g',
    },
    inStock: true,
    stockQuantity: 20,
    sku: 'MET-CAR-001',
    sortOrder: 1, // র্যাঙ্ক #১ (সবার আগে বসবে)
    isFeatured: true,
    showInHero: false,
    showInHomepage: true,
    isNewArrival: true,
    isBestSeller: true,
    tags: ['cars', 'f1', 'mercedes'],
    rating: 5.0,
    reviewCount: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'metalic-poster-2',
    title: 'Spider-Style: WEB-001',
    slug: 'spider-style-web-001',
    description: 'High-definition Spider Hero wall art on 1mm steel plate. Includes 3 pieces of damage-free nano tape.',
    category: 'Movies',
    price: 850,
    discountPrice: 749,
    featuredImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80'],
    dimensions: '20 × 30 cm',
    orientation: 'portrait',
    thickness: '1 mm',
    finish: 'Matte Steel',
    specifications: {
      dimensions: '20 × 30 cm',
      thickness: '1 mm',
      material: 'Industrial Grade Rust-Proof Steel',
      mounting: '3 Pieces of Heavy-Duty Nano Tape Included (No Drilling Required)',
      imageRatio: '1:1',
      weight: '420g',
    },
    inStock: true,
    stockQuantity: 35,
    sku: 'MET-MOV-002',
    sortOrder: 2, // র্যাঙ্ক #২
    isFeatured: true,
    showInHero: false,
    showInHomepage: true,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['movies', 'spider', 'hero'],
    rating: 5.0,
    reviewCount: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'metalic-poster-3',
    title: 'Tanjiro Kamado: Water Breathing Legacy',
    slug: 'tanjiro-kamado-water-breathing-legacy',
    description: 'Demon Slayer Tanjiro Kamado high-definition steel art. Includes 3 pieces of damage-free nano tape.',
    category: 'Anime',
    price: 850,
    discountPrice: 749,
    featuredImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80'],
    dimensions: '20 × 30 cm',
    orientation: 'portrait',
    thickness: '1 mm',
    finish: 'Matte Steel',
    specifications: {
      dimensions: '20 × 30 cm',
      thickness: '1 mm',
      material: 'Industrial Grade Rust-Proof Steel',
      mounting: '3 Pieces of Heavy-Duty Nano Tape Included (No Drilling Required)',
      imageRatio: '1:1',
      weight: '420g',
    },
    inStock: true,
    stockQuantity: 11,
    sku: 'MET-ANM-003',
    sortOrder: 3, // র্যাঙ্ক #৩
    isFeatured: true,
    showInHero: true,
    showInHomepage: true,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['anime', 'tanjiro', 'demon slayer'],
    rating: 4.8,
    reviewCount: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'metalic-poster-4',
    title: 'Retro GT-R Skyline Sunset Drift',
    slug: 'retro-gtr-skyline-sunset-drift',
    description: 'JDM Automotive legend Nissan Skyline GT-R speeding through Japanese neon sunset. 30x20cm format on 1mm durable metal. Includes 3 pieces of damage-free nano tape.',
    category: 'Cars',
    price: 1650,
    discountPrice: 1350,
    featuredImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80'],
    dimensions: '30 × 20 cm',
    orientation: 'landscape',
    thickness: '1 mm',
    finish: 'High Gloss Metallic',
    specifications: {
      dimensions: '30 × 20 cm',
      thickness: '1 mm',
      material: 'Industrial Grade Rust-Proof Steel',
      mounting: '3 Pieces of Heavy-Duty Nano Tape Included (No Drilling Required)',
      imageRatio: '1:1',
      weight: '420g',
    },
    inStock: true,
    stockQuantity: 25,
    sku: 'MET-CAR-004',
    sortOrder: 4, // র্যাঙ্ক #৪
    isFeatured: false,
    showInHero: false,
    showInHomepage: false,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['cars', 'gtr', 'jdm', 'landscape'],
    rating: 4.9,
    reviewCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * ফিল্টারিং ও র্যাঙ্কিং (১ সবার আগে, ২ দ্বিতীয়তে, ৩ তৃতীয়তে) ১০০% লকড সর্টিং
 */
export async function getProducts(filters: ProductFilterOptions = {}): Promise<Product[]> {
  try {
    const colRef = collection(db, COLLECTIONS.PRODUCTS);
    const querySnapshot = await getDocs(colRef);

    let items: Product[] = [];
    querySnapshot.forEach((docSnapshot) => {
      items.push({ id: docSnapshot.id, ...docSnapshot.data() } as Product);
    });

    if (items.length === 0) {
      items = [...FALLBACK_PRODUCTS];
    }

    // ক্যাটাগরি ফিল্টার
    if (filters.category && filters.category !== 'ALL') {
      items = items.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
    }

    // ডাইমেনশন ফিল্টার
    if (filters.dimensions) {
      items = items.filter((p) => p.dimensions === filters.dimensions);
    }

    // লাইভ সার্চ
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.onlyDiscounted) {
      items = items.filter((p) => p.discountPrice && p.discountPrice < p.price);
    }

    if (filters.minPrice !== undefined) {
      items = items.filter((p) => (p.discountPrice || p.price) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      items = items.filter((p) => (p.discountPrice || p.price) <= filters.maxPrice!);
    }

    // ১, ২, ৩ র্যাঙ্ক শতভাগ নিশ্চিত করা
    if (filters.sortBy === 'price-low') {
      items.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (filters.sortBy === 'price-high') {
      items.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (filters.sortBy === 'popular') {
      items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // ডিফল্ট: ১ নম্বর আগে, ২ দ্বিতীয়তে, ৩ তৃতীয়তে
      items.sort((a, b) => {
        const orderA = a.sortOrder !== undefined && a.sortOrder !== null ? Number(a.sortOrder) : 999;
        const orderB = b.sortOrder !== undefined && b.sortOrder !== null ? Number(b.sortOrder) : 999;
        if (orderA !== orderB) {
          return orderA - orderB; // ১, ২, ৩... ক্রমানুসারে
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }

    return items;
  } catch (error) {
    console.warn('[Firestore getProducts] Using fallback products due to:', error);
    return FALLBACK_PRODUCTS;
  }
}

/**
 * স্লাগ দিয়ে প্রোডাক্ট ফেচ করা
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const colRef = collection(db, COLLECTIONS.PRODUCTS);
    const q = query(colRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }

    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
  } catch (error) {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

/**
 * আইডি দিয়ে প্রোডাক্ট ফেচ করা
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }

    return FALLBACK_PRODUCTS.find((p) => p.id === id) || null;
  } catch (error) {
    return FALLBACK_PRODUCTS.find((p) => p.id === id) || null;
  }
}

/**
 * ফিচার্ড পোস্টার তালিকা (র্যাঙ্ক ১, ২, ৩ অনুযায়ী)
 */
export async function getFeaturedProducts(limitCount = 4): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.showInHomepage !== false).slice(0, limitCount);
}

/**
 * সম্পর্কিত পোস্টার তালিকা
 */
export async function getRelatedProducts(
  category: string,
  currentProductId: string,
  limitCount = 4
): Promise<Product[]> {
  const all = await getProducts();
  return all
    .filter((p) => p.category === category && p.id !== currentProductId)
    .slice(0, limitCount);
}

/**
 * অ্যাডমিন: নতুন পোস্টার তৈরি করা
 */
export async function createProduct(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const colRef = collection(db, COLLECTIONS.PRODUCTS);
  const newDocRef = doc(colRef);
  await setDoc(newDocRef, {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return newDocRef.id;
}

/**
 * অ্যাডমিন: পোস্টার আপডেট করা
 */
export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * অ্যাডমিন: পোস্টার ডিলিট করা
 */
export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await deleteDoc(docRef);
}