import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';
import { useCartStore } from './useCartStore';
import toast from 'react-hot-toast';

interface WishlistStore {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (product: Product) => void;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      // উইশলিস্টে যোগ করা
      addToWishlist: (product: Product) => {
        const { items } = get();
        if (!items.some((item) => item.id === product.id)) {
          set({ items: [...items, product] });
          toast.success(`Saved "${product.title}" to wishlist!`);
        }
      },

      // উইশলিস্ট থেকে সরানো
      removeFromWishlist: (productId: string) => {
        const { items } = get();
        const item = items.find((i) => i.id === productId);
        set({ items: items.filter((i) => i.id !== productId) });
        if (item) {
          toast.success(`Removed "${item.title}" from wishlist`);
        }
      },

      // টগল (থাকলে সরানো, না থাকলে যোগ করা)
      toggleWishlist: (product: Product) => {
        const { items, addToWishlist, removeFromWishlist } = get();
        if (items.some((i) => i.id === product.id)) {
          removeFromWishlist(product.id);
        } else {
          addToWishlist(product);
        }
      },

      // চেক করা যে প্রোডাক্টটি উইশলিস্টে আছে কি না
      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      // উইশলিস্ট থেকে এক ক্লিকে কার্টে মুভ করা
      moveToCart: (product: Product) => {
        useCartStore.getState().addItem(product, 1);
        get().removeFromWishlist(product.id);
      },

      // পুরো উইশলিস্ট খালি করা
      clearWishlist: () => set({ items: [] }),

      // মোট কতটি পোস্টার সেভ আছে
      getTotalItems: () => get().items.length,
    }),
    {
      name: 'metalic-wishlist-storage',
    }
  )
);