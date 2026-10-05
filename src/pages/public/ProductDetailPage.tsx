import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  ArrowLeft, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Info, 
  Truck, 
  RotateCcw,
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X 
} from 'lucide-react';
import { Product } from '@/types/product';
import { getProductBySlug, getRelatedProducts } from '@/services/products/productService';
import { getPosterDetailUrl, getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { ProductCard } from '@/components/product/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchProductData = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await getProductBySlug(slug);
        if (isMounted) {
          if (data) {
            setProduct(data);
            setCurrentImageIndex(0);
            const related = await getRelatedProducts(data.category, data.id, 4);
            if (isMounted) setRelatedProducts(related);
          } else {
            setProduct(null);
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProductData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const allImages = useMemo(() => {
    if (!product) return [];
    return [product.featuredImage, ...(product.gallery || [])].filter(
      (img, index, self) => self.indexOf(img) === index
    );
  }, [product]);

  // ইমেজ ব্যাকগ্রাউন্ড প্রি-লোডিং
  useEffect(() => {
    if (allImages.length > 0) {
      allImages.forEach((imgUrl) => {
        const img = new Image();
        img.src = getPosterDetailUrl(imgUrl);
      });
    }
  }, [allImages]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  }, [allImages]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  }, [allImages]);

  // কীবোর্ড অ্যারো নেভিগেশন
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      navigate('/checkout');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <Skeleton className="w-full aspect-square max-w-md mx-auto rounded-3xl" />
          </div>
          <div className="lg:col-span-6 flex flex-col space-y-4">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded-lg" />
            <Skeleton className="h-10 w-1/2 rounded-lg mt-4" />
            <Skeleton className="h-32 w-full rounded-2xl mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase text-black mb-2">
          Poster Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          The metal poster you are looking for might have been moved or removed.
        </p>
        <Link to="/shop">
          <Button variant="primary" className="bg-black text-white px-6">
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const activeImage = allImages[currentImageIndex] || product.featuredImage;
  const isWishlisted = isInWishlist(product.id);

  const discountPercentage =
    product.discountPrice && product.price > product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Helmet>
        <title>{`${product.title} — Metal Poster | METALIC`}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      {/* ব্যাক বাটন */}
      <div className="w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-1 sm:pb-2 text-left">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </Link>
      </div>

      {/* মূল পোস্টার ভিউ সেকশন */}
      <section className="w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-14 items-start">
          
          {/* বাম পাশ: মোবাইলে অপ্টিমাইজড কমপ্যাক্ট ইমেজ ফ্রেম */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full max-w-[220px] sm:max-w-[320px] lg:max-w-md aspect-square rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-white border border-slate-200 shadow-premium">
              <div
                onClick={() => setIsLightboxOpen(true)}
                role="button"
                tabIndex={0}
                aria-label="Click to enlarge poster"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIsLightboxOpen(true);
                  }
                }}
                className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50/60 border border-slate-100 flex items-center justify-center cursor-pointer group select-none"
              >
                {/* সেন্ট্রাল মেটালিক পোস্টার */}
                <img
                  src={getPosterDetailUrl(activeImage)}
                  alt={product.title}
                  className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:scale-102 cursor-pointer"
                />

                {/* ব্যাজসমূহ */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex flex-col gap-1.5 sm:gap-2 pointer-events-none">
                  {discountPercentage && (
                    <Badge variant="discount" className="shadow-xs text-[9px] sm:text-xs">
                      -{discountPercentage}% OFF
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-white/95 text-black border border-slate-200 shadow-xs text-[9px] sm:text-xs">
                    {product.category}
                  </Badge>
                </div>

                {/* ফুলস্ক্রিন আইকন */}
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/90 border border-slate-200 text-slate-700 shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                {/* ডানে ও বামে যাওয়ার অ্যারো বাটন */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Previous image"
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-md border border-slate-200 transition-all active:scale-95 z-20 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next image"
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-md border border-slate-200 transition-all active:scale-95 z-20 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* থাম্বনেইল গ্যালারি — স্লিম ও কমপ্যাক্ট */}
            {allImages.length > 1 && (
              <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mt-2.5 sm:mt-4 py-1 sm:py-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      'w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-slate-50',
                      currentImageIndex === idx
                        ? 'border-black scale-105 shadow-md'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    )}
                  >
                    <img
                      src={getPosterThumbnailUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ডান পাশ: স্পেসিফিকেশন ও ক্রয় ব্যবস্থা */}
          <div className="lg:col-span-6 flex flex-col text-left space-y-2.5 sm:space-y-6 mt-1 lg:mt-0">
            
            {/* রিভিউ ও স্টক */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 text-[10px] sm:text-xs">
              <div className="flex items-center text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 mr-1" />
                <span>{product.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">({product.reviewCount || 0} reviews)</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600 font-bold uppercase tracking-wider">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* টাইটেল */}
            <h1 className="text-lg sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-black leading-tight">
              {product.title}
            </h1>

            {/* মূল্য প্রদর্শনী */}
            <div className="flex items-baseline space-x-2.5 sm:space-x-3.5 pb-2 sm:pb-3 border-b border-slate-200">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-black">
                ৳{(product.discountPrice || product.price).toLocaleString('en-IN')}
              </span>

              {product.discountPrice && product.discountPrice < product.price && (
                <span className="text-sm sm:text-lg font-bold text-slate-400 line-through">
                  ৳{product.price.toLocaleString('en-IN')}
                </span>
              )}

              {discountPercentage && (
                <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Save ৳{(product.price - product.discountPrice!).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* সাইজ ও স্পেক্স কার্ড */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 py-0.5 sm:py-1">
              <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 flex flex-col space-y-0.5 sm:space-y-1">
                <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Dimensions
                </span>
                <span className="text-[11px] sm:text-sm font-extrabold text-black uppercase">
                  {product.dimensions}
                </span>
                <span className="text-[8px] sm:text-[10px] text-slate-500 font-medium">
                  Thickness: 1mm Heavy Steel
                </span>
              </div>

              <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 flex flex-col space-y-0.5 sm:space-y-1">
                <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Finish & Mounting
                </span>
                <span className="text-[11px] sm:text-sm font-extrabold text-black uppercase">
                  {product.finish}
                </span>
                <span className="text-[8px] sm:text-[10px] text-slate-500 font-medium">
                  3 Pcs Nano Tape Included
                </span>
              </div>
            </div>

            {/* কোয়ান্টিটি ও অ্যাকশন বাটনসমূহ */}
            <div className="flex flex-col space-y-2 sm:space-y-3 pt-1 sm:pt-2">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 sm:p-1 h-9 sm:h-11">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:text-black transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <span className="w-7 sm:w-10 text-center font-bold text-xs sm:text-sm text-black">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:text-black transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white hover:bg-neutral-800 font-bold uppercase tracking-wider sm:tracking-widest text-[10px] sm:text-xs h-9 sm:h-11 shadow-sm cursor-pointer"
                  leftIcon={<ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                >
                  ADD TO CART
                </Button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  aria-label="Toggle Wishlist"
                  className={cn(
                    'w-9 h-9 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0',
                    isWishlisted
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isWishlisted && 'fill-red-500')} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full h-9 sm:h-11 bg-white border-2 border-black text-black hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                BUY IT NOW
              </button>
            </div>

            {/* ডেলিভারি ও ৩ পিস ন্যানো টেপ ট্রাস্ট ব্যাজ */}
            <div className="border-t border-slate-200 pt-3 sm:pt-5 space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs text-slate-600">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span><strong>৩ পিস হেভি-ডিউটি ন্যানো টেপ অন্তর্ভুক্ত:</strong> দেয়ালে কোনো ছিদ্র করার প্রয়োজন নেই।</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span><strong>ক্যাশ অন ডেলিভারি:</strong> পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span><strong>ড্যামেজ রিপ্লেসমেন্ট:</strong> ডেলিভারিতে কোনো ক্ষতি হলে শতভাগ ফ্রি রিপ্লেসমেন্ট।</span>
              </div>
            </div>

            {/* ABOUT THIS POSTER */}
            <div className="border-t border-slate-200 pt-3 sm:pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2 sm:mb-3">
                About this Poster
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {product.description}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ফুলস্ক্রিন প্রফেশনাল ফ্রস্টেড গ্লাস লাইটবক্স মোডাল */}
      {isLightboxOpen && createPortal(
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200 select-none"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close fullscreen view"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer z-30 shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>

          {/* বামের অ্যারো */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer z-30 shadow-lg"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          {/* সেন্ট্রাল শার্প ইমেজ */}
          <img
            src={getPosterDetailUrl(activeImage)}
            alt={product.title}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl select-none"
          />

          {/* ডানের অ্যারো */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer z-30 shadow-lg"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {/* কাউন্টার পিল */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest z-30">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>,
        document.body
      )}

      {/* সম্পর্কিত পোস্টার কালেকশন */}
      {relatedProducts.length > 0 && (
        <section className="w-full px-3 sm:px-6 lg:px-8 py-10 sm:py-16 border-t border-slate-200 bg-slate-50/50">
          <div className="w-full text-left mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black uppercase text-black">
              Related {product.category} Posters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider">
              More high-definition {product.category} metal art
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

ProductDetailPage.displayName = 'ProductDetailPage';
export default ProductDetailPage;