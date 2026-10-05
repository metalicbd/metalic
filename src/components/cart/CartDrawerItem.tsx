import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem, useCartStore } from '@/stores/useCartStore';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { cn } from '@/utils/cn';

interface CartDrawerItemProps {
  item: CartItem;
  onItemClick?: () => void;
}

export const CartDrawerItem: React.FC<CartDrawerItemProps> = ({ item, onItemClick }) => {
  const { updateQuantity, removeItem } = useCartStore();

  const itemTotal = item.unitPrice * item.quantity;
  const isLandscape = item.selectedDimensions === '30 × 20 cm';

  return (
    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-standard text-left">
      
      {/* পোস্টার থাম্বনেইল (20x30 cm বা 30x20 cm অনুপাত) */}
      <Link
        to={`/product/${item.product.slug}`}
        onClick={onItemClick}
        className={cn(
          'rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200 relative block',
          isLandscape ? 'w-20 aspect-[3/2]' : 'w-16 aspect-[2/3]'
        )}
      >
        <img
          src={getPosterThumbnailUrl(item.product.featuredImage)}
          alt={item.product.title}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* পোস্টার ইনফো ও কন্ট্রোলস */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/product/${item.product.slug}`}
            onClick={onItemClick}
            className="hover:text-blue-600 transition-colors"
          >
            <h4 className="text-xs font-bold text-black truncate leading-snug">
              {item.product.title}
            </h4>
          </Link>

          {/* ডিলিট বাটন */}
          <button
            type="button"
            onClick={() => removeItem(item.product.id)}
            aria-label="Remove item"
            className="text-slate-400 hover:text-red-600 p-1 -mr-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* সাইজ ও স্পেসিফিকেশন ট্যাগ */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {item.selectedDimensions}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            • 1mm Steel
          </span>
        </div>

        {/* মূল্য এবং কোয়ান্টিটি কন্ট্রোল */}
        <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-100">
          <span className="text-xs font-black text-black">
            ৳{itemTotal.toLocaleString('en-IN')}
          </span>

          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              className="w-5 h-5 rounded bg-white shadow-xs flex items-center justify-center text-slate-700 hover:text-black transition-colors"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="w-6 text-center font-bold text-xs text-black">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              className="w-5 h-5 rounded bg-white shadow-xs flex items-center justify-center text-slate-700 hover:text-black transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

CartDrawerItem.displayName = 'CartDrawerItem';