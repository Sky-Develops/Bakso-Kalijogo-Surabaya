"use client";

import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/mock-data";
import { ArrowLeft, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function TableCartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { items, increaseQuantity, decreaseQuantity, getSubtotal } = useCartStore();
  const router = useRouter();

  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-neutral-300" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">Keranjang Kosong</h2>
        <p className="text-neutral-500 mb-6 text-sm">Belum ada makanan yang dipilih.</p>
        <Link
          href={`/table/${id}`}
          className="bg-[#2D5016] text-white px-6 py-3 rounded-full font-bold hover:bg-[#2D5016]/90 transition-colors"
        >
          Lihat Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-36">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Keranjang Anda</h1>
        <span className="ml-auto text-sm text-neutral-400">Meja {id}</span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
          >
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 select-none">
              {item.product.imageUrl}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                {item.product.name}
              </p>
              <p className="font-semibold text-[#E85D04] text-sm mt-0.5">
                {formatPrice(item.product.price)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => decreaseQuantity(item.product.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-neutral-700 shadow-sm text-neutral-600 dark:text-neutral-300 hover:text-red-500 active:scale-90 transition-all"
                  >
                    {item.quantity <= 1 ? (
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className="font-bold text-sm min-w-[20px] text-center text-neutral-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => increaseQuantity(item.product.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-[#2D5016] text-white active:scale-90 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="ml-auto font-bold text-neutral-900 dark:text-white text-sm">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed bottom checkout */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-4 space-y-3 z-50">
        <div className="flex justify-between items-center">
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">
            {items.reduce((s, i) => s + i.quantity, 0)} item
          </span>
          <span className="font-bold text-neutral-900 dark:text-white text-lg">{formatPrice(subtotal)}</span>
        </div>
        <Link
          href={`/table/${id}/checkout`}
          className="w-full bg-[#2D5016] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#2D5016]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#2D5016]/20"
        >
          Lanjut ke Pembayaran
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
