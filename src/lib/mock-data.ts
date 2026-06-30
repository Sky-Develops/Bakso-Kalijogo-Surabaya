// src/lib/mock-data.ts
import { Category, Product } from "@/types";

export const categories: Category[] = [
  { id: "all", name: "Semua", icon: "Menu" },
  { id: "bakso", name: "Bakso", icon: "Bakso" },
  { id: "mie-ayam", name: "Mie Ayam", icon: "Mie" },
  { id: "minuman", name: "Minuman", icon: "Minum" },
  { id: "tambahan", name: "Tambahan", icon: "Extra" },
];

const productImages = {
  baksoSpecial:
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
  baksoUrat:
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
  baksoHalus:
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80",
  baksoJumbo:
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
  baksoBakar:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  baksoKuah:
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
  mieAyam:
    "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80",
  mieAyamSpesial:
    "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80",
  esTeh:
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80",
  esJeruk:
    "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80",
  airMineral:
    "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80",
  tahuGoreng:
    "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=900&q=80",
  pangsitGoreng:
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80",
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Bakso Spesial",
    description:
      "Bakso sapi pilihan dengan kuah kaldu bening, mie, bihun, tahu, sawi, dan bawang goreng.",
    price: 18000,
    imageUrl: productImages.baksoSpecial,
    imageAlt: "Semangkuk bakso spesial dengan mie dan kuah kaldu",
    isAvailable: true,
    categoryId: "bakso",
    badge: "Terlaris",
    rating: 4.9,
    soldCount: 250,
    spiceLevel: "Bisa request pedas",
    toppings: ["Bakso halus", "Tahu", "Mie", "Bihun", "Sawi"],
    servingTime: "8-12 menit",
    recommendations: ["Es Teh Manis", "Pangsit Goreng"],
  },
  {
    id: "p2",
    name: "Bakso Urat",
    description:
      "Bakso urat sapi bertekstur kenyal dengan kuah gurih dan sambal rumah.",
    price: 15000,
    imageUrl: productImages.baksoUrat,
    imageAlt: "Bakso urat dalam kuah kaldu hangat",
    isAvailable: true,
    categoryId: "bakso",
    badge: null,
    rating: 4.7,
    soldCount: 120,
    spiceLevel: "Normal atau pedas",
    toppings: ["Bakso urat", "Mie", "Bihun", "Sawi"],
    servingTime: "8-12 menit",
    recommendations: ["Es Jeruk", "Tahu Goreng"],
  },
  {
    id: "p3",
    name: "Bakso Halus",
    description:
      "Bakso sapi tekstur halus, ringan, dan cocok untuk anak maupun keluarga.",
    price: 14000,
    imageUrl: productImages.baksoHalus,
    imageAlt: "Bakso halus dengan kuah kaldu sapi",
    isAvailable: true,
    categoryId: "bakso",
    badge: null,
    rating: 4.6,
    soldCount: 98,
    spiceLevel: "Tidak pedas",
    toppings: ["Bakso halus", "Mie", "Bihun", "Sawi"],
    servingTime: "7-10 menit",
    recommendations: ["Air Mineral", "Pangsit Goreng"],
  },
  {
    id: "p4",
    name: "Bakso Jumbo",
    description:
      "Bakso ukuran besar dengan isian daging cincang dan kuah kaldu panas.",
    price: 22000,
    imageUrl: productImages.baksoJumbo,
    imageAlt: "Bakso jumbo dengan kuah dan pelengkap",
    isAvailable: true,
    categoryId: "bakso",
    badge: "Baru",
    rating: 4.8,
    soldCount: 45,
    spiceLevel: "Bisa request pedas",
    toppings: ["Bakso jumbo", "Bakso kecil", "Mie", "Sawi"],
    servingTime: "10-14 menit",
    recommendations: ["Es Teh Manis", "Tahu Goreng"],
  },
  {
    id: "p5",
    name: "Bakso Bakar",
    description:
      "Bakso sapi panggang dengan bumbu kecap pedas manis dan taburan wijen.",
    price: 20000,
    imageUrl: productImages.baksoBakar,
    imageAlt: "Bakso bakar berbumbu kecap pedas manis",
    isAvailable: true,
    categoryId: "bakso",
    badge: null,
    rating: 4.7,
    soldCount: 88,
    spiceLevel: "Pedas sedang",
    toppings: ["Bumbu bakar", "Sambal", "Acar"],
    servingTime: "12-15 menit",
    recommendations: ["Es Jeruk", "Air Mineral"],
  },
  {
    id: "p6",
    name: "Bakso Kuah Sapi",
    description:
      "Kuah kaldu sapi pekat dengan irisan daging dan bakso sapi rumahan.",
    price: 16000,
    imageUrl: productImages.baksoKuah,
    imageAlt: "Bakso kuah sapi dengan irisan daging",
    isAvailable: true,
    categoryId: "bakso",
    badge: null,
    rating: 4.8,
    soldCount: 110,
    spiceLevel: "Normal",
    toppings: ["Bakso sapi", "Irisan daging", "Bawang goreng"],
    servingTime: "8-12 menit",
    recommendations: ["Pangsit Goreng", "Es Teh Manis"],
  },
  {
    id: "p7",
    name: "Mie Ayam Biasa",
    description:
      "Mie kenyal dengan ayam kecap gurih, sawi, daun bawang, dan kuah kaldu.",
    price: 14000,
    imageUrl: productImages.mieAyam,
    imageAlt: "Mie ayam dengan topping ayam kecap",
    isAvailable: true,
    categoryId: "mie-ayam",
    badge: null,
    rating: 4.5,
    soldCount: 75,
    spiceLevel: "Sambal terpisah",
    toppings: ["Ayam kecap", "Sawi", "Daun bawang"],
    servingTime: "7-10 menit",
    recommendations: ["Bakso Halus", "Es Teh Manis"],
  },
  {
    id: "p8",
    name: "Mie Ayam Spesial",
    description:
      "Mie ayam dengan double topping ayam, bakso kecil, dan pangsit goreng renyah.",
    price: 18000,
    imageUrl: productImages.mieAyamSpesial,
    imageAlt: "Mie ayam spesial dengan pangsit dan bakso",
    isAvailable: true,
    categoryId: "mie-ayam",
    badge: "Terlaris",
    rating: 4.9,
    soldCount: 195,
    spiceLevel: "Sambal terpisah",
    toppings: ["Double ayam", "Bakso kecil", "Pangsit", "Sawi"],
    servingTime: "9-12 menit",
    recommendations: ["Es Jeruk", "Tahu Goreng"],
  },
  {
    id: "p9",
    name: "Es Teh Manis",
    description: "Teh manis dingin dengan gula pas dan es batu bersih.",
    price: 5000,
    imageUrl: productImages.esTeh,
    imageAlt: "Gelas es teh manis dingin",
    isAvailable: true,
    categoryId: "minuman",
    badge: null,
    rating: 4.6,
    soldCount: 300,
    spiceLevel: "Dingin",
    toppings: ["Es batu", "Teh melati"],
    servingTime: "2-4 menit",
    recommendations: ["Bakso Spesial", "Mie Ayam Biasa"],
  },
  {
    id: "p10",
    name: "Es Jeruk",
    description: "Jeruk peras segar dengan es batu dan gula sesuai selera.",
    price: 7000,
    imageUrl: productImages.esJeruk,
    imageAlt: "Gelas es jeruk segar",
    isAvailable: true,
    categoryId: "minuman",
    badge: null,
    rating: 4.7,
    soldCount: 180,
    spiceLevel: "Dingin",
    toppings: ["Jeruk peras", "Es batu"],
    servingTime: "3-5 menit",
    recommendations: ["Bakso Bakar", "Bakso Urat"],
  },
  {
    id: "p11",
    name: "Air Mineral",
    description: "Air mineral kemasan 600 ml, dingin atau suhu ruang.",
    price: 4000,
    imageUrl: productImages.airMineral,
    imageAlt: "Botol air mineral dingin",
    isAvailable: true,
    categoryId: "minuman",
    badge: null,
    rating: 4.5,
    soldCount: 400,
    spiceLevel: "Dingin atau normal",
    toppings: ["Botol 600 ml"],
    servingTime: "1 menit",
    recommendations: ["Bakso Jumbo", "Bakso Bakar"],
  },
  {
    id: "p12",
    name: "Tahu Goreng",
    description: "Tahu goreng renyah dengan cocolan sambal kacang gurih.",
    price: 3000,
    imageUrl: productImages.tahuGoreng,
    imageAlt: "Tahu goreng renyah",
    isAvailable: true,
    categoryId: "tambahan",
    badge: null,
    rating: 4.5,
    soldCount: 220,
    spiceLevel: "Sambal terpisah",
    toppings: ["Sambal kacang"],
    servingTime: "4-6 menit",
    recommendations: ["Bakso Urat", "Mie Ayam Spesial"],
  },
  {
    id: "p13",
    name: "Pangsit Goreng",
    description: "Pangsit isi ayam, digoreng renyah dan cocok untuk pelengkap kuah.",
    price: 5000,
    imageUrl: productImages.pangsitGoreng,
    imageAlt: "Pangsit goreng renyah",
    isAvailable: true,
    categoryId: "tambahan",
    badge: null,
    rating: 4.8,
    soldCount: 165,
    spiceLevel: "Tidak pedas",
    toppings: ["Saus sambal"],
    servingTime: "4-6 menit",
    recommendations: ["Bakso Spesial", "Mie Ayam Biasa"],
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
  PENDING: { label: "Menunggu Konfirmasi", color: "text-amber-600 bg-amber-50", icon: "..." },
  CONFIRMED: { label: "Dikonfirmasi", color: "text-blue-600 bg-blue-50", icon: "OK" },
  PREPARING: { label: "Sedang Dimasak", color: "text-orange-600 bg-orange-50", icon: "Cook" },
  DELIVERING: { label: "Sedang Diantar", color: "text-green-600 bg-green-50", icon: "Go" },
  DELIVERED: { label: "Sudah Diterima", color: "text-emerald-600 bg-emerald-50", icon: "Done" },
  CANCELLED: { label: "Dibatalkan", color: "text-red-600 bg-red-50", icon: "X" },
};
