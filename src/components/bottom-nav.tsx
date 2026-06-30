"use client";

import Link from "next/link";
import { Home, BookOpen, ShoppingCart, User, Clock } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/menu", icon: BookOpen, label: "Menu" },
  { href: "/cart", icon: ShoppingCart, label: "Keranjang" },
  { href: "/riwayat", icon: Clock, label: "Riwayat" },
  { href: "/profil", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.getTotalItems());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-16 max-w-lg items-center justify-around border-t border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
        const isCart = href === "/cart";
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-3 py-2 transition-colors min-w-0",
              isActive
                ? "text-primary"
                : "text-neutral-400 dark:text-neutral-500"
            )}
          >
            <div className="relative">
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              {isCart && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </div>
            <span className={cn("text-[10px] font-medium truncate", isActive && "font-semibold")}>
              {label}
            </span>
            {isActive && (
              <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
