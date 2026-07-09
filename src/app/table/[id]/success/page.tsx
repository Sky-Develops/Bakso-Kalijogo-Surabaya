"use client";

import { Suspense, use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Copy, Loader2, RotateCcw, Search } from "lucide-react";
import { fetchOrder } from "@/lib/order-api";
import { formatPrice } from "@/lib/mock-data";
import { ProductImage } from "@/components/product-image";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";
import { toast } from "sonner";

function TableSuccessContent({ tableId }: { tableId: string }) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      const result = await fetchOrder(orderId);
      setOrder(result.order);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrder();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOrder]);

  useEffect(() => {
    if (!orderId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`table-success-${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        () => void loadOrder()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadOrder, orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D5016]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Search className="mb-4 h-14 w-14 text-neutral-300" />
        <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
          Pesanan Tidak Ditemukan
        </h2>
        <p className="mb-6 text-sm text-neutral-500">
          Pesanan belum tersedia atau link tidak lengkap.
        </p>
        <Link
          href={`/table/${tableId}`}
          className="rounded-full bg-[#2D5016] px-6 py-3 font-bold text-white transition-colors hover:bg-[#2D5016]/90"
        >
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber).catch(() => {});
    toast.success("Nomor pesanan disalin!");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 overflow-x-hidden p-4 pb-8">
      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-1.5 bg-[#2D5016]" />
        <div className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold text-neutral-900 dark:text-white">
            Pesanan Diterima
          </h1>
          <p className="max-w-[280px] text-sm leading-relaxed text-neutral-500">
            Pesanan meja <strong className="text-neutral-900 dark:text-white">{tableId}</strong>{" "}
            sudah masuk ke admin/dapur.
          </p>

          <button
            onClick={copyOrderNumber}
            className="mt-5 flex items-center gap-2 rounded-xl bg-neutral-100 px-5 py-3 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Nomor Pesanan
              </p>
              <p className="font-mono font-bold tracking-widest text-neutral-900 dark:text-white">
                {order.orderNumber}
              </p>
            </div>
            <Copy className="h-4 w-4 flex-shrink-0 text-neutral-400" />
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
          Pembayaran
        </p>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center dark:border-blue-900/30 dark:bg-blue-900/10">
          <p className="mb-1 font-bold text-blue-900 dark:text-blue-100">
            {order.paymentMethod === "QRIS" ? "Scan QRIS di Kasir" : "Bayar Tunai di Kasir"}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Sebutkan nomor pesanan <span className="font-bold">{order.orderNumber}</span>{" "}
            kepada kasir saat pembayaran.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <span className="text-sm text-neutral-500">Total Tagihan</span>
          <span className="text-xl font-bold text-neutral-900 dark:text-white">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
          Detail Pesanan
        </p>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <ProductImage
                  src={item.productImage}
                  alt={item.productName}
                  className="h-10 w-10 flex-shrink-0 rounded-lg"
                  sizes="40px"
                />
                <span className="truncate text-neutral-700 dark:text-neutral-300">
                  {item.quantity}x {item.productName}
                </span>
              </div>
              <span className="flex-shrink-0 font-semibold text-neutral-900 dark:text-white">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Link
        href={`/table/${tableId}`}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-4 font-bold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
      >
        <RotateCcw className="h-5 w-5" />
        Tambah Pesanan Lagi
      </Link>
    </div>
  );
}

export default function TableSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2D5016]" />
        </div>
      }
    >
      <TableSuccessContent tableId={id} />
    </Suspense>
  );
}
