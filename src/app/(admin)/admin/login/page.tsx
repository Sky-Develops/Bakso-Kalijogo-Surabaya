"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Lock, Loader2, Eye, EyeOff, Mail, X, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

type LoginView = "login" | "forgot";

export default function AdminLoginPage() {
  const [view, setView] = useState<LoginView>("login");

  // Login state
  const [identifier, setIdentifier] = useState(""); // email / phone / username
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const supabase = createClient();

  /** Resolve identifier to an email address for signInWithPassword */
  const resolveToEmail = async (id: string): Promise<string | null> => {
    const isPhone = /^[0-9+\-\s()]{8,}$/.test(id.replace(/\s/g, ""));
    const isEmail = id.includes("@") && id.includes(".");

    if (isEmail) return id; // already an email

    if (isPhone) {
      // Try to look up email by phone in profiles
      const { data } = await supabase
        .from("profiles")
        .select("email")
        .eq("phone", id.replace(/\D/g, "")) // digits only
        .maybeSingle();
      if (data?.email) return data.email;
      // try with leading format
      const { data: data2 } = await supabase
        .from("profiles")
        .select("email")
        .eq("phone", id)
        .maybeSingle();
      return data2?.email ?? null;
    }

    // Treat as username
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", id.toUpperCase())
      .maybeSingle();
    return data?.email ?? null;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Isi identitas dan kata sandi.");
      return;
    }
    setIsLoading(true);

    try {
      const resolvedEmail = await resolveToEmail(identifier.trim());

      if (!resolvedEmail) {
        toast.error("Akun tidak ditemukan. Periksa email, no. HP, atau username Anda.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          toast.error("Kata sandi salah atau akun belum dikonfirmasi.");
        } else if (error.message.toLowerCase().includes("email not confirmed")) {
          toast.error("Email belum dikonfirmasi. Cek inbox email Anda.");
        } else {
          toast.error("Gagal login: " + error.message);
        }
        return;
      }

      toast.success("Berhasil masuk!");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Gagal login dengan Google. Pastikan Google OAuth sudah dikonfigurasi.");
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) { toast.error("Masukkan email Anda."); return; }
    setForgotSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim email reset.");
    } finally {
      setForgotSending(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/50 transition-all text-sm";

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-neutral-50 to-green-50/30 dark:from-neutral-950 dark:to-neutral-900 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-xl shadow-neutral-100 dark:shadow-none">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#2D5016]/10 rounded-2xl flex items-center justify-center mb-4 text-[#2D5016]">
              <Store className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {view === "login" ? "Admin POS" : "Lupa Kata Sandi"}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">Bakso Kalijogo Surabaya</p>
          </div>

          {/* ─── LOGIN VIEW ─── */}
          {view === "login" && (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Identifier */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Email / No. HP / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      placeholder="email@kamu.com atau 08xxx atau USERNAME"
                      className={inputClass}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-xs text-[#2D5016] hover:underline font-medium"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="login-password"
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className={inputClass + " pr-10"}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#2D5016] text-white font-bold py-3.5 rounded-xl hover:bg-[#2D5016]/90 active:scale-[0.98] transition-all mt-2 flex items-center justify-center shadow-lg shadow-[#2D5016]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk ke Dashboard"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                <span className="text-xs text-neutral-400 font-medium">atau</span>
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
              </div>

              {/* Google Login */}
              <button
                id="login-google"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 border border-neutral-300 dark:border-neutral-700 rounded-xl py-3 font-semibold text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-70"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Masuk dengan Google
              </button>
            </>
          )}

          {/* ─── FORGOT PASSWORD VIEW ─── */}
          {view === "forgot" && (
            <>
              {forgotSent ? (
                <div className="text-center py-4 space-y-3">
                  <div className="flex justify-center">
                    <CheckCircle className="w-16 h-16 text-emerald-500" />
                  </div>
                  <p className="font-bold text-neutral-900 dark:text-white">Email Terkirim!</p>
                  <p className="text-sm text-neutral-500">
                    Kami telah mengirim link reset kata sandi ke <strong>{forgotEmail}</strong>. Periksa inbox atau folder spam Anda.
                  </p>
                  <button
                    onClick={() => { setView("login"); setForgotSent(false); setForgotEmail(""); }}
                    className="mt-4 text-sm text-[#2D5016] font-semibold hover:underline"
                  >
                    ← Kembali ke Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-neutral-500 -mt-2">
                    Masukkan alamat email Anda dan kami akan mengirimkan link untuk mengatur ulang kata sandi.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        placeholder="email@kamu.com"
                        className={inputClass}
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotSending}
                    className="w-full bg-[#2D5016] text-white font-bold py-3.5 rounded-xl hover:bg-[#2D5016]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {forgotSending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Link Reset"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="w-full text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" /> Batal
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          © {new Date().getFullYear()} Bakso Kalijogo Surabaya · POS System
        </p>
      </div>
    </div>
  );
}
