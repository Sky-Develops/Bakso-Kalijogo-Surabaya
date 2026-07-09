"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, Minus, Plus, ShoppingBag, Utensils } from "lucide-react";
import { products, formatPrice } from "@/lib/mock-data";
import { fetchMenu } from "@/lib/menu-api";
import { useCartStore } from "@/store/cart-store";
import { Product } from "@/types";
import { ProductImage } from "@/components/product-image";

export default function TableMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    items,
    addItem,
    increaseQuantity,
    decreaseQuantity,
    getTotalItems,
    getSubtotal,
    syncProducts,
  } = useCartStore();
  const [menuProducts, setMenuProducts] = useState<Product[]>(products);
  const [loading, setLoading] = useState(true);
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  useEffect(() => {
    let active = true;

    fetchMenu()
      .then((data) => {
        if (!active || data.products.length === 0) return;
        setMenuProducts(data.products);
        syncProducts(data.products);
      })
      .catch(() => setMenuProducts(products))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [syncProducts]);

  const getItemQty = (productId: string) => {
    const found = items.find((item) => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 overflow-x-hidden pb-28 px-4 lg:px-6">
      <div className="mx-auto mt-4 w-full max-w-5xl rounded-2xl bg-[#2D5016] p-4 text-center text-white lg:px-6">
        <p className="text-sm font-medium text-white/80">Anda di</p>
        <h1 className="mt-0.5 text-2xl font-extrabold">Meja {id}</h1>
        <p className="mt-1 text-xs text-white/70">
          Pilih menu dan pesanan langsung masuk ke admin/dapur.
        </p>
      </div>

      <div className="px-4">
        <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white">
          Menu Tersedia
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#2D5016]" />
          </div>
        ) : menuProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Utensils className="mb-3 h-12 w-12 opacity-30" />
            <p className="font-semibold">Belum ada menu.</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {menuProducts.map((product) => {
              const qty = getItemQty(product.id);
              const isSoldOut =
                !product.isAvailable ||
                (product.stockQuantity !== undefined && product.stockQuantity <= 0);

              return (
                <div
                  key={product.id}
                  className="flex min-h-[128px] gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.imageAlt ?? product.name}
                    className="h-20 w-20 flex-shrink-0 rounded-xl sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                    sizes="80px"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold leading-tight text-neutral-900 dark:text-white">
                          {product.name}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {product.badge && (
                            <span className="rounded bg-[#E85D04]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#E85D04]">
                              {product.badge}
                            </span>
                          )}
                          {isSoldOut && (
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                              Habis
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#E85D04]">{formatPrice(product.price)}</p>
                        {product.stockQuantity !== undefined && (
                          <p className="text-[10px] text-neutral-400">
                            Stok {product.stockQuantity}
                          </p>
                        )}
                      </div>
                      {isSoldOut ? (
                        <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-400 dark:bg-neutral-800">
                          Habis
                        </span>
                      ) : qty === 0 ? (
                        <button
                          onClick={() => addItem(product)}
                          className="flex items-center gap-1 rounded-lg bg-[#2D5016] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#2D5016]/90 active:scale-95"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Tambah
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                          <button
                            onClick={() => decreaseQuantity(product.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-neutral-600 shadow-sm transition-all hover:text-red-500 active:scale-90 dark:bg-neutral-700 dark:text-neutral-300"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[20px] text-center text-sm font-bold text-neutral-900 dark:text-white">
                            {qty}
                          </span>
                          <button
                            onClick={() => increaseQuantity(product.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2D5016] text-white transition-all active:scale-90"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg">
          <Link
            href={`/table/${id}/cart`}
            className="flex items-center justify-between rounded-2xl bg-[#2D5016] px-5 py-4 text-white shadow-2xl shadow-[#2D5016]/40 transition-all hover:bg-[#2D5016]/90 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#2D5016] bg-[#E85D04] text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-medium leading-tight text-white/70">
                  Total Pesanan
                </p>
                <p className="text-base font-bold leading-tight">{formatPrice(subtotal)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-sm font-semibold">
              Pesan
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
