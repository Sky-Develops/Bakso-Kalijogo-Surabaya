"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useOrderStore } from "@/store/order-store";
import {
  SHIPPING_FEE,
  SERVICE_FEE,
  formatPrice,
  generateOrderNumber,
} from "@/lib/mock-data";
import { CheckoutForm, Order, PaymentMethod, OrderType } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const checkoutSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    phone: z
      .string()
      .regex(/^[0-9]{10,13}$/, "Nomor WhatsApp tidak valid (10-13 digit)"),
    address: z.string().optional(),
    notes: z.string().optional(),
    orderType: z.enum(["ONLINE", "TAKEAWAY", "DINE_IN"]),
    paymentMethod: z.enum(["CASH", "QRIS", "TRANSFER_BANK"]),
  })
  .refine(
    (data) => {
      if (data.orderType === "ONLINE") return !!data.address && data.address.length >= 10;
      return true;
    },
    { message: "Alamat lengkap wajib diisi (min. 10 karakter)", path: ["address"] }
  );

const STEPS = ["Keranjang", "Checkout", "Konfirmasi"];

const DELIVERY_OPTIONS: { value: OrderType; label: string; desc: string; icon: string }[] = [
  { value: "ONLINE", label: "Ojek Online", desc: "Estimasi 30–45 menit", icon: "🛵" },
  { value: "TAKEAWAY", label: "Ambil Sendiri", desc: "Langsung ke warung", icon: "🏃" },
];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; desc: string; icon: string }[] = [
  { value: "CASH", label: "Cash", desc: "Bayar tunai saat terima", icon: "💵" },
  { value: "QRIS", label: "QRIS", desc: "Scan QR untuk bayar", icon: "📱" },
  { value: "TRANSFER_BANK", label: "Transfer Bank", desc: "BCA / Mandiri / BRI", icon: "🏦" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, orderType, setOrderType, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const shippingFee = orderType === "ONLINE" ? SHIPPING_FEE : 0;
  const total = subtotal + shippingFee + SERVICE_FEE;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      orderType: orderType,
      paymentMethod: "QRIS",
    },
  });

  const watchedOrderType = watch("orderType");
  const watchedPayment = watch("paymentMethod");

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      toast.error("Keranjang kosong!");
      return;
    }

    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1200));

    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber: generateOrderNumber(),
      status: "PENDING",
      orderType: data.orderType,
      paymentMethod: data.paymentMethod,
      totalAmount: total,
      subtotal,
      shippingFee: data.orderType === "ONLINE" ? SHIPPING_FEE : 0,
      serviceFee: SERVICE_FEE,
      customerName: data.name,
      customerPhone: data.phone,
      deliveryAddress: data.address,
      notes: data.notes,
      items: items.map((i) => ({
        id: i.product.id,
        productName: i.product.name,
        productImage: i.product.imageUrl,
        quantity: i.quantity,
        price: i.product.price,
        notes: i.notes,
      })),
      createdAt: new Date().toISOString(),
    };

    addOrder(order);
    clearCart();
    toast.success("Pesanan berhasil dibuat!");
    router.push(`/pesanan/${order.id}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 gap-4">
        <span className="text-5xl">🛒</span>
        <p className="font-bold text-lg text-neutral-700 dark:text-neutral-300">
          Keranjang kosong
        </p>
        <Link
          href="/menu"
          className="bg-primary text-white px-6 py-3 rounded-full font-bold"
        >
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-32">
      {/* Header */}
      <div className="bg-[#2D5016] dark:bg-[#1a3209] sticky top-0 z-30 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/cart" className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-white font-bold text-lg">Checkout</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center">
          {STEPS.map((step, idx) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  idx === 0
                    ? "bg-white text-[#2D5016]"
                    : idx === 1
                    ? "bg-white/20 border-2 border-white text-white"
                    : "bg-white/10 text-white/40"
                )}
              >
                {idx === 0 ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <p className={cn("text-[10px] ml-1.5 font-medium", idx <= 1 ? "text-white" : "text-white/40")}>
                {step}
              </p>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-white/20 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="px-4 pt-5 space-y-4">
        {/* Delivery Method */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">
            Metode Pengiriman
          </p>
          <div className="space-y-2">
            {DELIVERY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                  watchedOrderType === opt.value
                    ? "border-[#2D5016] bg-[#2D5016]/5"
                    : "border-neutral-200 dark:border-neutral-700"
                )}
              >
                <input
                  type="radio"
                  value={opt.value}
                  {...register("orderType")}
                  onChange={() => {
                    setValue("orderType", opt.value);
                    setOrderType(opt.value);
                  }}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    watchedOrderType === opt.value
                      ? "border-[#2D5016]"
                      : "border-neutral-300"
                  )}
                >
                  {watchedOrderType === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-[#2D5016]" />
                  )}
                </div>
                <span className="text-xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                    {opt.label}
                  </p>
                  <p className="text-xs text-neutral-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Delivery Address (only if ONLINE) */}
        {watchedOrderType === "ONLINE" && (
          <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800 space-y-3">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Alamat Pengiriman
            </p>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                Nama Penerima
              </label>
              <input
                {...register("name")}
                placeholder="Contoh: Budi Santoso"
                className={cn(
                  "w-full border rounded-xl px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30 transition",
                  errors.name ? "border-red-400" : "border-neutral-200 dark:border-neutral-700"
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                Nomor WhatsApp
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="Contoh: 08123456789"
                className={cn(
                  "w-full border rounded-xl px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30 transition",
                  errors.phone ? "border-red-400" : "border-neutral-200 dark:border-neutral-700"
                )}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                Alamat Lengkap
              </label>
              <textarea
                {...register("address")}
                rows={3}
                placeholder="Jalan, RT/RW, Kelurahan..."
                className={cn(
                  "w-full border rounded-xl px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none",
                  errors.address ? "border-red-400" : "border-neutral-200 dark:border-neutral-700"
                )}
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>
          </section>
        )}

        {/* Pickup - just name and phone */}
        {watchedOrderType !== "ONLINE" && (
          <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800 space-y-3">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Data Pemesan
            </p>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                Nama
              </label>
              <input
                {...register("name")}
                placeholder="Contoh: Budi Santoso"
                className={cn(
                  "w-full border rounded-xl px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30 transition",
                  errors.name ? "border-red-400" : "border-neutral-200 dark:border-neutral-700"
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                Nomor WhatsApp
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="Contoh: 08123456789"
                className={cn(
                  "w-full border rounded-xl px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30 transition",
                  errors.phone ? "border-red-400" : "border-neutral-200 dark:border-neutral-700"
                )}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </section>
        )}

        {/* Additional Notes */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">
            Keterangan Tambahan
          </p>
          <textarea
            {...register("notes")}
            rows={2}
            placeholder="Contoh: Tolong jangan pedas, bungkus rapi..."
            className="w-full border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition"
          />
        </section>

        {/* Payment Method */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">
            Metode Pembayaran
          </p>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                  watchedPayment === opt.value
                    ? "border-[#2D5016] bg-[#2D5016]/5"
                    : "border-neutral-200 dark:border-neutral-700"
                )}
              >
                <input
                  type="radio"
                  value={opt.value}
                  {...register("paymentMethod")}
                  onChange={() => setValue("paymentMethod", opt.value)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    watchedPayment === opt.value
                      ? "border-[#2D5016]"
                      : "border-neutral-300"
                  )}
                >
                  {watchedPayment === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-[#2D5016]" />
                  )}
                </div>
                <span className="text-xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                    {opt.label}
                  </p>
                  <p className="text-xs text-neutral-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Order Summary */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">
            Ringkasan
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {items.reduce((s, i) => s + i.quantity, 0)} item (
            {items
              .slice(0, 2)
              .map((i) => `${i.product.name} ×${i.quantity}`)
              .join(", ")}
            {items.length > 2 ? ", ..." : ""})
          </p>
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1 text-sm">
            {watchedOrderType === "ONLINE" && (
              <div className="flex justify-between text-neutral-500">
                <span>Ongkos Kirim</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-neutral-900 dark:text-white">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </section>
      </form>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 px-4 py-4 z-40">
        <button
          type="submit"
          form="checkout-form"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={cn(
            "w-full bg-[#2D5016] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg",
            isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-[#2D5016]/90"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses Pesanan...
            </>
          ) : (
            <>
              Buat Pesanan →
            </>
          )}
        </button>
      </div>
    </div>
  );
}
