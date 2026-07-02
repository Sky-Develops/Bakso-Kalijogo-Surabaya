"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/mock-data";
import { fetchOrders } from "@/lib/order-api";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/types";
import { BarChart3, Download, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ReportPeriod = "Harian" | "Mingguan" | "Bulanan";
const REPORT_PERIODS: ReportPeriod[] = ["Harian", "Mingguan", "Bulanan"];

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<ReportPeriod>("Harian");
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
    void loadOrders();
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

  const completedOrders = orders.filter((order) => order.status === "DELIVERED");
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue =
    completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const bestSellingItems = useMemo(() => {
    const items = new Map<string, { name: string; qty: number; rev: number }>();

    completedOrders.forEach((order) => {
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
  }, [completedOrders]);

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
          onClick={() => {
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
              doc.text(`Total Pesanan Sukses: ${completedOrders.length}`, 14, 52);
              doc.text(`Rata-rata Nilai Pesanan: ${formatPrice(averageOrderValue)}`, 14, 59);
              
              const tableData = bestSellingItems.map((item) => [
                item.name,
                item.qty.toString(),
                formatPrice(item.rev)
              ]);
              
              if (tableData.length > 0) {
                autoTable(doc, {
                  startY: 70,
                  head: [["Menu Terlaris", "Terjual", "Pendapatan"]],
                  body: tableData,
                  theme: "grid",
                  styles: { fontSize: 10, cellPadding: 5 },
                  headStyles: { fillColor: [45, 80, 22] }
                });
              } else {
                doc.text("Belum ada data menu selesai.", 14, 75);
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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide print:hidden">
        {REPORT_PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              period === p
                ? "bg-[#2D5016] text-white shadow-sm"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            {p}
          </button>
        ))}
        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 mx-2 hidden sm:block" />
        <button 
          onClick={() => toast.info("Fitur filter tanggal khusus (Segera Hadir)")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <Calendar className="w-4 h-4" />
          Pilih Tanggal
        </button>
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
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : completedOrders.length}
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
        <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 min-h-[300px] flex flex-col items-center justify-center text-neutral-400">
          <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-semibold text-neutral-500">Grafik Penjualan</p>
          <p className="text-sm">Fitur visualisasi grafik akan segera hadir.</p>
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
