import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { COLLECTIONS } from '@/services/firebase/firestore';
import { useCartStore } from '@/stores/useCartStore';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Check, 
  Search, 
  ChevronDown, 
  Tag, 
  ShoppingBag 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

// বাংলাদেশের ৬৪টি জেলার তালিকা
const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Faridpur', 'Gopalganj', 
  'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narsingdi', 
  'Rajbari', 'Shariatpur', 'Chattogram', "Cox's Bazar", 'Cumilla', 
  'Brahmanbaria', 'Chandpur', 'Feni', 'Lakshmipur', 'Noakhali', 'Khagrachhari', 
  'Rangamati', 'Bandarban', 'Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj', 
  'Rajshahi', 'Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Chapai Nawabganj', 
  'Pabna', 'Sirajganj', 'Khulna', 'Bagerhat', 'Chuadanga', 'Jashore', 
  'Jhenaidah', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira', 
  'Barishal', 'Barguna', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur', 
  'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 
  'Panchagarh', 'Thakurgaon', 'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();

  // কাস্টমার ফর্ম স্টেট
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'inside-dhaka' | 'outside-dhaka'>('inside-dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // জেলা ড্রপডাউন প্যানেল স্টেট ও Ref
  const [isDistrictPickerOpen, setIsDistrictPickerOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const districtPickerRef = useRef<HTMLDivElement>(null);

  // কুপন স্টেট
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ করার হ্যান্ডলার
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        districtPickerRef.current &&
        !districtPickerRef.current.contains(event.target as Node)
      ) {
        setIsDistrictPickerOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDistrictPickerOpen(false);
      }
    };

    if (isDistrictPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDistrictPickerOpen]);

  // সাবটোটাল হিসাব
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  // ডেলিভারি ফি (ঢাকা ভিতরে ৳৮০, বাইরে ৳১৩০)
  const deliveryFee = deliveryZone === 'inside-dhaka' ? 80 : 130;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  // জেলা সিলেক্ট হ্যান্ডলার
  const handleSelectDistrict = (selectedDist: string) => {
    setDistrict(selectedDist);
    setIsDistrictPickerOpen(false);
    setDistrictSearch('');

    if (selectedDist.toLowerCase() === 'dhaka') {
      setDeliveryZone('inside-dhaka');
    } else {
      setDeliveryZone('outside-dhaka');
    }
  };

  // জেলা সার্চ ফিল্টারিং
  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return BANGLADESH_DISTRICTS;
    return BANGLADESH_DISTRICTS.filter((d) =>
      d.toLowerCase().includes(districtSearch.toLowerCase().trim())
    );
  }, [districtSearch]);

  // কুপন অ্যাপ্লাই
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase().trim() === 'MET10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      toast.success('Coupon MET10 applied! 10% discount added.');
    } else {
      toast.error('Invalid coupon code.');
    }
  };

  // অর্ডার সাবমিট (১০০% নিরাপদ ও এররমুক্ত)
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      navigate('/shop');
      return;
    }

    if (!fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone.length < 11) {
      toast.error('Please enter a valid 11-digit mobile number (e.g., 017XXXXXXXX).');
      return;
    }

    if (!fullAddress.trim()) {
      toast.error('Please enter your detailed delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // র্যান্ডম ইউনিক অর্ডার আইডি (MET-XXXXX)
      const randomId = 'MET-' + Math.floor(10000 + Math.random() * 90000);

      // কোনো undefined ফিল্ড না পাঠিয়ে শতভাগ ক্লিন ডাটা
      const orderData = {
        id: randomId,
        orderId: randomId,
        customerInfo: {
          fullName: fullName.trim(),
          phoneNumber: cleanPhone,
          alternativePhone: alternativePhone.trim() || '',
          email: email.trim() || '',
          deliveryZone,
          district: district || 'Dhaka',
          thana: thana.trim() || 'N/A',
          fullAddress: fullAddress.trim(),
          deliveryNotes: deliveryNotes.trim() || '',
        },
        items: items.map((i) => ({
          productId: i.product.id || '',
          title: i.product.title || '',
          slug: i.product.slug || '',
          featuredImage: i.product.featuredImage || '',
          dimensions: i.product.dimensions || '20 × 30 cm',
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.product.discountPrice || i.product.price) || 0,
        })),
        subtotal: Number(subtotal) || 0,
        deliveryFee: Number(deliveryFee) || 80,
        discount: Number(discountAmount) || 0,
        grandTotal: Number(grandTotal) || 0,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // সরাসরি MET-XXXXX আইডিতে সেভ করা
      await setDoc(doc(db, COLLECTIONS.ORDERS, randomId), orderData);

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${randomId}`);
    } catch (error: any) {
      console.error('Order placement failed:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase text-black mb-1">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          Add some high-definition metal posters to your cart before proceeding to checkout.
        </p>
        <Link to="/shop">
          <Button variant="primary" className="bg-black text-white px-6">
            Browse Posters
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 pb-32 sm:pb-20 text-left">
      <Helmet>
        <title>Checkout | METALIC</title>
      </Helmet>

      {/* ব্যাক লিঙ্ক */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mb-8 font-sans">
          CASH ON DELIVERY CHECKOUT
        </h1>

        <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* বাম পাশ: ডেলিভারি ঠিকানা ফর্ম */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col space-y-5">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-500 pb-3 border-b border-slate-100">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>DELIVERY INFORMATION (BANGLADESH)</span>
              </div>

              {/* নাম */}
              <Input
                label="FULL NAME *"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="h-11 text-xs"
              />

              {/* ফোন নম্বর */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="MOBILE NUMBER (01XXXXXXXXX) *"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="h-11 text-xs"
                />

                <Input
                  label="ALTERNATIVE PHONE (OPTIONAL)"
                  type="tel"
                  value={alternativePhone}
                  onChange={(e) => setAlternativePhone(e.target.value)}
                  placeholder="018XXXXXXXX"
                  className="h-11 text-xs"
                />
              </div>

              {/* ইমেইল */}
              <Input
                label="EMAIL ADDRESS (FOR ORDER UPDATES)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="h-11 text-xs"
              />

              {/* ডেলিভারি এরিয়া রেডিও বাটন */}
              <div className="flex flex-col space-y-2 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                  <span className="text-blue-600">📍</span>
                  <span>SELECT DELIVERY AREA *</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => {
                      setDeliveryZone('inside-dhaka');
                      setDistrict('Dhaka');
                    }}
                    className={cn(
                      'p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer select-none',
                      deliveryZone === 'inside-dhaka'
                        ? 'border-black bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        deliveryZone === 'inside-dhaka' ? 'border-black bg-black' : 'border-slate-300'
                      )}>
                        {deliveryZone === 'inside-dhaka' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-xs font-bold uppercase text-black">INSIDE DHAKA</span>
                    </div>
                    <span className="text-xs font-bold text-black font-mono">৳80</span>
                  </label>

                  <label
                    onClick={() => {
                      setDeliveryZone('outside-dhaka');
                      if (district === 'Dhaka') setDistrict('Chattogram');
                    }}
                    className={cn(
                      'p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer select-none',
                      deliveryZone === 'outside-dhaka'
                        ? 'border-black bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        deliveryZone === 'outside-dhaka' ? 'border-black bg-black' : 'border-slate-300'
                      )}>
                        {deliveryZone === 'outside-dhaka' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-xs font-bold uppercase text-black">OUTSIDE DHAKA</span>
                    </div>
                    <span className="text-xs font-bold text-black font-mono">৳130</span>
                  </label>
                </div>
              </div>

              {/* ডিস্ট্রিক্ট / সিটি — বাটনের নিচে ইন-পেজ ড্রপডাউন (কখনো স্ক্রিনের বাইরে যাবে না) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* জেলা ড্রপডাউন ফিল্ড */}
                <div ref={districtPickerRef} className="flex flex-col space-y-1.5 relative">
                  <label className="text-xs font-bold uppercase tracking-wider text-black">
                    DISTRICT / CITY *
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsDistrictPickerOpen(!isDistrictPickerOpen)}
                    className="w-full h-11 px-3.5 text-xs font-bold bg-white border border-slate-200 hover:border-black rounded-xl flex items-center justify-between text-black outline-none shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{district}</span>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', isDistrictPickerOpen && 'rotate-180')} />
                  </button>

                  {/* ইন-পেজ ড্রপডাউন মেনু — বাটনের ঠিক নিচে সুন্দরভাবে খুলবে */}
                  {isDistrictPickerOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* সার্চ ইনপুট */}
                      <div className="relative mb-2">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          autoFocus
                          value={districtSearch}
                          onChange={(e) => setDistrictSearch(e.target.value)}
                          placeholder="Search 64 districts..."
                          className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black text-black placeholder:text-slate-400"
                        />
                      </div>

                      {/* স্ক্রলেবল তালিকা */}
                      <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
                        {filteredDistricts.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => handleSelectDistrict(d)}
                            className={cn(
                              'w-full py-2 px-3 text-left text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer',
                              district === d
                                ? 'bg-black text-white font-bold'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-black'
                            )}
                          >
                            <span>{d}</span>
                            {district === d && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* থানা / উপজেলা */}
                <Input
                  label="THANA / UPAZILA *"
                  required
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  placeholder="e.g. Mirpur, Dhanmondi, Savar"
                  className="h-11 text-xs"
                />
              </div>

              {/* বিস্তারিত ডেলিভারি ঠিকানা */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-black">
                  FULL DELIVERY ADDRESS (HOUSE, ROAD, AREA) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="e.g. House #14, Road #5, Block C, Mirpur-10"
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-black text-black shadow-xs resize-none"
                />
              </div>

              {/* ডেলিভারি নির্দেশিকা */}
              <Input
                label="DELIVERY INSTRUCTIONS / NOTE (OPTIONAL)"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Please call before arriving"
                className="h-11 text-xs"
              />
            </div>
          </div>

          {/* ডান পাশ: অর্ডার সামারি ও কনফার্ম বাটন */}
          <div className="lg:col-span-5 flex flex-col space-y-5">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-widest text-black">
                  ORDER SUMMARY
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
                </span>
              </div>

              {/* কার্ট আইটেমস প্রিভিউ */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 p-0.5">
                        <img
                          src={getPosterThumbnailUrl(item.product.featuredImage)}
                          alt={item.product.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <h4 className="text-xs font-bold text-black truncate">
                          {item.product.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          {item.product.dimensions} • {item.quantity} × ৳{(item.product.discountPrice || item.product.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-black font-mono shrink-0">
                      ৳{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* কুপন কোড ফর্ম */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="COUPON CODE (E.G. MET10)"
                      className="w-full h-10 pl-9 pr-3 text-xs uppercase font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-black placeholder:text-slate-400"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    className="h-10 px-4 text-xs font-bold uppercase border-slate-200 hover:border-black text-black cursor-pointer shrink-0"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* প্রাইসিং ব্রেকডাউন */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-bold text-black font-mono">৳{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Delivery ({deliveryZone === 'inside-dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                  <span className="font-bold text-black font-mono">৳{deliveryFee}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount:</span>
                    <span className="font-mono">-৳{discountAmount}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-black uppercase text-black font-sans">
                    TOTAL AMOUNT:
                  </span>
                  <span className="text-2xl font-black text-black font-mono">
                    ৳{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* কনফার্ম বাটন */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 min-h-[50px] bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? 'PLACING ORDER...' : 'CONFIRM ORDER'}
              </button>

              <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>100% Cash on Delivery in Bangladesh</span>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

CheckoutPage.displayName = 'CheckoutPage';
export default CheckoutPage;