"use client";

import Link from "next/link";
import { useOrderStore } from "@/store/order-store";
import { formatPrice, formatDate, ORDER_STATUS_MAP } from "@/lib/mock-data";
import { Clock, ChevronRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderCardSkeleton } from "@/components/skeletons";
import { useState, useEffect } from "react";

export default function RiwayatPage() {
  const orders = useOrderStore((s) => s.orders);
  const [loading, setLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-[#2D5016] dark:bg-[#1a3209] px-4 py-5">
        <h1 className="text-white font-bold text-xl">Riwayat Pesanan</h1>
        <p className="text-white/60 text-sm mt-0.5">Semua pesananmu ada di sini</p>
      </div>

      <div className="px-4 pt-5 pb-6">
        {loading ? (
          <div className="space-y-3">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
            <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
            <p className="font-bold text-lg text-neutral-600 dark:text-neutral-300">
              Belum ada pesanan
            </p>
            <p className="text-sm text-center mt-1 mb-6">
              Yuk, pesan Bakso Kalijogo sekarang!
            </p>
            <Link
              href="/menu"
              className="bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary/90 active:scale-95 transition-all"
            >
              Lihat Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP["PENDING"];
              const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <Link
                  key={order.id}
                  href={`/pesanan/${order.id}`}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex gap-3 items-start active:scale-[0.98] transition-transform block"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 bg-stone-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🍜</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                        {order.orderNumber}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                          status.color
                        )}
                      >
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {totalQty} item ·{" "}
                      {order.items
                        .slice(0, 2)
                        .map((i) => `${i.productName} ×${i.quantity}`)
                        .join(", ")}
                      {order.items.length > 2 ? ", ..." : ""}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sm text-primary">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <span className="text-xs text-[#2D5016] font-semibold flex items-center gap-0.5">
                        Detail <ChevronRight className="w-3 h-3" />
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
