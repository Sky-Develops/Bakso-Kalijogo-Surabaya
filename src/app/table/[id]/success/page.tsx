"use client";

import { useOrderStore } from "@/store/order-store";
import { formatPrice, formatDate } from "@/lib/mock-data";
import { CheckCircle2, Copy, Home, RotateCcw, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { use } from "react";
import { toast } from "sonner";

function TableSuccessContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { orders } = useOrderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5016]" />
      </div>
    );
  }

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <span className="text-5xl mb-4">🤔</span>
        <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">
          Pesanan Tidak Ditemukan
        </h2>
        <p className="text-neutral-500 mb-6 text-sm">
          Link sudah kedaluwarsa atau Anda memuat ulang halaman.
        </p>
        <Link
          href={`/table/${id}`}
          className="bg-[#2D5016] text-white px-6 py-3 rounded-full font-bold hover:bg-[#2D5016]/90 transition-colors"
        >
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber).catch(() => {});
    toast.success("Nomor pesanan disalin!");
  };

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Success Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#2D5016] via-emerald-400 to-[#E85D04]" />
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2">
            Pesanan Diterima! 🎉
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-[240px]">
            Pesanan Anda di <strong className="text-neutral-900 dark:text-white">Meja {id}</strong> sedang diproses oleh dapur kami.
          </p>

          <button
            onClick={copyOrderNumber}
            className="mt-5 flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-5 py-3 rounded-xl transition-colors"
          >
            <div className="text-left">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Nomor Pesanan</p>
              <p className="font-bold text-neutral-900 dark:text-white font-mono tracking-widest">{order.orderNumber}</p>
            </div>
            <Copy className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Pembayaran</p>
        {order.paymentMethod === "QRIS" ? (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 text-center">
            <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">Scan QRIS di Kasir</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Sebutkan nomor pesanan <span className="font-bold">{order.orderNumber}</span> kepada kasir saat membayar via QRIS.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 text-center">
            <p className="font-bold text-amber-900 dark:text-amber-100 mb-1">Bayar Tunai di Kasir</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Silakan bayar ke kasir setelah selesai menikmati hidangan.
            </p>
          </div>
        )}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-neutral-500 text-sm">Total Tagihan</span>
          <span className="font-bold text-xl text-neutral-900 dark:text-white">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Detail Pesanan</p>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-neutral-700 dark:text-neutral-300">
                {item.quantity}× {item.productName}
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <Link
        href={`/table/${id}`}
        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold py-4 rounded-2xl hover:bg-neutral-50 active:scale-[0.98] transition-all"
      >
        <RotateCcw className="w-5 h-5" />
        Tambah Pesanan Lagi
      </Link>
    </div>
  );
}

export default function TableSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5016]" />
      </div>
    }>
      <TableSuccessContent id={id} />
    </Suspense>
  );
}
