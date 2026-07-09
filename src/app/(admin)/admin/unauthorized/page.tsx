"use client";

import Link from "next/link";
import { ShieldX, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-xl p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <ShieldX className="h-8 w-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Akses Ditolak
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
          Kamu tidak memiliki izin untuk mengakses halaman ini. Silakan login
          dengan akun yang memiliki hak akses admin.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/admin/login"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5016] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2D5016]/90"
          >
            <LogIn className="h-4 w-4" />
            Login sebagai Admin
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
