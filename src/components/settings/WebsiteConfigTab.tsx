import { useState } from "react";
import { Image, MapPin, Save, Store } from "lucide-react";
import { StoreSettings } from "@/types";

export function WebsiteConfigTab({ settings, onSave, isLoading }: { settings: StoreSettings | null, onSave: (p: Partial<StoreSettings>) => void, isLoading: boolean }) {
  const [formData, setFormData] = useState({
    logoUrl: settings?.websiteConfig?.logoUrl || "",
    bannerUrl: settings?.websiteConfig?.bannerUrl || "",
    isOpen: settings?.websiteConfig?.isOpen ?? true,
    announcement: settings?.websiteConfig?.announcement || "",
    restaurantName: settings?.restaurantName || "",
    address: settings?.address || "",
    about: settings?.websiteConfig?.about || "",
    locationUrl: settings?.websiteConfig?.locationUrl || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = (name: "logoUrl" | "bannerUrl", file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, [name]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveWrapper = () => {
    onSave({
      websiteConfig: {
        logoUrl: formData.logoUrl,
        bannerUrl: formData.bannerUrl,
        isOpen: formData.isOpen,
        announcement: formData.announcement,
        about: formData.about,
        locationUrl: formData.locationUrl
      },
      restaurantName: formData.restaurantName,
      address: formData.address
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Store className="w-5 h-5" /> Website Pelanggan
          </h2>
          <p className="text-sm text-neutral-500">Atur tampilan dan informasi di website pelanggan.</p>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
            <div>
              <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">Status Toko</p>
              <p className="text-xs text-neutral-500">{formData.isOpen ? "Toko saat ini BUKA dan menerima pesanan" : "Toko saat ini TUTUP sementara"}</p>
            </div>
            <input 
              type="checkbox" 
              name="isOpen"
              checked={formData.isOpen} 
              onChange={handleToggle}
              className="w-5 h-5 accent-[#2D5016]"
            />
          </label>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Logo Restoran</label>
            <div className="flex gap-3">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo restoran" className="h-full w-full object-cover" />
                ) : (
                  <Image className="h-6 w-6 text-neutral-400" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm" placeholder="https://.../logo.png" />
                <input type="file" accept="image/*" onChange={(event) => handleImageUpload("logoUrl", event.target.files?.[0])} className="w-full text-xs text-neutral-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#2D5016] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />
              </div>
            </div>
            <p className="text-xs text-neutral-500">Masukkan URL gambar logo. Format bebas selama browser bisa membuka gambarnya.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Nama Restoran</label>
              <input name="restaurantName" value={formData.restaurantName} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm" placeholder="Bakso Kalijogo" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Link Lokasi</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input type="url" name="locationUrl" value={formData.locationUrl} onChange={handleChange} className="w-full pl-9 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm" placeholder="https://maps.google.com/..." />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Alamat Restoran</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm resize-none" placeholder="Alamat lengkap restoran" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Tentang Restoran</label>
            <textarea name="about" value={formData.about} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm resize-none" placeholder="Ceritakan singkat tentang restoran" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Pengumuman Toko</label>
            <textarea name="announcement" value={formData.announcement} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm resize-none" placeholder="Misal: Diskon 20% untuk semua menu hari ini!" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">URL Banner Promo</label>
            <input type="text" name="bannerUrl" value={formData.bannerUrl} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm" placeholder="https://..." />
            <input type="file" accept="image/*" onChange={(event) => handleImageUpload("bannerUrl", event.target.files?.[0])} className="w-full text-xs text-neutral-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#2D5016] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />
            <p className="text-xs text-neutral-500">Masukkan link gambar untuk ditampilkan sebagai banner di halaman utama.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button onClick={handleSaveWrapper} disabled={isLoading} className="flex items-center justify-center gap-2 bg-[#2D5016] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2D5016]/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />
            {isLoading ? "Menyimpan..." : "Simpan Tampilan"}
          </button>
        </div>
      </div>
    </div>
  );
}
