import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  QueryConstraint,
  serverTimestamp,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';

// মাস্টার প্রম্পটের ২৮ নং সেকশন অনুযায়ী কালেকশন নেইমস
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  WISHLISTS: 'wishlists',
  COUPONS: 'coupons',
  CUSTOM_ORDERS: 'customOrders',
  LEGAL_PAGES: 'legalPages',
  SETTINGS: 'settings',
} as const;

// কালেকশন রেফারেন্স হেল্পার
export function getCollectionRef<T = DocumentData>(collectionName: string): CollectionReference<T> {
  return collection(db, collectionName) as CollectionReference<T>;
}

// নির্দিষ্ট আইডি দিয়ে যেকোনো ডকুমেন্ট রিড করা
export async function getDocumentById<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`[Firestore Error] Fetching ${collectionName}/${id}:`, error);
    throw error;
  }
}

// ডকুমেন্ট সংরক্ষণ বা আপডেট করা
export async function setDocument<T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: T,
  merge = true
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge }
    );
  } catch (error) {
    console.error(`[Firestore Error] Setting ${collectionName}/${id}:`, error);
    throw error;
  }
}

// ডকুমেন্ট আংশিক আপডেট করা
export async function updateDocument<T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[Firestore Error] Updating ${collectionName}/${id}:`, error);
    throw error;
  }
}

// ডকুমেন্ট ডিলিট করা
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`[Firestore Error] Deleting ${collectionName}/${id}:`, error);
    throw error;
  }
}

// শর্ত সাপেক্ষে (Filter / Sort) একাধিক ডকুমেন্ট কুয়েরি করা
export async function queryDocuments<T>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    const items: T[] = [];
    querySnapshot.forEach((snapshotDoc) => {
      items.push({ id: snapshotDoc.id, ...snapshotDoc.data() } as T);
    });
    return items;
  } catch (error) {
    console.error(`[Firestore Error] Querying ${collectionName}:`, error);
    throw error;
  }
}