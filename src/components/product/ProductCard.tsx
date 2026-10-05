import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { cn } from '@/utils/cn';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted: isWishlistedProp,
}) => {
  const addItemToCart = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isItemInWishlist = isWishlistedProp !== undefined ? isWishlistedProp : isInWishlist(product.id);

  const discountPercentage =
    product.discountPrice && product.price > product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  // কার্টে পোস্টার যোগ করা
  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addItemToCart(product, 1);
    }
  };

  // উইশলিস্ট টগল
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
    } else {
      toggleWishlist(product);
    }
  };

  return (
    <div className="group flex flex-col bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-subtle hover:shadow-premium hover:border-slate-300 transition-all duration-300 relative text-left w-full">
      
      {/* ১:১ স্কয়ার ফ্রেম — Glassy Blue Ambient Glow সহ নিখুঁত আর্টওয়ার্ক ভিউ */}
      <Link
        to={`/product/${product.slug || product.id}`}
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-blue-500/20 flex items-center justify-center select-none"
      >
        {/* ১. দুই পাশে সায়ান ও ব্লু মেটালিক অরা লাইট — কালো দাগ পুরোপুরি দূর করে */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-transparent to-cyan-500/30 pointer-events-none z-0" />
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/25 rounded-full blur-2xl pointer-events-none" />

        {/* ২. ছবির সফট অ্যাম্বিয়েন্ট ব্লার গ্লাস ব্যাকগ্রাউন্ড */}
        <img
          src={getPosterThumbnailUrl(product.featuredImage)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-55 scale-125 pointer-events-none transition-transform duration-700"
        />

        {/* ৩. ফ্রস্টেড গ্লাস রিফ্লেকশন ওভারলে */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-blue-400/10 pointer-events-none z-1" />

        {/* ব্যাজসমূহ (ডিসকাউন্ট ও ক্যাটাগরি) */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 items-start">
          {discountPercentage && (
            <span className="bg-red-600 text-white font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow-sm">
              -{discountPercentage}%
            </span>
          )}
          <span className="bg-white/95 text-black font-bold uppercase text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow-sm">
            {product.category}
          </span>
        </div>

        {/* উইশলিস্ট বাটন */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label="Toggle Wishlist"
          className={cn(
            'absolute top-2 right-2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-standard shadow-sm cursor-pointer',
            isItemInWishlist
              ? 'bg-red-50 text-red-500 border border-red-200'
              : 'bg-white/85 text-slate-700 hover:bg-white hover:text-black border border-white/40'
          )}
        >
          <Heart
            className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform active:scale-125', isItemInWishlist && 'fill-red-500')}
          />
        </button>

        {/* ৪. মূল শার্প সেন্ট্রাল মেটালিক পোস্টার */}
        <img
          src={getPosterThumbnailUrl(product.featuredImage)}
          alt={product.title}
          loading="lazy"
          className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(15,23,42,0.65)] group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </Link>

      {/* পোস্টার ডিটেইলস ও প্রাইস সেকশন */}
      <div className="mt-2.5 sm:mt-3 flex flex-col space-y-1 flex-1 justify-between">
        <div>
          {/* রেটিং ও রিভিউ সংখ্যা */}
          <div className="flex items-center space-x-1 text-slate-500 text-[10px] sm:text-[11px] mb-0.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold ml-1 text-slate-800">{product.rating?.toFixed(1) || '5.0'}</span>
            </div>
            <span>•</span>
            <span className="truncate">({product.reviewCount || 0})</span>
          </div>

          {/* টাইটেল */}
          <Link to={`/product/${product.slug || product.id}`}>
            <h3 className="text-xs sm:text-sm font-bold text-black group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* ডাইমেনশন সাবটেক্সট */}
          <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">
            {product.dimensions}
          </p>
        </div>

        {/* প্রাইস ও মোবাইল অপ্টিমাইজড 'Add' বাটন */}
        <div className="pt-2 sm:pt-2.5 flex items-center justify-between border-t border-slate-100 mt-1.5 gap-1">
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-extrabold text-black">
              ৳{(product.discountPrice || product.price).toLocaleString('en-IN')}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-[9px] sm:text-[10px] text-slate-400 line-through leading-none">
                ৳{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            className="h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-xs font-bold uppercase rounded-lg bg-slate-100 hover:bg-black hover:text-white border border-slate-200 transition-all flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Add</span>
          </button>
        </div>

      </div>
    </div>
  );
};

ProductCard.displayName = 'ProductCard';