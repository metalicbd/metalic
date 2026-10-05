import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Order, OrderStatus } from '@/types/order';
import { getOrderByOrderId } from '@/services/orders/orderService';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  PackageCheck, 
  Search, 
  Copy, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  FileText} from 'lucide-react';
import toast from 'react-hot-toast';

// ৫টি লাইভ টাইমলাইন স্টেপ (২ লাইনে অপ্টিমাইজড)
const STATUS_STEPS: { 
  status: OrderStatus; 
  line1: string; 
  line2: string; 
  desc: string 
}[] = [
  { status: 'Pending', line1: 'ORDER', line2: 'PLACED', desc: 'Received & queued for QC' },
  { status: 'Confirmed', line1: 'ORDER', line2: 'CONFIRMED', desc: 'Order verified by Metalic' },
  { status: 'Processing', line1: 'CRAFTING', line2: 'PLATE', desc: '1mm High-Definition steel print' },
  { status: 'Shipped', line1: 'PARCEL', line2: 'DISPATCHED', desc: 'In transit via courier in BD' },
  { status: 'Delivered', line1: 'PARCEL', line2: 'DELIVERED', desc: 'Delivered to your doorstep' },
];

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setSearched] = useState(false);

  // Firestore থেকে অর্ডার ফেচ করা
  const fetchOrder = async (idToSearch: string) => {
    const cleanId = idToSearch.trim().toUpperCase();
    if (!cleanId) return;

    setIsLoading(true);
    setSearched(true);
    try {
      const data = await getOrderByOrderId(cleanId);
      setOrder(data);
      if (!data) {
        toast.error(`Order "${cleanId}" not found. Please verify your Order ID.`);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Failed to lookup order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      setSearchParams({ id: orderIdInput.trim().toUpperCase() });
      fetchOrder(orderIdInput.trim());
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(`Order ID "${id}" copied to clipboard!`);
  };

  // স্ট্যাটাস ইন্ডেক্স
  const currentStepIndex = order 
    ? STATUS_STEPS.findIndex((s) => s.status === order.orderStatus)
    : -1;


  return (
    <div className="min-h-screen flex flex-col bg-white pb-32 sm:pb-24 text-left">
      <Helmet>
        <title>Track Parcel | METALIC</title>
        <meta name="description" content="Track your Metalic poster delivery status live across Bangladesh." />
      </Helmet>

      {/* সার্চ ব্যানার — পিসিতে ও মোবাইলে পারফেক্ট */}
      <section className="w-full bg-slate-50/80 border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm mb-3">
            <PackageCheck className="w-6 h-6" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black font-sans">
            Track Your Parcel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 mb-6 font-medium">
            Enter your unique Metalic Order ID (e.g. MET-40548) to see real-time delivery updates in Bangladesh.
          </p>

          {/* সার্চ ইনপুট ফর্ম */}
          <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Enter Order ID (e.g. MET-40548)"
                className="w-full h-12 pl-4 pr-10 text-xs font-mono font-bold uppercase tracking-wider bg-white border border-slate-200 rounded-2xl outline-none focus:border-black text-black shadow-sm transition-standard"
              />
              {orderIdInput && (
                <button
                  type="button"
                  onClick={() => setOrderIdInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="bg-black text-white hover:bg-neutral-800 px-6 h-12 text-xs font-bold uppercase tracking-widest rounded-2xl shadow-sm cursor-pointer"
              rightIcon={<Search className="w-4 h-4" />}
            >
              Track
            </Button>
          </form>
        </div>
      </section>

      {/* ট্র্যাকিং ফলাফল */}
      {order && (
        <section className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-premium flex flex-col space-y-8">
            
            {/* অর্ডার হেডার */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 font-mono">
                    Live Tracking
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                    Cash on Delivery
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-black font-mono whitespace-nowrap">
                    {order.orderId}
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleCopyId(order.orderId)}
                    aria-label="Copy Order ID"
                    className="text-slate-400 hover:text-black transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={order.orderStatus === 'Delivered' ? 'success' : 'secondary'}
                  size="md"
                  className="text-xs px-3 py-1 font-bold font-mono"
                >
                  Status: {order.orderStatus.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* ৫-ধাপের লাইভ টাইমলাইন — ২ লাইনে স্পষ্ট টেক্সট ও আরামদায়ক স্পেসিং */}
            <div className="py-5 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 font-mono">
                Parcel Status Timeline
              </h3>
              
              <div className="relative py-2">
                {/* কানেক্টিং ব্যাকগ্রাউন্ড লাইন */}
                <div className="absolute top-4 sm:top-5 left-4 right-4 h-0.5 sm:h-1 bg-slate-100 -z-0 rounded-full" />

                {/* ৫টি স্টেপ গ্রিড — ২ লাইনে ১০০% রিডেবল টেক্সট */}
                <div className="grid grid-cols-5 gap-1 sm:gap-4 relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;

                    return (
                      <div key={step.status} className="flex flex-col items-center text-center">
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold font-mono transition-all duration-300 shrink-0 shadow-xs mb-2 ${
                            isCompleted
                              ? 'bg-black text-white'
                              : 'bg-white text-slate-400 border border-slate-200'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : idx + 1}
                        </div>
                        
                        {/* ২ লাইনে অপ্টিমাইজড টেক্সট — কোনো শব্দ কাটবে না */}
                        <div className={`flex flex-col items-center text-[7.5px] sm:text-[10px] font-bold uppercase tracking-tight leading-[1.15] ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-black' : 'text-slate-400'
                        }`}>
                          <span>{step.line1}</span>
                          <span>{step.line2}</span>
                        </div>
                        
                        <p className="hidden sm:block text-[9px] text-slate-400 leading-tight mt-1 max-w-[110px]">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* পোস্টার আইটেমস তালিকা — ২ লাইনের স্লিক স্পেক্স ব্যাজ */}
            <div className="py-5 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-3 flex items-center gap-1.5 font-mono">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                <span>Included Posters ({order.items.length})</span>
              </h3>
              
              <div className="flex flex-col space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
                      <div className="w-11 h-14 sm:w-12 sm:h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200 p-0.5">
                        <img
                          src={getPosterThumbnailUrl(item.featuredImage)}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="min-w-0 flex-1 flex flex-col justify-center space-y-1">
                        <p className="text-xs sm:text-sm font-bold text-black truncate leading-tight">
                          {item.title}
                        </p>
                        
                        {/* ডাইমেনশন ও মেটেরিয়াল স্পেক্স — ২ লাইনে ছোট ও প্রফেশনাল ব্যাজ */}
                        <div className="flex flex-col bg-white border border-slate-200/90 px-2 py-1 rounded-lg w-fit shadow-2xs">
                          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-700 leading-none">
                            {item.dimensions}
                          </span>
                          <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-slate-400 leading-none mt-0.5">
                            1MM SOLID STEEL
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium font-mono">
                        {item.quantity} × ৳{item.unitPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-black font-mono">
                        ৳{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ডেলিভারি ও রসিদ সামারি */}
            <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  Recipient & Destination
                </span>
                <h4 className="text-sm sm:text-base font-black text-black leading-none">
                  {order.customerInfo.fullName}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span className="truncate">
                    {order.customerInfo.phoneNumber} 
                    {order.customerInfo.alternativePhone && ` (Alt: ${order.customerInfo.alternativePhone})`}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-snug mt-1">
                  {order.customerInfo.fullAddress}
                </p>
                <p className="text-[10px] text-slate-500">
                  Thana: {order.customerInfo.thana}, District: {order.customerInfo.district}
                </p>
                {order.customerInfo.deliveryNotes && (
                  <p className="text-[10px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    Note: {order.customerInfo.deliveryNotes}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-black">৳{order.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Delivery Charge:</span>
                    <span className="font-bold text-black">৳{order.deliveryFee}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold">
                      <span>Discount:</span>
                      <span>-৳{order.discount}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200/80 pt-2.5 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-black font-sans">
                    Total Payable:
                  </span>
                  <span className="text-base sm:text-lg font-black text-black font-mono">
                    ৳{order.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* ন্যানো টেপ ট্রাস্ট ফুটার */}
            <div className="border-t border-slate-100 pt-4 mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Includes <strong>3 pieces of damage-free nano tape</strong> for effortless wall mounting.</span>
            </div>

          </div>
        </section>
      )}
    </div>
  );
};

TrackOrderPage.displayName = 'TrackOrderPage';
export default TrackOrderPage;