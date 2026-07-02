"use client";

import { useCartStore } from "@/store/cart-store";
import { useSettingsStore } from "@/store/settings-store";
import { formatPrice } from "@/lib/mock-data";
import { ArrowLeft, Minus, Plus, Trash2, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { OrderType } from "@/types";
import { ProductImage } from "@/components/product-image";
import { fetchMenu } from "@/lib/menu-api";

const ORDER_TYPE_OPTIONS: { value: OrderType; label: string; desc: string }[] = [
  { value: "ONLINE", label: "Antar ke Lokasi", desc: "Estimasi 30-45 menit" },
  { value: "TAKEAWAY", label: "Ambil Sendiri", desc: "Ambil langsung di warung" },
];

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

  const { settings, loadSettings } = useSettingsStore();

  const serviceFee = settings?.serviceFee ?? 1000;
  const shippingFeeDef = settings?.deliveryFeeDefault ?? 8000;

  const subtotal = getSubtotal();
  const shippingFee = orderType === "ONLINE" ? shippingFeeDef : 0;
  const total = subtotal + shippingFee + serviceFee;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handleClearCart = () => {
    clearCart();
    toast.success("Keranjang dikosongkan");
  };

  useEffect(() => {
    if (!settings) loadSettings();
    fetchMenu()
      .then((data) => {
        if (data.products.length === 0) return;
        const currentItems = useCartStore.getState().items;
        useCartStore.getState().syncProducts(data.products);
        const latestAvailableIds = new Set(
          data.products
            .filter(
              (product) =>
                product.isAvailable &&
                (product.stockQuantity === undefined || product.stockQuantity > 0)
            )
            .map((product) => product.id)
        );
        const removed = currentItems.filter(
          (item) => !latestAvailableIds.has(item.product.id)
        );
        if (currentItems.length > 0 && removed.length > 0) {
          toast.info("Beberapa item habis dan dihapus dari keranjang.");
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="sticky top-0 z-30 bg-[#2D5016] px-4 py-4 dark:bg-[#1a3209]">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/menu" className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-white">Keranjang</h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-white/70 transition hover:text-white"
            >
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center text-neutral-400">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-neutral-300 shadow-sm dark:bg-neutral-900">
            <Tag className="h-9 w-9" />
          </div>
          <p className="text-lg font-bold text-neutral-600 dark:text-neutral-300">
            Keranjang Kosong
          </p>
          <p className="mt-1 text-sm">Tambahkan menu favoritmu ke keranjang</p>
          <Link
            href="/menu"
            className="mt-6 rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary/90 active:scale-95"
          >
            Lihat Menu
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl space-y-4 px-4 pb-44 pt-4 md:pb-32">
          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Metode Pengambilan
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ORDER_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOrderType(opt.value)}
                  className={cn(
                    "rounded-lg border px-3 py-3 text-left transition-all",
                    orderType === opt.value
                      ? "border-[#2D5016] bg-[#2D5016] text-white shadow-sm"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  )}
                >
                  <span className="block text-sm font-bold">{opt.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-xs",
                      orderType === opt.value ? "text-white/70" : "text-neutral-400"
                    )}
                  >
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-start gap-3 border-b border-neutral-50 p-4 last:border-b-0 dark:border-neutral-800"
              >
                <ProductImage
                  src={item.product.imageUrl}
                  alt={item.product.imageAlt ?? item.product.name}
                  className="h-16 w-16 flex-shrink-0 rounded-lg"
                  sizes="64px"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                    {item.product.name}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-primary">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  {item.notes && (
                    <p className="mt-0.5 text-xs text-neutral-400">{item.notes}</p>
                  )}
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(item.product.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      aria-label={`Kurangi ${item.product.name}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-neutral-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.product.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
                      aria-label={`Tambah ${item.product.name}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeItem(item.product.id);
                    toast.success(`${item.product.name} dihapus`);
                  }}
                  className="flex-shrink-0 p-1 text-neutral-300 transition hover:text-red-500 dark:text-neutral-600 dark:hover:text-red-400"
                  aria-label={`Hapus ${item.product.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Link
              href="/menu"
              className="flex items-center justify-center py-3 text-sm font-semibold text-primary transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Tambah Menu Lainnya
            </Link>
          </section>

          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Tag className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Masukkan kode promo"
                className="min-w-0 flex-1 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-neutral-800 dark:text-neutral-200"
              />
              <button
                onClick={() => toast.info("Kode promo tidak ditemukan")}
                className="rounded-lg bg-[#2D5016] px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#2D5016]/90 active:scale-95"
              >
                Pakai
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 font-bold text-neutral-900 dark:text-white">
              Ringkasan Pesanan
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4 text-neutral-600 dark:text-neutral-400">
                <span>Subtotal ({totalItems} item)</span>
                <span className="text-right">{formatPrice(subtotal)}</span>
              </div>
              {orderType === "ONLINE" && (
                <div className="flex justify-between gap-4 text-neutral-600 dark:text-neutral-400">
                  <span>Ongkos Kirim</span>
                  <span className="text-right">{formatPrice(shippingFeeDef)}</span>
                </div>
              )}
              <div className="flex justify-between gap-4 text-neutral-600 dark:text-neutral-400">
                <span>Biaya Layanan</span>
                <span className="text-right">{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between gap-4 text-neutral-600 dark:text-neutral-400">
                <span>Diskon Promo</span>
                <span className="font-semibold text-emerald-600">-Rp 0</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900 dark:border-neutral-800 dark:text-white">
                <span>Total Pembayaran</span>
                <span className="text-right text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto flex max-w-5xl items-center justify-between gap-4 border-t border-neutral-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 md:bottom-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
              {formatPrice(total)}
            </p>
            <p className="text-xs text-neutral-400">{totalItems} item</p>
          </div>
          <Link
            href="/checkout"
            className="flex min-w-0 items-center gap-2 rounded-full bg-[#2D5016] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#2D5016]/90 active:scale-95 sm:text-base"
          >
            <span className="truncate">Lanjut ke Checkout</span>
          </Link>
        </div>
      )}
    </div>
  );
}
