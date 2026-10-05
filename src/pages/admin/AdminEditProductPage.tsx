import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getProductById, updateProduct } from '@/services/products/productService';
import { uploadProductImage } from '@/services/cloudinary/upload';
import { PosterDimension, PosterFinish } from '@/types/product';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft, 
  UploadCloud, 
  Star, 
  Check, 
  Zap, 
  Sparkles, 
  Trash2, 
  Plus, 
  ArrowUpDown 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface NewGalleryUpload {
  file: File;
  preview: string;
}

export const AdminEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ফর্ম ফিল্ডস
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Anime');
  const [dimensions, setDimensions] = useState<PosterDimension>('20 × 30 cm');
  const [finish, setFinish] = useState<PosterFinish>('High Gloss Metallic');
  const [price, setPrice] = useState<number | ''>('');
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(50);
  const [sku, setSku] = useState('');
  const [sortOrder, setSortOrder] = useState<number | ''>(1);
  const [description, setDescription] = useState('');

  // রেটিং ও রিভিউ সংখ্যা এডিট
  const [rating, setRating] = useState<number | ''>(5.0);
  const [reviewCount, setReviewCount] = useState<number | ''>(0);

  // ডিসপ্লে কন্ট্রোলস
  const [showInHero, setShowInHero] = useState(false);
  const [showInHomepage, setShowInHomepage] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // ইমেজ স্টেট (ক্রপার ছাড়া সরাসরি আপলোড)
  const [existingImage, setExistingImage] = useState('');
  const [newPrimaryFile, setNewPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState('');
  
  // মাল্টিপল গ্যালারি ইমেজ ম্যানেজমেন্ট
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [newGalleryUploads, setNewGalleryUploads] = useState<NewGalleryUpload[]>([]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    getProductById(id).then((p) => {
      if (p) {
        setTitle(p.title);
        setCategory(p.category);
        setDimensions(p.dimensions || '20 × 30 cm');
        setFinish(p.finish || 'High Gloss Metallic');
        setPrice(p.price);
        setDiscountPrice(p.discountPrice || '');
        setStockQuantity(p.stockQuantity || 50);
        setSku(p.sku || '');
        setSortOrder(p.sortOrder || 1);
        setDescription(p.description || '');
        setRating(p.rating || 5.0);
        setReviewCount(p.reviewCount || 0);
        setShowInHero(!!p.showInHero);
        setShowInHomepage(p.showInHomepage !== undefined ? p.showInHomepage : true);
        setIsNewArrival(!!p.isNewArrival);
        setIsBestSeller(!!p.isBestSeller);
        setExistingImage(p.featuredImage);
        setExistingGallery((p.gallery || []).filter((g) => g !== p.featuredImage));
      } else {
        toast.error('Product not found.');
      }
      setIsLoading(false);
    });
  }, [id]);

  // নতুন মেইন ইমেজ সিলেক্ট (সরাসরি প্রিভিউ)
  const handlePrimarySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPrimaryFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrimaryPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // নতুন গ্যালারি ইমেজ সিলেক্ট
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (existingGallery.length + newGalleryUploads.length >= 4) {
        toast.error('You can upload a maximum of 4 gallery images.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewGalleryUploads((prev) => [
          ...prev,
          { file, preview: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeExistingGalleryImage = (index: number) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewGalleryUpload = (index: number) => {
    setNewGalleryUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !title.trim() || price === '') {
      toast.error('দয়া করে আবশ্যক তথ্যগুলো পূরণ করুন।');
      return;
    }

    const numericPrice = Number(price);
    const numericDiscount = discountPrice !== '' ? Number(discountPrice) : undefined;

    if (numericDiscount !== undefined && numericDiscount >= numericPrice) {
      toast.error('ডিসকাউন্ট মূল্য মূল দামের চেয়ে কম হতে হবে।');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalFeaturedUrl = existingImage;

      // নতুন প্রাইমারি ছবি থাকলে Cloudinary-তে আপলোড
      if (newPrimaryFile) {
        const uploadRes = await uploadProductImage(newPrimaryFile);
        finalFeaturedUrl = uploadRes.secure_url;
      }

      // নতুন গ্যালারি ছবি থাকলে Cloudinary-তে আপলোড
      const finalGalleryUrls = [finalFeaturedUrl, ...existingGallery];
      for (const item of newGalleryUploads) {
        const res = await uploadProductImage(item.file);
        finalGalleryUrls.push(res.secure_url);
      }

      await updateProduct(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        price: numericPrice,
        discountPrice: numericDiscount,
        featuredImage: finalFeaturedUrl,
        gallery: finalGalleryUrls,
        dimensions,
        thickness: '1 mm',
        finish,
        stockQuantity: stockQuantity === '' ? 50 : Number(stockQuantity),
        sku: sku.trim(),
        sortOrder: sortOrder === '' ? 99 : Number(sortOrder),
        isFeatured: showInHomepage,
        showInHero,
        showInHomepage,
        isNewArrival,
        isBestSeller,
        rating: rating === '' ? 5.0 : Number(rating),
        reviewCount: reviewCount === '' ? 0 : Number(reviewCount),
      });

      toast.success(`Poster "${title}" updated successfully!`);
      navigate('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase">
        Loading Poster Data...
      </div>
    );
  }

  const totalGalleryCount = existingGallery.length + newGalleryUploads.length;

  return (
    <div className="flex flex-col space-y-6">
      <Helmet>
        <title>Edit Poster | METALIC Admin</title>
      </Helmet>

      {/* হেডার */}
      <div className="flex items-center space-x-3">
        <Link
          to="/admin/products"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            Edit Metal Poster
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Update original artwork, gallery shots, rankings, and specs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* বাম পাশ: ইমেজ প্রিভিউ ও গ্যালারি এডিট */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle flex flex-col space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Primary Artwork</span>
            </span>

            {/* মূল ইমেজ ফ্রেম (অরিজিনাল সম্পূর্ণ ছবি দেখাবে) */}
            <label
              className="relative w-full aspect-[4/5] max-w-sm mx-auto rounded-2xl border-2 border-slate-300 flex flex-col items-center justify-center p-2 cursor-pointer overflow-hidden bg-slate-50 group hover:border-black transition-all"
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePrimarySelect}
                className="hidden"
              />

              <img
                src={primaryPreview || existingImage}
                alt={title}
                className="w-full h-full object-contain rounded-xl"
              />

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider rounded-xl">
                Click to Change Image
              </div>
            </label>

            {/* মাল্টিপল গ্যালারি ইমেজ এডিটিং সেকশন (স্ক্রিনশট ৯ ও ১০ অনুযায়ী) */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Gallery Shots ({totalGalleryCount} / 4)
              </span>

              <div className="grid grid-cols-4 gap-2">
                {/* বিদ্যমান গ্যালারি ছবিসমূহ */}
                {existingGallery.map((img, idx) => (
                  <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => removeExistingGalleryImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* নতুন আপলোড করা গ্যালারি ছবিসমূহ */}
                {newGalleryUploads.map((item, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-400 bg-slate-100 group shadow-xs">
                    <img src={item.preview} alt={`New ${idx + 1}`} className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => removeNewGalleryUpload(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* নতুন ছবি যোগ করার স্লট */}
                {totalGalleryCount < 4 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-black flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-colors">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleGallerySelect}
                      className="hidden"
                    />
                    <Plus className="w-5 h-5 text-slate-400" />
                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-1">Upload</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* ডিসপ্লে কন্ট্রোলস */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle flex flex-col space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
              Display & Landing Controls
            </span>

            <label className="p-3.5 rounded-2xl border border-slate-200 hover:border-black flex items-center justify-between cursor-pointer transition-all">
              <div className="flex items-center space-x-2.5">
                <Zap className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-bold uppercase text-black block">FEATURED (HERO SECTION)</span>
                  <span className="text-[10px] text-slate-400">Showcase in main hero on homepage</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showInHero}
                onChange={(e) => setShowInHero(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
            </label>

            <label className="p-3.5 rounded-2xl border border-slate-200 hover:border-black flex items-center justify-between cursor-pointer transition-all">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold uppercase text-black block">SHOW IN HOMEPAGE</span>
                  <span className="text-[10px] text-slate-400">Display in homepage featured collection</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showInHomepage}
                onChange={(e) => setShowInHomepage(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
            </label>

            <label className="p-3.5 rounded-2xl border border-slate-200 hover:border-black flex items-center justify-between cursor-pointer transition-all">
              <span className="text-xs font-bold uppercase text-black">NEW ARRIVAL BADGE</span>
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
            </label>

            <label className="p-3.5 rounded-2xl border border-slate-200 hover:border-black flex items-center justify-between cursor-pointer transition-all">
              <span className="text-xs font-bold uppercase text-black">BEST SELLER LIST</span>
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* ডান পাশ: পোস্টার ডিটেইলস এডিট */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-subtle flex flex-col space-y-4">
            
            <Input
              label="Poster Title *"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 text-xs"
            />

            {/* প্রাইস ও ডিসকাউন্ট প্রাইস */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-black">
                  Base Price (৳ BDT) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPrice(val === '' ? '' : parseInt(val, 10) || '');
                  }}
                  className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-black shadow-xs"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-black">
                  Discount Price (৳ BDT)
                </label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDiscountPrice(val === '' ? '' : parseInt(val, 10) || '');
                  }}
                  placeholder="Optional"
                  className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-black shadow-xs"
                />
              </div>
            </div>

            {/* ক্যাটাগরি ও স্টক */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-black">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-black cursor-pointer shadow-sm"
                >
                  <option value="Anime">Anime</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Movies">Movies</option>
                  <option value="Cars">Cars</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Art">Art</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-black">
                  Unit Stock
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStockQuantity(val === '' ? '' : parseInt(val, 10) || '');
                  }}
                  className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-black shadow-xs font-mono"
                />
              </div>
            </div>

            {/* নাম্বারিং র্যাঙ্ক */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                <span>Sort Order (Display Rank Number) *</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={sortOrder}
                onChange={(e) => {
                  const val = e.target.value;
                  setSortOrder(val === '' ? '' : parseInt(val, 10) || '');
                }}
                className="w-full h-11 px-3 text-xs font-bold bg-white border border-blue-200 rounded-xl outline-none focus:border-black text-black shadow-xs font-mono"
              />
            </div>

            {/* ডাইমেনশন অপশন */}
            <div className="flex flex-col space-y-2 pt-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-black">
                Physical Dimension *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDimensions('20 × 30 cm')}
                  className={cn(
                    'p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer',
                    dimensions === '20 × 30 cm'
                      ? 'border-black bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div>
                    <span className="text-xs font-extrabold text-black block">20 × 30 cm</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Vertical / Portrait</span>
                  </div>
                  {dimensions === '20 × 30 cm' && <Check className="w-4 h-4 text-black" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDimensions('30 × 20 cm')}
                  className={cn(
                    'p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer',
                    dimensions === '30 × 20 cm'
                      ? 'border-black bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div>
                    <span className="text-xs font-extrabold text-black block">30 × 20 cm</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Horizontal / Landscape</span>
                  </div>
                  {dimensions === '30 × 20 cm' && <Check className="w-4 h-4 text-black" />}
                </button>
              </div>
            </div>

            {/* ফিনিশ ও SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-black">
                  Steel Finish
                </label>
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value as PosterFinish)}
                  className="h-11 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-black cursor-pointer shadow-sm"
                >
                  <option value="High Gloss Metallic">High Gloss Metallic</option>
                  <option value="Matte Steel">Matte Steel</option>
                </select>
              </div>

              <Input
                label="SKU Code"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Auto-generated if empty"
                className="h-11 text-xs font-mono"
              />
            </div>

            {/* রেটিং ও রিভিউ সংখ্যা এডিট ইনপুট */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-black flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Display Star Rating</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-black shadow-xs font-mono"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-black">
                  Display Review Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={reviewCount}
                  onChange={(e) => setReviewCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="25"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-black shadow-xs font-mono"
                />
              </div>
            </div>

            {/* ডেসক্রিপশন */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-black">
                Short Description / Technical Report
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write description line by line..."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-black placeholder:text-slate-400 shadow-sm resize-none font-sans"
              />
            </div>

            {/* সেভ বাটন */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 min-h-[52px] bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-black text-xs tracking-widest uppercase rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer mt-4"
            >
              {isSubmitting ? 'Saving Changes...' : 'SAVE & UPDATE POSTER'}
            </button>

          </div>
        </div>

      </form>
    </div>
  );
};

AdminEditProductPage.displayName = 'AdminEditProductPage';