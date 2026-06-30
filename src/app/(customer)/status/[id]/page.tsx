"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChefHat,
  ClipboardList,
  Loader2,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Search,
  Truck,
} from "lucide-react";
import { fetchOrder } from "@/lib/order-api";
import { toWhatsAppUrl } from "@/lib/delivery";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { Order, OrderStatus } from "@/types";

const TRACKING_STEPS: {
  status: OrderStatus;
  label: string;
  desc: string;
  icon: typeof ClipboardList;
}[] = [
  {
    status: "PENDING",
    label: "Pesanan Diterima",
    desc: "Menunggu konfirmasi admin",
    icon: ClipboardList,
  },
  {
    status: "CONFIRMED",
    label: "Dikonfirmasi",
    desc: "Pesanan sudah masuk antrean dapur",
    icon: Check,
  },
  {
    status: "PREPARING",
    label: "Sedang Dimasak",
    desc: "Dapur sedang menyiapkan pesanan",
    icon: ChefHat,
  },
  {
    status: "DELIVERING",
    label: "Dalam Pengiriman",
    desc: "Pesanan sedang menuju lokasi",
    icon: Truck,
  },
  {
    status: "DELIVERED",
    label: "Selesai",
    desc: "Pesanan sudah diterima",
    icon: PackageCheck,
  },
];

const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "DELIVERING",
  "DELIVERED",
];

export default function OrderStatusPage({
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
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`customer-status-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `id=eq.${id}` },
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
        <p className="text-lg font-bold">Pesanan tidak ditemukan</p>
        {error && <p className="max-w-sm text-sm text-neutral-500">{error}</p>}
        <Link href="/" className="rounded-full bg-primary px-6 py-3 font-bold text-white">
          Kembali
        </Link>
      </div>
    );
  }

  const currentStepIdx =
    order.status === "CANCELLED" ? -1 : STATUS_ORDER.indexOf(order.status);
  const currentTracking = TRACKING_STEPS[Math.max(currentStepIdx, 0)];
  const CurrentIcon = currentTracking.icon;
  const driverPhone = order.driverPhone?.replace(/\D/g, "");
  const contactPhone = driverPhone || undefined;
  const contactLabel = driverPhone ? "Hubungi Driver" : "Hubungi Outlet";
  const whatsappMessage = driverPhone
    ? `Halo, saya pemesan ${order.orderNumber}. Saya ingin cek pengiriman.`
    : `Halo Bakso Kalijogo, saya ingin cek status pesanan ${order.orderNumber}.`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-50 pb-28 dark:bg-neutral-950">
      <div className="bg-[#2D5016] px-4 py-4 dark:bg-[#1a3209]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/pesanan/${order.id}`} className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="truncate text-lg font-bold text-white">Status Pesanan</h1>
          </div>
          <span className="flex-shrink-0 font-mono text-sm text-white/60">
            #{order.orderNumber}
          </span>
        </div>
      </div>

      <div className="bg-[#2D5016] px-5 pb-8 dark:bg-[#1a3209]">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
            {order.status === "CANCELLED" ? (
              <ClipboardList className="h-7 w-7" />
            ) : (
              <CurrentIcon className="h-7 w-7" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white">
              {order.status === "CANCELLED" ? "Pesanan Dibatalkan" : currentTracking.label}
            </h2>
            <p className="text-sm text-white/65">
              {order.status === "CANCELLED"
                ? "Hubungi outlet jika pembatalan tidak sesuai."
                : currentTracking.desc}
            </p>
            {order.orderType === "ONLINE" && (
              <p className="mt-0.5 text-xs text-white/50">
                Driver: {order.driverName ?? "Menunggu penugasan admin"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-4 px-4 pt-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Tracking Pesanan
          </p>
          <div>
            {TRACKING_STEPS.map((step, idx) => {
              const stepIdx = STATUS_ORDER.indexOf(step.status);
              const isCompleted = stepIdx <= currentStepIdx;
              const isCurrent = step.status === order.status;
              const isLast = idx === TRACKING_STEPS.length - 1;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 bg-white dark:bg-neutral-900",
                        isCompleted
                          ? "border-[#2D5016] bg-[#2D5016] text-white"
                          : "border-neutral-200 text-neutral-400 dark:border-neutral-700"
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "my-1 min-h-8 w-0.5 flex-1",
                          isCompleted ? "bg-[#2D5016]" : "bg-neutral-200 dark:bg-neutral-700"
                        )}
                      />
                    )}
                  </div>

                  <div className={cn("pb-5 pt-1", isLast && "pb-0")}>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isCurrent
                          ? "text-neutral-900 dark:text-white"
                          : isCompleted
                          ? "text-neutral-600 dark:text-neutral-400"
                          : "text-neutral-400"
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {isCompleted ? step.desc : "Menunggu update"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          {order.orderType === "ONLINE" && (
            <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Pengiriman
              </p>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <div className="min-w-0">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {order.deliveryAddress}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {order.deliveryArea ?? "Radius belum tercatat"} - {order.customerName} -{" "}
                    {order.customerPhone}
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Bantuan
            </p>
            <div className="grid gap-2">
              <a
                href={toWhatsAppUrl(whatsappMessage, contactPhone)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5016] px-4 py-3 text-sm font-bold text-white"
              >
                <MessageCircle className="h-4 w-4" />
                {contactLabel}
              </a>
              {driverPhone && (
                <a
                  href={`tel:${driverPhone}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-bold text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
                >
                  <Phone className="h-4 w-4" />
                  Telepon Driver
                </a>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
