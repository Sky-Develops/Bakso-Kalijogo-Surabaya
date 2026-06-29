"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, MoreVertical, Coffee } from "lucide-react";
import { categories } from "@/lib/mock-data";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col min-h-0 h-[calc(100vh-6rem)]">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Kategori</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Tambah, ubah, atau hapus kategori menu
          </p>
        </div>
        <button 
          onClick={() => toast.success("Membuka form Tambah Kategori (Segera Hadir)")}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2D5016] text-white rounded-xl text-sm font-bold hover:bg-[#2D5016]/90 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Kategori Baru
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Cari kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 text-sm"
        />
      </div>

      {/* Grid Layout for Categories */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between group hover:border-[#2D5016]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-900 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {category.icon || <Coffee className="w-6 h-6 text-neutral-400" />}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">{category.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">{category.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => toast.info(`Membuka form Edit untuk ${category.name} (Segera Hadir)`)}
                  className="p-1.5 text-neutral-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toast.success(`${category.name} berhasil dihapus`)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-500">
              Kategori tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
