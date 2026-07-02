"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  QrCode,
  ShoppingBag,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useSettingsStore } from "@/store/settings-store";
import { formatPrice } from "@/lib/mock-data";
import { CUSTOMER_PHONE_KEY, createOrder } from "@/lib/order-api";
import { DELIVERY_AREAS, getDeliveryArea } from "@/lib/delivery";
import { PaymentMethod, OrderType } from "@/types";
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
    deliveryArea: z.enum(["0-3km", "3-6km", "outside"]).optional(),
    paymentMethod: z.enum(["CASH", "QRIS", "TRANSFER_BANK"]),
  })
  .refine(
    (data) => {
      if (data.orderType === "ONLINE") return !!data.address && data.address.length >= 10;
      return true;
    },
    { message: "Alamat lengkap wajib diisi (min. 10 karakter)", path: ["address"] }
  )
  .refine(
    (data) => {
      if (data.orderType !== "ONLINE") return true;
      return data.deliveryArea !== "outside";
    },
    {
      message: "Alamat di luar radius delivery. Silakan pilih ambil sendiri atau hubungi outlet.",
      path: ["deliveryArea"],
    }
  );

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const STEPS = ["Keranjang", "Checkout", "Konfirmasi"];

const DELIVERY_OPTIONS: {
  value: OrderType;
  label: string;
  desc: string;
  icon: typeof MapPin;
}[] = [
  { value: "ONLINE", label: "Delivery Outlet", desc: "Radius dan ongkir jelas", icon: MapPin },
  { value: "TAKEAWAY", label: "Ambil Sendiri", desc: "Langsung ke warung", icon: Store },
];

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof Banknote;
}[] = [
  { value: "CASH", label: "Cash", desc: "Bayar tunai saat terima", icon: Banknote },
  { value: "QRIS", label: "QRIS", desc: "Scan QR untuk bayar", icon: QrCode },
  { value: "TRANSFER_BANK", label: "Transfer Bank", desc: "BCA / Mandiri / BRI", icon: CreditCard },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, orderType, setOrderType, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      orderType,
      deliveryArea: "0-3km",
      paymentMethod: "QRIS",
    },
  });

  const { settings, loadSettings } = useSettingsStore();
  const paymentConfig = settings?.paymentConfig;

  const serviceFee = settings?.serviceFee ?? 1000;
  // If we wanted to use default delivery fee for some reason, it's settings?.deliveryFeeDefault
  // but checkout uses distance-based fee if we keep that. I'll just use the serviceFee.

  const watchedOrderType = useWatch({ control, name: "orderType" });
  const watchedDeliveryArea = useWatch({ control, name: "deliveryArea" });
  const watchedPayment = useWatch({ control, name: "paymentMethod" });
  const availablePaymentOptions = useMemo(() => {
    return PAYMENT_OPTIONS.filter((option) => {
      if (option.value === "CASH") return paymentConfig?.cashEnabled ?? true;
      if (option.value === "TRANSFER_BANK") return paymentConfig?.transferEnabled ?? true;
      if (option.value === "QRIS") return paymentConfig?.qrisEnabled ?? true;
      return true;
    });
  }, [paymentConfig]);
  const selectedDeliveryArea = getDeliveryArea(watchedDeliveryArea ?? "0-3km");
  
  const shippingFee =
    watchedOrderType === "ONLINE" && selectedDeliveryArea.available
      ? selectedDeliveryArea.fee
      : 0;
      
  const total = subtotal + shippingFee + serviceFee;
  const deliveryBlocked =
    watchedOrderType === "ONLINE" && !selectedDeliveryArea.available;
  const paymentBlocked = availablePaymentOptions.length === 0;

  useEffect(() => {
    if (!settings) {
      void loadSettings();
    }
  }, [loadSettings, settings]);

  useEffect(() => {
    if (availablePaymentOptions.length === 0) return;
    if (!availablePaymentOptions.some((option) => option.value === watchedPayment)) {
      setValue("paymentMethod", availablePaymentOptions[0].value);
    }
  }, [availablePaymentOptions, setValue, watchedPayment]);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("Keranjang kosong!");
      return;
    }

    setIsSubmitting(true);
    try {
      const deliveryArea =
        data.orderType === "ONLINE" ? getDeliveryArea(data.deliveryArea ?? "0-3km") : null;
      const { order } = await createOrder({
        customerName: data.name,
        customerPhone: data.phone,
        deliveryAddress: data.address,
        deliveryArea: deliveryArea?.label,
        notes: data.notes,
        orderType: data.orderType,
        paymentMethod: data.paymentMethod,
        shippingFee: data.orderType === "ONLINE" ? shippingFee : 0,
        serviceFee: serviceFee,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.imageUrl,
          quantity: item.quantity,
          price: item.product.price,
          notes: item.notes,
        })),
      });

      window.localStorage.setItem(CUSTOMER_PHONE_KEY, data.phone);
      clearCart();
      toast.success("Pesanan berhasil masuk ke sistem!");
      router.push(`/pesanan/${order.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Pesanan gagal dibuat. Coba lagi.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <ShoppingBag className="h-14 w-14 text-neutral-300" />
        <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300">
          Keranjang kosong
        </p>
        <Link href="/menu" className="rounded-full bg-primary px-6 py-3 font-bold text-white">
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-50 pb-44 dark:bg-neutral-950 md:pb-32">
      <div className="sticky top-0 z-30 bg-[#2D5016] px-4 py-4 dark:bg-[#1a3209]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-center gap-3">
            <Link href="/cart" className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-white">Checkout</h1>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {STEPS.map((step, idx) => (
              <div
                key={step}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-full px-2 py-1.5",
                  idx === 1 ? "bg-white/15" : "bg-white/5"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    idx === 0
                      ? "bg-white text-[#2D5016]"
                      : idx === 1
                      ? "border-2 border-white bg-white/20 text-white"
                      : "bg-white/10 text-white/40"
                  )}
                >
                  {idx === 0 ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <p
                  className={cn(
                    "min-w-0 truncate text-[10px] font-medium sm:text-xs",
                    idx <= 1 ? "text-white" : "text-white/40"
                  )}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form
        id="checkout-form"
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto grid max-w-5xl gap-4 px-4 pt-5 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-4">
          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Metode Pengiriman
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DELIVERY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all",
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
                    <Icon className="h-5 w-5 flex-shrink-0 text-[#2D5016]" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {opt.label}
                      </p>
                      <p className="text-xs text-neutral-400">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              {watchedOrderType === "ONLINE" ? "Alamat Pengiriman" : "Data Pemesan"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nama
                </label>
                <input
                  {...register("name")}
                  placeholder="Contoh: Budi Santoso"
                  className={cn(
                    "w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-neutral-800 dark:text-neutral-200",
                    errors.name ? "border-red-400" : "border-neutral-200 dark:border-neutral-700"
                  )}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nomor WhatsApp
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  className={cn(
                    "w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-neutral-800 dark:text-neutral-200",
                    errors.phone ? "border-red-400" : "border-neutral-200 dark:border-neutral-700"
                  )}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              {watchedOrderType === "ONLINE" && (
                <>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Alamat Lengkap
                    </label>
                    <textarea
                      {...register("address")}
                      rows={3}
                      placeholder="Jalan, nomor rumah, patokan, kelurahan..."
                      className={cn(
                        "w-full resize-none rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-neutral-800 dark:text-neutral-200",
                        errors.address
                          ? "border-red-400"
                          : "border-neutral-200 dark:border-neutral-700"
                      )}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Radius Pengiriman
                    </label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {DELIVERY_AREAS.map((area) => (
                        <label
                          key={area.id}
                          className={cn(
                            "cursor-pointer rounded-xl border-2 p-3 text-sm transition-all",
                            watchedDeliveryArea === area.id
                              ? "border-[#2D5016] bg-[#2D5016]/5"
                              : "border-neutral-200 dark:border-neutral-700",
                            !area.available && "opacity-70"
                          )}
                        >
                          <input
                            type="radio"
                            value={area.id}
                            {...register("deliveryArea")}
                            className="sr-only"
                          />
                          <span className="block font-semibold text-neutral-900 dark:text-white">
                            {area.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-neutral-500">
                            {area.available ? `${formatPrice(area.fee)} - ${area.eta}` : area.eta}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.deliveryArea && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.deliveryArea.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Keterangan Tambahan
            </p>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Contoh: Tolong jangan pedas, bungkus rapi..."
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            />
          </section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Metode Pembayaran
            </p>
            <div className="space-y-2">
              {availablePaymentOptions.length === 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  Belum ada metode pembayaran yang aktif.
                </div>
              )}
              {availablePaymentOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all",
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
                    <Icon className="h-5 w-5 flex-shrink-0 text-[#2D5016]" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {opt.label}
                      </p>
                      <p className="text-xs text-neutral-400">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {watchedPayment === "TRANSFER_BANK" && paymentConfig?.transferEnabled && (
              <div className="mt-3 rounded-xl border border-[#2D5016]/20 bg-[#2D5016]/5 p-3 text-sm">
                <p className="font-bold text-neutral-900 dark:text-white">
                  {paymentConfig.bankName || "Bank"} {paymentConfig.bankAccountNumber || "-"}
                </p>
                <p className="text-xs text-neutral-500">a.n. {paymentConfig.bankAccountHolder || settings?.restaurantName || "Restoran"}</p>
                <p className="mt-2 text-xs text-neutral-500">Transfer sesuai nominal berikut:</p>
                <p className="text-lg font-extrabold text-[#2D5016]">{formatPrice(total)}</p>
              </div>
            )}
            {watchedPayment === "QRIS" && paymentConfig?.qrisEnabled && (
              <div className="mt-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                {paymentConfig.qrisImageUrl ? (
                  <img src={paymentConfig.qrisImageUrl} alt="QRIS pembayaran" className="mx-auto h-40 w-40 rounded-lg object-contain" />
                ) : (
                  <p className="text-center text-xs text-neutral-500">Gambar QRIS belum diatur admin.</p>
                )}
                <p className="mt-2 text-center text-xs text-neutral-500">Bayar sesuai total: <span className="font-bold text-[#2D5016]">{formatPrice(total)}</span></p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Ringkasan
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {totalItems} item (
              {items
                .slice(0, 2)
                .map((item) => `${item.product.name} x${item.quantity}`)
                .join(", ")}
              {items.length > 2 ? ", ..." : ""})
            </p>
            <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800">
              <div className="flex justify-between gap-4 text-neutral-500">
                <span>Subtotal</span>
                <span className="text-right">{formatPrice(subtotal)}</span>
              </div>
              {watchedOrderType === "ONLINE" && (
                <div className="flex justify-between gap-4 text-neutral-500">
                  <span>Ongkos Kirim</span>
                  <span className="text-right">{formatPrice(shippingFee)}</span>
                </div>
              )}
              {watchedOrderType === "ONLINE" && (
                <p className="text-xs text-neutral-400">
                  {selectedDeliveryArea.label} - {selectedDeliveryArea.eta}
                </p>
              )}
              <div className="flex justify-between gap-4 text-neutral-500">
                <span>Biaya Layanan</span>
                <span className="text-right">{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-neutral-100 pt-2 font-bold text-neutral-900 dark:border-neutral-800 dark:text-white">
                <span>Total</span>
                <span className="text-right text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </section>
        </div>
      </form>

      <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-5xl border-t border-neutral-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950 md:bottom-0">
        <button
          type="submit"
          form="checkout-form"
          disabled={isSubmitting || deliveryBlocked || paymentBlocked}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D5016] py-4 font-bold text-white shadow-lg transition-all active:scale-95",
            isSubmitting || deliveryBlocked || paymentBlocked
              ? "cursor-not-allowed opacity-70"
              : "hover:bg-[#2D5016]/90"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses Pesanan...
            </>
          ) : (
            paymentBlocked ? "Pembayaran belum tersedia" : deliveryBlocked ? "Alamat di luar radius" : "Buat Pesanan"
          )}
        </button>
      </div>
    </div>
  );
}
