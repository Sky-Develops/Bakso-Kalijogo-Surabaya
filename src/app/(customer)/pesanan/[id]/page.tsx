"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Search,
} from "lucide-react";
import { fetchOrder } from "@/lib/order-api";
import { toWhatsAppUrl } from "@/lib/delivery";
import { formatPrice, formatDate, ORDER_STATUS_MAP } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/product-image";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Cash",
  QRIS: "QRIS",
  TRANSFER_BANK: "Transfer Bank",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  UNPAID: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  REFUNDED: "Refund",
};

const DELIVERY_LABEL: Record<string, string> = {
  ONLINE: "Delivery",
  TAKEAWAY: "Ambil Sendiri",
  DINE_IN: "Makan di Tempat",
};

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      const result = await fetchOrder(id);
      setOrder(result.order);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pesanan tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrder();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOrder]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`customer-order-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `id=eq.${id}` },
        () => void loadOrder()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items", filter: `order_id=eq.${id}` },
        () => void loadOrder()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id, loadOrder]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="h-6 w-6 animate-spin text-[#2D5016]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <Search className="h-14 w-14 text-neutral-300" />
        <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300">
          Pesanan tidak ditemukan
        </p>
        {error && <p className="max-w-sm text-sm text-neutral-500">{error}</p>}
        <Link href="/" className="rounded-full bg-primary px-6 py-3 font-bold text-white">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const status = ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP["PENDING"];
  const whatsappMessage = `Halo Bakso Kalijogo, saya ingin konfirmasi pesanan ${order.orderNumber}.`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-50 pb-44 dark:bg-neutral-950 md:pb-28">
      <div className="bg-[#2D5016] px-4 py-4 dark:bg-[#1a3209]">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link href="/" className="text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-white">Detail Pesanan</h1>
        </div>
      </div>

      <div className="bg-[#2D5016] px-5 pb-10 text-center dark:bg-[#1a3209]">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
            <CheckCircle2 className="h-9 w-9 text-[#2D5016]" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Pesanan Masuk</h2>
          <p className="mt-1 text-sm text-white/70">
            Status pesanan akan diperbarui otomatis dari dapur/admin.
          </p>
          <p className="mt-1 font-mono text-sm text-white/55">#{order.orderNumber}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-4 px-4 pt-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Detail Pesanan
            </p>
            <div className="space-y-2.5 text-sm">
              {[
                { label: "Nomor Pesanan", value: order.orderNumber },
                { label: "Tanggal", value: formatDate(order.createdAt) },
                { label: "Metode Kirim", value: DELIVERY_LABEL[order.orderType] },
                {
                  label: "Pembayaran",
                  value: `${PAYMENT_LABEL[order.paymentMethod]} - ${
                    PAYMENT_STATUS_LABEL[order.paymentStatus ?? "UNPAID"]
                  }`,
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <span className="text-neutral-500 dark:text-neutral-400">{row.label}</span>
                  <span className="text-right font-medium text-neutral-900 dark:text-white">
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">Status</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-bold",
                    status.color
                  )}
                >
                  {status.label}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Item Pesanan
            </p>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <ProductImage
                      src={item.productImage}
                      alt={item.productName}
                      className="h-11 w-11 flex-shrink-0 rounded-lg"
                      sizes="44px"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-neutral-800 dark:text-neutral-200">
                        {item.productName} x{item.quantity}
                      </p>
                      {item.notes && (
                        <p className="truncate text-xs text-neutral-400">{item.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 font-semibold text-neutral-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Ringkasan Pembayaran
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-neutral-500">
                  <span>Ongkos Kirim</span>
                  <span>{formatPrice(order.shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>Biaya Layanan</span>
                <span>{formatPrice(order.serviceFee)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-2 font-bold text-neutral-900 dark:border-neutral-800 dark:text-white">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </section>

          {order.orderType === "ONLINE" && (
            <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Delivery
              </p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {order.deliveryArea ?? "Radius belum tercatat"}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{order.deliveryAddress}</p>
              <p className="mt-2 text-xs text-neutral-400">
                Driver: {order.driverName ?? "Menunggu penugasan admin"}
              </p>
            </section>
          )}
        </aside>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-5xl border-t border-neutral-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950 md:bottom-0">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href={`/status/${order.id}`}
            className="flex w-full items-center justify-center rounded-2xl bg-[#2D5016] py-3.5 font-bold text-white transition-all hover:bg-[#2D5016]/90 active:scale-95"
          >
            Lacak Pesanan
          </Link>
          <a
            href={toWhatsAppUrl(whatsappMessage)}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 font-bold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <MessageCircle className="h-4 w-4" />
            Hubungi Outlet
          </a>
        </div>
      </div>
    </div>
  );
}
