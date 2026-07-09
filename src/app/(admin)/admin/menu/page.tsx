"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Loader2,
  PackageX,
  Plus,
  Search,
  ToggleLeft,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { uploadMenuImage } from "@/lib/menu-image-upload";
import {
  createMenuItem,
  deleteMenuItem,
  fetchMenu,
  MenuItemInput,
  updateMenuItem,
} from "@/lib/menu-api";
import { formatPrice } from "@/lib/mock-data";
import { Category, Product } from "@/types";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type MenuFormState = {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
  badge: "" | "Terlaris" | "Baru";
  rating: string;
  stockQuantity: string;
  isAvailable: boolean;
  spiceLevel: string;
  toppings: string;
  servingTime: string;
  recommendations: string;
};

const EMPTY_FORM: MenuFormState = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  imageAlt: "",
  badge: "",
  rating: "4.8",
  stockQuantity: "20",
  isAvailable: true,
  spiceLevel: "Sedang",
  toppings: "",
  servingTime: "10-15 menit",
  recommendations: "",
};

function toCsv(values?: string[]) {
  return values?.join(", ") ?? "";
}

function fromCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function productToForm(product: Product): MenuFormState {
  return {
    categoryId: product.categoryId,
    name: product.name,
    description: product.description ?? "",
    price: product.price.toString(),
    imageUrl: product.imageUrl ?? "",
    imageAlt: product.imageAlt ?? "",
    badge: product.badge ?? "",
    rating: (product.rating ?? 4.8).toString(),
    stockQuantity: (product.stockQuantity ?? 20).toString(),
    isAvailable: product.isAvailable,
    spiceLevel: product.spiceLevel ?? "",
    toppings: toCsv(product.toppings),
    servingTime: product.servingTime ?? "",
    recommendations: toCsv(product.recommendations),
  };
}

function formToPayload(form: MenuFormState): MenuItemInput {
  return {
    categoryId: form.categoryId,
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    imageUrl: form.imageUrl.trim(),
    imageAlt: form.imageAlt.trim(),
    badge: form.badge || null,
    rating: Number(form.rating) || 4.8,
    stockQuantity: Number(form.stockQuantity) || 0,
    isAvailable: form.isAvailable,
    spiceLevel: form.spiceLevel.trim(),
    toppings: fromCsv(form.toppings),
    servingTime: form.servingTime.trim(),
    recommendations: fromCsv(form.recommendations),
  };
}

export default function AdminMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<MenuFormState>(EMPTY_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran maksimal 2MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Tipe file harus jpg/png/webp");
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadMenuImage(file);
      setForm((current) => ({ ...current, imageUrl: url }));
      toast.success("Gambar berhasil diupload");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal upload gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  const loadMenu = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMenu();
      setProducts(data.products);
      setCategories(data.categories);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || data.categories[0]?.id || "",
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat menu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMenu();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadMenu]);

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase();
    return products.filter((product) => {
      const categoryName = product.category?.name ?? "";
      return (
        product.name.toLowerCase().includes(keyword) ||
        categoryName.toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id ?? "",
    });
    setFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.categoryId) {
      toast.error("Kategori wajib dipilih.");
      return;
    }

    setSaving(true);
    try {
      const payload = formToPayload(form);
      const result = editingProduct
        ? await updateMenuItem(editingProduct.id, payload)
        : await createMenuItem(payload);

      setProducts((current) => {
        if (editingProduct) {
          return current.map((product) =>
            product.id === editingProduct.id ? result.product : product
          );
        }
        return [result.product, ...current];
      });
      toast.success(editingProduct ? "Menu berhasil diperbarui." : "Menu berhasil ditambahkan.");
      setFormOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan menu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const ok = window.confirm(`Hapus menu "${product.name}"?`);
    if (!ok) return;

    try {
      await deleteMenuItem(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast.success("Menu berhasil dihapus.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus menu.");
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const payload = formToPayload({
        ...productToForm(product),
        isAvailable: !product.isAvailable,
        stockQuantity:
          !product.isAvailable && (product.stockQuantity ?? 0) <= 0
            ? "20"
            : (product.stockQuantity ?? 0).toString(),
      });
      const result = await updateMenuItem(product.id, payload);
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? result.product : item))
      );
      toast.success(result.product.isAvailable ? "Menu tersedia." : "Menu diset habis.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah status.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-5 overflow-x-hidden">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Menu</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            Menu tersimpan di Supabase dan dipakai langsung oleh customer.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Tambah Menu Baru
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Cari nama menu atau kategori..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#2D5016]" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex gap-3">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.imageAlt ?? product.name}
                    className="h-16 w-16 flex-shrink-0 rounded-lg"
                    sizes="64px"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-neutral-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {product.category?.name ?? "Tanpa kategori"}
                    </p>
                    <p className="mt-1 font-bold text-primary">{formatPrice(product.price)}</p>
                  </div>
                  <span
                    className={cn(
                      "h-fit rounded-full px-2 py-0.5 text-[10px] font-bold",
                      product.isAvailable
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {product.isAvailable ? "Tersedia" : "Habis"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-neutral-500">
                  <span>Stok {product.stockQuantity ?? 0}</span>
                  <span>{product.soldCount ?? 0} terjual</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openEditForm(product)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-neutral-200 py-2 text-xs font-bold dark:border-neutral-700"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-neutral-200 py-2 text-xs font-bold dark:border-neutral-700"
                  >
                    <ToggleLeft className="h-3.5 w-3.5" />
                    Status
                  </button>
                  <button
                    onClick={() => void handleDelete(product)}
                    className="flex items-center justify-center gap-1 rounded-lg bg-red-50 py-2 text-xs font-bold text-red-600 dark:bg-red-900/10 dark:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-neutral-50 font-medium text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                  <tr>
                    <th className="px-5 py-4">Foto</th>
                    <th className="px-5 py-4">Informasi Menu</th>
                    <th className="px-5 py-4">Kategori</th>
                    <th className="px-5 py-4 text-right">Harga</th>
                    <th className="px-5 py-4 text-center">Stok</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                    >
                      <td className="px-5 py-4">
                        <ProductImage
                          src={product.imageUrl}
                          alt={product.imageAlt ?? product.name}
                          className="h-12 w-12 rounded-lg"
                          sizes="48px"
                        />
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-bold text-neutral-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="mt-1 max-w-md line-clamp-2 text-xs text-neutral-500">
                          {product.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {product.badge && (
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                              {product.badge}
                            </span>
                          )}
                          {product.spiceLevel && (
                            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500 dark:bg-neutral-800">
                              {product.spiceLevel}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {product.category?.name ?? "Tanpa kategori"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right align-top font-bold text-neutral-900 dark:text-white">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-5 py-4 text-center align-top">
                        <p className="font-bold text-neutral-900 dark:text-white">
                          {product.stockQuantity ?? 0}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          {product.soldCount ?? 0} terjual
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center align-top">
                        <button
                          onClick={() => handleToggleAvailability(product)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold",
                            product.isAvailable
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {product.isAvailable ? "Tersedia" : "Habis"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right align-top">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(product)}
                            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-blue-500 dark:hover:bg-neutral-800"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => void handleDelete(product)}
                            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10"
                            aria-label={`Hapus ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                        <PackageX className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
                        Menu tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-6 max-w-3xl rounded-xl bg-white shadow-xl dark:bg-neutral-950">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingProduct ? "Edit Menu" : "Tambah Menu"}
                </h2>
                <p className="text-sm text-neutral-500">
                  Data ini langsung dipakai di menu customer.
                </p>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold">
                Nama Menu
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                  required
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold">
                Kategori
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                  required
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-semibold">
                Harga
                <input
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  type="number"
                  min="0"
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                  required
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold">
                Stok
                <input
                  value={form.stockQuantity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      stockQuantity: event.target.value,
                      isAvailable: Number(event.target.value) > 0 && form.isAvailable,
                    })
                  }
                  type="number"
                  min="0"
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
                Deskripsi
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  rows={3}
                  className="resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
                Foto Produk
                <div className="flex gap-2 items-center">
                  <input
                    value={form.imageUrl}
                    onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                    placeholder="https://images.unsplash.com/... (atau upload file)"
                    className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp" 
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <button type="button" disabled={uploadingImage} className="flex h-[38px] items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 text-sm font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 pointer-events-none">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload
                    </button>
                  </div>
                </div>
                {form.imageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-neutral-500 mb-1">Preview:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-neutral-200 dark:border-neutral-800" />
                  </div>
                )}
              </label>

              <label className="grid gap-1.5 text-sm font-semibold">
                Alt Foto
                <input
                  value={form.imageAlt}
                  onChange={(event) => setForm({ ...form, imageAlt: event.target.value })}
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold">
                Badge
                <select
                  value={form.badge}
                  onChange={(event) =>
                    setForm({ ...form, badge: event.target.value as MenuFormState["badge"] })
                  }
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <option value="">Tanpa badge</option>
                  <option value="Terlaris">Terlaris</option>
                  <option value="Baru">Baru</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-semibold">
                Rating
                <input
                  value={form.rating}
                  onChange={(event) => setForm({ ...form, rating: event.target.value })}
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold">
                Level Pedas
                <input
                  value={form.spiceLevel}
                  onChange={(event) => setForm({ ...form, spiceLevel: event.target.value })}
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold">
                Waktu Saji
                <input
                  value={form.servingTime}
                  onChange={(event) => setForm({ ...form, servingTime: event.target.value })}
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold">
                Isi/Topping
                <input
                  value={form.toppings}
                  onChange={(event) => setForm({ ...form, toppings: event.target.value })}
                  placeholder="Bakso halus, pangsit, seledri"
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold">
                Rekomendasi
                <input
                  value={form.recommendations}
                  onChange={(event) =>
                    setForm({ ...form, recommendations: event.target.value })
                  }
                  placeholder="Es Teh, Pangsit Goreng"
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-3 text-sm font-semibold dark:border-neutral-700 sm:col-span-2">
                Menu tersedia untuk customer
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })}
                  className="h-5 w-5 accent-[#2D5016]"
                />
              </label>

              <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800 sm:col-span-2 sm:flex-row sm:justify-end">
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
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
