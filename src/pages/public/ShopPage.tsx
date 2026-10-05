import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Product } from '@/types/product';
import { getProducts } from '@/services/products/productService';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

const CATEGORIES = ['ALL', 'ANIME', 'GAMING', 'MOVIES', 'CARS', 'MINIMAL', 'ART'];

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // URL প্যারামস থেকে ফিল্টার সংগ্রহ
  const selectedCategory = searchParams.get('category') || 'ALL';
  const sortBy = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    let isMounted = true;
    const fetchAllProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts({
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          searchQuery: searchQuery || undefined,
          sortBy: sortBy as any,
        });
        if (isMounted) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching shop products:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllProducts();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, sortBy, searchQuery]);

  const updateCategory = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'ALL') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const updateSort = (sortVal: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortVal);
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Helmet>
        <title>All Metal Posters | METALIC</title>
        <meta
          name="description"
          content="Browse our full collection of high-definition 1mm steel metal posters. Authentic wall art in Bangladesh."
        />
      </Helmet>

      {/* টপ ব্যানার — মোবাইলে স্লিক ও কমপ্যাক্ট, পিসিতে বড় ও স্পেসিয়াস */}
      <section className="w-full bg-slate-50/70 border-b border-slate-200 py-4 sm:py-10 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white border border-slate-200 text-[8px] sm:text-xs font-bold uppercase tracking-wider text-black mb-1.5 sm:mb-3 shadow-2xs">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
            <span>1mm Industrial Steel • Damage-Free Mount</span>
          </div>
          <h1 className="text-xl sm:text-4xl font-black uppercase tracking-tight text-black leading-tight">
            {searchQuery ? `Search Results: "${searchQuery}"` : 'All Metal Posters'}
          </h1>
          <p className="text-[9px] sm:text-sm text-slate-500 uppercase tracking-wider font-medium mt-0.5 sm:mt-1">
            {products.length} {products.length === 1 ? 'Design' : 'Designs'} Available in 20×30 cm & 30×20 cm
          </p>
        </div>
      </section>

      {/* ক্যাটাগরি ও সর্টিং বার — মোবাইলে নো-স্ক্রলবার ও ক্যাটাগরি দৃশ্যমান */}
      <section className="sticky top-15 sm:top-18 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 py-2 sm:py-3.5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-4">
          
          {/* ক্যাটাগরি ভ্যারাইটিজ পিল বাটনসমূহ — নো-স্ক্রলবার মসৃণ সোয়াইপ */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 flex-1 min-w-0">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory.toUpperCase() === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateCategory(cat)}
                  className={cn(
                    'px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9.5px] sm:text-xs font-bold uppercase tracking-wider transition-all shrink-0 select-none cursor-pointer',
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 hover:text-black'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* সর্টিং ড্রপডাউন — মোবাইলে অত্যন্ত স্লিম ও ছোট প্রস্থ (Narrow Width max-w-[95px]) */}
          <div className="flex items-center shrink-0">
            <select
              value={sortBy}
              onChange={(e) => updateSort(e.target.value)}
              className="h-7 sm:h-10 px-1.5 sm:px-3.5 text-[8.5px] sm:text-xs font-bold uppercase tracking-wider bg-white border border-slate-200 rounded-lg sm:rounded-xl outline-none focus:border-black text-slate-800 shadow-2xs transition-standard cursor-pointer max-w-[95px] sm:max-w-none truncate"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </div>
      </section>

      {/* মূল পোস্টার গ্রিড এরিয়া (১:১ স্কয়ার ফ্রেম) */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1">
        <ProductGrid
          products={products}
          isLoading={isLoading}
          onResetFilters={resetFilters}
          emptyMessage={
            searchQuery
              ? `No metal posters found matching "${searchQuery}". Try a different keyword.`
              : 'No metal posters found in this category.'
          }
        />
      </main>
    </div>
  );
};

ShopPage.displayName = 'ShopPage';
export default ShopPage;