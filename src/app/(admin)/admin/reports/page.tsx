"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/mock-data";
import { fetchOrders } from "@/lib/order-api";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";
import { BarChart3, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toPng } from 'html-to-image';
import { cn } from "@/lib/utils";

type ReportPeriod = "Harian" | "Mingguan" | "Bulanan" | "Custom";
const REPORT_PERIODS: ReportPeriod[] = ["Harian", "Mingguan", "Bulanan", "Custom"];

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<ReportPeriod>("Harian");
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const result = await fetchOrders();
      setOrders(result.orders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat laporan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOrders]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () =>
        void loadOrders()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const completedOrders = useMemo(() => {
    return orders.filter((order) => order.status === "DELIVERED");
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return completedOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (period === "Harian") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (period === "Mingguan") {
        const diff = now.getTime() - orderDate.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      }
      if (period === "Bulanan") {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      if (period === "Custom" && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      }
      return true;
    });
  }, [completedOrders, period, customRange]);

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue =
    filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  const bestSellingItems = useMemo(() => {
    const items = new Map<string, { name: string; qty: number; rev: number }>();

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = items.get(item.productName) ?? {
          name: item.productName,
          qty: 0,
          rev: 0,
        };
        current.qty += item.quantity;
        current.rev += item.quantity * item.price;
        items.set(item.productName, current);
      });
    });

    return Array.from(items.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach(order => {
      const dateStr = new Date(order.createdAt).toLocaleDateString("id-ID", { month: 'short', day: 'numeric' });
      map.set(dateStr, (map.get(dateStr) || 0) + order.totalAmount);
    });
    return Array.from(map.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan Penjualan</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Analisis dan statistik pendapatan restoran
          </p>
        </div>
        <button 
          onClick={async () => {
            try {
              toast.info("Menyiapkan dokumen PDF...");
              const doc = new jsPDF();
              
              doc.setFontSize(18);
              doc.text("Laporan Penjualan POS Kalijogo", 14, 22);
              
              doc.setFontSize(11);
              doc.setTextColor(100);
              doc.text(`Periode: ${period}`, 14, 30);
              
              doc.setFontSize(12);
              doc.setTextColor(0);
              doc.text(`Total Pendapatan: ${formatPrice(totalRevenue)}`, 14, 45);
              doc.text(`Total Pesanan Sukses: ${filteredOrders.length}`, 14, 52);
              doc.text(`Rata-rata Nilai Pesanan: ${formatPrice(averageOrderValue)}`, 14, 59);

              let currentY = 70;

              const chartElement = document.getElementById("sales-chart-container");
              if (chartElement && chartData.length > 0) {
                const dataUrl = await toPng(chartElement, { quality: 0.95, backgroundColor: '#ffffff' });
                doc.addImage(dataUrl, 'PNG', 14, currentY, 180, 80);
                currentY += 90;
              }
              
              const tableData = bestSellingItems.map((item) => [
                item.name,
                item.qty.toString(),
                formatPrice(item.rev)
              ]);
              
              if (tableData.length > 0) {
                autoTable(doc, {
                  startY: currentY,
                  head: [["Menu Terlaris", "Terjual", "Pendapatan"]],
                  body: tableData,
                  theme: "grid",
                  styles: { fontSize: 10, cellPadding: 5 },
                  headStyles: { fillColor: [45, 80, 22] }
                });
              } else {
                doc.text("Belum ada data menu selesai.", 14, currentY);
              }
              
              doc.save(`Laporan-Penjualan-${period}.pdf`);
              toast.success("PDF berhasil diunduh");
            } catch (err) {
              toast.error("Gagal membuat PDF");
              console.error(err);
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pb-2 print:hidden">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {REPORT_PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap",
                period === p
                  ? "bg-[#2D5016] text-white shadow-sm"
                  : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        {period === "Custom" && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 mx-2 hidden sm:block" />
            <input 
              type="date"
              value={customRange.start}
              onChange={e => setCustomRange(c => ({...c, start: e.target.value}))}
              className="px-3 py-2 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 outline-none"
            />
            <span className="text-neutral-500">-</span>
            <input 
              type="date"
              value={customRange.end}
              onChange={e => setCustomRange(c => ({...c, end: e.target.value}))}
              className="px-3 py-2 rounded-xl text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 outline-none"
            />
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Pendapatan</p>
          <h3 className="text-3xl font-extrabold mt-2 text-neutral-900 dark:text-white">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatPrice(totalRevenue)}
          </h3>
          <p className="text-sm text-neutral-500 font-medium mt-2">Dari pesanan selesai</p>
        </div>
        <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Pesanan Sukses</p>
          <h3 className="text-3xl font-extrabold mt-2 text-neutral-900 dark:text-white">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : filteredOrders.length}
          </h3>
          <p className="text-sm text-neutral-500 font-medium mt-2">Status DELIVERED</p>
        </div>
        <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Rata-rata Nilai Pesanan</p>
          <h3 className="text-3xl font-extrabold mt-2 text-neutral-900 dark:text-white">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatPrice(averageOrderValue)}
          </h3>
          <p className="text-sm text-amber-600 flex items-center font-medium mt-2">
            Berdasarkan pesanan selesai
          </p>
        </div>
      </div>

      {/* Charts / Tables Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 min-h-[300px] flex flex-col">
          <h2 className="font-bold text-lg mb-4">Grafik Penjualan</h2>
          <div className="flex-1 w-full" id="sales-chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `Rp${value/1000}k`} />
                  <Tooltip cursor={{ fill: 'transparent' }} formatter={(value) => formatPrice(Number(value))} />
                  <Bar dataKey="revenue" fill="#2D5016" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-semibold text-neutral-500">Belum ada data</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h2 className="font-bold text-lg">Menu Terlaris</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Menu</th>
                  <th className="px-6 py-3 text-right">Terjual</th>
                  <th className="px-6 py-3 text-right">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {bestSellingItems.map((item) => (
                  <tr key={item.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-right">{item.qty}</td>
                    <td className="px-6 py-4 text-right font-medium text-primary">
                      {formatPrice(item.rev)}
                    </td>
                  </tr>
                ))}
                {!loading && bestSellingItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-neutral-500">
                      Belum ada data menu selesai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
