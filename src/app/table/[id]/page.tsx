"use client";

import { products, formatPrice } from "@/lib/mock-data";
import { useCartStore } from "@/store/cart-store";
import { ShoppingBag, ChevronRight, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import Image from "next/image";

export default function TableMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { items, addItem, increaseQuantity, decreaseQuantity, getTotalItems, getSubtotal } = useCartStore();
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  const getItemQty = (productId: string) => {
    const found = items.find((i) => i.product.id === productId);
    return found ? found.quantity : 0;
  };

  const availableProducts = products.filter((p) => p.isAvailable);

  return (
    <div className="space-y-1">
      {/* Welcome Banner */}
      <div className="mx-4 mt-4 bg-[#2D5016] text-white rounded-2xl p-4 text-center">
        <p className="text-sm font-medium text-white/80">Anda di</p>
        <h1 className="text-2xl font-extrabold mt-0.5">Meja {id}</h1>
        <p className="text-xs text-white/70 mt-1">Pilih menu dan pesan langsung dari HP Anda</p>
      </div>

      {/* Menu List */}
      <div className="px-4 pt-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">Menu Tersedia</h2>
        <div className="space-y-3">
          {availableProducts.map((product) => {
            const qty = getItemQty(product.id);
            return (
              <div
                key={product.id}
                className="flex gap-3 bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800 shadow-sm"
              >
                <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 select-none">
                  {product.imageUrl}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900 dark:text-white text-sm leading-tight">
                        {product.name}
                      </p>
                      {product.badge && (
                        <span className="inline-block text-[10px] bg-[#E85D04]/10 text-[#E85D04] font-bold px-1.5 py-0.5 rounded mt-0.5">
                          {product.badge}
                        </span>
                      )}
                      {product.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-[#E85D04]">{formatPrice(product.price)}</p>
                    {qty === 0 ? (
                      <button
                        onClick={() => addItem(product)}
                        className="flex items-center gap-1 bg-[#2D5016] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#2D5016]/90 active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                        <button
                          onClick={() => decreaseQuantity(product.id)}
                          className="w-7 h-7 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-md shadow-sm text-neutral-600 dark:text-neutral-300 hover:text-red-500 active:scale-90 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm min-w-[20px] text-center text-neutral-900 dark:text-white">
                          {qty}
                        </span>
                        <button
                          onClick={() => increaseQuantity(product.id)}
                          className="w-7 h-7 flex items-center justify-center bg-[#2D5016] rounded-md text-white active:scale-90 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50">
          <Link
            href={`/table/${id}/cart`}
            className="bg-[#2D5016] text-white px-5 py-4 rounded-2xl shadow-2xl shadow-[#2D5016]/40 flex items-center justify-between hover:bg-[#2D5016]/90 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-[#E85D04] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#2D5016]">
                  {totalItems}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-white/70 font-medium leading-tight">Total Pesanan</p>
                <p className="font-bold text-base leading-tight">{formatPrice(subtotal)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/10 rounded-xl px-3 py-1.5 font-semibold text-sm">
              Pesan
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Spacer for floating button */}
      {totalItems > 0 && <div className="h-24" />}
    </div>
  );
}
