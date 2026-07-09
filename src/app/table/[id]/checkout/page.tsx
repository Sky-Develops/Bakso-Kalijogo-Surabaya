"use client";

import { use, FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Loader2, QrCode, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useSettingsStore } from "@/store/settings-store";
import { createOrder } from "@/lib/order-api";
import { formatPrice, SERVICE_FEE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/product-image";
import { toast } from "sonner";

export default function TableCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { items, getSubtotal, clearCart } = useCartStore();
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS">("QRIS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings) void loadSettings();
  }, [settings, loadSettings]);

  const subtotal = getSubtotal();
  const total = subtotal + SERVICE_FEE;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (items.length === 0) return;

    if (paymentMethod === "QRIS" && !settings?.paymentConfig?.qrisImageUrl) {
      toast.error("Pembayaran QRIS belum tersedia saat ini, silakan pilih metode Tunai.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { order } = await createOrder({
        customerName: customerName.trim() || `Meja ${id}`,
        customerPhone: `MEJA-${id}`,
        orderType: "DINE_IN",
        paymentMethod,
        shippingFee: 0,
        serviceFee: SERVICE_FEE,
        tableNumber: id,
        notes: `Meja ${id}`,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.imageUrl,
          quantity: item.quantity,
          price: item.product.price,
          notes: item.notes,
        })),
      });

      clearCart();
      toast.success("Pesanan meja berhasil dikirim ke dapur!");
      router.push(`/table/${id}/success?orderId=${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <ShoppingBag className="mb-4 h-14 w-14 text-neutral-300" />
        <h2 className="mb-2 text-xl font-bold">Keranjang Kosong</h2>
        <p className="mb-6 text-sm text-neutral-500">Belum ada menu yang dipilih.</p>
        <button
          onClick={() => router.back()}
          className="rounded-full bg-[#2D5016] px-6 py-3 font-bold text-white transition-colors hover:bg-[#2D5016]/90"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 overflow-x-hidden p-4 pb-40">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
          Konfirmasi Pesanan
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="table-checkout-form">
        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Ringkasan Pesanan
            </p>
          </div>
          <div className="space-y-3 p-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <ProductImage
                    src={item.product.imageUrl}
                    alt={item.product.imageAlt ?? item.product.name}
                    className="h-10 w-10 flex-shrink-0 rounded-lg"
                    sizes="40px"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-neutral-900 dark:text-white">
                      {item.product.name}
                    </p>
                    {item.notes && (
                      <p className="truncate text-xs text-neutral-400">{item.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-bold text-neutral-900 dark:text-white">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {item.quantity}x {formatPrice(item.product.price)}
                  </p>
                </div>
              </div>
            ))}
            <div className="space-y-1 border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Biaya Layanan</span>
                <span>{formatPrice(SERVICE_FEE)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900 dark:border-neutral-800 dark:text-white">
                <span>Total Tagihan</span>
                <span className="text-[#E85D04]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">
            Nama Anda (Opsional)
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Untuk memudahkan pelayan memanggil"
            className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[#2D5016]/40 dark:border-neutral-700 dark:bg-neutral-950"
          />
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
            Metode Pembayaran
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "QRIS" as const, label: "QRIS", desc: "GoPay / M-Banking", icon: QrCode },
              { value: "CASH" as const, label: "Tunai", desc: "Bayar di kasir", icon: Banknote },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
                    paymentMethod === opt.value
                      ? "border-[#2D5016] bg-[#2D5016]/5"
                      : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-xl p-2.5",
                      paymentMethod === opt.value
                        ? "bg-[#2D5016] text-white"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-neutral-400">{opt.desc}</p>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                    className="sr-only"
                  />
                </label>
              );
            })}
          </div>
        </section>
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-3xl border-t border-neutral-200 bg-white/90 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
        <button
          type="submit"
          form="table-checkout-form"
          disabled={isSubmitting || items.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D5016] py-4 font-bold text-white shadow-lg shadow-[#2D5016]/20 transition-all hover:bg-[#2D5016]/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Mengirim ke Dapur...
            </>
          ) : (
            "Kirim Pesanan ke Dapur"
          )}
        </button>
      </div>
    </div>
  );
}
