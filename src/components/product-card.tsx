"use client";

import { Product } from "@/types";
import { formatPrice } from "@/lib/mock-data";
import { useCartStore } from "@/store/cart-store";
import { Minus, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export function ProductCard({ product, onOpenDetail }: ProductCardProps) {
  const { addItem, increaseQuantity, decreaseQuantity, items } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);

  return (
    <div
      className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
      onClick={() => onOpenDetail(product)}
    >
      {/* Image Area */}
      <div className="relative bg-stone-100 dark:bg-neutral-800 flex items-center justify-center h-32">
        {product.badge && (
          <span
            className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white z-10 ${
              product.badge === "Terlaris" ? "bg-primary" : "bg-emerald-600"
            }`}
          >
            {product.badge}
          </span>
        )}
        <span className="text-5xl select-none">{product.imageUrl}</span>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2">
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-2 gap-1">
          <span className="text-primary font-bold text-sm flex-shrink-0">
            {formatPrice(product.price)}
          </span>

          {cartItem ? (
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => decreaseQuantity(product.id)}
                className="w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-neutral-900 dark:text-white w-4 text-center">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => increaseQuantity(product.id)}
                className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
              className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:scale-90 transition-all shadow-md font-bold text-lg leading-none flex-shrink-0"
              aria-label={`Tambah ${product.name}`}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
