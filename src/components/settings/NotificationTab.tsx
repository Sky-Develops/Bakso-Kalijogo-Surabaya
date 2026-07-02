import { useState } from "react";
import { Save, Bell } from "lucide-react";
import { toast } from "sonner";

export function NotificationTab() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("pos_notification_sound");
    return saved === null ? true : saved === "true";
  });

  const handleSaveLocal = () => {
    localStorage.setItem("pos_notification_sound", String(soundEnabled));
    toast.success("Preferensi notifikasi disimpan");
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifikasi
          </h2>
          <p className="text-sm text-neutral-500">Atur preferensi pemberitahuan untuk pesanan baru.</p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
            <div>
              <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">Suara Pesanan Baru</p>
              <p className="text-xs text-neutral-500">Mainkan suara saat ada pesanan online baru</p>
            </div>
            <input 
              type="checkbox" 
              checked={soundEnabled} 
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 accent-[#2D5016]"
            />
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button onClick={handleSaveLocal} className="flex items-center justify-center gap-2 bg-[#2D5016] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2D5016]/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />
            Simpan Preferensi
          </button>
        </div>
      </div>
    </div>
  );
}
