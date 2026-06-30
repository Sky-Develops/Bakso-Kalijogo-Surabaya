import { Category, Product } from "@/types";

export type MenuPayload = {
  products: Product[];
  categories: Category[];
};

export type MenuItemInput = {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  imageAlt?: string;
  badge?: "Terlaris" | "Baru" | null;
  rating?: number;
  stockQuantity?: number;
  isAvailable: boolean;
  spiceLevel?: string;
  toppings?: string[];
  servingTime?: string;
  recommendations?: string[];
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Permintaan gagal diproses.");
  }

  return data;
}

export async function fetchMenu() {
  const response = await fetch("/api/menu", { cache: "no-store" });
  return readJson<MenuPayload>(response);
}

export async function createMenuItem(payload: MenuItemInput) {
  const response = await fetch("/api/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readJson<{ product: Product }>(response);
}

export async function updateMenuItem(id: string, payload: MenuItemInput) {
  const response = await fetch(`/api/menu/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readJson<{ product: Product }>(response);
}

export async function deleteMenuItem(id: string) {
  const response = await fetch(`/api/menu/${id}`, { method: "DELETE" });
  return readJson<{ ok: true }>(response);
}
