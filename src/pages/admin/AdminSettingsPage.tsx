import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { COLLECTIONS } from '@/services/firebase/firestore';
import { Product } from '@/types/product';
import { getProducts } from '@/services/products/productService';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { 
  SlidersHorizontal, 
  ShoppingBag, 
  AlertTriangle, 
  Eye, 
  Save, 
  Check, 
  ImageIcon 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const AdminSettingsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedHeroImage, setSelectedHeroImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts();
        if (isMounted) {
          setProducts(data);

          const currentHero = data.find((p) => p.showInHero);
          if (currentHero) {
            setSelectedProductId(currentHero.id);
            setSelectedHeroImage(currentHero.heroCustomImage || currentHero.featuredImage);
          } else if (data.length > 0) {
            setSelectedProductId(data[0].id);
            setSelectedHeroImage(data[0].heroCustomImage || data[0].featuredImage);
          }
        }
      } catch (error) {
        console.error('Error fetching products for settings:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // সিলেক্টেড প্রোডাক্ট পরিবর্তন হলে তার প্রথম ইমেজ ডিফল্ট হিরো ইমেজ হিসেবে সেট
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setSelectedHeroImage(prod.heroCustomImage || prod.featuredImage);
    }
  };

  // সিলেক্টেড প্রোডাক্টের সব ছবির তালিকা
  const availableImages = useMemo(() => {
    if (!selectedProduct) return [];
    return [selectedProduct.featuredImage, ...(selectedProduct.gallery || [])].filter(
      (img, index, self) => self.indexOf(img) === index
    );
  }, [selectedProduct]);

  // হিরো পোস্টার ও নির্দিষ্ট ইমেজ হিসেবে ডিপ্লয় করা
  const handleDeployChanges = async () => {
    if (!selectedProductId || !selectedHeroImage) return;

    setIsDeploying(true);
    try {
      const batch = writeBatch(db);

      products.forEach((p) => {
        const pRef = doc(db, COLLECTIONS.PRODUCTS, p.id);
        if (p.id === selectedProductId) {
          batch.update(pRef, { 
            showInHero: true, 
            heroCustomImage: selectedHeroImage,
            updatedAt: new Date().toISOString() 
          });
        } else if (p.showInHero) {
          batch.update(pRef, { showInHero: false, updatedAt: new Date().toISOString() });
        }
      });

      await batch.commit();

      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          showInHero: p.id === selectedProductId,
          heroCustomImage: p.id === selectedProductId ? selectedHeroImage : p.heroCustomImage,
        }))
      );

      toast.success(`Selected image of "${selectedProduct.title}" is now the primary hero artwork!`);
    } catch (error: any) {
      console.error('Failed to deploy hero poster:', error);
      toast.error('Deployment failed. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <Helmet>
        <title>Site Settings | METALIC Admin</title>
      </Helmet>

      {/* হেডার */}
      <div className="text-left pb-2">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans">
          SYSTEM SETTINGS
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mt-1">
          FRONTEND UI & HERO BANNER CONFIGURATION
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 font-mono text-xs uppercase">
          LOADING SYSTEM CONFIGURATION...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* বাম পাশ: HERO BANNER CONTROL ও ইমেজ পিকার */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-subtle flex flex-col space-y-5">
              
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-black">
                  HERO BANNER CONTROL
                </h2>
              </div>

              {/* প্রোডাক্ট ড্রপডাউন সিলেক্টর */}
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-600">
                  FEATURED HERO PRODUCT
                </label>

                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full h-13 px-4 text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-200 focus:border-black rounded-2xl outline-none text-black cursor-pointer shadow-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white text-black">
                      {p.title} (৳{(p.discountPrice || p.price).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* নির্দিষ্ট ইমেজ সিলেক্টর ১:১ স্কয়ার থাম্বনেইল গ্রিড */}
              {availableImages.length > 0 && (
                <div className="flex flex-col space-y-2 pt-2">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Select Specific Image For Hero Showcase:</span>
                  </label>
                  
                  <div className="grid grid-cols-4 gap-2.5">
                    {availableImages.map((img, idx) => {
                      const isSelected = (selectedHeroImage || selectedProduct?.featuredImage) === img;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedHeroImage(img)}
                          className={cn(
                            'relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-black cursor-pointer',
                            isSelected
                              ? 'border-blue-600 ring-2 ring-blue-500/40 scale-105 shadow-md'
                              : 'border-slate-200 opacity-60 hover:opacity-100'
                          )}
                        >
                          <img
                            src={getPosterThumbnailUrl(img)}
                            alt={`Option ${idx + 1}`}
                            className="w-full h-full object-contain"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    যে ছবিতে ক্লিক করবেন, হোমপেজের মূল হিরোতে ঠিক সেই ছবিটি ১:১ ফ্রেম আকারে শোকেস হবে।
                  </p>
                </div>
              )}

              {/* ডিপ্লয় বাটন */}
              <button
                type="button"
                disabled={isDeploying || !selectedProduct}
                onClick={handleDeployChanges}
                className="w-full h-14 bg-black text-white hover:bg-neutral-800 font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 font-mono"
              >
                <Save className="w-4 h-4" />
                <span>{isDeploying ? 'DEPLOYING CHANGES...' : 'DEPLOY UI CHANGES'}</span>
              </button>
            </div>

            {/* গ্লোবাল ব্রডকাস্ট বক্স */}
            <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 flex items-start space-x-3.5 text-left">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                  GLOBAL BROADCAST
                </span>
                <p className="text-[11px] text-amber-800 font-mono mt-0.5 leading-relaxed">
                  UI changes will reflect globally for all users immediately after successful deployment.
                </p>
              </div>
            </div>
          </div>

          {/* ডান পাশ: REAL-TIME PREVIEW (১:১ স্কয়ার প্রিভিউ) */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-subtle flex flex-col justify-between text-left">
              
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-mono font-bold uppercase tracking-widest mb-4">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>REAL-TIME HERO PREVIEW (1:1 SQUARE)</span>
              </div>

              {selectedProduct ? (
                /* সিলেক্টেড নির্দিষ্ট ইমেজ প্রিভিউ — ১:১ স্কয়ার ফ্রেম */
                <div className="relative w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-xl group">
                  <img
                    src={getPosterThumbnailUrl(selectedHeroImage || selectedProduct.featuredImage)}
                    alt={selectedProduct.title}
                    className="w-full h-full object-contain"
                  />

                  {/* টেক্সট ওভারলে */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5 text-white select-none pointer-events-none">
                    <span className="bg-white text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded w-fit mb-1.5 shadow-sm">
                      FEATURED ASSET
                    </span>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider leading-snug line-clamp-2 max-w-xs">
                      {selectedProduct.title}
                    </h3>
                  </div>

                  {/* ফ্লোটিং প্রাইসিং কার্ড */}
                  <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center space-x-3 z-20">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left pr-1">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono leading-none">
                        PRICING
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-white leading-tight font-mono mt-0.5">
                        ৳{(selectedProduct.discountPrice || selectedProduct.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-square rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-mono text-xs">
                  NO POSTER SELECTED
                </div>
              )}

              <div className="pt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                <span>INTERACTIVE ELEMENT</span>
                <span>METALIC UI V1.0</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

AdminSettingsPage.displayName = 'AdminSettingsPage';