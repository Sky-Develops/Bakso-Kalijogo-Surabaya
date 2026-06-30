"use client";

import Link from "next/link";
import { MessageCircle, QrCode, ShoppingCart, Store } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { products } from "@/lib/mock-data";
import { fetchMenu } from "@/lib/menu-api";
import { ProductCard } from "@/components/product-card";
import { MenuDetailSheet } from "@/components/menu-detail-sheet";
import { Product } from "@/types";
import { useEffect, useState } from "react";
import { ProductImage } from "@/components/product-image";

export default function HomePage() {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const syncProducts = useCartStore((s) => s.syncProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [homeProducts, setHomeProducts] = useState<Product[]>(products);
  const heroProduct = homeProducts[0] ?? products[0];
  const featuredProducts = homeProducts
    .filter((product) => product.isAvailable)
    .slice(0, 4);

  useEffect(() => {
    let active = true;

    fetchMenu()
      .then((data) => {
        if (!active || data.products.length === 0) return;
        setHomeProducts(data.products);
        syncProducts(data.products);
      })
      .catch(() => setHomeProducts(products));

    return () => {
      active = false;
    };
  }, [syncProducts]);

  return (
    <>
      <div className="min-h-screen overflow-x-hidden">
        <section className="bg-[#2D5016] px-5 py-6 text-white md:rounded-b-3xl md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/12">
                  <Store className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold">Bakso Kalijogo</span>
              </div>
              <Link href="/cart" className="relative rounded-full p-2 hover:bg-white/10">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>
            </div>

            <div className="grid items-center gap-7 md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_460px]">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/65">
                  Khas Surabaya sejak 1995
                </p>
                <h1 className="mt-2 max-w-xl text-4xl font-extrabold leading-tight md:text-6xl">
                  Bakso Kalijogo
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
                  Bakso sapi segar, kuah kaldu gurih, dan mie ayam rumahan untuk
                  makan di tempat, takeaway, atau pesan dari rumah.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/menu"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 active:scale-95"
                  >
                    Pesan Sekarang
                  </Link>
                  <Link
                    href="/table/1"
                    className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Mode QR Meja
                  </Link>
                </div>
              </div>

              <ProductImage
                src={heroProduct.imageUrl}
                alt={heroProduct.imageAlt ?? heroProduct.name}
                className="h-56 w-full rounded-2xl shadow-2xl shadow-black/20 md:h-72"
                sizes="(max-width: 768px) 100vw, 460px"
                priority
              />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
              <div>
                <p className="text-2xl font-extrabold text-primary">29+</p>
                <p className="text-xs text-white/65">Tahun Berdiri</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-primary">500+</p>
                <p className="text-xs text-white/65">Pelanggan/Hari</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-primary">4.9</p>
                <p className="text-xs text-white/65">Rating</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pt-7 md:px-8 lg:px-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white md:text-xl">
                Menu Favorit
              </h2>
              <p className="text-xs text-neutral-400 md:text-sm">
                Pilihan paling sering dipesan hari ini
              </p>
            </div>
            <Link href="/menu" className="whitespace-nowrap text-sm font-semibold text-primary">
              Lihat Semua
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={setSelectedProduct}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 py-7 md:grid-cols-[1.2fr_1fr] md:px-8 lg:px-10">
          <div className="rounded-xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Tentang Kami
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Bakso Kalijogo berdiri sejak 1995 di Surabaya. Kami memakai daging
              sapi pilihan dan kuah kaldu yang dimasak perlahan untuk rasa yang
              konsisten.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Cara Pesan
            </h2>
            <div className="mt-4 grid gap-3">
              {[
                { icon: ShoppingCart, title: "Order Online", desc: "Pilih menu lalu checkout" },
                { icon: QrCode, title: "Scan QR Meja", desc: "Pesan langsung dari meja" },
                { icon: MessageCircle, title: "WhatsApp", desc: "0812-3456-7890" },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#2D5016]/10 text-[#2D5016]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-[#1C1917] px-5 py-5 text-center text-xs text-white/60">
          <p className="mb-1 font-semibold text-white/80">
            Copyright 2025 Bakso Kalijogo - Surabaya
          </p>
          <p>Jl. Kalijogo No.12, Surabaya - 0812-3456-7890</p>
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
