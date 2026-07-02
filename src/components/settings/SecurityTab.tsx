import { useState } from "react";
import { Save, Shield } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function SecurityTab() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      toast.error("Kata sandi tidak cocok!");
      return;
    }
    if (password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter!");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      toast.success("Kata sandi berhasil diperbarui");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui kata sandi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" /> Keamanan
          </h2>
          <p className="text-sm text-neutral-500">Ubah kata sandi akun Anda secara berkala.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Kata Sandi Baru</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm" placeholder="Minimal 6 karakter" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Konfirmasi Kata Sandi</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm" placeholder="Ulangi kata sandi baru" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button onClick={handleUpdatePassword} disabled={saving || !password} className="flex items-center justify-center gap-2 bg-[#2D5016] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2D5016]/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />
            {saving ? "Memperbarui..." : "Perbarui Sandi"}
          </button>
        </div>
      </div>
    </div>
  );
}
