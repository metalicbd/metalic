import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Product } from '@/types/product';
import { getProducts } from '@/services/products/productService';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { useCartStore } from '@/stores/useCartStore';
import { 
  Sparkles, 
  ShoppingBag, 
  Eye, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Truck 
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [homepageProducts, setHomepageProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addItem } = useCartStore();

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts();
        if (isMounted) {
          setAllProducts(data);

          // অ্যাডমিনের সিলেক্ট করা হিরো প্রোডাক্ট লোড
          const heroSelected = data.find((p) => p.showInHero);
          setHeroProduct(heroSelected || data[0] || null);

          // শুধুমাত্র হোমপেজের জন্য নির্ধারিত পোস্টারসমূহ
          const forHome = data.filter((p) => p.showInHomepage !== false).slice(0, 4);
          setHomepageProducts(forHome);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // হিরো পোস্টার কুইক-অ্যাড
  const handleHeroQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (heroProduct) {
      addItem(heroProduct, 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ব্রাউজার ট্যাবে শুধুমাত্র METALIC */}
      <Helmet>
        <title>METALIC</title>
        <meta
          name="description"
          content="Transform your living space with our mind-blowing metal poster collection. Featuring stunning, durable designs that are guaranteed to impress. Shop today and save!"
        />
        <meta property="og:title" content="METALIC" />
        <meta
          property="og:description"
          content="Transform your living space with our mind-blowing metal poster collection. Featuring stunning, durable designs that are guaranteed to impress. Shop today and save!"
        />
      </Helmet>

      {/* হিরো সেকশন — পিসিতে ১০০% অক্ষুণ্ণ এবং মোবাইলে পাশাপাশি স্লিক লুক */}
      <section className="relative overflow-hidden py-3 sm:py-8 lg:py-20 border-b border-slate-200 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/30">
        <div className="w-full px-2.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 items-center gap-2.5 sm:gap-6 lg:gap-12 w-full">
            
            {/* বাম পাশ: হেডিং, ডেসক্রিপশন, বাটন ও ট্রাস্ট পয়েন্ট */}
            <div className="text-left flex flex-col space-y-1.5 sm:space-y-4 lg:space-y-6">
              <h1 className="text-base sm:text-3xl md:text-5xl lg:text-7xl font-black tracking-tight uppercase text-black leading-[1.08]">
                YOUR WALLS. <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-black bg-clip-text text-transparent">
                  UPGRADED.
                </span>
              </h1>

              {/* মোবাইলের জন্য ছোট, মার্জিত ও প্রফেশনাল ডেসক্রিপশন */}
              <p className="block sm:hidden text-[9px] text-slate-500 font-medium leading-snug line-clamp-3">
                High-definition 1mm industrial steel posters. Includes 3 heavy-duty nano tapes for clean, damage-free wall mounting.
              </p>

              {/* পিসির জন্য স্ক্রিনশটের মূল বড় ডেসক্রিপশন */}
              <p className="hidden sm:block text-xs md:text-sm lg:text-base text-slate-600 uppercase tracking-wider font-medium leading-relaxed max-w-xl">
                PREMIUM INDUSTRIAL-GRADE STEEL METAL POSTERS WITH BOLD HIGH-DEFINITION ARTWORK. INCLUDES 3 PIECES OF HEAVY-DUTY NANO TAPE FOR EASY DAMAGE-FREE MOUNTING.
              </p>

              {/* বাটন — এক লাইনে স্লিক ও প্রফেশনাল */}
              <div className="pt-1 sm:pt-2">
                <Link to="/shop" className="inline-block">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
                    className="bg-black text-white hover:bg-neutral-800 px-3 sm:px-6 lg:px-8 h-8 sm:h-10 lg:h-12 text-[9.5px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-bold shadow-md cursor-pointer whitespace-nowrap"
                  >
                    VIEW ALL POSTERS
                  </Button>
                </Link>
              </div>

              {/* মাইক্রো ট্রাস্ট ফিচারস */}
              <div className="pt-0.5 sm:pt-1 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-x-6 gap-y-1 text-[8px] sm:text-[10px] lg:text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                  <span>ZERO WALL DAMAGE</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                  <span>1MM HIGH-DENSITY STEEL</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                  <span>3 PCS NANO TAPE INCLUDED</span>
                </div>
              </div>
            </div>

            {/* ডান পাশ: মেটাল পোস্টার কার্ড */}
            <div className="w-full flex justify-end items-center">
              <div className="relative w-full max-w-[155px] sm:max-w-[260px] md:max-w-[340px] lg:max-w-[420px] aspect-square rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 bg-gradient-to-br from-blue-100 via-white to-blue-50 border border-blue-200 shadow-premium">
                
                {heroProduct ? (
                  <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group select-none">
                    
                    {/* ১. পোস্টারের অ্যাম্বিয়েন্ট ব্লার ব্যাকগ্রাউন্ড */}
                    <img
                      src={getPosterThumbnailUrl(heroProduct.heroCustomImage || heroProduct.featuredImage)}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-60 scale-110 pointer-events-none transition-transform duration-700"
                    />

                    {/* ২. গ্লাসি মেটালিক রিফ্লেকশন ওভারলে */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-blue-400/10 pointer-events-none z-1" />

                    {/* ৩. সেন্ট্রাল মেটালিক পোস্টার */}
                    <Link
                      to={`/product/${heroProduct.slug || heroProduct.id}`}
                      className="absolute inset-0 z-10 flex items-center justify-center p-1 sm:p-2 cursor-pointer select-none"
                    >
                      <img
                        src={getPosterThumbnailUrl(heroProduct.heroCustomImage || heroProduct.featuredImage)}
                        alt={heroProduct.title}
                        className="w-full h-full object-contain drop-shadow-[0_15px_35px_rgba(15,23,42,0.8)] group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* টেক্সট ওভারলে — মোবাইলে উপরে, পিসিতে নিচে */}
                    <div className="absolute top-1.5 left-1.5 sm:top-auto sm:bottom-4 sm:left-4 z-20 max-w-[65%] sm:max-w-[55%] pointer-events-none text-left bg-black/60 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-1 sm:p-0 rounded sm:rounded-none">
                      <span className="text-[7px] sm:text-[9px] uppercase font-bold tracking-widest text-blue-400 block mb-0.5 leading-none">
                        {heroProduct.category}
                      </span>
                      <h3 className="text-[8px] sm:text-xs lg:text-sm font-bold uppercase tracking-wide leading-tight sm:leading-snug text-white line-clamp-1 sm:line-clamp-2 drop-shadow-md">
                        {heroProduct.title}
                      </h3>
                    </div>

                    {/* ফ্লোটিং কার্ড — নিচে ডান পাশে ফিক্সড */}
                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-4 sm:right-4 z-30 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl sm:rounded-2xl p-1 sm:p-3 shadow-2xl flex items-center space-x-1 sm:space-x-3 pointer-events-auto">
                      <button
                        type="button"
                        onClick={handleHeroQuickAdd}
                        aria-label="Add to cart"
                        className="w-5 h-5 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition-standard active:scale-95 cursor-pointer shrink-0"
                      >
                        <ShoppingBag className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                      </button>
                      
                      <div className="flex flex-col text-left pr-0.5 sm:pr-1">
                        <span className="text-[6px] sm:text-[8px] lg:text-[9px] uppercase font-bold tracking-widest text-slate-400 leading-none">
                          ORDER NOW
                        </span>
                        {heroProduct.discountPrice && heroProduct.discountPrice < heroProduct.price && (
                          <span className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-slate-300 line-through mt-0.5 leading-none">
                            ৳{heroProduct.price.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="text-[9px] sm:text-sm lg:text-base font-black text-white leading-tight">
                          ৳{(heroProduct.discountPrice || heroProduct.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      High-Definition Steel Posters
                    </span>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* হোমপেজ ফিচার্ড পোস্টার ক্যাটালগ গ্রিড — বাটন দুটি মোটা, সলিড ও প্রিমিয়াম */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="w-full px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-10 text-left">
            <div>
              {/* হেডিং */}
              <h2 className="text-base sm:text-2xl font-black uppercase text-black tracking-tight">
                Featured Metal Posters
              </h2>
              {/* সাবটাইটেল */}
              <p className="text-[8.5px] sm:text-xs text-slate-500 mt-0.5 uppercase tracking-wider font-medium">
                High-Definition 1mm Steel Posters in 20×30 cm & 30×20 cm
              </p>
            </div>

            {/* বাটন দুটি সলিড থিকনেস ও মোটা আকারে ডানপাশে ফিক্সড */}
            <div className="flex items-center justify-end gap-2 shrink-0 sm:ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                className="h-9 px-3.5 rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap cursor-pointer border-slate-200 hover:border-black text-slate-800 shadow-2xs transition-colors"
              >
                Mounting Guide
              </Button>
              
              <Link to="/shop">
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 px-3.5 sm:px-5 rounded-xl bg-black text-white hover:bg-neutral-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer shadow-xs transition-colors"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 shrink-0" />}
                >
                  View All ({allProducts.length})
                </Button>
              </Link>
            </div>
          </div>

          <ProductGrid products={homepageProducts} isLoading={isLoading} />
        </div>
      </section>

      {/* কেন METALIC? */}
      <section className="py-10 sm:py-16 bg-slate-50/70 border-t border-slate-200">
        <div className="w-full px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono">
              ENGINEERED FOR EXCELLENCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-black mt-1 font-sans">
              Why Metalic Wall Art?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Standard paper posters tear, fade and bend. Metalic posters are built from steel plates designed to last for decades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-1">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold uppercase text-black">
                1mm Heavy-Gauge Steel
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Crafted from authentic rust-proof steel plates. Completely waterproof, durable, and immune to moisture or humidity.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-1">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold uppercase text-black">
                3 Pcs Heavy-Duty Nano Tape
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero drilling or wall damage. Every poster includes 3 pieces of ultra-strong, washable nano tape for fast and clean wall hanging.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-1">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold uppercase text-black">
                Cash on Delivery (Bangladesh)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We deliver across all 64 districts in Bangladesh with 100% Cash on Delivery and safe multi-layer packaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* মাউন্টিং গাইড মোডাল */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="EASY NANO TAPE MOUNTING"
        description="Mount Your Metal Poster in Under 30 Seconds (No Wall Damage)"
        maxWidth="md"
      >
        <div className="space-y-3.5 text-left">
          <div className="w-full aspect-[16/9] max-h-36 sm:max-h-48 bg-gradient-to-br from-slate-100 to-blue-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-700">
            <Eye className="w-7 h-7 text-black" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs sm:text-sm font-bold text-black">
              Step-by-Step Nano Tape Mounting:
            </h4>
            <ol className="text-[10.5px] sm:text-xs text-slate-600 space-y-1.5 list-decimal pl-4 leading-relaxed">
              <li>Wipe and clean your desired wall area with a dry cloth to remove dust.</li>
              <li>Take the <strong>3 pieces of included nano tape</strong> and stick them evenly onto the back of your 1mm steel poster.</li>
              <li>Peel off the transparent protective film from each nano tape strip.</li>
              <li>Align the poster on your wall and press firmly for 15–20 seconds. Done!</li>
            </ol>
          </div>
          <div className="pt-2 flex gap-3">
            <Button
              variant="primary"
              className="w-full h-10 sm:h-11 text-xs uppercase font-bold bg-black hover:bg-neutral-800 text-white cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              Got It
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

HomePage.displayName = 'HomePage';
export default HomePage;