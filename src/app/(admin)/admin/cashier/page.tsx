"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  ShoppingCart,
  X,
  Trash2,
  Utensils,
} from "lucide-react";
import { createOrder, fetchOrders, updateOrder } from "@/lib/order-api";
import { fetchMenu } from "@/lib/menu-api";
import { formatPrice } from "@/lib/mock-data";
import { useSettingsStore } from "@/store/settings-store";
import { Order, OrderStatus, OrderType, PaymentMethod, Product } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CashierItem = {
  product: Product;
  quantity: number;
  notes?: string;
};

const ORDER_TYPE_OPTIONS: { value: OrderType; label: string }[] = [
  { value: "DINE_IN", label: "Makan di Tempat" },
  { value: "TAKEAWAY", label: "Takeaway" },
  { value: "ONLINE", label: "Online" },
];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "QRIS", label: "QRIS", icon: QrCode },
  { value: "TRANSFER_BANK", label: "Transfer", icon: CreditCard },
];

const ACTIVE_ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "DELIVERING"];

function isSoldOut(product: Product) {
  return !product.isAvailable || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
}

export default function AdminCashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CashierItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const [customerName, setCustomerName] = useState("Pelanggan Kasir");
  const [customerPhone, setCustomerPhone] = useState("0000000000");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [payNow, setPayNow] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { settings, loadSettings } = useSettingsStore();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [menuResult, orderResult] = await Promise.all([fetchMenu(), fetchOrders()]);
      setProducts(menuResult.products);
      setOrders(orderResult.orders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat data kasir.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!settings) void loadSettings();
    void Promise.resolve().then(loadData);
  }, [loadData, loadSettings, settings]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) => {
      if (product.category) map.set(product.category.id, product.category.name);
    });
    return [{ id: "ALL", name: "Semua" }, ...Array.from(map, ([id, name]) => ({ id, name }))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase();
    return products.filter((product) => {
      const matchesCategory = categoryId === "ALL" || product.categoryId === categoryId;
      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        (product.category?.name ?? "").toLowerCase().includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [categoryId, products, search]);

  const activeOrders = useMemo(
    () => orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status)).slice(0, 12),
    [orders]
  );

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const serviceFee = settings?.serviceFee ?? 0;
  const total = subtotal + serviceFee;

  const addItem = (product: Product) => {
    if (isSoldOut(product)) {
      toast.error(`${product.name} sedang habis.`);
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, nextQuantity: number) => {
    setCart((current) =>
      nextQuantity <= 0
        ? current.filter((item) => item.product.id !== productId)
        : current.map((item) =>
            item.product.id === productId ? { ...item, quantity: nextQuantity } : item
          )
    );
  };

  const resetTransaction = () => {
    setCart([]);
    setCustomerName("Pelanggan Kasir");
    setCustomerPhone("0000000000");
    setTableNumber("");
    setOrderType("DINE_IN");
    setPaymentMethod("CASH");
    setPayNow(true);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Keranjang kasir masih kosong.");
      return;
    }
    if (orderType === "DINE_IN" && !tableNumber.trim()) {
      toast.error("Nomor meja wajib diisi untuk makan di tempat.");
      return;
    }

    setSaving(true);
    try {
      const result = await createOrder({
        customerName: customerName.trim() || "Pelanggan Kasir",
        customerPhone: customerPhone.replace(/\D/g, "") || "0000000000",
        tableNumber: orderType === "DINE_IN" ? tableNumber.trim() : undefined,
        orderType,
        paymentMethod,
        shippingFee: 0,
        serviceFee,
        notes: "Dibuat dari kasir POS",
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.imageUrl,
          quantity: item.quantity,
          price: item.product.price,
          notes: item.notes,
        })),
      });

      let nextOrder = result.order;
      if (payNow) {
        const paid = await updateOrder(result.order.id, {
          paymentStatus: "PAID",
          status: orderType === "DINE_IN" ? "CONFIRMED" : "DELIVERED",
        });
        nextOrder = paid.order;
      }

      setOrders((current) => [nextOrder, ...current.filter((order) => order.id !== nextOrder.id)]);
      resetTransaction();
      setIsCartOpen(false);
      toast.success(payNow ? "Transaksi kasir selesai dan dibayar." : "Pesanan berhasil dibuat.");
      void loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memproses transaksi.");
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (order: Order) => {
    try {
      const result = await updateOrder(order.id, {
        paymentStatus: "PAID",
        status: order.status === "PENDING" ? "CONFIRMED" : order.status,
      });
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? result.order : item))
      );
      toast.success("Pembayaran pesanan diterima.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menerima pembayaran.");
    }
  };

  return (
    <div className="grid h-[calc(100vh-6rem)] min-h-0 gap-4 lg:grid-cols-[1fr_380px] pb-[4.5rem] lg:pb-0">
      <div className={cn("flex min-h-0 flex-col gap-4", orderType === "ONLINE" ? "hidden lg:flex" : "")}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kasir POS</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Transaksi offline, pesanan meja, dan pembayaran pelanggan.
            </p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari menu..."
              className="w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#2D5016]/30 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setCategoryId(category.id)}
              className={cn(
                "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                categoryId === category.id
                  ? "bg-[#2D5016] text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
          {loading ? (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memuat menu...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const soldOut = isSoldOut(product);
                return (
                  <button
                    key={product.id}
                    onClick={() => addItem(product)}
                    disabled={soldOut}
                    className={cn(
                      "min-w-0 rounded-xl border p-3 text-left transition-all",
                      soldOut
                        ? "cursor-not-allowed border-neutral-200 bg-neutral-100 opacity-70 dark:border-neutral-800 dark:bg-neutral-900"
                        : "border-neutral-200 bg-white hover:border-[#2D5016] hover:shadow-sm active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-950"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-bold text-neutral-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">{product.category?.name}</p>
                      </div>
                      <Plus className="h-4 w-4 flex-shrink-0 text-[#2D5016]" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-extrabold text-[#2D5016]">{formatPrice(product.price)}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", soldOut ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")}>
                        {soldOut ? "Habis" : `Stok ${product.stockQuantity ?? "-"}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <section className="max-h-56 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-neutral-900 dark:text-white">Pesanan Aktif</p>
            <button onClick={() => void loadData()} className="text-xs font-semibold text-[#2D5016]">Refresh</button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {activeOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white">{order.orderNumber}</p>
                    <p className="text-xs text-neutral-500">
                      {order.orderType === "DINE_IN" ? `Meja ${order.tableNumber ?? "-"}` : order.orderType} - {order.customerName}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    {order.paymentStatus === "PAID" ? "Lunas" : "Belum Bayar"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-bold text-[#2D5016]">{formatPrice(order.totalAmount)}</p>
                  {order.paymentStatus !== "PAID" && (
                    <button onClick={() => void markPaid(order)} className="rounded-lg bg-[#2D5016] px-3 py-1.5 text-xs font-bold text-white">
                      Terima Bayar
                    </button>
                  )}
                </div>
              </div>
            ))}
            {activeOrders.length === 0 && (
              <p className="py-4 text-center text-sm text-neutral-400 md:col-span-2">Belum ada pesanan aktif.</p>
            )}
          </div>
        </section>
      </div>

      <aside
        className={cn(
          "flex min-h-0 flex-col bg-white dark:bg-neutral-950",
          "lg:relative lg:flex lg:rounded-2xl lg:border lg:border-neutral-200 lg:dark:border-neutral-800",
          orderType === "ONLINE"
            ? "flex rounded-2xl border border-neutral-200 dark:border-neutral-800"
            : isCartOpen
              ? "fixed inset-0 z-[60] m-0 border-none rounded-none"
              : "hidden lg:flex"
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#2D5016]" />
            <p className="font-bold text-neutral-900 dark:text-white">Transaksi Baru</p>
          </div>
          {orderType !== "ONLINE" && (
            <button className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:hidden dark:hover:bg-neutral-800 dark:hover:text-neutral-300" onClick={() => setIsCartOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-2">
            {ORDER_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setOrderType(option.value)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-xs font-bold transition-colors",
                  orderType === option.value
                    ? "border-[#2D5016] bg-[#2D5016]/10 text-[#2D5016]"
                    : "border-neutral-200 text-neutral-500 dark:border-neutral-800"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="Nama pelanggan"
            />
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className="rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="No. HP pelanggan"
            />
            {orderType === "DINE_IN" && (
              <input
                value={tableNumber}
                onChange={(event) => setTableNumber(event.target.value)}
                className="rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                placeholder="Nomor meja"
              />
            )}
          </div>

          <div className="mt-4 space-y-2">
            {cart.map((item) => (
              <div key={item.product.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-bold text-neutral-900 dark:text-white">{item.product.name}</p>
                    <p className="text-xs text-neutral-500">{formatPrice(item.product.price)}</p>
                  </div>
                  <button onClick={() => updateQuantity(item.product.id, 0)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2D5016] text-white">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-[#2D5016]">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-400 dark:border-neutral-700">
                <Utensils className="mx-auto mb-2 h-6 w-6" />
                Pilih menu untuk mulai transaksi.
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-100 p-4 dark:border-neutral-800">
          <div className="mb-3 grid grid-cols-3 gap-2">
            {PAYMENT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setPaymentMethod(option.value)}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-bold",
                    paymentMethod === option.value
                      ? "border-[#2D5016] bg-[#2D5016]/10 text-[#2D5016]"
                      : "border-neutral-200 text-neutral-500 dark:border-neutral-800"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <label className="mb-3 flex items-center justify-between rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Langsung lunas</span>
            <input type="checkbox" checked={payNow} onChange={(event) => setPayNow(event.target.checked)} className="h-5 w-5 accent-[#2D5016]" />
          </label>

          <div className="space-y-1 border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Biaya layanan</span>
              <span>{formatPrice(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-neutral-900 dark:text-white">
              <span>Total</span>
              <span className="text-[#2D5016]">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <button
              onClick={handleCheckout}
              disabled={saving || cart.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5016] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#2D5016]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Proses
            </button>
            <button
              onClick={resetTransaction}
              className="flex h-full items-center justify-center rounded-xl border border-neutral-200 px-3 text-neutral-500 dark:border-neutral-800"
              title="Reset transaksi"
            >
              <ReceiptText className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Order Type Toggle Mobile (When ONLINE) */}
      {orderType === "ONLINE" && (
        <div className="fixed bottom-[4.5rem] left-4 right-4 z-40 lg:hidden">
          <button
            onClick={() => setOrderType("DINE_IN")}
            className="flex w-full items-center justify-center rounded-xl bg-neutral-900 p-4 font-bold text-white shadow-lg shadow-neutral-900/20 transition-all hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            Kembali ke Menu Kasir
          </button>
        </div>
      )}

      {/* Floating Button Mobile (Cart) */}
      {!isCartOpen && cart.length > 0 && orderType !== "ONLINE" && (
        <div className="fixed bottom-[4.5rem] left-4 right-4 z-40 lg:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-[#2D5016] p-4 font-bold text-white shadow-lg shadow-[#2D5016]/20 transition-all hover:bg-[#2D5016]/90"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} item</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>Lanjut Pembayaran</span>
              <span>•</span>
              <span>{formatPrice(total)}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
