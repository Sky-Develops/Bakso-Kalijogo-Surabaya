// src/lib/mock-data.ts
import { Category, Product, Order } from "@/types";

export const categories: Category[] = [
  { id: "all", name: "Semua", icon: "🍽️" },
  { id: "bakso", name: "Bakso", icon: "🍜" },
  { id: "mie-ayam", name: "Mie Ayam", icon: "🍝" },
  { id: "minuman", name: "Minuman", icon: "🧋" },
  { id: "tambahan", name: "Tambahan", icon: "🍡" },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Bakso Spesial",
    description:
      "Bakso daging sapi segar pilihan, kenyal sempurna dengan kuah kaldu sapi yang gurih. Disajikan dengan mie, bihun, tahu, dan pelengkap segar.",
    price: 18000,
    imageUrl: "🍜",
    isAvailable: true,
    categoryId: "bakso",
    badge: "Terlaris",
    rating: 4.9,
    soldCount: 250,
  },
  {
    id: "p2",
    name: "Bakso Urat",
    description: "Bakso dengan isian urat sapi pilihan, bertekstur kenyal dan gurih.",
    price: 15000,
    imageUrl: "🥣",
    isAvailable: true,
    categoryId: "bakso",
    badge: null,
    rating: 4.7,
    soldCount: 120,
  },
  {
    id: "p3",
    name: "Bakso Halus",
    description: "Bakso dengan tekstur halus lembut, cocok untuk semua usia.",
    price: 14000,
    imageUrl: "🍲",
    isAvailable: true,
    categoryId: "bakso",
    badge: null,
    rating: 4.6,
    soldCount: 98,
  },
  {
    id: "p4",
    name: "Bakso Jumbo",
    description: "Bakso berukuran jumbo dengan isian daging cincang pilihan yang melimpah.",
    price: 22000,
    imageUrl: "🎁",
    isAvailable: true,
    categoryId: "bakso",
    badge: "Baru",
    rating: 4.8,
    soldCount: 45,
  },
  {
    id: "p5",
    name: "Bakso Bakar",
    description: "Bakso panggang dengan bumbu kecap manis pedas yang menggugah selera.",
    price: 20000,
    imageUrl: "🔥",
    isAvailable: true,
    categoryId: "bakso",
    badge: null,
    rating: 4.7,
    soldCount: 88,
  },
  {
    id: "p6",
    name: "Bakso Kuah Sapi",
    description: "Kuah kaldu sapi asli yang kaya rasa dengan irisan daging sapi lembut.",
    price: 16000,
    imageUrl: "🥘",
    isAvailable: true,
    categoryId: "bakso",
    badge: null,
    rating: 4.8,
    soldCount: 110,
  },
  {
    id: "p7",
    name: "Mie Ayam Biasa",
    description: "Mie ayam klasik dengan topping ayam cincang bumbu kecap yang lezat.",
    price: 14000,
    imageUrl: "🍜",
    isAvailable: true,
    categoryId: "mie-ayam",
    badge: null,
    rating: 4.5,
    soldCount: 75,
  },
  {
    id: "p8",
    name: "Mie Ayam Spesial",
    description: "Mie ayam premium dengan double topping ayam dan pangsit goreng renyah.",
    price: 18000,
    imageUrl: "🌶️",
    isAvailable: true,
    categoryId: "mie-ayam",
    badge: "Terlaris",
    rating: 4.9,
    soldCount: 195,
  },
  {
    id: "p9",
    name: "Es Teh Manis",
    description: "Teh manis segar dengan es batu pilihan.",
    price: 5000,
    imageUrl: "🧋",
    isAvailable: true,
    categoryId: "minuman",
    badge: null,
    rating: 4.6,
    soldCount: 300,
  },
  {
    id: "p10",
    name: "Es Jeruk",
    description: "Jeruk peras segar dengan es batu dan gula asli.",
    price: 7000,
    imageUrl: "🍊",
    isAvailable: true,
    categoryId: "minuman",
    badge: null,
    rating: 4.7,
    soldCount: 180,
  },
  {
    id: "p11",
    name: "Air Mineral",
    description: "Air mineral kemasan 600ml.",
    price: 4000,
    imageUrl: "💧",
    isAvailable: true,
    categoryId: "minuman",
    badge: null,
    rating: 4.5,
    soldCount: 400,
  },
  {
    id: "p12",
    name: "Tahu Goreng",
    description: "Tahu goreng renyah dengan cocolan sambal kacang.",
    price: 3000,
    imageUrl: "🟨",
    isAvailable: true,
    categoryId: "tambahan",
    badge: null,
    rating: 4.5,
    soldCount: 220,
  },
  {
    id: "p13",
    name: "Pangsit Goreng",
    description: "Pangsit isi daging ayam, digoreng renyah keemasan.",
    price: 5000,
    imageUrl: "🥟",
    isAvailable: true,
    categoryId: "tambahan",
    badge: null,
    rating: 4.8,
    soldCount: 165,
  },
];

export const SHIPPING_FEE = 8000;
export const SERVICE_FEE = 1000;

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const generateOrderNumber = (): string => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `BKJ-${y}${m}${d}-${seq}`;
};

export const ORDER_STATUS_MAP: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  PENDING: { label: "Menunggu Konfirmasi", color: "text-amber-600 bg-amber-50", icon: "⏳" },
  CONFIRMED: { label: "Dikonfirmasi", color: "text-blue-600 bg-blue-50", icon: "✅" },
  PREPARING: { label: "Sedang Dimasak", color: "text-orange-600 bg-orange-50", icon: "👨‍🍳" },
  DELIVERING: { label: "Sedang Diantar", color: "text-green-600 bg-green-50", icon: "🛵" },
  DELIVERED: { label: "Sudah Diterima", color: "text-emerald-600 bg-emerald-50", icon: "🎉" },
  CANCELLED: { label: "Dibatalkan", color: "text-red-600 bg-red-50", icon: "❌" },
};
