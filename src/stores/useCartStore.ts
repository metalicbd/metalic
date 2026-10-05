import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, PosterDimension, PosterFinish } from '@/types/product';
import toast from 'react-hot-toast';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedDimensions: PosterDimension;
  selectedFinish: PosterFinish;
  unitPrice: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // কার্টে পোস্টার যোগ করা (স্বয়ংক্রিয়ভাবে ড্রয়ার ওপেন হবে)
      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex((item) => item.product.id === product.id);

        const effectivePrice =
          product.discountPrice && product.discountPrice < product.price
            ? product.discountPrice
            : product.price;

        if (existingIndex > -1) {
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += quantity;
          set({ items: updatedItems, isOpen: true });
          toast.success(`Updated quantity for "${product.title}" (${updatedItems[existingIndex].quantity})`);
        } else {
          const newItem: CartItem = {
            product,
            quantity,
            selectedDimensions: product.dimensions,
            selectedFinish: product.finish,
            unitPrice: effectivePrice,
          };
          set({ items: [...items, newItem], isOpen: true });
          toast.success(`Added "${product.title}" to cart!`);
        }
      },

      // কার্ট থেকে পোস্টার মুছে ফেলা
      removeItem: (productId: string) => {
        const { items } = get();
        const itemToRemove = items.find((item) => item.product.id === productId);
        const filteredItems = items.filter((item) => item.product.id !== productId);
        set({ items: filteredItems });
        if (itemToRemove) {
          toast.success(`Removed "${itemToRemove.product.title}" from cart`);
        }
      },

      // পোস্টার পরিমাণ (Quantity) বাড়ানো বা কমানো
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const { items } = get();
        const updatedItems = items.map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      // সম্পূর্ণ কার্ট ক্লিয়ার করা
      clearCart: () => set({ items: [] }),

      // মোট কতটি পোস্টার কার্টে আছে তা গণনা
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      // মোট সাবটোটাল মূল্য (টাকায়)
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
      },
    }),
    {
      name: 'metalic-cart-storage',
      partialize: (state) => ({ items: state.items }), // লোকালস্টোরেজে আইটেমগুলো সুরক্ষিত রাখা
    }
  )
);