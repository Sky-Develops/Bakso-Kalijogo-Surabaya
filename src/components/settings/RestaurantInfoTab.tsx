import { useState } from "react";
import { Save } from "lucide-react";
import { StoreSettings } from "@/types";

export function RestaurantInfoTab({ settings, onSave, isLoading }: { settings: StoreSettings | null, onSave: (p: Partial<StoreSettings>) => void, isLoading: boolean }) {
  const [formData, setFormData] = useState({
    restaurantName: settings?.restaurantName || "",
    whatsappNumber: settings?.whatsappNumber || "",
    address: settings?.address || "",
    serviceFee: settings?.serviceFee || 0,
    deliveryFeeDefault: settings?.deliveryFeeDefault || 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "serviceFee" || name === "deliveryFeeDefault" ? Number(value) : value
    }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Informasi Restoran</h2>
          <p className="text-sm text-neutral-500">Perbarui identitas dan informasi dasar restoran.</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Nama Restoran</label>
            <input name="restaurantName" value={formData.restaurantName} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Nomor WhatsApp</label>
            <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Alamat</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm resize-none" />
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <h3 className="font-semibold text-sm mb-3">Biaya & Pajak Default</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500">Biaya Layanan (Rp)</label>
              <input type="number" name="serviceFee" value={formData.serviceFee} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500">Ongkir Default (Rp)</label>
              <input type="number" name="deliveryFeeDefault" value={formData.deliveryFeeDefault} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button onClick={() => onSave(formData)} disabled={isLoading} className="flex items-center justify-center gap-2 bg-[#2D5016] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2D5016]/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
