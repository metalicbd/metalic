import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Product } from '@/types/product';
import { getProducts, deleteProduct } from '@/services/products/productService';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products for admin:', error);
      toast.error('Failed to load posters.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (productId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setIsDeleting(productId);
    try {
      await deleteProduct(productId);
      toast.success(`Poster "${title}" deleted successfully.`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete poster.');
    } finally {
      setIsDeleting(null);
    }
  };

  // সার্চ ফিল্টারিং
  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6">
      <Helmet>
        <title>Poster Catalog Management | METALIC</title>
      </Helmet>

      {/* হেডার ও অ্যাড নিউ বাটন */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">
            Catalog Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-0.5">
            Metal Posters ({products.length})
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage high-definition 1mm steel posters in 20×30 cm & 30×20 cm formats
          </p>
        </div>

        <Link to="/admin/products/new">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="bg-black text-white hover:bg-neutral-800 text-xs uppercase font-bold tracking-wider rounded-xl shadow-sm cursor-pointer"
          >
            Add New Poster
          </Button>
        </Link>
      </div>

      {/* সার্চ ও ফিল্টার বার */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-subtle flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU, or category..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-black placeholder:text-slate-400"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold uppercase pr-2 hidden sm:inline">
          Showing {filteredProducts.length} Posters
        </span>
      </div>

      {/* পোস্টার টেবিল কার্ড */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-bold uppercase">
            Loading Poster Inventory...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p>No posters found matching &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-3">Artwork</th>
                  <th className="py-3 px-3">Title & SKU</th>
                  <th className="py-3 px-3">Dimensions</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* ১:১ থাম্বনেইল */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shrink-0 aspect-square">
                        <img
                          src={getPosterThumbnailUrl(p.featuredImage)}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* টাইটেল ও এসকিউ */}
                    <td className="py-3 px-3 max-w-xs">
                      <p className="font-bold text-black truncate">{p.title}</p>
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{p.sku}</span>
                    </td>

                    {/* ডাইমেনশন */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 uppercase">
                        {p.dimensions} • 1mm
                      </span>
                    </td>

                    {/* মূল্য */}
                    <td className="py-3 px-3 whitespace-nowrap font-bold text-black">
                      <div>৳{(p.discountPrice || p.price).toLocaleString('en-IN')}</div>
                      {p.discountPrice && p.discountPrice < p.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ৳{p.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    {/* ক্যাটাগরি */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge variant="secondary" className="bg-white border-slate-200 text-black">
                        {p.category}
                      </Badge>
                    </td>

                    {/* অ্যাকশনস: ভিউ, এডিট এবং ডিলিট বাটন */}
                    <td className="py-3 px-3 whitespace-nowrap text-right space-x-1.5">
                      {/* লাইভ পোস্টার ভিউ */}
                      <Link
                        to={`/product/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-black hover:border-slate-300 transition-colors shadow-xs"
                        title="View Live Poster"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {/* এডিট বাটন */}
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-xs cursor-pointer"
                        title="Edit Poster"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>

                      {/* ডিলিট বাটন */}
                      <button
                        type="button"
                        disabled={isDeleting === p.id}
                        onClick={() => handleDelete(p.id, p.title)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                        title="Delete Poster"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

AdminProductsPage.displayName = 'AdminProductsPage';