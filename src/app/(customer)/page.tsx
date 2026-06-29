"use client";

import Link from "next/link";
import { ShoppingCart, Star, Clock, Users } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { products, formatPrice } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { MenuDetailSheet } from "@/components/menu-detail-sheet";
import { Product } from "@/types";
import { useState } from "react";

const featuredProducts = products.slice(0, 3);

export default function HomePage() {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="bg-[#2D5016] dark:bg-[#1a3209] text-white px-5 pt-12 pb-8 relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute top-16 -right-4 w-24 h-24 rounded-full bg-white/5" />

          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍜</span>
              <span className="font-bold text-lg">Bakso Kalijogo</span>
            </div>
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Hero Text + Image */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white/60 text-sm font-medium">Khas Surabaya Sejak 1995</p>
              <h1 className="text-4xl font-extrabold mt-1 leading-tight">
                Bakso<br />Kalijogo
              </h1>
              <p className="text-white/70 text-sm mt-1">Nikmat, Kenyal, Otentik.</p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 mt-5 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-lg shadow-primary/40"
              >
                Pesan Sekarang →
              </Link>
            </div>
            <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center ml-4 flex-shrink-0">
              <span className="text-6xl">🍜</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-8 pt-6 border-t border-white/10">
            <div>
              <p className="text-2xl font-extrabold text-primary">29+</p>
              <p className="text-xs text-white/60">Tahun Berdiri</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-primary">500+</p>
              <p className="text-xs text-white/60">Pelanggan/Hari</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-primary">4.9★</p>
              <p className="text-xs text-white/60">Rating</p>
            </div>
          </div>
        </section>

        {/* Featured Menu Section */}
        <section className="px-5 pt-6 pb-2">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Menu Favorit</h2>
              <p className="text-xs text-neutral-400">Pilihan terlaris hari ini</p>
            </div>
            <Link href="/menu" className="text-sm font-semibold text-primary">
              Lihat Semua
            </Link>
          </div>

          {/* Horizontal scroll cards */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {featuredProducts.map((product) => (
              <div key={product.id} className="min-w-[130px]">
                <ProductCard product={product} onOpenDetail={setSelectedProduct} />
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="mx-5 mt-6 bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Tentang Kami</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Bakso Kalijogo berdiri sejak 1995 di Surabaya. Kami menggunakan daging sapi segar pilihan,
            diracik dengan bumbu rahasia turun-temurun yang selalu bikin ketagihan.
          </p>
        </section>

        {/* How to Order */}
        <section className="px-5 mt-6 mb-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Cara Pesan</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "💻", title: "Order Online", desc: "Pesan lewat website" },
              { icon: "📱", title: "Scan QR Meja", desc: "Scan di meja resto" },
              { icon: "📞", title: "WhatsApp", desc: "0812-3456-7890" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white dark:bg-neutral-900 rounded-xl p-3 text-center border border-neutral-100 dark:border-neutral-800 shadow-sm"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-2">{item.title}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1C1917] text-white/60 text-center text-xs py-5 mt-auto px-5">
          <p className="font-semibold text-white/80 mb-1">© 2025 Bakso Kalijogo — Surabaya</p>
          <p>Jl. Kalijogo No.12, Surabaya · 0812-3456-7890</p>
        </footer>
      </div>

      <MenuDetailSheet
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
