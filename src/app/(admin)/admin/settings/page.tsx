"use client";

import { Save, Store, User, Shield, Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Pengaturan berhasil disimpan");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Kelola informasi toko, akun admin, dan preferensi aplikasi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="col-span-1 space-y-2 hidden md:block">
          {[
            { icon: Store, label: "Informasi Restoran", active: true },
            { icon: User, label: "Akun Admin", active: false },
            { icon: Shield, label: "Keamanan", active: false },
            { icon: Bell, label: "Notifikasi", active: false },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                item.active
                  ? "bg-[#2D5016] text-white"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">
              Informasi Restoran
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Nama Restoran
                </label>
                <input
                  type="text"
                  defaultValue="Bakso Kalijogo Surabaya"
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Nomor WhatsApp Restoran
                </label>
                <input
                  type="text"
                  defaultValue="0812-3456-7890"
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Alamat Restoran
                </label>
                <textarea
                  defaultValue="Jl. Kalijogo No.12, Surabaya"
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 text-sm resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">
              Biaya & Pajak
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Biaya Layanan (Rp)
                </label>
                <input
                  type="number"
                  defaultValue={1000}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Ongkos Kirim Default (Rp)
                </label>
                <input
                  type="number"
                  defaultValue={8000}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 bg-[#2D5016] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#2D5016]/90 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
