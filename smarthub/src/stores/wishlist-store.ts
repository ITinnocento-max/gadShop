import { create } from "zustand";

export interface WishlistItem {
  id: string;
  slug: string;
  image: string;
  brand: string;
  title: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  clearAll: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  toggleItem: (item) => {
    const existing = get().items.find((i) => i.id === item.id);
    if (existing) {
      set((state) => ({ items: state.items.filter((i) => i.id !== item.id) }));
    } else {
      set((state) => ({ items: [...state.items, item] }));
    }
  },
  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },
  hasItem: (id) => get().items.some((i) => i.id === id),
  clearAll: () => set({ items: [] }),
}));
