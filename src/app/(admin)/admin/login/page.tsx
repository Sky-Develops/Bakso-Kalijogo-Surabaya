"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Lock, Mail, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          // Auto sign-up for initial setup
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (signUpError) {
            toast.error("Gagal membuat akun: " + signUpError.message);
            setIsLoading(false);
            return;
          }
          
          toast.success("Akun berhasil dibuat! Silakan cek email jika butuh konfirmasi, atau login kembali.");
          setIsLoading(false);
          return;
        }

        toast.error("Gagal login: " + error.message);
        setIsLoading(false);
        return;
      }

      toast.success("Berhasil masuk!");
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#2D5016]/10 rounded-2xl flex items-center justify-center mb-4 text-[#2D5016]">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Admin POS</h1>
          <p className="text-neutral-500 text-sm mt-1">Bakso Kalijogo Surabaya</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@kalijogo.com"
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2D5016] text-white font-bold py-3.5 rounded-xl hover:bg-[#2D5016]/90 active:scale-[0.98] transition-all mt-4 flex items-center justify-center shadow-lg shadow-[#2D5016]/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk ke Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
