"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Coffee, Edit, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import {
  CategoryInput,
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/lib/category-api";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CategoryFormState = {
  name: string;
  icon: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: CategoryFormState = {
  name: "",
  icon: "Bowl",
  sortOrder: "0",
  isActive: true,
};

function formToPayload(form: CategoryFormState): CategoryInput {
  return {
    name: form.name.trim(),
    icon: form.icon.trim(),
    sortOrder: Number(form.sortOrder) || 0,
    isActive: form.isActive,
  };
}

function categoryToForm(category: Category): CategoryFormState {
  return {
    name: category.name,
    icon: category.icon ?? "",
    sortOrder: (category.sortOrder ?? 0).toString(),
    isActive: category.isActive ?? true,
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchCategories();
      setCategories(result.categories);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const keyword = search.toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(keyword)
    );
  }, [categories, search]);

  const openCreateForm = () => {
    setEditingCategory(null);
    setForm({
      ...EMPTY_FORM,
      sortOrder: (categories.length + 1).toString(),
    });
    setFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setForm(categoryToForm(category));
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = formToPayload(form);
      const result = editingCategory
        ? await updateCategory(editingCategory.id, payload)
        : await createCategory(payload);

      setCategories((current) => {
        if (editingCategory) {
          return current.map((category) =>
            category.id === editingCategory.id ? result.category : category
          );
        }

        return [...current, result.category].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        );
      });

      toast.success(
        editingCategory ? "Kategori berhasil diperbarui." : "Kategori berhasil ditambahkan."
      );
      setFormOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan kategori.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const ok = window.confirm(`Hapus kategori "${category.name}"?`);
    if (!ok) return;

    try {
      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      toast.success("Kategori berhasil dihapus.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Kategori gagal dihapus. Pastikan tidak ada menu yang memakai kategori ini."
      );
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-5 overflow-x-hidden">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Kategori</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            Kategori tersimpan di Supabase dan dipakai oleh admin menu serta customer menu.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5016] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#2D5016]/90"
        >
          <Plus className="h-5 w-5" />
          Kategori Baru
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Cari kategori..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#2D5016]/50 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#2D5016]" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-[#2D5016]/50 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-sm font-bold text-[#2D5016] dark:bg-neutral-900">
                    {category.icon ? (
                      <span className="truncate px-1 text-center text-xs">{category.icon}</span>
                    ) : (
                      <Coffee className="h-6 w-6 text-neutral-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-neutral-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      Urutan {category.sortOrder ?? 0}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    category.isActive === false
                      ? "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                      : "bg-emerald-100 text-emerald-700"
                  )}
                >
                  {category.isActive === false ? "Nonaktif" : "Aktif"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => openEditForm(category)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-2 text-xs font-bold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => void handleDelete(category)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2 text-xs font-bold text-red-600 dark:bg-red-900/10 dark:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-16 text-center text-neutral-500">
              Kategori tidak ditemukan.
            </div>
          )}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-10 max-w-xl rounded-xl bg-white shadow-xl dark:bg-neutral-950">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
                </h2>
                <p className="text-sm text-neutral-500">Urutan kategori memengaruhi menu customer.</p>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-4">
              <label className="grid gap-1.5 text-sm font-semibold">
                Nama Kategori
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[#2D5016]/30 dark:border-neutral-700 dark:bg-neutral-900"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold">
                  Icon/Label
                  <input
                    value={form.icon}
                    onChange={(event) => setForm({ ...form, icon: event.target.value })}
                    placeholder="Bowl, Drink, Side..."
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[#2D5016]/30 dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold">
                  Urutan
                  <input
                    value={form.sortOrder}
                    onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
                    type="number"
                    min="0"
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[#2D5016]/30 dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </label>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-3 text-sm font-semibold dark:border-neutral-700">
                Kategori aktif
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                  className="h-5 w-5 accent-[#2D5016]"
                />
              </label>

              <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold dark:border-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5016] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
