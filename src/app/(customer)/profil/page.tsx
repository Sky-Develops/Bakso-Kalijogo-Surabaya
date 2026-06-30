"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { CUSTOMER_PHONE_KEY, fetchOrders } from "@/lib/order-api";
import { formatPrice } from "@/lib/mock-data";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/types";

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
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const phone = window.localStorage.getItem(CUSTOMER_PHONE_KEY);
    if (!phone) return;

    fetchOrders(phone)
      .then((result) => setOrders(result.orders))
      .catch(() => setOrders([]));
  }, []);

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-50 pb-28 dark:bg-neutral-950">
      <div className="bg-[#2D5016] px-5 pb-12 pt-8 dark:bg-[#1a3209]">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Pelanggan Setia</h1>
            <p className="mt-0.5 text-sm text-white/60">Bakso Kalijogo Member</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <section className="-mt-6 grid grid-cols-3 divide-x divide-neutral-100 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col items-center pr-3">
            <p className="text-xl font-extrabold text-neutral-900 dark:text-white">
              {orders.length}
            </p>
            <p className="mt-0.5 text-center text-xs text-neutral-400">Total Pesanan</p>
          </div>
          <div className="flex flex-col items-center px-3">
            <p className="text-xl font-extrabold text-primary">
              {formatPrice(totalSpent).replace("Rp\u00a0", "Rp")}
            </p>
            <p className="mt-0.5 text-center text-xs text-neutral-400">Total Belanja</p>
          </div>
          <div className="flex flex-col items-center pl-3">
            <p className="text-xl font-extrabold text-amber-500">4.9</p>
            <p className="mt-0.5 text-center text-xs text-neutral-400">Rating</p>
          </div>
        </section>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/riwayat"
            className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Riwayat</p>
              <p className="truncate text-xs text-neutral-400">{orders.length} pesanan</p>
            </div>
          </Link>
          <Link
            href="/menu"
            className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <Star className="h-5 w-5 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Favorit</p>
              <p className="truncate text-xs text-neutral-400">Menu pilihan</p>
            </div>
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {MENU_ITEMS.map((section) => (
            <section
              key={section.group}
              className="overflow-hidden rounded-xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="px-4 pb-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {section.group}
              </p>
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-800 dark:active:bg-neutral-700"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 text-neutral-500 dark:text-neutral-400" />
                      <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                    </Link>
                    {idx < section.items.length - 1 && (
                      <Separator className="mx-4 opacity-50" />
                    )}
                  </div>
                );
              })}
            </section>
          ))}

          <button className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-white p-4 text-red-500 transition-colors hover:bg-red-50 active:scale-[0.98] dark:border-red-900/30 dark:bg-neutral-900 dark:hover:bg-red-900/10">
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-semibold">Keluar</span>
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-300 dark:text-neutral-600">
          (c) 2026 Bakso Kalijogo Surabaya - v1.0.0
        </p>
      </div>
    </div>
  );
}
