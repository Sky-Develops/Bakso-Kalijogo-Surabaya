// src/store/order-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order, OrderStatus } from "@/types";

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrderById: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      updateOrderStatus: (id, status) =>
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        }),
      getOrderById: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "bakso-orders" }
  )
);
