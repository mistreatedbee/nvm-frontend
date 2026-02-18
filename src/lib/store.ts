import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartAPI, wishlistAPI } from './api';

// Auth Store
interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart-storage');
        localStorage.removeItem('wishlist-storage');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Cart Store
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor: {
    id: string;
    name: string;
  };
  variant?: any;
}

interface CartState {
  items: CartItem[];
  syncing: boolean;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncFromServer: () => Promise<void>;
  mergeGuestCartToServer: () => Promise<void>;
  getTotal: () => number;
  getItemsCount: () => number;
}

function hasToken() {
  return Boolean(localStorage.getItem('token'));
}

function mapServerCartItems(serverItems: any[]): CartItem[] {
  return (serverItems || []).map((item: any) => ({
    productId: String(item.productId),
    name: item.product?.name || item.titleSnapshot,
    price: Number(item.priceSnapshot || item.product?.price || 0),
    quantity: Number(item.qty || 1),
    image: item.product?.image || item.imageSnapshot || item.product?.images?.[0]?.url || '',
    vendor: {
      id: String(item.vendorId || item.product?.vendorId || ''),
      name: item.product?.vendor?.storeName || 'Vendor'
    }
  }));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      syncing: false,
      addItem: async (item) => {
        const previous = get().items;
        const existingItem = previous.find((i) => i.productId === item.productId);

        const optimistic = existingItem
          ? previous.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          : [...previous, item];

        set({ items: optimistic });

        try {
          const res = await cartAPI.add(item.productId, item.quantity);
          set({ items: mapServerCartItems(res.data?.data?.items || []) });
        } catch (error) {
          set({ items: previous });
          throw error;
        }
      },
      removeItem: async (productId) => {
        const previous = get().items;
        set({ items: previous.filter((i) => i.productId !== productId) });

        try {
          const res = await cartAPI.remove(productId);
          set({ items: mapServerCartItems(res.data?.data?.items || []) });
        } catch (error) {
          set({ items: previous });
          throw error;
        }
      },
      updateQuantity: async (productId, quantity) => {
        const previous = get().items;
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        set({
          items: previous.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });

        try {
          const res = await cartAPI.update(productId, quantity);
          set({ items: mapServerCartItems(res.data?.data?.items || []) });
        } catch (error) {
          set({ items: previous });
          throw error;
        }
      },
      clearCart: async () => {
        const previous = get().items;
        set({ items: [] });

        try {
          const res = await cartAPI.clear();
          set({ items: mapServerCartItems(res.data?.data?.items || []) });
        } catch (error) {
          set({ items: previous });
          throw error;
        }
      },
      syncFromServer: async () => {
        set({ syncing: true });
        try {
          const res = await cartAPI.get();
          set({ items: mapServerCartItems(res.data?.data?.items || []) });
        } finally {
          set({ syncing: false });
        }
      },
      mergeGuestCartToServer: async () => {
        if (!hasToken()) return;
        const current = get().items;
        if (!current.length) {
          await get().syncFromServer();
          return;
        }

        const payload = current.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }));

        set({ syncing: true });
        try {
          const res = await cartAPI.merge(payload);
          set({ items: mapServerCartItems(res.data?.data?.items || []) });
        } finally {
          set({ syncing: false });
        }
      },
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Wishlist Store
interface WishlistState {
  items: string[];
  syncing: boolean;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncFromServer: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      syncing: false,
      addItem: async (productId) => {
        const previous = get().items;
        if (!previous.includes(productId)) {
          set({ items: [productId, ...previous] });
        }

        if (!hasToken()) return;

        try {
          const res = await wishlistAPI.add(productId);
          set({ items: (res.data?.productIds || []).map(String) });
        } catch (error) {
          set({ items: previous });
          throw error;
        }
      },
      removeItem: async (productId) => {
        const previous = get().items;
        set({ items: previous.filter((id) => id !== productId) });

        if (!hasToken()) return;

        try {
          const res = await wishlistAPI.remove(productId);
          set({ items: (res.data?.productIds || []).map(String) });
        } catch (error) {
          set({ items: previous });
          throw error;
        }
      },
      toggleItem: async (productId) => {
        const previous = get().items;
        const inWishlist = previous.includes(productId);
        const optimistic = inWishlist
          ? previous.filter((id) => id !== productId)
          : [productId, ...previous];

        set({ items: optimistic });

        if (!hasToken()) return !inWishlist;

        try {
          const res = await wishlistAPI.toggle(productId);
          const next = (res.data?.productIds || []).map(String);
          set({ items: next });
          return Boolean(res.data?.isFavourite);
        } catch (error) {
          set({ items: previous });
          throw error;
        }
      },
      isInWishlist: (productId) => get().items.includes(productId),
      clearWishlist: () => set({ items: [] }),
      syncFromServer: async () => {
        if (!hasToken()) return;
        set({ syncing: true });
        try {
          const res = await wishlistAPI.get({ page: 1, limit: 100 });
          set({ items: (res.data?.productIds || []).map(String) });
        } finally {
          set({ syncing: false });
        }
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
