"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Konfirmasi kata sandi tidak cocok!"); return; }
    if (password.length < 6) { toast.error("Kata sandi minimal 6 karakter!"); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("Kata sandi berhasil diperbarui!");
      setTimeout(() => router.push("/admin/login"), 2500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui kata sandi. Link mungkin sudah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-10 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 transition-all text-sm";

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-neutral-50 to-green-50/30 dark:from-neutral-950 dark:to-neutral-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#2D5016]/10 rounded-2xl flex items-center justify-center mb-4 text-[#2D5016]">
              <Store className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Reset Kata Sandi</h1>
            <p className="text-neutral-500 text-sm mt-1">Bakso Kalijogo Surabaya</p>
          </div>

          {done ? (
            <div className="text-center space-y-3 py-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-emerald-500" />
              </div>
              <p className="font-bold text-neutral-900 dark:text-white">Kata sandi berhasil diperbarui!</p>
              <p className="text-sm text-neutral-500">Anda akan diarahkan ke halaman login...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-neutral-500 -mt-2">Masukkan kata sandi baru Anda di bawah ini.</p>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Minimal 6 karakter"
                    className={inputClass}
                    autoFocus
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="Ulangi kata sandi baru"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2D5016] text-white font-bold py-3.5 rounded-xl hover:bg-[#2D5016]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2D5016]/20 disabled:opacity-70 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Kata Sandi Baru"}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-neutral-400 mt-6">
          © {new Date().getFullYear()} Bakso Kalijogo Surabaya · POS System
        </p>
      </div>
    </div>
  );
}
