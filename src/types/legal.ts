export type LegalPageSlug = 'privacy' | 'terms' | 'refund' | 'shipping';

/**
 * লিগ্যাল পেজ কনটেন্ট ইন্টারফেস
 */
export interface LegalPageContent {
  id: LegalPageSlug;
  title: string;
  subtitle: string;
  contentHtml: string;
  updatedAt: any;
}

/**
 * মেটালিক ব্র্যান্ডের ডিফল্ট লিগ্যাল পলিসিস
 * (Firestore ডাটাবেস খালি থাকলেও ওয়েবসাইট স্বয়ংক্রিয়ভাবে এই পলিসিগুলো প্রদর্শন করবে)
 */
export const DEFAULT_LEGAL_PAGES: Record<LegalPageSlug, LegalPageContent> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'How Metalic collects, protects, and handles your personal information in Bangladesh.',
    contentHtml: `
      <h3>1. Information We Collect</h3>
      <p>When you place an order or create an account with Metalic, we collect your name, delivery address, mobile phone number, and email. This information is exclusively utilized to process your metal poster order, calculate shipping across Bangladesh, and dispatch tracking notifications.</p>
      
      <h3>2. Payment Data & Cash on Delivery</h3>
      <p>Metalic operates on a 100% Cash on Delivery (COD) basis. We never store or request credit card CVVs or bank PINs on our servers. You pay safely upon receiving your posters at your doorstep.</p>
      
      <h3>3. Data Protection</h3>
      <p>We respect your privacy and will never sell, lease, or monetize your contact information to third-party telemarketers or advertisers.</p>
    `,
    updatedAt: new Date().toISOString(),
  },
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    subtitle: 'Rules, guidelines, and agreements governing purchases on Metalic.',
    contentHtml: `
      <h3>1. Product Specifications</h3>
      <p>All Metalic posters are crafted from authentic 1mm heavy-gauge industrial steel plates with rust-proof coating. Sizes are standardized as 20 × 30 cm (Portrait) or 30 × 20 cm (Landscape). Every package includes 3 pieces of damage-free nano tape.</p>
      
      <h3>2. Order Placement & Cash on Delivery</h3>
      <p>By placing an order, you agree to receive the parcel and pay the delivery agent in cash upon arrival. Orders are verified by our team before dispatch.</p>
      
      <h3>3. Pricing & Delivery Charges</h3>
      <p>Delivery charges are ৳80 inside Dhaka City and ৳130 for all districts outside Dhaka. All prices are listed in Bangladeshi Taka (BDT).</p>
    `,
    updatedAt: new Date().toISOString(),
  },
  refund: {
    id: 'refund',
    title: 'Refund & Replacement Policy',
    subtitle: 'Our 100% free damage replacement guarantee across Bangladesh.',
    contentHtml: `
      <h3>1. Transit Damage Guarantee</h3>
      <p>Metal posters are exceptionally durable, but if your poster or nano tape arrives bent, scratched, or damaged due to courier mishandling, we offer a 100% free replacement with zero hassle.</p>
      
      <h3>2. Claim Procedure</h3>
      <p>Simply take a clear photo of the damaged metal plate and parcel label, and message our official Facebook page (facebook.com/metalicbd) or email support@metalic.com.bd within 48 hours of delivery.</p>
      
      <h3>3. Exchange Process</h3>
      <p>Once verified, a brand new replacement poster will be dispatched to your address immediately.</p>
    `,
    updatedAt: new Date().toISOString(),
  },
  shipping: {
    id: 'shipping',
    title: 'Shipping & Delivery Policy',
    subtitle: 'Nationwide home delivery protocols across 64 districts in Bangladesh.',
    contentHtml: `
      <h3>1. Delivery Timelines</h3>
      <p>Inside Dhaka: 2 to 3 business days.<br>Outside Dhaka (All other districts): 3 to 5 business days.</p>
      
      <h3>2. Delivery Rates</h3>
      <p>Inside Dhaka: ৳80.<br>Outside Dhaka: ৳130 flat nationwide rate.</p>
      
      <h3>3. Multi-Layer Protective Packaging</h3>
      <p>Every poster is shipped in heavy-duty multi-layer bubble wrap and rigid corner protectors to guarantee your steel art arrives in pristine condition.</p>
    `,
    updatedAt: new Date().toISOString(),
  },
};