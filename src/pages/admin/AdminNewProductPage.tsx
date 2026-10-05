import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { uploadProductImage } from '@/services/cloudinary/upload';
import { createProduct } from '@/services/products/productService';
import { PosterDimension, PosterFinish } from '@/types/product';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft, 
  UploadCloud, 
  Image as ImageIcon, 
  Check, 
  Star, 
  Trash2, 
  Zap, 
  Plus, 
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface GalleryUploadItem {
  file: File;
  preview: string;
}

export const AdminNewProductPage: React.FC = () => {
  const navigate = useNavigate();

  // টেক্সট ফিল্ডস
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

  // রেটিং ও রিভিউ সংখ্যা
  const [rating, setRating] = useState<number | ''>(5.0);
  const [reviewCount, setReviewCount] = useState<number | ''>(18);

  // ডিসপ্লে কন্ট্রোল সুইচ
  const [showInHero, setShowInHero] = useState(false);
  const [showInHomepage, setShowInHomepage] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // প্রাইমারি ইমেজ স্টেট (ক্রপার ছাড়া সরাসরি আপলোড)
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string>('');

  // গ্যালারি ইমেজ স্টেট (স্ক্রিনশট ৯ ও ১০ অনুযায়ী ৪টি স্লট)
  const [galleryItems, setGalleryItems] = useState<GalleryUploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // মূল ইমেজ সিলেক্ট
  const handlePrimarySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrimaryFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrimaryPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // গ্যালারি ইমেজ সিলেক্ট (সরাসরি আপলোড)
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (galleryItems.length >= 4) {
        toast.error('You can upload a maximum of 4 gallery images.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryItems((prev) => [
          ...prev,
          { file, preview: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeGalleryItem = (index: number) => {
    setGalleryItems((prev) => prev.filter((_, i) => i !== index));
  };

  // প্রোডাক্ট সাবমিট
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || price === '' || !primaryFile) {
      toast.error('দয়া করে পোস্টারের টাইটেল, মূল্য এবং মূল আর্টওয়ার্ক ইমেজ প্রদান করুন।');
      return;
    }

    const numericPrice = Number(price);
    const numericDiscount = discountPrice !== '' ? Number(discountPrice) : undefined;

    if (numericDiscount !== undefined && numericDiscount >= numericPrice) {
      toast.error('অফার ডিসকাউন্ট মূল্য মূল দামের চেয়ে কম হতে হবে।');
      return;
    }

    setIsSubmitting(true);
    try {
      // ১. Cloudinary-তে আসল প্রাইমারি ইমেজ আপলোড
      const primaryRes = await uploadProductImage(primaryFile);

      // ২. Cloudinary-তে গ্যালারি ইমেজসমূহ আপলোড
      const uploadedGalleryUrls: string[] = [primaryRes.secure_url];
      for (const item of galleryItems) {
        const res = await uploadProductImage(item.file);
        uploadedGalleryUrls.push(res.secure_url);
      }

      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const generatedSku =
        sku.trim() ||
        `MET-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      // ৩. Firestore-এ সম্পূর্ণ ডেটা সেভ
      await createProduct({
        title: title.trim(),
        slug,
        description:
          description.trim() ||
          `High-definition 1mm steel metal poster with ${finish}. Crafted with genuine heavy-gauge industrial steel. Includes 3 pieces of damage-free nano tape.`,
        category,
        price: numericPrice,
        discountPrice: numericDiscount,
        featuredImage: primaryRes.secure_url,
        gallery: uploadedGalleryUrls,
        dimensions,
        thickness: '1 mm',
        finish,
        specifications: {
          dimensions,
          thickness: '1 mm',
          material: 'Industrial Grade Rust-Proof Steel',
          mounting: '3 Pieces of Heavy-Duty Nano Tape Included (No Drilling Required)',
          imageRatio: '4:5',
          weight: '420g',
        },
        inStock: true,
        stockQuantity: stockQuantity === '' ? 50 : Number(stockQuantity),
        sku: generatedSku,
        sortOrder: sortOrder === '' ? 99 : Number(sortOrder),
        isFeatured: showInHomepage,
        showInHero,
        showInHomepage,
        isNewArrival,
        isBestSeller,
        tags: [category.toLowerCase(), 'metal poster', dimensions],
        rating: rating === '' ? 5.0 : Number(rating),
        reviewCount: reviewCount === '' ? 0 : Number(reviewCount),
      });

      toast.success(`Poster "${title}" published successfully!`);
      navigate('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'পোস্টার আপলোড ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <Helmet>
        <title>Deploy New Metal Poster | METALIC Admin</title>
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
            Deploy New Metal Poster
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Upload uncropped original artwork to Cloudinary with full specs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* বাম পাশ: সরাসরি ইমেজ আপলোড ও ৪টি গ্যালারি স্লট (স্ক্রিনশট ৯ ও ১০ অনুযায়ী) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-subtle flex flex-col space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Primary Artwork *</span>
            </span>

            {/* মূল ইমেজ আপলোড ফ্রেম (কোনো কাটাকাটি ছাড়া সম্পূর্ণ ছবি দেখাবে) */}
            <label
              className={cn(
                'relative w-full aspect-[4/5] max-w-sm mx-auto rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all overflow-hidden bg-slate-50/70 hover:bg-slate-50',
                primaryPreview ? 'border-solid border-slate-300' : 'border-slate-300 hover:border-black'
              )}
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePrimarySelect}
                className="hidden"
              />

              {primaryPreview ? (
                <>
                  <img
                    src={primaryPreview}
                    alt="Main Artwork"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider rounded-xl">
                    Change Image
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-slate-400 p-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-black uppercase tracking-wider">
                    Upload Primary Artwork
                  </p>
                  <p className="text-[10px] text-slate-400">
                    High-Res PNG, JPG or WEBP (Displays in Full)
                  </p>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded">
                    Cloudinary Secured
                  </span>
                </div>
              )}
            </label>

            {/* স্ক্রিনশট ৯ ও ১০ অনুযায়ী গ্যালারি ইমেজ স্লট (৪টি স্লট) */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Gallery Shots ({galleryItems.length} / 4)
              </span>

              <div className="grid grid-cols-4 gap-2">
                {galleryItems.map((item, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                    <img src={item.preview} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain" />
                    
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                      title="Delete image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {galleryItems.length < 4 && (
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

            {/* FEATURED IN HERO */}
            <label className="p-3.5 rounded-2xl border border-slate-200 hover:border-black flex items-center justify-between cursor-pointer transition-all">
              <div className="flex items-center space-x-2.5">
                <Zap className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-bold uppercase text-black block">FEATURED (HERO SECTION)</span>
                  <span className="text-[10px] text-slate-400">Showcase in main hero section on homepage</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showInHero}
                onChange={(e) => setShowInHero(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
            </label>

            {/* SHOW IN HOMEPAGE */}
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

            {/* NEW ARRIVAL BADGE */}
            <label className="p-3.5 rounded-2xl border border-slate-200 hover:border-black flex items-center justify-between cursor-pointer transition-all">
              <span className="text-xs font-bold uppercase text-black">NEW ARRIVAL BADGE</span>
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
            </label>

            {/* BEST SELLER BADGE */}
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

        {/* ডান পাশ: পোস্টার ডিটেইলস */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-subtle flex flex-col space-y-4">
            
            {/* টাইটেল */}
            <Input
              label="Asset Name (Title) *"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tanjiro Kamado: Water Breathing Legacy"
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
                  placeholder="850"
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
                  placeholder="749 (Optional)"
                  className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-black shadow-xs"
                />
              </div>
            </div>

            {/* ক্যাটাগরি ও স্টক */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-black">
                  Sector (Category) *
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
                  placeholder="50"
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
                placeholder="1"
                className="w-full h-11 px-3 text-xs font-bold bg-white border border-blue-200 rounded-xl outline-none focus:border-black text-black shadow-xs font-mono"
              />
              <span className="text-[10px] text-blue-700 font-medium">
                যাকে ১ দিবেন সে সবার আগে দেখাবে, যাকে ২ দিবেন সে দ্বিতীয়তে দেখাবে।
              </span>
            </div>

            {/* ডাইমেনশন অপশন */}
            <div className="flex flex-col space-y-2 pt-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-black">
                Select Physical Dimension (Product Page Specs) *
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
                  placeholder="18"
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

            {/* সাবমিট বাটন */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 min-h-[52px] bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-black text-xs tracking-widest uppercase rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer mt-4"
            >
              {isSubmitting ? 'Deploying to Cloudinary & Firestore...' : 'DEPLOY POSTER TO CATALOG'}
            </button>

          </div>
        </div>

      </form>
    </div>
  );
};

AdminNewProductPage.displayName = 'AdminNewProductPage';