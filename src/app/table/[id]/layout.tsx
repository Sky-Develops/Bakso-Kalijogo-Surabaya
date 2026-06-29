"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart-store";
import { Store } from "lucide-react";
import { use } from "react";

export default function TableLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setTableNumber(id);
    }
  }, [id, setTableNumber]);

  return (
    <div className="min-h-[100dvh] bg-neutral-50 dark:bg-neutral-950 flex flex-col max-w-lg mx-auto">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2D5016]/10 flex items-center justify-center text-[#2D5016]">
            <Store className="w-4 h-4" />
          </div>
          <span className="font-bold text-neutral-900 dark:text-white">Bakso Kalijogo</span>
        </div>
        <div className="bg-[#2D5016] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          🪑 Meja {id}
        </div>
      </header>
      <main className="flex-1 pb-6">{children}</main>
    </div>
  );
}
