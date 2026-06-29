"use client";

import { useOrderStore } from "@/store/order-store";
import { formatPrice, formatDate } from "@/lib/mock-data";
import { Search, MoreVertical, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { OrderStatus } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { id: "ALL", label: "Semua" },
  { id: "PENDING", label: "Baru" },
  { id: "CONFIRMED", label: "Dikonfirmasi" },
  { id: "PREPARING", label: "Dimasak" },
  { id: "DELIVERING", label: "Diantar" },
  { id: "DELIVERED", label: "Selesai" },
  { id: "CANCELLED", label: "Batal" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PREPARING: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  DELIVERING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  DELIVERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Baru Masuk",
  CONFIRMED: "Dikonfirmasi",
  PREPARING: "Dimasak",
  DELIVERING: "Diantar",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatal",
};

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOrderStore();
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filter === "ALL" || o.status === filter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Status pesanan diperbarui ke "${STATUS_LABELS[newStatus]}"`);
  };

  const handleQuickConfirm = (orderId: string, currentStatus: OrderStatus) => {
    const FLOW: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "DELIVERING",
      "DELIVERED",
    ];
    const currentIdx = FLOW.indexOf(currentStatus);
    if (currentIdx < FLOW.length - 1) {
      const next = FLOW[currentIdx + 1];
      handleStatusChange(orderId, next);
    } else {
      toast.info("Pesanan sudah selesai.");
    }
  };

  return (
    <div className="space-y-4 flex flex-col" style={{ minHeight: "calc(100vh - 6rem)" }}>
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pesanan</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {orders.length} total pesanan · {orders.filter(o => o.status === "PENDING").length} menunggu proses
          </p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari ID atau Nama pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/30 text-sm w-full sm:w-72"
          />
        </div>
      </div>

      {/* Status Tabs - Scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map((tab) => {
          const count = tab.id === "ALL"
            ? orders.length
            : orders.filter(o => o.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === tab.id
                  ? "bg-[#2D5016] text-white shadow-sm"
                  : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  filter === tab.id ? "bg-white/20" : "bg-neutral-200 dark:bg-neutral-700"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Cards View */}
      <div className="flex md:hidden flex-col gap-3 flex-1 overflow-y-auto pb-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">{order.orderNumber}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", STATUS_COLORS[order.status])}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">{order.customerName}</p>
                <p className="text-xs text-neutral-500">{order.customerPhone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-neutral-900 dark:text-white">{formatPrice(order.totalAmount)}</p>
                <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded font-medium">
                  {order.orderType === "DINE_IN" ? `Meja ${order.tableNumber}` : order.orderType}
                </span>
              </div>
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-0.5">
              {order.items.slice(0, 2).map((item) => (
                <p key={item.id}>{item.quantity}× {item.productName}</p>
              ))}
              {order.items.length > 2 && <p>+{order.items.length - 2} item lainnya</p>}
            </div>
            <div className="flex gap-2 pt-1">
              {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                <button
                  onClick={() => handleQuickConfirm(order.id, order.status)}
                  className="flex-1 bg-[#2D5016] text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#2D5016]/90 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Proses Lanjut
                </button>
              )}
              <button
                onClick={() => handleStatusChange(order.id, "CANCELLED")}
                disabled={order.status === "DELIVERED" || order.status === "CANCELLED"}
                className="px-3 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">📋</span>
            <p className="font-semibold text-neutral-600 dark:text-neutral-400">Tidak ada pesanan</p>
            <p className="text-sm text-neutral-400 mt-1">
              {search ? "Coba ubah kata kunci pencarian" : "Pesanan baru akan muncul di sini"}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:flex flex-1 bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-5 py-3.5">Pesanan</th>
                <th className="px-5 py-3.5">Pelanggan</th>
                <th className="px-5 py-3.5">Item</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                  <td className="px-5 py-4 align-top">
                    <p className="font-bold text-neutral-900 dark:text-white text-xs">{order.orderNumber}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    <span className="inline-block mt-1.5 text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded font-semibold">
                      {order.orderType === "DINE_IN" ? `Meja ${order.tableNumber}` : order.orderType === "TAKEAWAY" ? "Ambil Sendiri" : "Online"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="font-semibold text-neutral-900 dark:text-white">{order.customerName}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{order.customerPhone}</p>
                    {order.deliveryAddress && (
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2 max-w-[180px]">📍 {order.deliveryAddress}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-xs">
                          <span className="font-semibold text-neutral-900 dark:text-white">{item.quantity}×</span>{" "}
                          <span className="text-neutral-600 dark:text-neutral-400">{item.productName}</span>
                          {item.notes && <span className="text-neutral-400 block pl-4 italic">— {item.notes}</span>}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="font-bold text-neutral-900 dark:text-white">{formatPrice(order.totalAmount)}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{order.paymentMethod}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={cn(
                          "text-xs font-bold pl-2.5 pr-7 py-1.5 rounded-lg appearance-none cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/30",
                          STATUS_COLORS[order.status]
                        )}
                      >
                        <option value="PENDING">Baru Masuk</option>
                        <option value="CONFIRMED">Dikonfirmasi</option>
                        <option value="PREPARING">Dimasak</option>
                        <option value="DELIVERING">Diantar</option>
                        <option value="DELIVERED">Selesai</option>
                        <option value="CANCELLED">Dibatalkan</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex justify-end gap-1.5">
                      {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleQuickConfirm(order.id, order.status)}
                          title="Proses ke status berikutnya"
                          className="p-1.5 text-[#2D5016] bg-[#2D5016]/10 rounded-lg hover:bg-[#2D5016]/20 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(order.id, "CANCELLED")}
                        disabled={order.status === "DELIVERED" || order.status === "CANCELLED"}
                        title="Batalkan pesanan"
                        className="p-1.5 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <span className="text-3xl block mb-2">📋</span>
                    <p className="font-semibold text-neutral-500">Tidak ada pesanan</p>
                    <p className="text-sm text-neutral-400 mt-1">
                      {search ? "Coba ubah kata kunci pencarian" : "Pesanan baru akan muncul di sini"}
                    </p>
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
