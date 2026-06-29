"use client";

import { useOrderStore } from "@/store/order-store";
import { formatPrice } from "@/lib/mock-data";
import { TrendingUp, ShoppingBag, Users, DollarSign, Clock, ArrowUpRight } from "lucide-react";

export default function AdminDashboardPage() {
  const orders = useOrderStore((s) => s.orders);
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Ringkasan performa penjualan hari ini
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Pendapatan",
            value: formatPrice(totalRevenue),
            trend: "+12.5%",
            icon: DollarSign,
            color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
          },
          {
            label: "Total Pesanan",
            value: totalOrders.toString(),
            trend: "+5.2%",
            icon: ShoppingBag,
            color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
          },
          {
            label: "Pesanan Masuk",
            value: pendingOrders.toString(),
            trend: "Butuh Proses",
            icon: Clock,
            color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
          },
          {
            label: "Pelanggan Aktif",
            value: "124",
            trend: "+2.1%",
            icon: Users,
            color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold mt-2 text-neutral-900 dark:text-white">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stat.trend.includes("+") ? (
                <span className="text-emerald-600 flex items-center font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.trend}
                </span>
              ) : stat.trend === "Butuh Proses" ? (
                <span className="text-amber-600 font-medium">{stat.trend}</span>
              ) : (
                <span className="text-neutral-500">{stat.trend}</span>
              )}
              {stat.trend.includes("%") && (
                <span className="text-neutral-400 ml-2">dari kemarin</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="font-bold text-lg">Pesanan Terbaru</h2>
          <button className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
            Lihat Semua <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-medium">
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
                <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-neutral-900 dark:text-white">{order.customerName}</p>
                    <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold">
                      {order.orderType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold
                        ${
                          order.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : order.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      `}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    Belum ada pesanan masuk.
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
