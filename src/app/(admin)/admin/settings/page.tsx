"use client";

import { 
  Store, User, Shield, Bell, 
  Printer, Globe, QrCode, Info, Smartphone, Wallet,
  LogOut, ChevronRight, ArrowLeft 
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { StoreSettings } from "@/types";
import { useSettingsStore } from "@/store/settings-store";
import { updateStoreSettings } from "@/lib/settings-api";
import { RestaurantInfoTab } from "@/components/settings/RestaurantInfoTab";
import { AdminProfileTab } from "@/components/settings/AdminProfileTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { NotificationTab } from "@/components/settings/NotificationTab";
import { PrintTemplateTab } from "@/components/settings/PrintTemplateTab";
import { WebsiteConfigTab } from "@/components/settings/WebsiteConfigTab";
import { QrTableTab } from "@/components/settings/QrTableTab";
import { PaymentSettingsTab } from "@/components/settings/PaymentSettingsTab";

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const router = useRouter();
  const { settings, loadSettings, setSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (payload: Partial<StoreSettings>) => {
    setIsLoading(true);
    try {
      const updated = await updateStoreSettings(payload);
      setSettings(updated);
      toast.success("Pengaturan berhasil disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Berhasil keluar.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar, coba lagi.");
    }
  };

  const tabs = [
    { icon: Store, label: "Informasi Restoran", desc: "Ubah nama, nomor WA, dan alamat" },
    { icon: User, label: "Akun Admin", desc: "Pengaturan profil admin" },
    { icon: Shield, label: "Keamanan", desc: "Ubah kata sandi" },
    { icon: Bell, label: "Notifikasi", desc: "Preferensi pemberitahuan" },
    { icon: Printer, label: "Print Struk", desc: "Edit struktur dan template struk" },
    { icon: Globe, label: "Website", desc: "Edit tampilan di website online user" },
    { icon: Wallet, label: "Pembayaran", desc: "Atur cash, transfer bank, dan QRIS" },
    { icon: QrCode, label: "Meja QR", desc: "Kelola dan cetak QR Code meja" },
    { icon: Info, label: "Tentang Aplikasi", desc: "Informasi sistem POS" },
    { icon: Smartphone, label: "Versi Aplikasi", desc: "v1.0.0", isStatic: true },
    { icon: LogOut, label: "Log out", desc: "Keluar dari sesi admin", isAction: true, onClick: handleLogout },
  ];

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header only shown if on Desktop OR on Mobile if no activeTab */}
      <div className={`md:block ${activeTab ? "hidden" : "block"}`}>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm md:text-base">
          Kelola sistem, akun admin, dan preferensi aplikasi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6">
        
        {/* Settings Navigation List */}
        <div className={`col-span-1 space-y-1 md:space-y-2 ${activeTab ? "hidden md:block" : "block"}`}>
          <div className="bg-white dark:bg-neutral-950 rounded-2xl md:border border-neutral-200 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-900">
            {tabs.map((item, idx) => {
              const isActive = activeTab === item.label;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (!item.isStatic) {
                      setActiveTab(item.label);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-4 transition-colors ${
                    isActive
                      ? "bg-neutral-50 dark:bg-neutral-900"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  } ${item.isAction ? "text-red-600 hover:text-red-700" : "text-neutral-700 dark:text-neutral-300"} ${
                    item.isStatic ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      isActive 
                        ? "bg-[#2D5016] text-white" 
                        : item.isAction ? "bg-red-100 text-red-600 dark:bg-red-900/20" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className={`text-xs ${item.isAction ? "text-red-500" : "text-neutral-500"}`}>{item.desc}</p>
                    </div>
                  </div>
                  {!item.isStatic && !item.isAction && (
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content Area */}
        <div className={`col-span-1 md:col-span-2 space-y-6 ${!activeTab ? "hidden md:block" : "block"}`}>
          
          {/* Mobile Back Button */}
          {activeTab && (
            <button 
              onClick={() => setActiveTab(null)}
              className="md:hidden flex items-center gap-2 text-sm font-medium text-neutral-600 mb-4 px-1 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Pengaturan
            </button>
          )}

          {!activeTab && (
            <div className="hidden md:flex bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-12 flex-col items-center justify-center min-h-[400px] text-neutral-400">
              <Store className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-semibold text-neutral-500 text-lg">Pilih Pengaturan</p>
              <p className="text-sm text-center">Pilih menu di sebelah kiri untuk mengedit pengaturan.</p>
            </div>
          )}

          {activeTab === "Informasi Restoran" && <RestaurantInfoTab key={settings?.updatedAt ?? "restaurant-info"} settings={settings} onSave={handleSave} isLoading={isLoading} />}
          {activeTab === "Akun Admin" && <AdminProfileTab />}
          {activeTab === "Keamanan" && <SecurityTab />}
          {activeTab === "Notifikasi" && <NotificationTab />}
          {activeTab === "Print Struk" && <PrintTemplateTab key={settings?.updatedAt ?? "print-template"} settings={settings} onSave={handleSave} isLoading={isLoading} />}
          {activeTab === "Website" && <WebsiteConfigTab key={settings?.updatedAt ?? "website-config"} settings={settings} onSave={handleSave} isLoading={isLoading} />}
          {activeTab === "Pembayaran" && <PaymentSettingsTab key={settings?.updatedAt ?? "payment-config"} settings={settings} onSave={handleSave} isLoading={isLoading} />}
          {activeTab === "Meja QR" && <QrTableTab />}

          {activeTab === "Tentang Aplikasi" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col items-center justify-center min-h-[300px] text-neutral-400">
              <Info className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-semibold text-neutral-500">Tentang POS Kalijogo</p>
              <p className="text-sm text-center mt-2 max-w-sm">Sistem Point of Sale khusus yang dirancang untuk UMKM Bakso Kalijogo Surabaya.</p>
              <p className="text-xs mt-6">© 2026 POS Kalijogo. All rights reserved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
