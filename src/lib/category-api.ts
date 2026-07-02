import { Category } from "@/types";

export type CategoryInput = {
  name: string;
  icon?: string;
  sortOrder: number;
  isActive?: boolean;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Permintaan gagal diproses.");
  }

  return data;
}

export async function fetchCategories() {
  const response = await fetch("/api/categories", { cache: "no-store" });
  return readJson<{ categories: Category[] }>(response);
}

export async function createCategory(payload: CategoryInput) {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readJson<{ category: Category }>(response);
}

export async function updateCategory(id: string, payload: CategoryInput) {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readJson<{ category: Category }>(response);
}

export async function deleteCategory(id: string) {
  const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
  return readJson<{ ok: true }>(response);
}
