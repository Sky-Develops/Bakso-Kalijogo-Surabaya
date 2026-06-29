"use client";

import { useCartStore } from "@/store/cart-store";
import { useOrderStore } from "@/store/order-store";
import { formatPrice, generateOrderNumber, SERVICE_FEE } from "@/lib/mock-data";
import { ArrowLeft, Loader2, QrCode, Banknote } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { use } from "react";
import { cn } from "@/lib/utils";

export default function TableCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { items, getSubtotal, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS">("QRIS");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const total = subtotal + SERVICE_FEE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = crypto.randomUUID();

      addOrder({
        id: orderId,
        orderNumber: generateOrderNumber(),
        customerName: customerName.trim() || `Meja ${id}`,
        customerPhone: "-",
        items: items.map((i) => ({
          id: crypto.randomUUID(),
          productId: i.product.id,
          productName: i.product.name,
          productImage: i.product.imageUrl,
          quantity: i.quantity,
          price: i.product.price,
          notes: i.notes,
        })),
        totalAmount: total,
        subtotal,
        shippingFee: 0,
        serviceFee: SERVICE_FEE,
        status: "PENDING",
        orderType: "DINE_IN",
        tableNumber: id,
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString(),
      });

      clearCart();
      router.push(`/table/${id}/success?orderId=${orderId}`);
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <span className="text-5xl mb-4">🛒</span>
        <h2 className="text-xl font-bold mb-2">Keranjang Kosong</h2>
        <p className="text-neutral-500 mb-6 text-sm">Belum ada menu yang dipilih.</p>
        <button
          onClick={() => router.back()}
          className="bg-[#2D5016] text-white px-6 py-3 rounded-full font-bold hover:bg-[#2D5016]/90 transition-colors"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 pb-40">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Konfirmasi Pesanan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="table-checkout-form">
        {/* Order Summary */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ringkasan Pesanan</p>
          </div>
          <div className="p-4 space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.product.imageUrl}</span>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{item.product.name}</p>
                    {item.notes && <p className="text-xs text-neutral-400 italic">{item.notes}</p>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-bold text-neutral-900 dark:text-white">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  <p className="text-xs text-neutral-400">{item.quantity}× {formatPrice(item.product.price)}</p>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Biaya Layanan</span>
                <span>{formatPrice(SERVICE_FEE)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span>Total Tagihan</span>
                <span className="text-[#E85D04]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Name */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Nama Anda (Opsional)
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Untuk memudahkan pelayan memanggil"
            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5016]/40 transition-all text-sm placeholder:text-neutral-400"
          />
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Metode Pembayaran</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "QRIS" as const, label: "QRIS", desc: "GoPay / M-Banking", icon: QrCode },
              { value: "CASH" as const, label: "Tunai", desc: "Bayar di kasir", icon: Banknote },
            ].map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all text-center",
                  paymentMethod === opt.value
                    ? "border-[#2D5016] bg-[#2D5016]/5"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-xl",
                  paymentMethod === opt.value ? "bg-[#2D5016] text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                )}>
                  <opt.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-neutral-900 dark:text-white">{opt.label}</p>
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
            ))}
          </div>
        </div>
      </form>

      {/* Fixed Submit */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-4 z-50">
        <button
          type="submit"
          form="table-checkout-form"
          disabled={isSubmitting || items.length === 0}
          className="w-full bg-[#2D5016] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#2D5016]/90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#2D5016]/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Mengirim ke Dapur...
            </>
          ) : (
            <>🍜 Kirim Pesanan ke Dapur</>
          )}
        </button>
      </div>
    </div>
  );
}
