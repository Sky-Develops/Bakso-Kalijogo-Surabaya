"use client";

import { useState } from "react";
import { Plus, Search, MoreVertical, LayoutGrid, CheckCircle, Clock, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type TableStatusFilter = "ALL" | "AVAILABLE" | "OCCUPIED" | "RESERVED";

// Mock Data for Tables
const MOCK_TABLES = Array.from({ length: 12 }).map((_, i) => ({
  id: `t${i + 1}`,
  number: i + 1,
  capacity: i % 3 === 0 ? 6 : 4,
  status: i % 4 === 0 ? "OCCUPIED" : i % 5 === 0 ? "RESERVED" : "AVAILABLE",
  currentOrder: i % 4 === 0 ? `BKJ-250618-${1000 + i}` : null,
}));

export default function AdminTablesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TableStatusFilter>("ALL");

  const filteredTables = MOCK_TABLES.filter((t) => {
    const matchStatus = filter === "ALL" || t.status === filter;
    const matchSearch = t.number.toString().includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 flex flex-col min-h-0 h-[calc(100vh-6rem)]">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Meja</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Kelola meja pelanggan untuk pesanan Dine-In
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              toast.info("Membuka dialog cetak...");
              setTimeout(() => window.print(), 500);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <QrCode className="w-5 h-5" />
            Cetak QR
          </button>
          <button 
            onClick={() => toast.success("Membuka form Tambah Meja (Segera Hadir)")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2D5016] text-white rounded-xl text-sm font-bold hover:bg-[#2D5016]/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tambah Meja
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nomor meja..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
          {([
            { id: "ALL", label: "Semua" },
            { id: "AVAILABLE", label: "Tersedia" },
            { id: "OCCUPIED", label: "Terisi" },
            { id: "RESERVED", label: "Dipesan" },
          ] satisfies { id: TableStatusFilter; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors",
                filter === tab.id
                  ? "bg-[#2D5016] text-white"
                  : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col group cursor-pointer hover:border-[#2D5016]/50 hover:shadow-md transition-all"
            >
              {/* Header Card */}
              <div
                className={cn(
                  "p-3 flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800",
                  table.status === "AVAILABLE"
                    ? "bg-emerald-50 dark:bg-emerald-900/10"
                    : table.status === "OCCUPIED"
                    ? "bg-amber-50 dark:bg-amber-900/10"
                    : "bg-blue-50 dark:bg-blue-900/10"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <LayoutGrid
                    className={cn(
                      "w-4 h-4",
                      table.status === "AVAILABLE"
                        ? "text-emerald-600"
                        : table.status === "OCCUPIED"
                        ? "text-amber-600"
                        : "text-blue-600"
                    )}
                  />
                  <span className="font-bold text-neutral-900 dark:text-white">Meja {table.number}</span>
                </div>
                <div className="flex items-center text-neutral-400">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info(`Opsi Meja ${table.number} (Segera Hadir)`);
                    }}
                    className="p-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>

              {/* Body Card */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3 text-xs text-neutral-500">
                  <span>Kapasitas: {table.capacity}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded font-bold uppercase",
                      table.status === "AVAILABLE"
                        ? "text-emerald-600 bg-emerald-100"
                        : table.status === "OCCUPIED"
                        ? "text-amber-600 bg-amber-100"
                        : "text-blue-600 bg-blue-100"
                    )}
                  >
                    {table.status === "AVAILABLE" ? "Tersedia" : table.status === "OCCUPIED" ? "Terisi" : "Dipesan"}
                  </span>
                </div>

                <div className="mt-auto">
                  {table.status === "OCCUPIED" && table.currentOrder ? (
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                        {table.currentOrder}
                      </span>
                    </div>
                  ) : table.status === "AVAILABLE" ? (
                    <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-semibold py-2">
                      <CheckCircle className="w-4 h-4" /> Siap Digunakan
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          {filteredTables.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-500">
              Tidak ada meja yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
