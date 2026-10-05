import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { COLLECTIONS } from '@/services/firebase/firestore';
import { PaymentStatus } from '@/types/order';

export type SupportedPaymentMethod = 'Cash on Delivery';

export interface PaymentConfig {
  method: SupportedPaymentMethod;
  displayName: string;
  isEnabled: boolean;
  description: string;
}

/**
 * মেটালিক সক্রিয় পেমেন্ট মেথড আর্কিটেকচার
 * (আপনার নির্দেশনা অনুযায়ী শুধুমাত্র ১০০% ক্যাশ অন ডেলিভারি এনাবল করা)
 */
export const ACTIVE_PAYMENT_METHODS: PaymentConfig[] = [
  {
    method: 'Cash on Delivery',
    displayName: 'Cash on Delivery',
    isEnabled: true,
    description: 'Pay safely with cash when your metal posters arrive at your door.',
  },
];

/**
 * পেমেন্ট মেথডের বৈধতা যাচাই
 */
export function isPaymentMethodAvailable(method: string): boolean {
  return ACTIVE_PAYMENT_METHODS.some((p) => p.method === method && p.isEnabled);
}

/**
 * অর্ডারের পেমেন্ট স্ট্যাটাস আপডেট করা (Pending থেকে Paid করার জন্য)
 */
export async function updateOrderPaymentStatus(
  orderDocId: string,
  status: PaymentStatus,
  transactionNote?: string
): Promise<void> {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderDocId);
    await updateDoc(orderRef, {
      paymentStatus: status,
      transactionNote: transactionNote || '',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Payment Service Error]:', error);
    throw new Error('পেমেন্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
  }
}

/**
 * ক্যাশ অন ডেলিভারি পেমেন্ট প্রসেসিং ও অর্ডার অথোরাইজেশন
 */
export async function processCashOnDeliveryPayment(
  orderId: string,
  totalAmount: number
): Promise<{ success: boolean; message: string }> {
  if (totalAmount <= 0) {
    return { success: false, message: 'অর্ডারের মোট মূল্য শূন্যের বেশি হতে হবে।' };
  }

  return {
    success: true,
    message: `Order ${orderId} successfully registered under Cash on Delivery.`,
  };
}