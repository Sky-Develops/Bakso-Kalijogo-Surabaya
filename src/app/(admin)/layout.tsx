"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  LogOut,
  Store,
  Grid,
  BarChart3,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/cashier", icon: Calculator, label: "Kasir" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Pesanan" },
  { href: "/admin/tables", icon: Grid, label: "Meja" },
  { href: "/admin/menu", icon: UtensilsCrossed, label: "Menu" },
  { href: "/admin/categories", icon: Coffee, label: "Kategori" },
  { href: "/admin/reports", icon: BarChart3, label: "Laporan" },
  { href: "/admin/settings", icon: Settings, label: "Pengaturan" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Berhasil keluar.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar, coba lagi.");
    }
  };

  // Don't render shell on login / reset-password pages
  if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-[100dvh] bg-neutral-100 dark:bg-neutral-900 overflow-hidden text-neutral-900 dark:text-neutral-100">
      {/* Sidebar (Desktop) */}
      <aside className="w-60 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex-col hidden md:flex">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div className="w-8 h-8 bg-[#2D5016] rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight block">POS Kalijogo</span>
            <span className="text-[10px] text-neutral-400">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-sm",
                  isActive
                    ? "bg-[#2D5016] text-white shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                )}
              >
                <item.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium transition-colors text-sm"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        {/* Mobile Header */}
        <header className="h-14 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 md:hidden flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#2D5016] rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">POS Kalijogo</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around h-16 px-1 z-50 safe-area-bottom">
          {NAV_ITEMS.filter(item => ["/admin", "/admin/cashier", "/admin/orders", "/admin/tables", "/admin/settings"].includes(item.href)).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors py-2",
                  isActive
                    ? "text-[#2D5016]"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className={cn("text-[10px] leading-tight", isActive ? "font-bold" : "font-medium")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
