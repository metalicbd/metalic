import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { COLLECTIONS } from '@/services/firebase/firestore';
import { LegalPageContent, LegalPageSlug, DEFAULT_LEGAL_PAGES } from '@/types/legal';

/**
 * নির্দিষ্ট লিগ্যাল পলিসির কনটেন্ট Firestore থেকে রিড করা
 * (ডাটাবেস খালি থাকলে স্বয়ংক্রিয়ভাবে ডিফল্ট পলিসি রিটার্ন করবে)
 */
export async function getLegalPageContent(slug: LegalPageSlug): Promise<LegalPageContent> {
  try {
    const docRef = doc(db, COLLECTIONS.LEGAL_PAGES, slug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: slug, ...docSnap.data() } as LegalPageContent;
    }

    return DEFAULT_LEGAL_PAGES[slug] || DEFAULT_LEGAL_PAGES.privacy;
  } catch (error) {
    console.warn(`[Legal Service] Fallback used for ${slug}:`, error);
    return DEFAULT_LEGAL_PAGES[slug] || DEFAULT_LEGAL_PAGES.privacy;
  }
}

/**
 * অ্যাডমিন: পলিসি কনটেন্ট Firestore-এ সেভ বা আপডেট করা
 */
export async function saveLegalPageContent(
  slug: LegalPageSlug,
  title: string,
  subtitle: string,
  contentHtml: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.LEGAL_PAGES, slug);
    await setDoc(
      docRef,
      {
        id: slug,
        title: title.trim(),
        subtitle: subtitle.trim(),
        contentHtml,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error: any) {
    console.error(`[Legal Service Error] Saving ${slug}:`, error);
    throw new Error(error.message || 'পলিসি সেভ করতে ব্যর্থ হয়েছে।');
  }
}