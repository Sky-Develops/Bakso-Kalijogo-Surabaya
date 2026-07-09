"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ChevronRight,
  Clock,
  Loader2,
  Search,
  ShoppingBag,
} from "lucide-react";
import { CUSTOMER_PHONE_KEY, fetchOrders } from "@/lib/order-api";
import { formatPrice, formatDate, ORDER_STATUS_MAP } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/product-image";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";

export default function RiwayatPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedPhone = window.localStorage.getItem(CUSTOMER_PHONE_KEY) ?? "";
      setPhone(savedPhone);
      setPhoneInput(savedPhone);
      if (!savedPhone) setLoading(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const loadOrders = useCallback(async (targetPhone: string) => {
    if (!targetPhone) return;

    setLoading(true);
    try {
      const result = await fetchOrders(targetPhone);
      setOrders(result.orders);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat riwayat pesanan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!phone) return;

    const timeoutId = window.setTimeout(() => {
      void loadOrders(phone);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [phone, loadOrders]);

  useEffect(() => {
    if (!phone) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`customer-history-${phone}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `customer_phone=eq.${phone}`,
        },
        () => void loadOrders(phone)
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [phone, loadOrders]);

  const handlePhoneSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = phoneInput.replace(/\D/g, "");

    if (normalized.length < 10) {
      setError("Masukkan nomor WhatsApp yang valid.");
      return;
    }

    window.localStorage.setItem(CUSTOMER_PHONE_KEY, normalized);
    setPhone(normalized);
    setPhoneInput(normalized);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-50 pb-28 dark:bg-neutral-950">
      <div className="bg-[#2D5016] px-4 py-5 dark:bg-[#1a3209]">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-xl font-bold text-white">Riwayat Pesanan</h1>
          <p className="mt-0.5 text-sm text-white/60">
            Cek pesanan lintas device memakai nomor WhatsApp.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-5">
        <form
          onSubmit={handlePhoneSubmit}
          className="mb-4 rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Nomor WhatsApp Pemesan
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={phoneInput}
                onChange={(event) => setPhoneInput(event.target.value)}
                type="tel"
                placeholder="08123456789"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#2D5016] px-5 py-3 text-sm font-bold text-white"
            >
              Cari Riwayat
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#2D5016]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-400">
            <ShoppingBag className="mb-4 h-16 w-16 opacity-30" />
            <p className="text-lg font-bold text-neutral-600 dark:text-neutral-300">
              Belum ada pesanan
            </p>
            <p className="mb-6 mt-1 text-sm">
              {phone
                ? "Tidak ada pesanan untuk nomor tersebut."
                : "Masukkan nomor WhatsApp untuk melihat riwayat."}
            </p>
            <Link
              href="/menu"
              className="rounded-full bg-primary px-6 py-3 font-bold text-white transition-all hover:bg-primary/90 active:scale-95"
            >
              Lihat Menu
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {orders.map((order) => {
              const status = ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP["PENDING"];
              const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const firstItem = order.items[0];

              return (
                <Link
                  key={order.id}
                  href={`/pesanan/${order.id}`}
                  className="flex gap-3 rounded-xl border border-neutral-100 bg-white p-4 transition-transform active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <ProductImage
                    src={firstItem?.productImage}
                    alt={firstItem?.productName ?? order.orderNumber}
                    className="h-14 w-14 flex-shrink-0 rounded-xl"
                    sizes="56px"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                        {order.orderNumber}
                      </p>
                      <span
                        className={cn(
                          "flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                          status.color
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {totalQty} item -{" "}
                      {order.items
                        .slice(0, 2)
                        .map((item) => `${item.productName} x${item.quantity}`)
                        .join(", ")}
                      {order.items.length > 2 ? ", ..." : ""}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-[#2D5016]">
                        Detail <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
