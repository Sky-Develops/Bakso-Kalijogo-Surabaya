"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { products, categories, formatPrice } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { MenuDetailSheet } from "@/components/menu-detail-sheet";
import { Product } from "@/types";
import { useCartStore } from "@/store/cart-store";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const totalItems = useCartStore((s) => s.getTotalItems());

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === "all" || p.categoryId === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch && p.isAvailable;
    });
  }, [activeCategory, search]);

  // Group by category for display
  const grouped = useMemo(() => {
    if (activeCategory !== "all" || search) {
      const catName =
        categories.find((c) => c.id === activeCategory)?.name ?? "Hasil Pencarian";
      return [{ categoryName: catName, items: filtered }];
    }
    // Group by category
    const catOrder = ["bakso", "mie-ayam", "minuman", "tambahan"];
    return catOrder
      .map((catId) => ({
        categoryName: categories.find((c) => c.id === catId)?.name ?? catId,
        items: products.filter((p) => p.categoryId === catId && p.isAvailable),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeCategory, search, filtered]);

  return (
    <>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Header */}
        <div className="bg-[#2D5016] dark:bg-[#1a3209] sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-white font-bold text-lg">Menu Bakso Kalijogo</h1>
            </div>
            <Link href="/cart" className="relative text-white">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-full px-4 py-2.5 shadow-sm">
              <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? "bg-[#2D5016] text-white ring-2 ring-white/50"
                    : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Content */}
        <div className="px-4 pt-5 pb-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <span className="text-5xl mb-4">🍽️</span>
              <p className="font-semibold text-lg">Menu tidak ditemukan</p>
              <p className="text-sm text-center mt-1">Coba kata kunci lain atau pilih kategori berbeda</p>
            </div>
          ) : (
            grouped.map((group) => (
              <section key={group.categoryName} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    {group.categoryName}
                  </h2>
                  <span className="text-xs text-neutral-400">{group.items.length} item</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
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

        {/* Floating Cart Button */}
        {totalItems > 0 && (
          <Link
            href="/cart"
            className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto bg-[#2D5016] text-white rounded-full py-3 px-5 flex items-center justify-between shadow-2xl z-40 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white text-[#2D5016] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
              <span className="font-semibold text-sm">Lihat Keranjang</span>
            </div>
            <ShoppingCart className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Menu Detail Sheet */}
      <MenuDetailSheet
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
