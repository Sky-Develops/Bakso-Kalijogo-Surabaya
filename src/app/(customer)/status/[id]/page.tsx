"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { useOrderStore } from "@/store/order-store";
import { cn } from "@/lib/utils";

const TRACKING_STEPS = [
  { status: "PENDING", label: "Pesanan Diterima", icon: "📋" },
  { status: "PREPARING", label: "Sedang Dimasak", icon: "👨‍🍳" },
  { status: "DELIVERING", label: "Sedang Diantar", icon: "🛵" },
  { status: "DELIVERED", label: "Pesanan Tiba", icon: "🎉" },
];

const STATUS_ORDER = ["PENDING", "CONFIRMED", "PREPARING", "DELIVERING", "DELIVERED"];

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const order = useOrderStore((s) => s.getOrderById(id));

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 gap-4">
        <span className="text-5xl">🔍</span>
        <p className="font-bold text-lg">Pesanan tidak ditemukan</p>
        <Link href="/" className="bg-primary text-white px-6 py-3 rounded-full font-bold">
          Kembali
        </Link>
      </div>
    );
  }

  const currentStepIdx = STATUS_ORDER.indexOf(order.status);
  const currentTracking = TRACKING_STEPS.find((s) => s.status === order.status);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-8">
      {/* Header */}
      <div className="bg-[#2D5016] dark:bg-[#1a3209] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/pesanan/${order.id}`} className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-white font-bold text-lg">Status Pesanan</h1>
        </div>
        <span className="text-white/60 text-sm font-mono">#{order.orderNumber}</span>
      </div>

      {/* Current Status Hero */}
      <div className="bg-[#2D5016] dark:bg-[#1a3209] px-5 pb-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{currentTracking?.icon ?? "⏳"}</span>
          <div>
            <h2 className="text-xl font-bold text-white">
              {currentTracking?.label ?? "Menunggu Konfirmasi"}
            </h2>
            <p className="text-white/60 text-sm">Estimasi tiba: 14:55 (± 15 menit)</p>
            {order.orderType === "ONLINE" && (
              <p className="text-white/50 text-xs mt-0.5">Driver: Pak Budi · ⭐ 4.9</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Tracking Steps */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-4">
            Tracking Pesanan
          </p>
          <div className="space-y-0">
            {TRACKING_STEPS.map((step, idx) => {
              const stepIdx = STATUS_ORDER.indexOf(step.status);
              const isCompleted = stepIdx <= currentStepIdx;
              const isCurrent = step.status === order.status || (
                order.status === "CONFIRMED" && step.status === "PENDING"
              );
              const isLast = idx === TRACKING_STEPS.length - 1;

              return (
                <div key={step.status} className="flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0 z-10 bg-white dark:bg-neutral-900",
                        isCompleted
                          ? "border-[#2D5016] bg-[#2D5016] text-white"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-400"
                      )}
                    >
                      {isCompleted ? "✓" : step.icon}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 my-1 min-h-[24px]",
                          isCompleted ? "bg-[#2D5016]" : "bg-neutral-200 dark:bg-neutral-700"
                        )}
                      />
                    )}
                  </div>

                  {/* Label */}
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
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {isCompleted && !isCurrent ? "14:32" : isCurrent ? "14:48" : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Address */}
        {order.orderType === "ONLINE" && order.deliveryAddress && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Alamat Pengiriman
            </p>
            <div className="flex gap-2">
              <span className="text-red-500 mt-0.5 flex-shrink-0">📍</span>
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {order.deliveryAddress}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Surabaya · {order.customerName} · {order.customerPhone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Driver Actions */}
        {order.orderType === "ONLINE" && (
          <div className="flex gap-3">
            <button className="flex-1 bg-[#2D5016] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2">
              💬 WhatsApp Driver
            </button>
            <button className="flex-1 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700">
              <Phone className="w-4 h-4" /> Hubungi Driver
            </button>
          </div>
        )}

        <p className="text-center text-sm text-neutral-500">
          Ada masalah dengan pesananmu?{" "}
          <span className="font-bold text-[#2D5016] cursor-pointer">Hubungi Kami</span>
        </p>
      </div>
    </div>
  );
}
