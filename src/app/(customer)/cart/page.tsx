"use client";

import { useCartStore } from "@/store/cart-store";
import { formatPrice, SHIPPING_FEE, SERVICE_FEE } from "@/lib/mock-data";
import { ArrowLeft, Minus, Plus, Trash2, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CartPage() {
  const {
    items,
    orderType,
    setOrderType,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    getSubtotal,
  } = useCartStore();

  const [promoCode, setPromoCode] = useState("");

  const subtotal = getSubtotal();
  const shippingFee = orderType === "ONLINE" ? SHIPPING_FEE : 0;
  const total = subtotal + shippingFee + SERVICE_FEE;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handleClearCart = () => {
    clearCart();
    toast.success("Keranjang dikosongkan");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-[#2D5016] dark:bg-[#1a3209] px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/menu" className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-white font-bold text-lg">Keranjang</h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-white/70 text-sm hover:text-white transition"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-5 text-neutral-400">
          <span className="text-6xl mb-4">🛒</span>
          <p className="font-bold text-lg text-neutral-600 dark:text-neutral-300">Keranjang Kosong</p>
          <p className="text-sm text-center mt-1 mb-6">Tambahkan menu favoritmu ke keranjang</p>
          <Link
            href="/menu"
            className="bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary/90 active:scale-95 transition-all"
          >
            Lihat Menu
          </Link>
        </div>
      ) : (
        <div className="px-4 pt-4 pb-36 space-y-4">
          {/* Order Type Toggle */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-3">
              Metode Pengambilan
            </p>
            <div className="flex rounded-full bg-neutral-100 dark:bg-neutral-800 p-1 gap-1">
              {[
                { value: "ONLINE", label: "🛵 Antar ke Lokasi" },
                { value: "TAKEAWAY", label: "🏃 Ambil Sendiri" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOrderType(opt.value as any)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-full text-xs font-semibold transition-all",
                    orderType === opt.value
                      ? "bg-[#2D5016] text-white shadow-sm"
                      : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Items */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 divide-y divide-neutral-50 dark:divide-neutral-800 overflow-hidden">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-start gap-3 p-4">
                <div className="w-14 h-14 bg-stone-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{item.product.imageUrl}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                    {item.product.name}
                  </p>
                  <p className="text-primary font-bold text-sm mt-0.5">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-neutral-400 mt-0.5">📝 {item.notes}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      onClick={() => decreaseQuantity(item.product.id)}
                      className="w-7 h-7 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-neutral-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.product.id)}
                      className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeItem(item.product.id);
                    toast.success(`${item.product.name} dihapus`);
                  }}
                  className="text-neutral-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 transition p-1 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Link
              href="/menu"
              className="flex items-center justify-center py-3 text-sm font-semibold text-primary hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            >
              + Tambah Menu Lainnya
            </Link>
          </div>

          {/* Promo Code */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Masukkan kode promo"
                className="flex-1 text-sm text-neutral-700 dark:text-neutral-200 bg-transparent placeholder:text-neutral-400 focus:outline-none"
              />
              <button
                onClick={() => toast.info("Kode promo tidak ditemukan")}
                className="bg-[#2D5016] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#2D5016]/90 active:scale-95 transition-all"
              >
                Pakai
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
            <h3 className="font-bold text-neutral-900 dark:text-white mb-3">Ringkasan Pesanan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Subtotal ({totalItems} item)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {orderType === "ONLINE" && (
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Ongkos Kirim</span>
                  <span>{formatPrice(SHIPPING_FEE)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Biaya Layanan</span>
                <span>{formatPrice(SERVICE_FEE)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Diskon Promo</span>
                <span className="text-emerald-600 font-semibold">-Rp 0</span>
              </div>
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 flex justify-between font-bold text-base text-neutral-900 dark:text-white">
                <span>Total Pembayaran</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Checkout Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 flex items-center justify-between gap-4 z-40">
          <div>
            <p className="font-bold text-neutral-900 dark:text-white text-sm">
              {formatPrice(total)}
            </p>
            <p className="text-xs text-neutral-400">{totalItems} item</p>
          </div>
          <Link
            href="/checkout"
            className="bg-[#2D5016] text-white font-bold px-5 py-3 rounded-full flex items-center gap-2 hover:bg-[#2D5016]/90 active:scale-95 transition-all"
          >
            Lanjut ke Checkout →
          </Link>
        </div>
      )}
    </div>
  );
}
