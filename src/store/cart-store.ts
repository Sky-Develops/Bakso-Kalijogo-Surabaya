// src/store/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, OrderType } from "@/types";

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  tableNumber: string | null;
  setOrderType: (type: OrderType) => void;
  setTableNumber: (tableId: string | null) => void;
  addItem: (product: Product, notes?: string) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  updateNotes: (productId: string, notes: string) => void;
  syncProducts: (products: Product[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: "ONLINE",
      tableNumber: null,

      setOrderType: (type) => set({ orderType: type }),
      setTableNumber: (tableId) => set({ tableNumber: tableId, orderType: "DINE_IN" }),

      addItem: (product, notes) => {
        const items = get().items;
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1, notes: notes ?? i.notes }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1, notes }] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product.id !== productId) }),

      increaseQuantity: (productId) =>
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }),

      decreaseQuantity: (productId) => {
        const item = get().items.find((i) => i.product.id === productId);
        if (!item) return;
        if (item.quantity <= 1) {
          get().removeItem(productId);
        } else {
          set({
            items: get().items.map((i) =>
              i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        }
      },

      updateNotes: (productId, notes) =>
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, notes } : i
          ),
        }),

      syncProducts: (products) => {
        const productById = new Map(products.map((product) => [product.id, product]));
        set({
          items: get()
            .items.map((item) => {
              const latest = productById.get(item.product.id);
              if (!latest) return item;

              const quantity =
                latest.stockQuantity !== undefined
                  ? Math.min(item.quantity, latest.stockQuantity)
                  : item.quantity;

              return { ...item, product: latest, quantity };
            })
            .filter((item) => {
              const stock = item.product.stockQuantity;
              return item.product.isAvailable && (stock === undefined || stock > 0);
            }),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: "bakso-cart" }
  )
);
