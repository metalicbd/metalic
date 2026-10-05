import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { COLLECTIONS } from '@/services/firebase/firestore';
import { 
  Order, 
  CustomerShippingAddress, 
  OrderItem, 
  DELIVERY_RATES,
  DeliveryZone
} from '@/types/order';

export interface CreateOrderInput {
  customerId?: string;
  customerInfo: CustomerShippingAddress;
  items: OrderItem[];
  couponCode?: string;
}

/**
 * ইউনিক অর্ডার আইডি জেনারেটর (যেমন: MET-78492)
 */
export function generateOrderId(): string {
  const randomFiveDigits = Math.floor(10000 + Math.random() * 90000);
  return `MET-${randomFiveDigits}`;
}

/**
 * কাস্টমারের নির্বাচিত ডেলিভারি জোনের ভিত্তিতে চার্জ নির্ধারণ
 * Inside Dhaka: ৳৮০, Outside Dhaka: ৳১৩০
 */
export function calculateDeliveryFee(zone: DeliveryZone): number {
  return zone === 'inside-dhaka' ? DELIVERY_RATES.INSIDE_DHAKA : DELIVERY_RATES.OUTSIDE_DHAKA;
}

/**
 * কুপন কোড যাচাইকরণ
 */
export function validateCouponCode(code: string, subtotal: number): { valid: boolean; discount: number; message: string } {
  const normalized = code.trim().toUpperCase();
  if (normalized === 'MET10') {
    const discount = Math.round(subtotal * 0.1);
    return { valid: true, discount, message: '১০% কুপন ডিসকাউন্ট প্রয়োগ করা হয়েছে!' };
  }
  if (normalized === 'METALIC100') {
    const discount = 100;
    return { valid: true, discount, message: '৳১০০ ফ্ল্যাট ডিসকাউন্ট প্রয়োগ করা হয়েছে!' };
  }
  return { valid: false, discount: 0, message: 'কুপন কোডটি সঠিক নয় বা মেয়াদ উত্তীর্ণ।' };
}

/**
 * Firestore-এ undefined ভ্যালু এরর চিরতরে বন্ধ করার নিরাপদ ক্লিনআপ ইউটিলিটি
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const cleanObj: any = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val: any = obj[key];
      if (val === undefined) {
        cleanObj[key] = ''; // undefined এর বদলে সেফ এম্পটি স্ট্রিং
      } else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        cleanObj[key] = sanitizeForFirestore(val);
      } else {
        cleanObj[key] = val;
      }
    }
  }
  return cleanObj;
}

/**
 * Firestore-এ নতুন অর্ডার সাবমিট করা
 */
export async function placeCashOnDeliveryOrder(input: CreateOrderInput): Promise<{ docId: string; orderId: string }> {
  try {
    if (!input.items || input.items.length === 0) {
      throw new Error('কার্টে কোনো পোস্টার পাওয়া যায়নি।');
    }

    // নিরাপদ সাবটোটাল হিসাব
    const subtotal = input.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    // কাস্টমারের সিলেক্ট করা ডেলিভারি জোন অনুযায়ী চার্জ (৳৮০ বা ৳১৩০)
    const deliveryFee = calculateDeliveryFee(input.customerInfo.deliveryZone);

    // ডিসকাউন্ট যাচাই
    let discount = 0;
    if (input.couponCode) {
      const couponResult = validateCouponCode(input.couponCode, subtotal);
      if (couponResult.valid) {
        discount = couponResult.discount;
      }
    }

    const grandTotal = Math.max(0, subtotal + deliveryFee - discount);
    const orderId = generateOrderId();

    const ordersCol = collection(db, COLLECTIONS.ORDERS);
    const newOrderDoc = doc(ordersCol);

    // অর্ডার অবজেক্ট প্রস্তুত করা (কখনো undefined থাকবে না)
    const rawOrderData: Order = {
      orderId,
      customerId: input.customerId || 'guest',
      customerInfo: {
        fullName: input.customerInfo.fullName || '',
        phoneNumber: input.customerInfo.phoneNumber || '',
        alternativePhone: input.customerInfo.alternativePhone || '',
        email: input.customerInfo.email || '',
        deliveryZone: input.customerInfo.deliveryZone || 'inside-dhaka',
        district: input.customerInfo.district || '',
        thana: input.customerInfo.thana || '',
        fullAddress: input.customerInfo.fullAddress || '',
        deliveryNotes: input.customerInfo.deliveryNotes || '',
      },
      items: input.items,
      subtotal,
      deliveryFee,
      discount,
      couponCode: input.couponCode || '',
      grandTotal,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // স্যানিটাইজ করে ডাটাবেসে সেভ করা
    const safeOrderData = sanitizeForFirestore(rawOrderData);
    await setDoc(newOrderDoc, safeOrderData);

    return {
      docId: newOrderDoc.id,
      orderId,
    };
  } catch (error: any) {
    console.error('[Order Placement Error]:', error);
    throw new Error(error.message || 'অর্ডারটি সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
  }
}

/**
 * অর্ডার আইডি দিয়ে নির্দিষ্ট অর্ডার ফেচ করা
 */
export async function getOrderByOrderId(orderId: string): Promise<Order | null> {
  try {
    const ordersCol = collection(db, COLLECTIONS.ORDERS);
    const q = query(ordersCol, where('orderId', '==', orderId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error('[Order Fetch Error]:', error);
    return null;
  }
}

/**
 * কাস্টমারের অতীতের সব অর্ডার সংগ্রহ করা
 */
export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  try {
    const ordersCol = collection(db, COLLECTIONS.ORDERS);
    const q = query(
      ordersCol,
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const orders: Order[] = [];
    snapshot.forEach((docItem) => {
      orders.push({ id: docItem.id, ...docItem.data() } as Order);
    });
    return orders;
  } catch (error) {
    console.error('[Customer Orders Fetch Error]:', error);
    return [];
  }
}