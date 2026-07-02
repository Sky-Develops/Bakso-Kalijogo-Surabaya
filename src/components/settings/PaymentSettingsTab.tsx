import { CreditCard, QrCode, Save, Wallet } from "lucide-react";
import { useState } from "react";
import { StoreSettings } from "@/types";

const BANK_OPTIONS = ["BCA", "BRI", "BNI", "Mandiri", "BSI", "CIMB Niaga", "Permata", "Danamon"];

type PaymentSettingsTabProps = {
  settings: StoreSettings | null;
  onSave: (payload: Partial<StoreSettings>) => void;
  isLoading: boolean;
};

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50">
      <div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>
        <p className="text-xs text-neutral-500">{desc}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#2D5016]"
      />
    </label>
  );
}

export function PaymentSettingsTab({ settings, onSave, isLoading }: PaymentSettingsTabProps) {
  const payment = settings?.paymentConfig;
  const [formData, setFormData] = useState({
    cashEnabled: payment?.cashEnabled ?? true,
    transferEnabled: payment?.transferEnabled ?? true,
    qrisEnabled: payment?.qrisEnabled ?? true,
    bankName: payment?.bankName || "BCA",
    bankAccountNumber: payment?.bankAccountNumber || "",
    bankAccountHolder: payment?.bankAccountHolder || settings?.restaurantName || "Bakso Kalijogo",
    qrisImageUrl: payment?.qrisImageUrl || "",
  });

  const updateField = (name: keyof typeof formData, value: string | boolean) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleQrisUpload = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateField("qrisImageUrl", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({ paymentConfig: formData });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
            <Wallet className="h-5 w-5" /> Pengaturan Pembayaran
          </h2>
          <p className="text-sm text-neutral-500">Aktifkan metode pembayaran yang tersedia untuk pelanggan.</p>
        </div>

        <div className="mt-6 space-y-3">
          <ToggleRow
            title="Cash"
            desc="Pelanggan dapat membayar tunai saat pesanan diterima atau diambil."
            checked={formData.cashEnabled}
            onChange={(checked) => updateField("cashEnabled", checked)}
          />
          <ToggleRow
            title="Transfer Bank"
            desc="Tampilkan nomor rekening dan nominal total otomatis di checkout."
            checked={formData.transferEnabled}
            onChange={(checked) => updateField("transferEnabled", checked)}
          />
          <ToggleRow
            title="QRIS"
            desc="Tampilkan gambar QRIS untuk pembayaran digital."
            checked={formData.qrisEnabled}
            onChange={(checked) => updateField("qrisEnabled", checked)}
          />
        </div>

        {formData.transferEnabled && (
          <div className="mt-6 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#2D5016]" />
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Transfer Bank</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Bank</label>
                <select
                  value={formData.bankName}
                  onChange={(event) => updateField("bankName", event.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                >
                  {BANK_OPTIONS.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Nomor Rekening</label>
                <input
                  value={formData.bankAccountNumber}
                  onChange={(event) => updateField("bankAccountNumber", event.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  placeholder="Contoh: 1234567890"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Nama Pemilik Rekening</label>
                <input
                  value={formData.bankAccountHolder}
                  onChange={(event) => updateField("bankAccountHolder", event.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  placeholder="Nama pemilik rekening"
                />
              </div>
            </div>
          </div>
        )}

        {formData.qrisEnabled && (
          <div className="mt-6 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="mb-4 flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[#2D5016]" />
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">QRIS</p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                {formData.qrisImageUrl ? (
                  <img src={formData.qrisImageUrl} alt="QRIS" className="h-full w-full object-contain" />
                ) : (
                  <QrCode className="h-8 w-8 text-neutral-400" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">URL Gambar QRIS</label>
                <input
                  type="url"
                  value={formData.qrisImageUrl}
                  onChange={(event) => updateField("qrisImageUrl", event.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  placeholder="https://.../qris.jpg"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleQrisUpload(event.target.files?.[0])}
                  className="w-full text-xs text-neutral-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#2D5016] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                />
                <p className="text-xs text-neutral-500">Gunakan link gambar PNG, JPG, JPEG, atau format gambar lain yang bisa dibuka browser.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5016] px-8 py-3 font-bold text-white transition-all hover:bg-[#2D5016]/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save className="h-5 w-5" />
            {isLoading ? "Menyimpan..." : "Simpan Pembayaran"}
          </button>
        </div>
      </div>
    </div>
  );
}
