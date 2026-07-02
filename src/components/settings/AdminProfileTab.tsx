"use client";

import { useState, useEffect } from "react";
import { Save, User, Mail, Phone, AtSign, KeyRound, Plus, Check, X, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// Validasi username: huruf kapital (A-Z), angka (0-9), karakter @ dan . saja, tanpa spasi
const USERNAME_REGEX = /^[A-Z0-9@.]+$/;

type ProfileData = {
  fullName: string;
  phone: string;
  email: string;
  username: string;
};

function hasProvider(identity: unknown, provider: string) {
  return (
    typeof identity === "object" &&
    identity !== null &&
    "provider" in identity &&
    identity.provider === provider
  );
}

export function AdminProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({ fullName: "", phone: "", email: "", username: "" });
  const [usernameError, setUsernameError] = useState("");
  
  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Add account form (create sub-admin)
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newAccountPassword, setNewAccountPassword] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newUsernameError, setNewUsernameError] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  
  // Google link state
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, phone, email, username")
          .eq("id", user.id)
          .single();
        if (data) {
          setProfile({
            fullName: data.full_name || "",
            phone: data.phone || "",
            email: data.email || user.email || "",
            username: data.username || "",
          });
        } else {
          setProfile(p => ({ ...p, email: user.email || "" }));
        }
        
        // Check if Google is linked
        const identities = user.identities || [];
        setIsGoogleLinked(identities.some((id) => hasProvider(id, "google")));
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const validateUsername = (val: string) => {
    if (!val) return "";
    if (!USERNAME_REGEX.test(val)) {
      return "Username hanya boleh huruf kapital (A-Z), angka, titik (.), dan @. Tanpa spasi dan huruf kecil.";
    }
    if (val.length < 4) return "Username minimal 4 karakter.";
    return "";
  };

  const handleUsernameChange = (val: string) => {
    setProfile(p => ({ ...p, username: val }));
    setUsernameError(validateUsername(val));
  };

  const handleSaveProfile = async () => {
    if (usernameError) { toast.error("Perbaiki kesalahan username terlebih dahulu."); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Tidak ada sesi login.");

      // Update profile table, create it first if the auth user does not have a profile row yet.
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: profile.fullName,
          phone: profile.phone,
          email: profile.email,
          username: profile.username || null,
        }, { onConflict: "id" });
      if (profileError) throw profileError;

      // Update email in auth if changed
      if (profile.email && profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: profile.email });
        if (emailError) throw emailError;
        toast.info("Email diperbarui! Cek inbox email baru Anda untuk konfirmasi.");
      }

      toast.success("Profil admin berhasil diperbarui!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error("Konfirmasi kata sandi tidak cocok!"); return; }
    if (newPassword.length < 6) { toast.error("Kata sandi minimal 6 karakter!"); return; }
    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Kata sandi berhasil diperbarui!");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui kata sandi");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLinkGoogle = async () => {
    setLinkingGoogle(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.linkIdentity({ provider: "google" });
      if (error) throw error;
      toast.success("Akun Google berhasil ditautkan!");
      setIsGoogleLinked(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menautkan Google. Pastikan Google OAuth sudah dikonfigurasi di Supabase.");
    } finally {
      setLinkingGoogle(false);
    }
  };

  const handleCreateAccount = async () => {
    const uErr = validateUsername(newUsername);
    if (newUsername && uErr) { toast.error(uErr); return; }
    if (!newEmail || !newAccountPassword) { toast.error("Email dan password wajib diisi."); return; }
    if (newAccountPassword.length < 6) { toast.error("Password minimal 6 karakter."); return; }

    setCreatingAccount(true);
    try {
      const supabase = createClient();
      // Supabase Admin requires service_role key to create users.
      // We'll use signUp with normal flow (email+password) then update profile.
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newAccountPassword,
        options: {
          data: { full_name: "" }
        }
      });
      if (error) throw error;

      if (data.user) {
        // Update profile with username and phone
        await supabase.from("profiles").update({
          phone: newPhone || null,
          email: newEmail,
          username: newUsername ? newUsername : null,
        }).eq("id", data.user.id);
      }

      toast.success(`Akun baru (${newEmail}) berhasil dibuat! Cek email untuk konfirmasi.`);
      setNewEmail("");
      setNewAccountPassword("");
      setNewPhone("");
      setNewUsername("");
      setShowAddAccount(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat akun baru.");
    } finally {
      setCreatingAccount(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5016]/30 transition-all";
  const labelClass = "text-sm font-semibold text-neutral-700 dark:text-neutral-300";

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">

      {/* Profil Utama */}
      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" /> Akun Admin
          </h2>
          <p className="text-sm text-neutral-500">Kelola profil, email, no HP, dan username login Anda.</p>
        </div>

        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-full"/>)}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Nama */}
            <div className="space-y-1.5">
              <label className={labelClass}>Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={profile.fullName} onChange={e => setProfile(p => ({...p, fullName: e.target.value}))}
                  className={inputClass + " pl-10"} placeholder="Nama Lengkap Admin" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))}
                  className={inputClass + " pl-10"} placeholder="admin@kalijogo.com" />
              </div>
            </div>

            {/* No. HP */}
            <div className="space-y-1.5">
              <label className={labelClass}>No. Telepon / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))}
                  className={inputClass + " pl-10"} placeholder="08xxxxxxxxxx" />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className={labelClass}>Username Login</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={profile.username}
                  onChange={e => handleUsernameChange(e.target.value.toUpperCase())}
                  className={`${inputClass} pl-10 ${usernameError ? "border-red-400" : ""}`}
                  placeholder="CONTOH.USERNAME@123"
                />
              </div>
              {usernameError ? (
                <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" />{usernameError}</p>
              ) : profile.username ? (
                <p className="text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" />Username valid.</p>
              ) : (
                <p className="text-xs text-neutral-400">Hanya huruf kapital (A-Z), angka, titik (.) dan @. Contoh: ADMIN.KALIJOGO@1</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button onClick={handleSaveProfile} disabled={saving || loading || !!usernameError}
            className="flex items-center justify-center gap-2 bg-[#2D5016] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2D5016]/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" />
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </div>

      {/* Kata Sandi */}
      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <button onClick={() => setShowPasswordSection(!showPasswordSection)}
          className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <div className="text-left">
              <p className="font-bold text-neutral-900 dark:text-white">Kata Sandi</p>
              <p className="text-xs text-neutral-500">Ubah kata sandi login akun ini</p>
            </div>
          </div>
          <span className="text-xs text-[#2D5016] font-semibold">{showPasswordSection ? "Tutup" : "Ubah"}</span>
        </button>

        {showPasswordSection && (
          <div className="mt-4 space-y-3">
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Kata sandi baru (min. 6 karakter)"
                className={inputClass} />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi kata sandi"
              className={inputClass} />
            <div className="flex justify-end">
              <button onClick={handleUpdatePassword} disabled={savingPassword || !newPassword}
                className="flex items-center gap-2 bg-[#2D5016] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#2D5016]/90 disabled:opacity-70">
                <KeyRound className="w-4 h-4" />
                {savingPassword ? "Memperbarui..." : "Perbarui Sandi"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tautkan Google */}
      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </div>
            <div>
              <p className="font-bold text-sm text-neutral-900 dark:text-white">Google</p>
              <p className="text-xs text-neutral-500">{isGoogleLinked ? "Akun Google sudah tertaut" : "Tautkan untuk login dengan Google"}</p>
            </div>
          </div>
          {isGoogleLinked ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <Check className="w-3 h-3" /> Terhubung
            </span>
          ) : (
            <button onClick={handleLinkGoogle} disabled={linkingGoogle}
              className="text-sm font-bold text-white bg-[#2D5016] px-4 py-2 rounded-lg hover:bg-[#2D5016]/90 transition-all disabled:opacity-70">
              {linkingGoogle ? "Menghubungkan..." : "Tautkan"}
            </button>
          )}
        </div>
      </div>

      {/* Tambah Akun */}
      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <button onClick={() => setShowAddAccount(!showAddAccount)}
          className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <div className="text-left">
              <p className="font-bold text-neutral-900 dark:text-white">Tambah Akun Admin</p>
              <p className="text-xs text-neutral-500">Daftarkan email admin baru ke sistem</p>
            </div>
          </div>
          <span className="text-xs text-[#2D5016] font-semibold">{showAddAccount ? "Tutup" : "Tambah"}</span>
        </button>

        {showAddAccount && (
          <div className="mt-4 space-y-3 border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  className={inputClass + " pl-10"} placeholder="email@baru.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Password *</label>
              <input type="password" value={newAccountPassword} onChange={e => setNewAccountPassword(e.target.value)}
                className={inputClass} placeholder="Minimal 6 karakter" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>No. Telepon (opsional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)}
                  className={inputClass + " pl-10"} placeholder="08xxxxxxxxxx" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Username (opsional)</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={newUsername}
                  onChange={e => {
                    const v = e.target.value.toUpperCase();
                    setNewUsername(v);
                    setNewUsernameError(validateUsername(v));
                  }}
                  className={`${inputClass} pl-10 ${newUsernameError ? "border-red-400" : ""}`}
                  placeholder="CONTOH.USER@1" />
              </div>
              {newUsernameError && <p className="text-xs text-red-500">{newUsernameError}</p>}
            </div>
            <div className="flex justify-end">
              <button onClick={handleCreateAccount}
                disabled={creatingAccount || !newEmail || !newAccountPassword || !!newUsernameError}
                className="flex items-center gap-2 bg-[#2D5016] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#2D5016]/90 disabled:opacity-70">
                <Plus className="w-4 h-4" />
                {creatingAccount ? "Membuat Akun..." : "Buat Akun"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
