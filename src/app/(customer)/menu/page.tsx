"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, ShoppingCart, Utensils } from "lucide-react";
import { products, categories } from "@/lib/mock-data";
import { fetchMenu } from "@/lib/menu-api";
import { ProductCard } from "@/components/product-card";
import { MenuDetailSheet } from "@/components/menu-detail-sheet";
import { useCartStore } from "@/store/cart-store";
import { Category, Product } from "@/types";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [menuProducts, setMenuProducts] = useState<Product[]>(products);
  const [menuCategories, setMenuCategories] = useState<Category[]>(categories);
  const [loading, setLoading] = useState(true);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const syncProducts = useCartStore((state) => state.syncProducts);

  useEffect(() => {
    let active = true;

    fetchMenu()
      .then((data) => {
        if (!active) return;
        const nextProducts = data.products.length > 0 ? data.products : products;
        const nextCategories =
          data.categories.length > 0
            ? [{ id: "all", name: "Semua" }, ...data.categories]
            : categories;

        setMenuProducts(nextProducts);
        setMenuCategories(nextCategories);
        syncProducts(nextProducts);
      })
      .catch(() => {
        if (!active) return;
        setMenuProducts(products);
        setMenuCategories(categories);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [syncProducts]);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return menuProducts.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.categoryId === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, menuProducts, search]);

  const grouped = useMemo(() => {
    if (activeCategory !== "all" || search) {
      const categoryName =
        menuCategories.find((category) => category.id === activeCategory)?.name ??
        "Hasil Pencarian";
      return [{ categoryName, items: filtered }];
    }

    return menuCategories
      .filter((category) => category.id !== "all")
      .map((category) => ({
        categoryName: category.name,
        items: menuProducts.filter((product) => product.categoryId === category.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [activeCategory, filtered, menuCategories, menuProducts, search]);

  return (
    <>
      <div className="min-h-screen overflow-x-hidden bg-neutral-50 dark:bg-neutral-950">
        <div className="sticky top-0 z-30 bg-[#2D5016] dark:bg-[#1a3209]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" className="flex-shrink-0 text-white">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="truncate text-lg font-bold text-white">
                Menu Bakso Kalijogo
              </h1>
            </div>
            <Link href="/cart" className="relative flex-shrink-0 text-white">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-4 md:px-8 lg:px-10">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2.5 shadow-sm dark:bg-neutral-800">
                <Search className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400 dark:text-neutral-200"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto flex-nowrap lg:flex-wrap lg:overflow-visible">
                {menuCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                      activeCategory === category.id
                        ? "bg-white text-[#2D5016]"
                        : "bg-white/12 text-white hover:bg-white/20"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:px-8 md:pb-12 lg:px-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#2D5016]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-400">
              <Utensils className="mb-4 h-14 w-14 opacity-30" />
              <p className="text-lg font-semibold">Menu tidak ditemukan</p>
              <p className="mt-1 text-sm">Coba kata kunci lain atau pilih kategori berbeda</p>
            </div>
          ) : (
            grouped.map((group) => (
              <section key={group.categoryName} className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    {group.categoryName}
                  </h2>
                  <span className="text-xs text-neutral-400">
                    {group.items.length} item
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {group.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetail={setSelectedProduct}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {totalItems > 0 && (
          <Link
            href="/cart"
            className="fixed bottom-20 left-4 right-4 z-40 mx-auto flex max-w-lg items-center justify-between rounded-full bg-[#2D5016] px-5 py-3 text-white shadow-2xl transition-all active:scale-95 md:bottom-6"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#2D5016]">
                {totalItems}
              </span>
              <span className="text-sm font-semibold">Lihat Keranjang</span>
            </div>
            <ShoppingCart className="h-5 w-5" />
          </Link>
        )}
      </div>

      <MenuDetailSheet
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
