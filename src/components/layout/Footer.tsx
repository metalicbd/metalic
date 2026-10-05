import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Send, 
  Facebook, 
  Instagram, 
  Heart,
  Truck, 
  RefreshCw, 
  Banknote
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Thank you for subscribing to Metalic updates!');
      setEmail('');
    }
  };

  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: 'Premium Metal Finish',
      desc: 'High-definition 1mm durable steel poster',
    },
    {
      icon: Truck,
      title: 'Nationwide Delivery',
      desc: 'Fast home delivery all over Bangladesh',
    },
    {
      icon: RefreshCw,
      title: 'Replacement Guarantee',
      desc: '100% replacement if damaged in transit',
    },
    {
      icon: Banknote,
      title: 'Cash on Delivery',
      desc: 'Pay safely upon receiving your poster',
    },
  ];

  return (
    /* পিসির অতিরিক্ত বড় ফাঁকা জায়গা সরিয়ে পারফেক্ট sm:pb-6 নির্ধারণ */
    <footer className="bg-slate-50/70 border-t border-slate-200/80 mt-auto pb-20 sm:pb-6 text-left">
      
      {/* ট্রাস্ট ফিচারস বার */}
      <div className="border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trustFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex flex-col space-y-1 sm:space-y-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-900 mb-0.5 sm:mb-1">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800" />
                  </div>
                  <h4 className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[9.5px] sm:text-[11px] text-slate-500 leading-snug sm:leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* প্রধান ফুটার কনটেন্ট সেকশন — অতিরিক্ত নিচের প্যাডিং কমিয়ে pb-2 sm:pb-4 করা হয়েছে */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-12 pb-2 sm:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          
          {/* ব্র্যান্ড পরিচিতি */}
          <div className="lg:col-span-4 flex flex-col space-y-3 sm:space-y-4">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-2.5 select-none">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-black flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-base sm:text-xl font-black tracking-widest uppercase text-slate-950 font-sans">
                METALIC
              </span>
            </Link>

            <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm leading-relaxed">
              Elevating spaces across Bangladesh with premium, high-definition rust-proof metal posters. Built for precision, designed for true aesthetics.
            </p>

            {/* ফেসবুক ও ইনস্টাগ্রাম সোশ্যাল বাটন */}
            <div className="flex items-center space-x-2 pt-0.5 sm:pt-1">
              <a
                href="https://www.facebook.com/metalicbd"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 hover:text-black hover:border-black transition-colors cursor-pointer"
              >
                <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://www.instagram.com/metalic_bd_/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 hover:text-black hover:border-black transition-colors cursor-pointer"
              >
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </div>
          </div>

          {/* কলাম ২: QUICK ACCESS */}
          <div className="lg:col-span-2 flex flex-col space-y-2.5 sm:space-y-3">
            <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-900 font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>QUICK ACCESS</span>
            </h5>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs font-medium text-slate-500">
              <li>
                <Link to="/" className="hover:text-black transition-colors flex items-center gap-1.5">
                  <span className="text-slate-300">•</span>
                  <span>Home Base</span>
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-black transition-colors flex items-center gap-1.5">
                  <span className="text-slate-300">•</span>
                  <span>The Catalog</span>
                </Link>
              </li>
              <li>
                <Link to="/custom-order" className="hover:text-black transition-colors flex items-center gap-1.5">
                  <span className="text-slate-300">•</span>
                  <span>Custom Lab</span>
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-black transition-colors flex items-center gap-1.5">
                  <span className="text-slate-300">•</span>
                  <span>My Profile</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* কলাম ৩: SUPPORT PROTOCOLS */}
          <div className="lg:col-span-3 flex flex-col space-y-2.5 sm:space-y-3">
            <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-900 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>SUPPORT PROTOCOLS</span>
            </h5>
            <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs font-mono text-slate-500">
              <li><Link to="/legal/privacy" className="hover:text-black transition-standard">PRIVACY POLICY</Link></li>
              <li><Link to="/legal/terms" className="hover:text-black transition-standard">TERMS & CONDITIONS</Link></li>
              <li><Link to="/legal/refund" className="hover:text-black transition-standard">REFUND POLICY</Link></li>
              <li><Link to="/legal/shipping" className="hover:text-black transition-standard">SHIPPING & DELIVERY</Link></li>
              <li><span className="text-slate-400">CASH ON DELIVERY ONLY</span></li>
            </ul>
          </div>

          {/* কলাম ৪: STAY SYNCHRONIZED */}
          <div className="lg:col-span-3 flex flex-col space-y-2.5 sm:space-y-3">
            <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-900 font-mono">
              STAY SYNCHRONIZED
            </h5>
            <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">support@metalic.com.bd</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* নিউজলেটার বক্স */}
            <form onSubmit={handleNewsletterSubmit} className="relative flex items-center w-full pt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Secure Email Address"
                className="w-full h-9 sm:h-10 pl-3 pr-10 text-[10px] sm:text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-black text-black placeholder:text-slate-400 font-mono shadow-xs"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black text-white hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* বটম রো — স্পেস কমিয়ে পারফেক্ট mt-4 pt-3 করা হয়েছে */}
        <div className="border-t border-slate-200/80 mt-4 pt-3 sm:mt-6 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-400 font-mono">
          <p className="text-[9.5px] sm:text-[11px] text-center sm:text-left">
            © {currentYear} METALIC COMMAND. ALL RIGHTS RESERVED.
          </p>

          <div className="flex items-center space-x-1 sm:space-x-1.5 text-[8.5px] sm:text-[10px] font-bold tracking-wider uppercase text-slate-500">
            <span>MADE WITH</span>
            <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 fill-red-500 inline-block mx-0.5" />
            <span>FOR ART ENTHUSIASTS</span>
            <span className="text-slate-300 mx-1">|</span>
            <span>SYSTEM V2.4.0</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
export default Footer;