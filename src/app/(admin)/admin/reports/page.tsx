"use client";

import { useOrderStore } from "@/store/order-store";
import { formatPrice } from "@/lib/mock-data";
import { BarChart3, TrendingUp, Download, Calendar, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminReportsPage() {
  const orders = useOrderStore((s) => s.orders);
  const [period, setPeriod] = useState<"Harian" | "Mingguan" | "Bulanan">("Harian");

  const completedOrders = orders.filter((o) => o.status === "DELIVERED");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

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
            toast.info("Menyiapkan dokumen PDF...");
            setTimeout(() => window.print(), 500);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide print:hidden">
        {["Harian", "Mingguan", "Bulanan"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
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
            {formatPrice(totalRevenue || 1250000)}
          </h3>
          <p className="text-sm text-emerald-600 flex items-center font-medium mt-2">
            <TrendingUp className="w-4 h-4 mr-1" /> +15% dari periode lalu
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Pesanan Sukses</p>
          <h3 className="text-3xl font-extrabold mt-2 text-neutral-900 dark:text-white">
            {completedOrders.length || 42}
          </h3>
          <p className="text-sm text-emerald-600 flex items-center font-medium mt-2">
            <TrendingUp className="w-4 h-4 mr-1" /> +8% dari periode lalu
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Rata-rata Nilai Pesanan</p>
          <h3 className="text-3xl font-extrabold mt-2 text-neutral-900 dark:text-white">
            {formatPrice((totalRevenue || 1250000) / (completedOrders.length || 42))}
          </h3>
          <p className="text-sm text-amber-600 flex items-center font-medium mt-2">
            Stabil
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
                {[
                  { name: "Bakso Spesial", qty: 45, rev: 810000 },
                  { name: "Mie Ayam Spesial", qty: 32, rev: 576000 },
                  { name: "Es Teh Manis", qty: 68, rev: 340000 },
                  { name: "Bakso Urat", qty: 21, rev: 315000 },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-right">{item.qty}</td>
                    <td className="px-6 py-4 text-right font-medium text-primary">
                      {formatPrice(item.rev)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
