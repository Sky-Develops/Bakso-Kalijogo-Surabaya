"use client";

import { products, formatPrice } from "@/lib/mock-data";
import { Plus, Search, Filter, Edit, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminMenuPage() {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Menu</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Tambah, ubah, atau hapus menu restoran
          </p>
        </div>
        <button 
          onClick={() => toast.success("Membuka form Tambah Menu (Segera Hadir)")}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Tambah Menu Baru
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
        <button 
          onClick={() => toast.info("Fitur filter kategori (Segera Hadir)")}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <Filter className="w-4 h-4" />
          Kategori
        </button>
      </div>

      {/* Product List */}
      <div className="flex-1 bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left relative">
            <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-medium sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 w-20 text-center">Icon</th>
                <th className="px-6 py-4">Informasi Menu</th>
                <th className="px-6 py-4 w-32">Kategori</th>
                <th className="px-6 py-4 w-32 text-right">Harga</th>
                <th className="px-6 py-4 w-32 text-center">Status</th>
                <th className="px-6 py-4 w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-2xl mx-auto">
                      {product.imageUrl}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="font-bold text-neutral-900 dark:text-white">{product.name}</p>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2 max-w-md">
                      {product.description}
                    </p>
                    {product.badge && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                        {product.badge}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold uppercase">
                      {product.categoryId}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <p className="font-bold text-neutral-900 dark:text-white">
                      {formatPrice(product.price)}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={product.isAvailable}
                        readOnly
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-[#2D5016]"></div>
                    </label>
                    <p className="text-[10px] text-neutral-500 mt-1 font-medium">
                      {product.isAvailable ? "Tersedia" : "Habis"}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <div className="flex justify-end gap-2 text-neutral-400">
                      <button 
                        onClick={() => toast.info(`Membuka form Edit untuk ${product.name} (Segera Hadir)`)}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg hover:text-blue-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toast.success(`${product.name} berhasil dihapus`)}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toast.info(`Opsi menu tambahan untuk ${product.name} (Segera Hadir)`)}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    Menu tidak ditemukan.
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
