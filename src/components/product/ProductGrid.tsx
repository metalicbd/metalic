import React from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { PosterCardSkeleton } from '@/components/ui/Skeleton';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: string[];
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyMessage = 'No metal posters found matching your criteria.',
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onResetFilters,
}) => {
  // লোডিং স্টেট: ৮টি প্রিমিয়াম শিমার স্কেলিটন ফ্রেম
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        {Array.from({ length: 8 }).map((_, index) => (
          <PosterCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // এম্পটি স্টেট: সার্চ বা ফিল্টারে কোনো প্রোডাক্ট না পাওয়া গেলে
  if (products.length === 0) {
    return (
      <div className="w-full py-16 px-4 bg-slate-50/70 border border-slate-200/90 rounded-3xl flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 mb-4 shadow-sm">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-1">
          No Posters Found
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
          {emptyMessage}
        </p>
        {onResetFilters && (
          <Button
            variant="primary"
            size="sm"
            onClick={onResetFilters}
            className="bg-black text-white hover:bg-neutral-800 shadow-sm"
          >
            Reset All Filters
          </Button>
        )}
      </div>
    );
  }

  // মূল প্রোডাক্ট গ্রিড: মোবাইলে ২ কলাম, বড় স্ক্রিনে ৪ কলাম
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistIds.includes(product.id)}
        />
      ))}
    </div>
  );
};

ProductGrid.displayName = 'ProductGrid';