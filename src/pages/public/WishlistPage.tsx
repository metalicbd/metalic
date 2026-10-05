import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCartStore } from '@/stores/useCartStore';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist, moveToCart, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleMoveAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((product) => {
      addItem(product, 1);
    });
    clearWishlist();
    toast.success('Moved all saved posters to cart!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Helmet>
        <title>My Wishlist | METALIC</title>
        <meta
          name="description"
          content="View your saved metal wall art posters and move them to cart with cash on delivery in Bangladesh."
        />
      </Helmet>

      {/* টপ ব্যানার */}
      <section className="w-full bg-slate-50/70 border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8 text-left">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-black mb-2 shadow-sm">
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>Saved Artworks ({items.length})</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Keep track of your favorite steel posters and order whenever you are ready.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={clearWishlist}
                className="border-slate-300 text-slate-700 hover:text-red-600 hover:border-red-200 text-xs uppercase font-bold"
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleMoveAllToCart}
                className="bg-black text-white hover:bg-neutral-800 text-xs uppercase font-bold"
                leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
              >
                Move All to Cart
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* মূল কনটেন্ট এরিয়া */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {items.length === 0 ? (
          // খালি উইশলিস্ট স্টেট
          <div className="w-full py-16 px-4 bg-slate-50/70 border border-slate-200/90 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 mb-4 shadow-sm">
              <Heart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-1">
              Your Wishlist is Empty
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
              You haven&apos;t saved any posters yet. Click the heart icon on any metal poster to save it for later!
            </p>
            <Link to="/shop">
              <Button variant="primary" size="sm" className="bg-black text-white px-6">
                Explore Poster Catalog
              </Button>
            </Link>
          </div>
        ) : (
          // উইশলিস্ট গ্রিড (৪-কলাম)
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full text-left">
            {items.map((product) => {
              const isLandscape = product.orientation === 'landscape';
              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white border border-slate-200 rounded-2xl p-3 shadow-subtle hover:shadow-premium hover:border-slate-300 transition-standard relative"
                >
                  {/* পোস্টার ইমেজ ফ্রেম */}
                  <Link
                    to={`/product/${product.slug}`}
                    className={cn(
                      'relative w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center select-none',
                      isLandscape ? 'aspect-[3/2]' : 'aspect-[2/3]'
                    )}
                  >
                    <img
                      src={getPosterThumbnailUrl(product.featuredImage)}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* রিমুভ বাটন */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(product.id);
                      }}
                      aria-label="Remove from wishlist"
                      className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 text-slate-600 hover:text-red-600 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="absolute top-2.5 left-2.5 z-10">
                      <Badge variant="secondary" className="bg-white/90 text-black border-none backdrop-blur-sm">
                        {product.category}
                      </Badge>
                    </div>

                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-black/85 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                        {product.dimensions} • 1mm Steel
                      </span>
                    </div>
                  </Link>

                  {/* পোস্টার ইনফো */}
                  <div className="mt-3.5 flex flex-col space-y-1 flex-1 justify-between">
                    <div>
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="text-sm font-bold text-black group-hover:text-blue-600 transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">
                        {product.dimensions} • {product.finish}
                      </p>
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-slate-100 mt-2">
                      <span className="text-sm font-extrabold text-black">
                        ৳{(product.discountPrice || product.price).toLocaleString('en-IN')}
                      </span>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => moveToCart(product)}
                        className="h-8 px-2.5 text-xs bg-black text-white hover:bg-neutral-800"
                        leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                      >
                        Move to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

WishlistPage.displayName = 'WishlistPage';