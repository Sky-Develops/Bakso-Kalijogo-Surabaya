import { Category, Product } from "@/types";

export type RawMenuCategory = {
  id: string;
  name: string;
  icon?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
};

export type RawMenuItem = {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price: number | string;
  image_url?: string | null;
  image_alt?: string | null;
  is_available: boolean;
  stock_quantity?: number | null;
  badge?: "Terlaris" | "Baru" | null;
  rating?: number | string | null;
  sold_count?: number | null;
  spice_level?: string | null;
  toppings?: string[] | null;
  serving_time?: string | null;
  recommendations?: string[] | null;
  menu_categories?: RawMenuCategory | RawMenuCategory[] | null;
};

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return undefined;
}

function joinedCategory(row: RawMenuItem) {
  const joined = row.menu_categories;
  if (Array.isArray(joined)) return joined[0];
  return joined;
}

export function mapCategory(row: RawMenuCategory): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? undefined,
    sortOrder: row.sort_order ?? undefined,
    isActive: row.is_active ?? undefined,
  };
}

export function mapProduct(row: RawMenuItem): Product {
  const category = joinedCategory(row);
  const stockQuantity = row.stock_quantity ?? undefined;

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    price: Number(row.price),
    imageUrl: row.image_url ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    isAvailable: row.is_available && (stockQuantity === undefined || stockQuantity > 0),
    stockQuantity,
    categoryId: row.category_id,
    category: category ? mapCategory(category) : undefined,
    badge: row.badge ?? null,
    rating: toNumber(row.rating),
    soldCount: row.sold_count ?? undefined,
    spiceLevel: row.spice_level ?? undefined,
    toppings: row.toppings ?? undefined,
    servingTime: row.serving_time ?? undefined,
    recommendations: row.recommendations ?? undefined,
  };
}
