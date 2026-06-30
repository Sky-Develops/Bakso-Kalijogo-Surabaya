import { Order, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from "@/types";

export const CUSTOMER_PHONE_KEY = "bakso-customer-phone";

export type CreateOrderItemInput = {
  productId?: string;
  productName: string;
  productImage?: string | null;
  quantity: number;
  price: number;
  notes?: string;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryArea?: string;
  tableNumber?: string;
  notes?: string;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  shippingFee: number;
  serviceFee: number;
  items: CreateOrderItemInput[];
};

export type UpdateOrderInput = {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  driverName?: string | null;
  driverPhone?: string | null;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Permintaan gagal diproses.");
  }

  return data;
}

export async function createOrder(payload: CreateOrderInput) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readJson<{ order: Order }>(response);
}

export async function fetchOrders(phone?: string) {
  const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
  const response = await fetch(`/api/orders${query}`, { cache: "no-store" });

  return readJson<{ orders: Order[] }>(response);
}

export async function fetchOrder(id: string) {
  const response = await fetch(`/api/orders/${id}`, { cache: "no-store" });

  return readJson<{ order: Order }>(response);
}

export async function updateOrder(id: string, payload: UpdateOrderInput) {
  const response = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readJson<{ order: Order }>(response);
}
