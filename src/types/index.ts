export type Category = {
  id: string;
  name: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
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

<<<<<<< HEAD
export type PrintTemplate = {
  header: string;          // Baris atas: nama toko, alamat, no WA
  subHeader: string;       // Sub-header: tagline / keterangan tambahan
  showLogo: boolean;       // Tampilkan nama toko besar di atas
  showOrderNumber: boolean;
  showDate: boolean;
  showCashier: boolean;
  showCustomer: boolean;
  showTableNumber: boolean;
  showItemNotes: boolean;
  showSubtotal: boolean;
  showServiceFee: boolean;
  showShippingFee: boolean;
  dividerChar: string;     // Karakter pembatas, misal "-" atau "="
  footer: string;          // Footer bawah: ucapan terima kasih, promo, dll
  paperSize: "58mm" | "80mm";
};

export type WebsiteConfig = {
  logoUrl: string;
  bannerUrl: string;
  isOpen: boolean;
  announcement: string;
  about: string;
  locationUrl: string;
};

export type PaymentConfig = {
  cashEnabled: boolean;
  transferEnabled: boolean;
  qrisEnabled: boolean;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  qrisImageUrl: string;
};

export type StoreSettings = {
  id: number;
  restaurantName: string;
  whatsappNumber: string;
  address: string;
  serviceFee: number;
  deliveryFeeDefault: number;
  printTemplate: PrintTemplate;
  websiteConfig: WebsiteConfig;
  paymentConfig: PaymentConfig;
  createdAt?: string;
  updatedAt?: string;
};
=======
export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED";

export type DiningTable = {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  qrCodeUrl?: string | null;
  activeQrSession?: QrSession | null;
  currentOrder?: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type QrSession = {
  id: string;
  tableId: string;
  tableNumber: number;
  token: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
};
>>>>>>> 55ef1d5 (update candra 2 juli)
