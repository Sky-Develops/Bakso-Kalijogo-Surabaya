"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useOrderStore } from "@/store/order-store";
import {
  formatPrice,
  formatDate,
  ORDER_STATUS_MAP,
  SHIPPING_FEE,
  SERVICE_FEE,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "💵 Cash",
  QRIS: "📱 QRIS",
  TRANSFER_BANK: "🏦 Transfer Bank",
};

const DELIVERY_LABEL: Record<string, string> = {
  ONLINE: "🛵 Ojek Online",
  TAKEAWAY: "🏃 Ambil Sendiri",
  DINE_IN: "🪑 Makan di Tempat",
};

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const order = useOrderStore((s) => s.getOrderById(id));

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 gap-4">
        <span className="text-5xl">🔍</span>
        <p className="font-bold text-lg text-neutral-700 dark:text-neutral-300">
          Pesanan tidak ditemukan
        </p>
        <Link href="/" className="bg-primary text-white px-6 py-3 rounded-full font-bold">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const status = ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP["PENDING"];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-28">
      {/* Header */}
      <div className="bg-[#2D5016] dark:bg-[#1a3209] px-4 py-4 flex items-center gap-3">
        <Link href="/" className="text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-white font-bold text-lg">Detail Pesanan</h1>
      </div>

      {/* Success Hero */}
      <div className="bg-[#2D5016] dark:bg-[#1a3209] px-5 pb-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
          <CheckCircle2 className="w-9 h-9 text-[#2D5016]" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Pesanan Berhasil!</h2>
        <p className="text-white/70 text-sm mt-1">Pesananmu sedang diproses</p>
        <p className="text-white/50 text-sm mt-1 font-mono">#{order.orderNumber}</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Order Detail Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">
            Detail Pesanan
          </p>
          <div className="space-y-2.5 text-sm">
            {[
              { label: "Nomor Pesanan", value: <span className="font-bold">{order.orderNumber}</span> },
              {
                label: "Tanggal",
                value: <span className="font-medium">{formatDate(order.createdAt)}</span>,
              },
              {
                label: "Metode Kirim",
                value: <span className="font-medium">{DELIVERY_LABEL[order.orderType]}</span>,
              },
              {
                label: "Pembayaran",
                value: <span className="font-medium">{PAYMENT_LABEL[order.paymentMethod]}</span>,
              },
              {
                label: "Status",
                value: (
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      status.color
                    )}
                  >
                    {status.icon} {status.label}
                  </span>
                ),
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center gap-4">
                <span className="text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                  {label}
                </span>
                <span className="text-neutral-900 dark:text-white text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">
            Item Pesanan
          </p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.productImage}</span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {item.productName} ×{item.quantity}
                  </span>
                </div>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-sm">
            <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Ongkos Kirim</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
              <span>Biaya Layanan</span>
              <span>{formatPrice(order.serviceFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-neutral-900 dark:text-white pt-1 border-t border-neutral-100 dark:border-neutral-800">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 px-4 py-4 space-y-3 z-40">
        <Link
          href={`/status/${order.id}`}
          className="w-full bg-[#2D5016] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#2D5016]/90 active:scale-95 transition-all"
        >
          Lacak Pesanan →
        </Link>
        <Link
          href="/"
          className="w-full text-center text-sm text-neutral-500 dark:text-neutral-400 font-medium py-1"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
