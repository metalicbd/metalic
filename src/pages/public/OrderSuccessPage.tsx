import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { COLLECTIONS } from '@/services/firebase/firestore';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/Button';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  MapPin, 
  Phone,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOrderDetails = async () => {
      if (!orderId) {
        navigate('/');
        return;
      }

      setIsLoading(true);
      try {
        const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
        const snapshot = await getDoc(orderRef);
        
        if (snapshot.exists() && isMounted) {
          setOrder({ id: snapshot.id, ...snapshot.data() } as Order);
        } else if (isMounted) {
          toast.error('Order not found!');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrderDetails();
    return () => {
      isMounted = false;
    };
  }, [orderId, navigate]);

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      toast.success('Order ID copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Confirming Deployment...
        </p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 pb-32 sm:pb-24">
      <Helmet>
        <title>Order Confirmed | METALIC</title>
      </Helmet>

      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-premium flex flex-col items-center text-center space-y-8">
          
          {/* সাকসেস হেডার */}
          <div className="flex flex-col items-center space-y-4 w-full border-b border-slate-100 pb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-500 shadow-xs">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 font-mono">
                ORDER CONFIRMED
              </span>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
                THANK YOU FOR <br className="hidden sm:block" /> ORDERING!
              </h1>
            </div>

            <button
              type="button"
              onClick={copyOrderId}
              className="mt-2 flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer active:scale-95"
            >
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                ID: {order.orderId}
              </span>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* অর্ডার করা পোস্টার সামারি */}
          <div className="w-full border border-slate-200 rounded-2xl p-4 sm:p-5 text-left bg-slate-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>ORDERED POSTERS ({order.items.length})</span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] sm:text-[10px] uppercase font-bold text-slate-400">TOTAL PAYABLE</span>
                <span className="text-sm sm:text-lg font-black text-black font-mono leading-none">
                  ৳{order.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 p-0.5">
                      <img
                        src={getPosterThumbnailUrl(item.featuredImage)}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="text-[11px] sm:text-sm font-bold text-black truncate leading-tight">
                        {item.title}
                      </h4>
                      {/* মোবাইলে না ভেঙে এক লাইনে দেখানোর ফিক্স */}
                      <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 whitespace-nowrap truncate">
                        {item.dimensions} • QTY: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] sm:text-sm font-bold text-black font-mono shrink-0">
                    ৳{item.unitPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* কাস্টমার ও ডেলিভারি তথ্য */}
          <div className="w-full border border-slate-200 rounded-2xl p-4 sm:p-5 text-left bg-slate-50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">
              RECIPIENT DETAILS
            </span>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm sm:text-base font-black text-black leading-none">
                  {order.customerInfo.fullName}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">
                    {order.customerInfo.phoneNumber} 
                    {order.customerInfo.alternativePhone && ` (Alt: ${order.customerInfo.alternativePhone})`}
                  </span>
                </div>
                {order.customerInfo.email && (
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{order.customerInfo.email}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200/80">
                <div className="flex items-start gap-1.5 text-[11px] sm:text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      DELIVERY ADDRESS
                    </span>
                    <span className="font-semibold text-slate-800 leading-snug">
                      {order.customerInfo.fullAddress}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Thana: {order.customerInfo.thana}, District: {order.customerInfo.district}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ট্রাস্ট মেসেজ */}
          <div className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-800 text-[10px] sm:text-xs">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-left font-medium leading-tight">
              Includes <strong>3 pieces of damage-free nano tape</strong> for effortless wall mounting.
            </span>
          </div>

          {/* অ্যাকশন বাটনসমূহ */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-4">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-slate-200 text-black px-4 sm:px-8 h-11 text-[9px] sm:text-xs uppercase font-bold tracking-widest whitespace-nowrap"
              >
                CONTINUE SHOPPING
              </Button>
            </Link>

            <Link to="/track-order" className="w-full sm:w-auto">
              <Button
                variant="primary"
                rightIcon={<ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                className="w-full sm:w-auto bg-black text-white hover:bg-neutral-800 px-4 sm:px-8 h-11 text-[9px] sm:text-xs uppercase font-bold tracking-widest shadow-md whitespace-nowrap"
              >
                TRACK THIS PARCEL
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

OrderSuccessPage.displayName = 'OrderSuccessPage';
export default OrderSuccessPage;