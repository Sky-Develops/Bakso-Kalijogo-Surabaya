"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Clock,
  DollarSign,
  Loader2,
  ShoppingBag,
  Users,
} from "lucide-react";
import { fetchOrders } from "@/lib/order-api";
import { formatPrice } from "@/lib/mock-data";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-orange-100 text-orange-700",
  DELIVERING: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const result = await fetchOrders();
      setOrders(result.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () =>
        void loadOrders()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(
      (order) => order.status === "PENDING" || order.status === "CONFIRMED"
    ).length;
    const activeCustomers = new Set(
      orders.map((order) => order.customerPhone).filter(Boolean)
    ).size;

    return [
      {
        label: "Total Pendapatan",
        value: formatPrice(totalRevenue),
        helper: "Tidak termasuk pesanan batal",
        icon: DollarSign,
        color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
      },
      {
        label: "Total Pesanan",
        value: orders.length.toString(),
        helper: "Tersimpan di Supabase",
        icon: ShoppingBag,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
      },
      {
        label: "Pesanan Masuk",
        value: pendingOrders.toString(),
        helper: "Butuh proses admin/dapur",
        icon: Clock,
        color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
      },
      {
        label: "Pelanggan Aktif",
        value: activeCustomers.toString(),
        helper: "Berdasarkan nomor WhatsApp",
        icon: Users,
        color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30",
      },
    ];
  }, [orders]);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Ringkasan operasional dari data pesanan Supabase.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {stat.label}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                  </h3>
                </div>
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm text-neutral-500">{stat.helper}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-5 dark:border-neutral-800 sm:px-6">
          <h2 className="text-lg font-bold">Pesanan Terbaru</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80"
          >
            Lihat Semua <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-neutral-50 font-medium text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {orders.slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {order.orderType === "ONLINE"
                        ? "Delivery"
                        : order.orderType === "TAKEAWAY"
                        ? "Ambil Sendiri"
                        : "Makan di Tempat"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        STATUS_BADGE[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    Belum ada pesanan masuk.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    Memuat pesanan...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
