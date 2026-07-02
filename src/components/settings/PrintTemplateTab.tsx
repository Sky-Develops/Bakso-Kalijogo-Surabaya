"use client";

import { useState } from "react";
import { Save, Printer, Eye } from "lucide-react";
import { StoreSettings, PrintTemplate } from "@/types";

const DEFAULT_TEMPLATE: PrintTemplate = {
  header: "BAKSO KALIJOGO\nJl. Kalijogo No.12, Surabaya\nWA: 0812-3456-7890",
  subHeader: "=== STRUK PEMBELIAN ===",
  showLogo: true,
  showOrderNumber: true,
  showDate: true,
  showCashier: true,
  showCustomer: true,
  showTableNumber: true,
  showItemNotes: true,
  showSubtotal: true,
  showServiceFee: true,
  showShippingFee: true,
  dividerChar: "-",
  footer: "Terima kasih sudah berkunjung!\nSampai jumpa kembali :)",
  paperSize: "58mm",
};

// Sample data for the live preview
const SAMPLE_ORDER = {
  orderNumber: "BK-240102-001",
  date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  cashier: "Admin Kalijogo",
  customer: "Budi Santoso",
  tableNumber: "5",
  orderType: "DINE_IN",
  items: [
    { name: "Bakso Spesial", qty: 2, price: 18000 },
    { name: "Mie Ayam Spesial", qty: 1, price: 18000 },
    { name: "Es Teh Manis", qty: 2, price: 5000 },
  ],
  subtotal: 64000,
  serviceFee: 1000,
  shippingFee: 0,
  total: 65000,
  paymentMethod: "QRIS",
};

function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function ReceiptPreview({ template }: { template: PrintTemplate }) {
  const paperWidth = template.paperSize === "80mm" ? 320 : 220;
  const charWidth = template.paperSize === "80mm" ? 42 : 28;
  const divider = template.dividerChar.repeat(charWidth);

  return (
    <div
      className="bg-white shadow-2xl mx-auto rounded-sm font-mono text-[11px] leading-tight overflow-hidden"
      style={{ width: paperWidth, minHeight: 400 }}
    >
      {/* Paper top tear */}
      <div className="h-2 bg-neutral-100 border-b border-dashed border-neutral-300" />

      <div className="px-3 py-4 space-y-0.5 text-neutral-900">
        {/* HEADER */}
        {template.showLogo && template.header && (
          <div className="text-center mb-1">
            {template.header.split("\n").map((line, i) => (
              <p key={i} className={i === 0 ? "font-bold text-[13px] tracking-wide" : "text-[10px] text-neutral-600"}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* SUB-HEADER */}
        {template.subHeader && (
          <p className="text-center text-[10px] font-semibold tracking-widest text-neutral-500 my-1">
            {template.subHeader}
          </p>
        )}

        {/* DIVIDER */}
        <p className="text-[9px] text-neutral-400 tracking-tighter overflow-hidden whitespace-nowrap">{divider}</p>

        {/* ORDER INFO */}
        <div className="space-y-0.5 py-1 text-[10px]">
          {template.showOrderNumber && (
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">No. Order</span>
              <span className="font-bold">{SAMPLE_ORDER.orderNumber}</span>
            </div>
          )}
          {template.showDate && (
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Tanggal</span>
              <span>{SAMPLE_ORDER.date}</span>
            </div>
          )}
          {template.showCashier && (
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Kasir</span>
              <span>{SAMPLE_ORDER.cashier}</span>
            </div>
          )}
          {template.showCustomer && (
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Pelanggan</span>
              <span>{SAMPLE_ORDER.customer}</span>
            </div>
          )}
          {template.showTableNumber && (
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Meja</span>
              <span>Meja {SAMPLE_ORDER.tableNumber}</span>
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <p className="text-[9px] text-neutral-400 tracking-tighter overflow-hidden whitespace-nowrap">{divider}</p>

        {/* ITEMS */}
        <div className="space-y-1.5 py-1">
          {SAMPLE_ORDER.items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between gap-2 text-[10px]">
                <span className="font-semibold flex-1 truncate">{item.name}</span>
                <span className="text-right shrink-0">{formatRp(item.price * item.qty)}</span>
              </div>
              <div className="flex gap-2 text-[9px] text-neutral-500 pl-1">
                <span>{item.qty} x {formatRp(item.price)}</span>
              </div>
              {template.showItemNotes && i === 0 && (
                <p className="text-[9px] text-neutral-400 pl-1 italic">Catatan: Kuah terpisah</p>
              )}
            </div>
          ))}
        </div>

        {/* DIVIDER */}
        <p className="text-[9px] text-neutral-400 tracking-tighter overflow-hidden whitespace-nowrap">{divider}</p>

        {/* TOTAL SECTION */}
        <div className="space-y-0.5 py-1 text-[10px]">
          {template.showSubtotal && (
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Subtotal</span>
              <span>{formatRp(SAMPLE_ORDER.subtotal)}</span>
            </div>
          )}
          {template.showServiceFee && (
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Biaya Layanan</span>
              <span>{formatRp(SAMPLE_ORDER.serviceFee)}</span>
            </div>
          )}
          {template.showShippingFee && SAMPLE_ORDER.shippingFee > 0 && (
            <div className="flex justify-between gap-2">
              <span className="text-neutral-500">Ongkos Kirim</span>
              <span>{formatRp(SAMPLE_ORDER.shippingFee)}</span>
            </div>
          )}
          <div className="flex justify-between gap-2 font-bold text-[12px] pt-1 border-t border-dashed border-neutral-400">
            <span>TOTAL</span>
            <span>{formatRp(SAMPLE_ORDER.total)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[10px] text-neutral-500">
            <span>Pembayaran</span>
            <span>{SAMPLE_ORDER.paymentMethod}</span>
          </div>
        </div>

        {/* DIVIDER */}
        <p className="text-[9px] text-neutral-400 tracking-tighter overflow-hidden whitespace-nowrap">{divider}</p>

        {/* FOOTER */}
        {template.footer && (
          <div className="text-center pt-1 pb-2">
            {template.footer.split("\n").map((line, i) => (
              <p key={i} className={i === 0 ? "font-semibold text-[10px]" : "text-[9px] text-neutral-500"}>
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Paper bottom tear */}
      <div className="h-2 bg-neutral-100 border-t border-dashed border-neutral-300" />
    </div>
  );
}

function Toggle({ label, desc, name, checked, onChange }: {
  label: string; desc?: string; name: string; checked: boolean;
  onChange: (name: string, val: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 cursor-pointer group">
      <div>
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-[#2D5016] transition-colors">{label}</p>
        {desc && <p className="text-xs text-neutral-500">{desc}</p>}
      </div>
      <div
        onClick={() => onChange(name, !checked)}
        className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${checked ? "bg-[#2D5016]" : "bg-neutral-300 dark:bg-neutral-600"}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </div>
    </label>
  );
}

export function PrintTemplateTab({ settings, onSave, isLoading }: {
  settings: StoreSettings | null;
  onSave: (p: Partial<StoreSettings>) => void;
  isLoading: boolean;
}) {
  const existing = settings?.printTemplate;
  const [template, setTemplate] = useState<PrintTemplate>({
    header: existing?.header ?? DEFAULT_TEMPLATE.header,
    subHeader: existing?.subHeader ?? DEFAULT_TEMPLATE.subHeader,
    showLogo: existing?.showLogo ?? DEFAULT_TEMPLATE.showLogo,
    showOrderNumber: existing?.showOrderNumber ?? DEFAULT_TEMPLATE.showOrderNumber,
    showDate: existing?.showDate ?? DEFAULT_TEMPLATE.showDate,
    showCashier: existing?.showCashier ?? DEFAULT_TEMPLATE.showCashier,
    showCustomer: existing?.showCustomer ?? DEFAULT_TEMPLATE.showCustomer,
    showTableNumber: existing?.showTableNumber ?? DEFAULT_TEMPLATE.showTableNumber,
    showItemNotes: existing?.showItemNotes ?? DEFAULT_TEMPLATE.showItemNotes,
    showSubtotal: existing?.showSubtotal ?? DEFAULT_TEMPLATE.showSubtotal,
    showServiceFee: existing?.showServiceFee ?? DEFAULT_TEMPLATE.showServiceFee,
    showShippingFee: existing?.showShippingFee ?? DEFAULT_TEMPLATE.showShippingFee,
    dividerChar: existing?.dividerChar ?? DEFAULT_TEMPLATE.dividerChar,
    footer: existing?.footer ?? DEFAULT_TEMPLATE.footer,
    paperSize: existing?.paperSize ?? DEFAULT_TEMPLATE.paperSize,
  });

  const handleText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: string, val: boolean) => {
    setTemplate(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = () => {
    onSave({ printTemplate: template });
  };

  const inputClass = "w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5016]/30 transition-all";

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Page header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Printer className="w-5 h-5" /> Template Struk
        </h2>
        <p className="text-sm text-neutral-500 mt-0.5">Edit setiap bagian struk dan lihat preview langsung di sebelah kanan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">

        {/* ── EDITOR COLUMN ── */}
        <div className="space-y-4">

          {/* Paper size */}
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
            <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">Ukuran Kertas</p>
            <div className="grid grid-cols-2 gap-3">
              {(["58mm", "80mm"] as const).map(size => (
                <button key={size} type="button"
                  onClick={() => setTemplate(p => ({ ...p, paperSize: size }))}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    template.paperSize === size
                      ? "border-[#2D5016] bg-[#2D5016]/5 text-[#2D5016]"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300"
                  }`}>
                  Thermal {size}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
              <span className="w-6 h-6 rounded-lg bg-[#2D5016]/10 text-[#2D5016] flex items-center justify-center text-xs font-bold">1</span>
              Header — Bagian Atas Struk
            </div>

            <div className="space-y-3">
              <Toggle label="Tampilkan Header" desc="Nama toko & info kontak di paling atas" name="showLogo" checked={template.showLogo} onChange={handleToggle} />

              {template.showLogo && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Teks Header</label>
                  <textarea name="header" value={template.header} onChange={handleText} rows={4}
                    className={inputClass + " font-mono resize-none"}
                    placeholder={"NAMA TOKO\nAlamat, Kota\nWA: 08xxxxxxxxxx"} />
                  <p className="text-xs text-neutral-400">Setiap baris baru (Enter) akan menjadi baris baru di struk. Baris pertama tampil lebih besar dan tebal.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Sub-Header / Judul Struk</label>
                <input name="subHeader" value={template.subHeader} onChange={handleText}
                  className={inputClass} placeholder="=== STRUK PEMBELIAN ===" />
                <p className="text-xs text-neutral-400">Judul kecil yang tampil di bawah header sebelum detail pesanan. Kosongkan jika tidak ingin ditampilkan.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Karakter Pembatas (Divider)</label>
                <div className="flex gap-2">
                  {["-", "=", "*", "~", "#"].map(c => (
                    <button key={c} type="button"
                      onClick={() => setTemplate(p => ({ ...p, dividerChar: c }))}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-mono font-bold transition-all ${
                        template.dividerChar === c
                          ? "border-[#2D5016] bg-[#2D5016]/5 text-[#2D5016]"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-500"
                      }`}>
                      {c}
                    </button>
                  ))}
                  <input name="dividerChar" value={template.dividerChar} onChange={handleText}
                    maxLength={1}
                    className={inputClass + " text-center font-mono font-bold flex-1"} />
                </div>
              </div>
            </div>
          </div>

          {/* Info Pesanan */}
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
              <span className="w-6 h-6 rounded-lg bg-[#2D5016]/10 text-[#2D5016] flex items-center justify-center text-xs font-bold">2</span>
              Informasi Pesanan — Bagian Tengah Atas
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              <Toggle label="Nomor Pesanan" name="showOrderNumber" checked={template.showOrderNumber} onChange={handleToggle} />
              <Toggle label="Tanggal & Waktu" name="showDate" checked={template.showDate} onChange={handleToggle} />
              <Toggle label="Nama Kasir" name="showCashier" checked={template.showCashier} onChange={handleToggle} />
              <Toggle label="Nama Pelanggan" name="showCustomer" checked={template.showCustomer} onChange={handleToggle} />
              <Toggle label="Nomor Meja" desc="Untuk pesanan makan di tempat" name="showTableNumber" checked={template.showTableNumber} onChange={handleToggle} />
            </div>
          </div>

          {/* Detail Item */}
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
              <span className="w-6 h-6 rounded-lg bg-[#2D5016]/10 text-[#2D5016] flex items-center justify-center text-xs font-bold">3</span>
              Detail Item — Isi Pesanan
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              <Toggle label="Catatan per Item" desc="Tampilkan catatan/request khusus tiap menu" name="showItemNotes" checked={template.showItemNotes} onChange={handleToggle} />
            </div>
          </div>

          {/* Ringkasan Harga */}
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
              <span className="w-6 h-6 rounded-lg bg-[#2D5016]/10 text-[#2D5016] flex items-center justify-center text-xs font-bold">4</span>
              Ringkasan Harga — Bagian Total
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              <Toggle label="Tampilkan Subtotal" name="showSubtotal" checked={template.showSubtotal} onChange={handleToggle} />
              <Toggle label="Tampilkan Biaya Layanan" name="showServiceFee" checked={template.showServiceFee} onChange={handleToggle} />
              <Toggle label="Tampilkan Ongkos Kirim" desc="Hanya tampil jika ada ongkir > 0" name="showShippingFee" checked={template.showShippingFee} onChange={handleToggle} />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
              <span className="w-6 h-6 rounded-lg bg-[#2D5016]/10 text-[#2D5016] flex items-center justify-center text-xs font-bold">5</span>
              Footer — Bagian Paling Bawah Struk
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Teks Footer</label>
              <textarea name="footer" value={template.footer} onChange={handleText} rows={4}
                className={inputClass + " font-mono resize-none"}
                placeholder={"Terima kasih sudah berkunjung!\nSampai jumpa kembali :)"} />
              <p className="text-xs text-neutral-400">Baris pertama tampil tebal, baris berikutnya lebih kecil dan redup. Cocok untuk ucapan, promo, atau info akun QRIS.</p>
            </div>
          </div>

          {/* Save Button (mobile) */}
          <div className="lg:hidden flex justify-end">
            <button onClick={handleSave} disabled={isLoading}
              className="flex items-center gap-2 bg-[#2D5016] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2D5016]/90 transition-all disabled:opacity-70">
              <Save className="w-5 h-5" />
              {isLoading ? "Menyimpan..." : "Simpan Template"}
            </button>
          </div>
        </div>

        {/* ── PREVIEW COLUMN ── */}
        <div className="lg:sticky lg:top-6 w-full lg:w-auto">
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-neutral-500" />
              <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Preview Struk</p>
              <span className="text-[10px] bg-[#2D5016]/10 text-[#2D5016] font-bold px-2 py-0.5 rounded-full ml-auto">
                {template.paperSize}
              </span>
            </div>

            <div className="overflow-x-auto">
              <ReceiptPreview template={template} />
            </div>

            <p className="text-center text-xs text-neutral-400 mt-3">
              Preview menggunakan data contoh
            </p>

            {/* Save Button (desktop) */}
            <button onClick={handleSave} disabled={isLoading}
              className="hidden lg:flex w-full mt-4 items-center justify-center gap-2 bg-[#2D5016] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2D5016]/90 transition-all disabled:opacity-70">
              <Save className="w-5 h-5" />
              {isLoading ? "Menyimpan..." : "Simpan Template"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
