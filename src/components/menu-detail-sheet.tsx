"use client";

import { Product } from "@/types";
import { formatPrice } from "@/lib/mock-data";
import { useCartStore } from "@/store/cart-store";
import { useState } from "react";
import {
  Clock,
  Flame,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ProductImage } from "@/components/product-image";

interface MenuDetailSheetProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function MenuDetailSheet({ product, open, onClose }: MenuDetailSheetProps) {
  const { addItem, items } = useCartStore();
  const [localQty, setLocalQty] = useState(1);
  const [notes, setNotes] = useState("");

  const cartItem = product ? items.find((i) => i.product.id === product.id) : null;
  const isSoldOut = product
    ? !product.isAvailable ||
      (product.stockQuantity !== undefined && product.stockQuantity <= 0)
    : true;

  const handleAdd = () => {
    if (!product || isSoldOut) return;
    for (let i = 0; i < localQty; i++) {
      addItem(product, notes || undefined);
    }
    onClose();
    setLocalQty(1);
    setNotes("");
  };

  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92vh] max-w-2xl overflow-y-auto rounded-t-3xl border-0 p-0"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-sm dark:bg-neutral-800/85"
          aria-label="Tutup detail menu"
        >
          <X className="h-4 w-4 text-neutral-500" />
        </button>

        <div className="relative h-60 overflow-hidden rounded-t-3xl bg-stone-100 dark:bg-neutral-800 md:h-72">
          {product.badge && (
            <span
              className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-bold text-white ${
                product.badge === "Terlaris" ? "bg-primary" : "bg-emerald-600"
              }`}
            >
              {product.badge}
            </span>
          )}
          <ProductImage
            src={product.imageUrl}
            alt={product.imageAlt ?? product.name}
            className="h-full w-full"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>

        <div className="p-5 pb-32">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 flex-1 text-xl font-bold text-neutral-900 dark:text-white">
              {product.name}
            </h2>
            <span className="whitespace-nowrap text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          {product.rating && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {product.rating}
              </span>
              <span>-</span>
              <span>{product.soldCount}+ terjual</span>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {product.servingTime && (
              <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                <Clock className="h-4 w-4 text-primary" />
                <span>{product.servingTime}</span>
              </div>
            )}
            {product.spiceLevel && (
              <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                <Flame className="h-4 w-4 text-primary" />
                <span>{product.spiceLevel}</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{isSoldOut ? "Habis" : "Tersedia"}</span>
            </div>
            {product.stockQuantity !== undefined && (
              <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span>Stok {product.stockQuantity}</span>
              </div>
            )}
          </div>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {product.description}
            </p>
          )}

          {product.toppings && product.toppings.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Isi dan topping
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.toppings.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#2D5016]/10 px-3 py-1 text-xs font-semibold text-[#2D5016] dark:bg-[#2D5016]/30 dark:text-emerald-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.recommendations && product.recommendations.length > 0 && (
            <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-3 dark:border-orange-900/40 dark:bg-orange-950/20">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Cocok dengan
              </p>
              <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                {product.recommendations.join(", ")}
              </p>
            </div>
          )}

          <div className="mt-4">
            <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Catatan <span className="font-normal text-neutral-400">(opsional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: pedas, tanpa kecap..."
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            />
          </div>

          {cartItem && (
            <p className="mt-3 text-xs font-medium text-primary">
              Sudah ada {cartItem.quantity} di keranjang
            </p>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-2xl items-center gap-3 border-t border-neutral-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-2 py-1.5 dark:border-neutral-700">
            <button
              onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
              disabled={isSoldOut}
              className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Kurangi jumlah"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-sm font-bold text-neutral-900 dark:text-white">
              {localQty}
            </span>
            <button
              onClick={() => setLocalQty((q) => q + 1)}
              disabled={isSoldOut}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-40"
              aria-label="Tambah jumlah"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={isSoldOut}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#2D5016] px-3 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#2D5016]/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            <ShoppingCart className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {isSoldOut ? "Menu Habis" : `Tambah - ${formatPrice(product.price * localQty)}`}
            </span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
