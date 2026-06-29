// src/types/index.ts
export type Category = {
  id: string;
  name: string;
  icon?: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  categoryId: string;
  category?: Category;
  badge?: "Terlaris" | "Baru" | null;
  rating?: number;
  soldCount?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
  notes?: string;
};

export type OrderType = "ONLINE" | "TAKEAWAY" | "DINE_IN";
export type PaymentMethod = "CASH" | "QRIS" | "TRANSFER_BANK";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED";

export type CheckoutForm = {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
};

export type OrderItem = {
  id: string;
  productId?: string;
  productName: string;
  productImage?: string | null;
  quantity: number;
  price: number;
  notes?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  serviceFee: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  tableNumber?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
};
