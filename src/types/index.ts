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
  imageAlt?: string;
  isAvailable: boolean;
  categoryId: string;
  category?: Category;
  badge?: "Terlaris" | "Baru" | null;
  rating?: number;
  soldCount?: number;
  stockQuantity?: number;
  spiceLevel?: string;
  toppings?: string[];
  servingTime?: string;
  recommendations?: string[];
};

export type CartItem = {
  product: Product;
  quantity: number;
  notes?: string;
};

export type OrderType = "ONLINE" | "TAKEAWAY" | "DINE_IN";
export type PaymentMethod = "CASH" | "QRIS" | "TRANSFER_BANK";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
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
  paymentStatus?: PaymentStatus;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  serviceFee: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryArea?: string;
  driverName?: string;
  driverPhone?: string;
  tableNumber?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
};
