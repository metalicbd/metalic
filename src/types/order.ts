import { PosterDimension } from './product';

export type DeliveryZone = 'inside-dhaka' | 'outside-dhaka';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type PaymentStatus = 'Pending' | 'Paid';

/**
 * বাংলাদেশ কাস্টমার ডেলিভারি ঠিকানা
 */
export interface CustomerShippingAddress {
  fullName: string;
  phoneNumber: string; // 01XXXXXXXXX
  alternativePhone?: string;
  email?: string;
  deliveryZone: DeliveryZone; // 'inside-dhaka' (৳৮০) অথবা 'outside-dhaka' (৳১৩০)
  district: string; // ড্রপডাউন থেকে নির্বাচিত জেলা
  thana: string; // থানা / উপজেলা
  fullAddress: string; // বাসা, রোড, এলাকা
  deliveryNotes?: string;
}

/**
 * অর্ডারের প্রতিটি পোস্টার আইটেম (20x30 বা 30x20 cm এবং 1mm Steel)
 */
export interface OrderItem {
  productId: string;
  title: string;
  featuredImage: string;
  dimensions: PosterDimension;
  thickness: '1 mm';
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

/**
 * মেটালিক সম্পূর্ণ অর্ডার ডাটাবেস স্কিমা
 */
export interface Order {
  id?: string;
  orderId: string; // যেমন: "MET-84921"
  customerId: string;
  customerInfo: CustomerShippingAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  grandTotal: number;
  paymentMethod: 'Cash on Delivery';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: any;
  updatedAt: any;
}

/**
 * বাংলাদেশ ডেলিভারি চার্জ রেট
 */
export const DELIVERY_RATES = {
  INSIDE_DHAKA: 80, // ৳৮০
  OUTSIDE_DHAKA: 130, // ৳১৩০
} as const;

/**
 * চেকআউটের জন্য বাংলাদেশের ৬৪ জেলার পূর্ণাঙ্গ ড্রপডাউন তালিকা
 */
export const BANGLADESH_DISTRICTS = [
  'Dhaka',
  'Gazipur',
  'Narayanganj',
  'Tangail',
  'Faridpur',
  'Gopalganj',
  'Kishoreganj',
  'Madaripur',
  'Manikganj',
  'Munshiganj',
  'Narsingdi',
  'Rajbari',
  'Shariatpur',
  'Chattogram',
  'Cox\'s Bazar',
  'Cumilla',
  'Brahmanbaria',
  'Chandpur',
  'Feni',
  'Lakshmipur',
  'Noakhali',
  'Khagrachhari',
  'Rangamati',
  'Bandarban',
  'Sylhet',
  'Moulvibazar',
  'Habiganj',
  'Sunamganj',
  'Rajshahi',
  'Bogura',
  'Joypurhat',
  'Naogaon',
  'Natore',
  'Chapai Nawabganj',
  'Pabna',
  'Sirajganj',
  'Khulna',
  'Bagerhat',
  'Satkhira',
  'Jashore',
  'Jhenaidah',
  'Magura',
  'Narail',
  'Kushtia',
  'Chuadanga',
  'Meherpur',
  'Barishal',
  'Barguna',
  'Bhola',
  'Jhalokati',
  'Patuakhali',
  'Pirojpur',
  'Rangpur',
  'Dinajpur',
  'Gaibandha',
  'Kurigram',
  'Lalmonirhat',
  'Nilphamari',
  'Panchagarh',
  'Thakurgaon',
  'Mymensingh',
  'Jamalpur',
  'Netrokona',
  'Sherpur',
] as const;