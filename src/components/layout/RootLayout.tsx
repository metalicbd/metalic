import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2,
  ShieldCheck
} from 'lucide-react';

export const RootLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { items, updateQuantity, removeItem } = useCartStore();
  
  // টাইপ-সেফ উইশলিস্ট কাউন্টার
  const wishlistItems = useWishlistStore((state: any) => state.items || state.wishlist || state.wishlistIds || []);
  const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // পেজ পরিবর্তন হলে টপে স্ক্রল
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* গ্লোবাল টপ হেডার */}
      <Header
        cartCount={totalItems}
        wishlistCount={wishlistCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* অ্যাক্টিভ চাইল্ড পেজ কনটেন্ট */}
      <main className="flex-1 w-full relative z-0">
        <Outlet />
      </main>

      {/* গ্লোবাল ফুটার */}
      <Footer />

      {/* মোবাইলের জন্য ফিক্সড বটম ন্যাভিগেশন */}
      <MobileBottomNav
        cartCount={totalItems}
        wishlistCount={wishlistCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* কুইক শপিং কার্ট স্লাইড-ওভার ড্রয়ার — কোনো তীর চিহ্ন ছাড়া সেন্টারে বাটন */}
      <Drawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title={`SHOPPING CART (${totalItems})`}
        position="right"
        footer={
          items.length > 0 && (
            <div className="flex flex-col space-y-3.5 w-full pb-1">
              <div className="flex items-center justify-between text-base font-black text-black">
                <span className="uppercase tracking-widest text-[11px] font-mono text-slate-500">SUBTOTAL:</span>
                <span className="font-mono text-base sm:text-lg font-black text-black">
                  ৳{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] text-slate-500 uppercase font-bold tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>100% Cash on Delivery across Bangladesh.</span>
              </div>

              {/* কোনো তীর চিহ্ন ছাড়া সেন্টারে পরিচ্ছন্ন বাটন */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full h-12 bg-black hover:bg-neutral-800 text-white uppercase text-xs font-black tracking-widest rounded-xl sm:rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center text-center"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )
        }
      >
        <div className="h-full flex flex-col w-full overflow-x-hidden">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-black mb-1.5">
                Your cart is empty
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 max-w-[200px] sm:max-w-xs mb-6">
                Looks like you haven&apos;t added any metal posters to your cart yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-black text-black uppercase font-bold text-[10px] sm:text-xs px-6 cursor-pointer"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shop');
                }}
              >
                Browse Posters
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 py-1">
              {items.map((item) => (
                <div 
                  key={item.product.id} 
                  className="relative flex items-center gap-2.5 sm:gap-3 bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-subtle w-full max-w-full overflow-hidden"
                >
                  {/* ১. কার্ট আইটেম থাম্বনেইল — ফিক্সড ৫৬×৫৬px সাইজ */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 p-0.5 flex items-center justify-center">
                    <img
                      src={getPosterThumbnailUrl(item.product.featuredImage)}
                      alt={item.product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* ২. আইটেম ডিটেইলস — pr-7 দিয়ে ট্র্যাশ বাটনের জন্য স্পেস নিশ্চিত করা হয়েছে */}
                  <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                    
                    {/* টাইটেল — ট্র্যাশ বাটনের আগে স্বয়ংক্রিয়ভাবে ট্রাঙ্কেট হবে */}
                    <h4 className="text-[11px] sm:text-xs font-bold text-black truncate pr-7 leading-tight">
                      {item.product.title}
                    </h4>

                    {/* ডাইমেনশন স্পেক্স */}
                    <span className="text-[8px] sm:text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-none mt-1 truncate block pr-7">
                      {item.product.dimensions} • 1MM STEEL
                    </span>

                    {/* নিচের সারি: প্রাইস ও কমপ্যাক্ট কোয়ান্টিটি কন্ট্রোল */}
                    <div className="flex items-center justify-between w-full mt-2 pt-0.5">
                      <span className="text-xs sm:text-sm font-black text-black font-mono">
                        ৳{(item.product.discountPrice || item.product.price).toLocaleString('en-IN')}
                      </span>

                      {/* কোয়ান্টিটি সিলেক্টর */}
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 h-6.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-5 h-full rounded hover:bg-white flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-5 text-center font-bold text-[10px] text-black font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-5 h-full rounded hover:bg-white flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* ৩. ট্র্যাশ/রিমুভ বাটন — কার্ডের ভেতরে top-2.5 right-2.5 এ ফিক্সড লকড */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    aria-label="Remove item"
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer z-10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
};

RootLayout.displayName = 'RootLayout';
export default RootLayout;