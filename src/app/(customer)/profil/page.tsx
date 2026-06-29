"use client";

import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Heart,
  HelpCircle,
  Info,
  LogOut,
  MapPin,
  Moon,
  Phone,
  Star,
  User as UserIcon,
} from "lucide-react";
import { useOrderStore } from "@/store/order-store";
import { formatPrice } from "@/lib/mock-data";
import { Separator } from "@/components/ui/separator";

const MENU_ITEMS = [
  {
    group: "Akun",
    items: [
      { icon: UserIcon, label: "Edit Profil", href: "#" },
      { icon: MapPin, label: "Alamat Tersimpan", href: "#" },
    ],
  },
  {
    group: "Preferensi",
    items: [
      { icon: Moon, label: "Mode Gelap", href: "#" },
      { icon: Heart, label: "Menu Favorit", href: "#" },
    ],
  },
  {
    group: "Informasi",
    items: [
      { icon: Info, label: "Tentang Aplikasi", href: "#" },
      { icon: Phone, label: "Hubungi Kami", href: "#" },
      { icon: HelpCircle, label: "Bantuan & FAQ", href: "#" },
    ],
  },
];

export default function ProfilPage() {
  const orders = useOrderStore((s) => s.orders);
  const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-6">
      {/* Header */}
      <div className="bg-[#2D5016] dark:bg-[#1a3209] px-5 pt-8 pb-12">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
            👤
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Pelanggan Setia</h1>
            <p className="text-white/60 text-sm mt-0.5">Bakso Kalijogo Member</p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mx-4 -mt-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 shadow-sm grid grid-cols-3 divide-x divide-neutral-100 dark:divide-neutral-800">
        <div className="flex flex-col items-center pr-4">
          <p className="text-xl font-extrabold text-neutral-900 dark:text-white">{orders.length}</p>
          <p className="text-xs text-neutral-400 text-center mt-0.5">Total Pesanan</p>
        </div>
        <div className="flex flex-col items-center px-4">
          <p className="text-xl font-extrabold text-primary">
            {formatPrice(totalSpent).replace("Rp\u00a0", "Rp")}
          </p>
          <p className="text-xs text-neutral-400 text-center mt-0.5">Total Belanja</p>
        </div>
        <div className="flex flex-col items-center pl-4">
          <p className="text-xl font-extrabold text-amber-500">4.9 ⭐</p>
          <p className="text-xs text-neutral-400 text-center mt-0.5">Rating</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mx-4 mt-5 grid grid-cols-2 gap-3">
        <Link
          href="/riwayat"
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-neutral-900 dark:text-white">Riwayat</p>
            <p className="text-xs text-neutral-400">{orders.length} pesanan</p>
          </div>
        </Link>
        <Link
          href="/menu"
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-sm text-neutral-900 dark:text-white">Favorit</p>
            <p className="text-xs text-neutral-400">Menu pilihan</p>
          </div>
        </Link>
      </div>

      {/* Menu Sections */}
      <div className="mx-4 mt-5 space-y-3">
        {MENU_ITEMS.map((section) => (
          <div
            key={section.group}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
          >
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-4 pt-4 pb-2">
              {section.group}
            </p>
            {section.items.map((item, idx) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors active:bg-neutral-100 dark:active:bg-neutral-700"
                >
                  <item.icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                </Link>
                {idx < section.items.length - 1 && (
                  <Separator className="mx-4 opacity-50" />
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Logout */}
        <button className="w-full bg-white dark:bg-neutral-900 rounded-2xl border border-red-100 dark:border-red-900/30 p-4 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors active:scale-[0.98]">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-semibold">Keluar</span>
        </button>
      </div>

      <p className="text-center text-xs text-neutral-300 dark:text-neutral-600 mt-6">
        © 2025 Bakso Kalijogo Surabaya · v1.0.0
      </p>
    </div>
  );
}
