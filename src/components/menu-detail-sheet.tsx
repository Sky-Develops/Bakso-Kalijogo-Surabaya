"use client";

import { Product } from "@/types";
import { formatPrice } from "@/lib/mock-data";
import { useCartStore } from "@/store/cart-store";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Star, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface MenuDetailSheetProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function MenuDetailSheet({ product, open, onClose }: MenuDetailSheetProps) {
  const { addItem, increaseQuantity, decreaseQuantity, items } = useCartStore();
  const [localQty, setLocalQty] = useState(1);
  const [notes, setNotes] = useState("");

  const cartItem = product ? items.find((i) => i.product.id === product.id) : null;

  const handleAdd = () => {
    if (!product) return;
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
        className="p-0 rounded-t-3xl max-h-[92vh] overflow-y-auto border-0"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>

        {/* Product Image Hero */}
        <div className="relative bg-stone-100 dark:bg-neutral-800 flex items-center justify-center h-52 rounded-t-3xl">
          {product.badge && (
            <span
              className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full text-white ${
                product.badge === "Terlaris" ? "bg-primary" : "bg-emerald-600"
              }`}
            >
              {product.badge} {product.badge === "Terlaris" ? "🔥" : "✨"}
            </span>
          )}
          <span className="text-8xl select-none">{product.imageUrl}</span>
        </div>

        {/* Content */}
        <div className="p-5 pb-32">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex-1">
              {product.name}
            </h2>
            <span className="text-primary font-bold text-xl whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {product.rating}
              </span>
              <span>•</span>
              <span>{product.soldCount}+ terjual</span>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Notes */}
          <div className="mt-4">
            <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Catatan{" "}
              <span className="font-normal text-neutral-400">(opsional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: pedas, tanpa kecap..."
              className="mt-2 w-full border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {cartItem && (
            <p className="mt-3 text-xs text-primary font-medium">
              ✓ Sudah ada {cartItem.quantity} di keranjang
            </p>
          )}
        </div>

        {/* Fixed bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 px-5 py-4 flex items-center gap-3">
          {/* Qty selector */}
          <div className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-700 rounded-full px-2 py-1.5">
            <button
              onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-5 text-center font-bold text-sm text-neutral-900 dark:text-white">
              {localQty}
            </span>
            <button
              onClick={() => setLocalQty((q) => q + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            className="flex-1 bg-[#2D5016] text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#2D5016]/90 active:scale-95 transition-all shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            + Tambah ke Keranjang · {formatPrice(product.price * localQty)}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
