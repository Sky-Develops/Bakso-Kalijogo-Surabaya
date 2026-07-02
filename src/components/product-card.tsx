"use client";

import { Product } from "@/types";
import { formatPrice } from "@/lib/mock-data";
import { useCartStore } from "@/store/cart-store";
import { Minus, Plus } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export function ProductCard({ product, onOpenDetail }: ProductCardProps) {
  const { addItem, increaseQuantity, decreaseQuantity, items } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const isSoldOut =
    !product.isAvailable ||
    (product.stockQuantity !== undefined && product.stockQuantity <= 0);

  return (
    <div
      className="h-full min-w-0 cursor-pointer overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-transform active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900"
      onClick={() => onOpenDetail(product)}
    >
      {/* Image Area */}
      <div className={cn("relative", isSoldOut && "bg-neutral-200 dark:bg-neutral-800")}>
        {isSoldOut && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            Habis
          </span>
        )}
        {product.badge && (
          <span
            className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white z-10 ${
              product.badge === "Terlaris" ? "bg-primary" : "bg-emerald-600"
            }`}
          >
            {product.badge}
          </span>
        )}
        <ProductImage
          src={product.imageUrl}
          alt={product.imageAlt ?? product.name}
          className={cn("h-32 w-full sm:h-36", isSoldOut && "opacity-60 grayscale")}
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2">
          {product.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-neutral-400">
          {product.servingTime && <span>{product.servingTime}</span>}
          {product.rating && <span>{product.rating} rating</span>}
          {product.stockQuantity !== undefined && (
            <span>{isSoldOut ? "Stok habis" : `Stok ${product.stockQuantity}`}</span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-bold text-primary">
            {formatPrice(product.price)}
          </span>

          {isSoldOut ? (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-400 dark:bg-neutral-800">
              Habis
            </span>
          ) : cartItem ? (
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => decreaseQuantity(product.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                aria-label={`Kurangi ${product.name}`}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-neutral-900 dark:text-white w-4 text-center">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => increaseQuantity(product.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
                aria-label={`Tambah ${product.name}`}
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
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold leading-none text-white shadow-md transition-all hover:bg-primary/90 active:scale-90"
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
