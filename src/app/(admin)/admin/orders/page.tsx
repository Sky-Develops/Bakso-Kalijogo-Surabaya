"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  Loader2,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { fetchOrders, updateOrder } from "@/lib/order-api";
import { formatPrice, formatDate } from "@/lib/mock-data";
import { createClient } from "@/utils/supabase/client";
import { Order, OrderStatus, PaymentStatus } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StatusFilter = OrderStatus | "ALL";
type DriverDraft = { driverName: string; driverPhone: string };

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Semua" },
  { id: "PENDING", label: "Baru" },
  { id: "CONFIRMED", label: "Dikonfirmasi" },
  { id: "PREPARING", label: "Dimasak" },
  { id: "DELIVERING", label: "Diantar" },
  { id: "DELIVERED", label: "Selesai" },
  { id: "CANCELLED", label: "Batal" },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PREPARING: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  DELIVERING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  DELIVERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Baru Masuk",
  CONFIRMED: "Dikonfirmasi",
  PREPARING: "Dimasak",
  DELIVERING: "Diantar",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Belum Dibayar",
  PAID: "Sudah Dibayar",
  REFUNDED: "Refund",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [driverDrafts, setDriverDrafts] = useState<Record<string, DriverDraft>>({});

  const syncDriverDrafts = useCallback((nextOrders: Order[]) => {
    setDriverDrafts((current) => {
      const next = { ...current };
      nextOrders.forEach((order) => {
        if (!next[order.id]) {
          next[order.id] = {
            driverName: order.driverName ?? "",
            driverPhone: order.driverPhone ?? "",
          };
        }
      });
      return next;
    });
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const result = await fetchOrders();
      setOrders(result.orders);
      syncDriverDrafts(result.orders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat pesanan.");
    } finally {
      setLoading(false);
    }
  }, [syncDriverDrafts]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () =>
        void loadOrders()
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () =>
        void loadOrders()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.toLowerCase();
    return orders.filter((order) => {
      const matchStatus = filter === "ALL" || order.status === filter;
      const matchSearch =
        order.orderNumber.toLowerCase().includes(keyword) ||
        order.customerName.toLowerCase().includes(keyword) ||
        order.customerPhone.toLowerCase().includes(keyword);
      return matchStatus && matchSearch;
    });
  }, [filter, orders, search]);

  const saveOrderUpdate = async (
    orderId: string,
    payload: Parameters<typeof updateOrder>[1],
    successMessage: string
  ) => {
    setSavingId(orderId);
    try {
      const result = await updateOrder(orderId, payload);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? result.order : order))
      );
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui pesanan.");
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    void saveOrderUpdate(orderId, { status: newStatus }, "Status pesanan diperbarui.");
  };

  const handlePaymentChange = (orderId: string, paymentStatus: PaymentStatus) => {
    void saveOrderUpdate(orderId, { paymentStatus }, "Status pembayaran diperbarui.");
  };

  const handleQuickConfirm = (orderId: string, currentStatus: OrderStatus) => {
    const flow: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "DELIVERING",
      "DELIVERED",
    ];
    const currentIdx = flow.indexOf(currentStatus);

    if (currentIdx >= 0 && currentIdx < flow.length - 1) {
      handleStatusChange(orderId, flow[currentIdx + 1]);
    } else {
      toast.info("Pesanan sudah selesai atau dibatalkan.");
    }
  };

  const handleDriverDraft = (orderId: string, field: keyof DriverDraft, value: string) => {
    setDriverDrafts((current) => ({
      ...current,
      [orderId]: {
        driverName: current[orderId]?.driverName ?? "",
        driverPhone: current[orderId]?.driverPhone ?? "",
        [field]: value,
      },
    }));
  };

  const handleDriverSave = (order: Order) => {
    const draft = driverDrafts[order.id] ?? { driverName: "", driverPhone: "" };
    void saveOrderUpdate(
      order.id,
      {
        driverName: draft.driverName.trim() || null,
        driverPhone: draft.driverPhone.replace(/\D/g, "") || null,
      },
      "Data driver diperbarui."
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4 overflow-x-hidden">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pesanan</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            {orders.length} total pesanan -{" "}
            {orders.filter((order) => order.status === "PENDING").length} menunggu proses
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari ID, nama, atau WhatsApp..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#2D5016]/30 dark:border-neutral-700 dark:bg-neutral-900 sm:w-80"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.id === "ALL"
              ? orders.length
              : orders.filter((order) => order.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter === tab.id
                  ? "bg-[#2D5016] text-white shadow-sm"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              )}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    filter === tab.id ? "bg-white/20" : "bg-neutral-200 dark:bg-neutral-700"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#2D5016]" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 pb-4 md:hidden">
            {filteredOrders.map((order) => {
              const draft = driverDrafts[order.id] ?? {
                driverName: "",
                driverPhone: "",
              };

              return (
                <div
                  key={order.id}
                  className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-neutral-900 dark:text-white">
                        {order.orderNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                        STATUS_COLORS[order.status]
                      )}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-neutral-900 dark:text-white">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 dark:text-white">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {PAYMENT_LABELS[order.paymentStatus ?? "UNPAID"]}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                    {order.items.slice(0, 3).map((item) => (
                      <p key={item.id}>
                        {item.quantity}x {item.productName}
                      </p>
                    ))}
                    {order.items.length > 3 && <p>+{order.items.length - 3} item lainnya</p>}
                  </div>

                  {order.orderType === "ONLINE" && (
                    <div className="grid gap-2 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                      <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
                        <Truck className="h-3.5 w-3.5" />
                        Driver Delivery
                      </p>
                      <input
                        value={draft.driverName}
                        onChange={(event) =>
                          handleDriverDraft(order.id, "driverName", event.target.value)
                        }
                        placeholder="Nama driver"
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-950"
                      />
                      <input
                        value={draft.driverPhone}
                        onChange={(event) =>
                          handleDriverDraft(order.id, "driverPhone", event.target.value)
                        }
                        placeholder="Nomor WhatsApp driver"
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-950"
                      />
                      <button
                        onClick={() => handleDriverSave(order)}
                        disabled={savingId === order.id}
                        className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                      >
                        Simpan Driver
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleQuickConfirm(order.id, order.status)}
                        disabled={savingId === order.id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2D5016] py-2 text-xs font-bold text-white transition-colors hover:bg-[#2D5016]/90 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Proses Lanjut
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(order.id, "CANCELLED")}
                      disabled={
                        savingId === order.id ||
                        order.status === "DELIVERED" ||
                        order.status === "CANCELLED"
                      }
                      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-red-900/10 dark:text-red-400"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 md:flex">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                  <tr>
                    <th className="px-5 py-3.5">Pesanan</th>
                    <th className="px-5 py-3.5">Pelanggan</th>
                    <th className="px-5 py-3.5">Item</th>
                    <th className="px-5 py-3.5">Pembayaran</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Driver</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredOrders.map((order) => {
                    const draft = driverDrafts[order.id] ?? {
                      driverName: "",
                      driverPhone: "",
                    };

                    return (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                      >
                        <td className="px-5 py-4 align-top">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">
                            {order.orderNumber}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {formatDate(order.createdAt)}
                          </p>
                          <span className="mt-1.5 inline-block rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            {order.orderType === "DINE_IN"
                              ? `Meja ${order.tableNumber}`
                              : order.orderType === "TAKEAWAY"
                              ? "Ambil Sendiri"
                              : "Delivery"}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            {order.customerName}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {order.customerPhone}
                          </p>
                          {order.deliveryAddress && (
                            <p className="mt-1 max-w-[190px] line-clamp-2 text-xs text-neutral-400">
                              {order.deliveryAddress}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <p key={item.id} className="text-xs">
                                <span className="font-semibold text-neutral-900 dark:text-white">
                                  {item.quantity}x
                                </span>{" "}
                                <span className="text-neutral-600 dark:text-neutral-400">
                                  {item.productName}
                                </span>
                                {item.notes && (
                                  <span className="block pl-4 text-neutral-400">
                                    {item.notes}
                                  </span>
                                )}
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-bold text-neutral-900 dark:text-white">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {order.paymentMethod}
                          </p>
                          <select
                            value={order.paymentStatus ?? "UNPAID"}
                            onChange={(event) =>
                              handlePaymentChange(
                                order.id,
                                event.target.value as PaymentStatus
                              )
                            }
                            disabled={savingId === order.id}
                            className="mt-2 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold outline-none dark:border-neutral-700 dark:bg-neutral-900"
                          >
                            <option value="UNPAID">Belum Dibayar</option>
                            <option value="PAID">Sudah Dibayar</option>
                            <option value="REFUNDED">Refund</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              onChange={(event) =>
                                handleStatusChange(order.id, event.target.value as OrderStatus)
                              }
                              disabled={savingId === order.id}
                              className={cn(
                                "cursor-pointer appearance-none rounded-lg border-0 py-1.5 pl-2.5 pr-7 text-xs font-bold outline-none focus:ring-2 focus:ring-[#2D5016]/30 disabled:opacity-60",
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
                            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2" />
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          {order.orderType === "ONLINE" ? (
                            <div className="grid w-44 gap-1.5">
                              <input
                                value={draft.driverName}
                                onChange={(event) =>
                                  handleDriverDraft(order.id, "driverName", event.target.value)
                                }
                                placeholder="Nama driver"
                                className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900"
                              />
                              <input
                                value={draft.driverPhone}
                                onChange={(event) =>
                                  handleDriverDraft(order.id, "driverPhone", event.target.value)
                                }
                                placeholder="WA driver"
                                className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900"
                              />
                              <button
                                onClick={() => handleDriverSave(order)}
                                disabled={savingId === order.id}
                                className="rounded-lg bg-neutral-900 px-2 py-1.5 text-xs font-bold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                              >
                                Simpan
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400">Tidak perlu driver</span>
                          )}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex justify-end gap-1.5">
                            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleQuickConfirm(order.id, order.status)}
                                disabled={savingId === order.id}
                                title="Proses ke status berikutnya"
                                className="rounded-lg bg-[#2D5016]/10 p-1.5 text-[#2D5016] transition-colors hover:bg-[#2D5016]/20 disabled:opacity-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusChange(order.id, "CANCELLED")}
                              disabled={
                                savingId === order.id ||
                                order.status === "DELIVERED" ||
                                order.status === "CANCELLED"
                              }
                              title="Batalkan pesanan"
                              className="rounded-lg bg-red-50 p-1.5 text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-red-900/10"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <p className="font-semibold text-neutral-500">Tidak ada pesanan</p>
                        <p className="mt-1 text-sm text-neutral-400">
                          {search
                            ? "Coba ubah kata kunci pencarian"
                            : "Pesanan baru akan muncul di sini"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
