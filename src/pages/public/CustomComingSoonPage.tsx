import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  ArrowRight, 
  Clock 
} from 'lucide-react';

export const CustomComingSoonPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem-4rem)] sm:min-h-[82vh] w-full flex items-center justify-center px-3 sm:px-6 py-4 sm:py-12 relative overflow-hidden bg-gradient-to-br from-blue-50/70 via-slate-50/60 to-blue-100/40">
      <Helmet>
        <title>Custom Metal Posters — Coming Soon | METALIC</title>
        <meta
          name="description"
          content="Custom metal poster printing is coming soon to Metalic Bangladesh. Upload your own artwork on 1mm steel plates."
        />
      </Helmet>

      {/* ব্যাকগ্রাউন্ড আইসি-ব্লু গ্লো অরা */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-blue-200/35 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ফ্রস্টেড গ্লাস কার্ড — পিসিতে আসল বড় সাইজ, মোবাইলে এক স্ক্রিনে ফিট */}
      <div className="w-full max-w-xl p-5 sm:p-12 rounded-2xl sm:rounded-3xl bg-white/85 backdrop-blur-2xl border border-blue-200/70 shadow-[0_12px_40px_-10px_rgba(59,130,246,0.12)] text-center relative overflow-hidden">
        
        {/* আইকন ব্যাজ — পিসিতে আসল বড় w-16 h-16 */}
        <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-black flex items-center justify-center text-white mx-auto mb-3 sm:mb-6 shadow-md border border-white/20">
          <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-blue-400" />
        </div>

        {/* কামিং সুন ব্যাজ */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[9.5px] sm:text-xs font-black uppercase tracking-widest text-blue-700 mb-2 sm:mb-4 shadow-2xs">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
          <span>Feature In Development</span>
        </div>

        {/* হেডলাইন — পিসিতে আসল বড় text-4xl font-black */}
        <h1 className="text-xl sm:text-4xl font-black uppercase tracking-tight text-black leading-tight sm:leading-tight">
          Custom Metal Posters <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-black bg-clip-text text-transparent">
            Coming Soon.
          </span>
        </h1>

        {/* ডেসক্রিপশন — পিসিতে আসল ডেসক্রিপশন */}
        <p className="text-[10.5px] sm:text-sm text-slate-600 max-w-md mx-auto mt-2 sm:mt-4 leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
          We are calibrating our industrial 1mm steel printing machines. Soon you will be able to upload your favorite personal photos, gaming shots, and anime artwork for custom fabrication.
        </p>

        {/* ৩টি স্পেক্স পিলস — পিসিতে আসল বড় স্পেসিফিকেশন টেক্সট */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 my-4 sm:my-8 text-left">
          <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400">
              <span className="sm:hidden">Spec</span>
              <span className="hidden sm:inline">Specification</span>
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-black truncate">
              <span className="sm:hidden">1mm Steel</span>
              <span className="hidden sm:inline">1mm Heavy Steel</span>
            </span>
          </div>

          <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400">
              <span className="sm:hidden">Mount</span>
              <span className="hidden sm:inline">Mounting</span>
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-black truncate">
              <span className="sm:hidden">3 Pcs Tape</span>
              <span className="hidden sm:inline">3 Pcs Nano Tape</span>
            </span>
          </div>

          <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400">
              Payment
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-black truncate">
              Cash on Delivery
            </span>
          </div>
        </div>

        {/* অ্যাকশন বাটন — পিসিতে আসল বড় h-12 ও Explore Current Catalog টেক্সট */}
        <div className="flex items-center justify-center pt-1">
          <Link to="/shop" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto bg-black text-white hover:bg-neutral-800 px-6 sm:px-8 h-10 sm:h-12 text-[10px] sm:text-xs uppercase font-bold tracking-widest shadow-md cursor-pointer whitespace-nowrap"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Current Catalog
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

CustomComingSoonPage.displayName = 'CustomComingSoonPage';
export default CustomComingSoonPage;