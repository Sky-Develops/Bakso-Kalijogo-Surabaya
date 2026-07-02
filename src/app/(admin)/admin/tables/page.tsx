"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  LayoutGrid,
  Loader2,
  Plus,
  Printer,
  QrCode,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createTable,
  deleteTable,
  fetchTables,
  regenerateTableQr,
  updateTable,
} from "@/lib/table-api";
import { formatPrice } from "@/lib/mock-data";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { DiningTable, TableStatus } from "@/types";
import { toast } from "sonner";

type TableStatusFilter = "ALL" | TableStatus;
type TableFormState = {
  number: string;
  capacity: string;
  status: TableStatus;
};

const EMPTY_FORM: TableFormState = {
  number: "",
  capacity: "4",
  status: "AVAILABLE",
};

const STATUS_TABS: { id: TableStatusFilter; label: string }[] = [
  { id: "ALL", label: "Semua" },
  { id: "AVAILABLE", label: "Tersedia" },
  { id: "OCCUPIED", label: "Terisi" },
  { id: "RESERVED", label: "Reservasi" },
];

const STATUS_LABEL: Record<TableStatus, string> = {
  AVAILABLE: "Tersedia",
  OCCUPIED: "Terisi",
  RESERVED: "Reservasi",
};

const STATUS_STYLE: Record<TableStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  OCCUPIED: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  RESERVED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
};

function qrImageUrl(url?: string | null) {
  if (!url) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${encodeURIComponent(
    url
  )}`;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TableStatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [form, setForm] = useState<TableFormState>(EMPTY_FORM);
  const [qrPreview, setQrPreview] = useState<DiningTable | null>(null);

  const loadTables = useCallback(async () => {
    try {
      const result = await fetchTables();
      setTables(result.tables);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat meja.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTables();
  }, [loadTables]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-tables")
      .on("postgres_changes", { event: "*", schema: "public", table: "dining_tables" }, () =>
        void loadTables()
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "qr_sessions" }, () =>
        void loadTables()
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () =>
        void loadTables()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadTables]);

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchStatus = filter === "ALL" || table.status === filter;
      const matchSearch = table.number.toString().includes(search.trim());
      return matchStatus && matchSearch;
    });
  }, [filter, search, tables]);

  const openCreateForm = () => {
    const maxNumber = tables.reduce((max, table) => Math.max(max, table.number), 0);
    setEditingTable(null);
    setForm({ ...EMPTY_FORM, number: (maxNumber + 1).toString() });
    setFormOpen(true);
  };

  const openEditForm = (table: DiningTable) => {
    setEditingTable(table);
    setForm({
      number: table.number.toString(),
      capacity: table.capacity.toString(),
      status: table.status,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        number: Number(form.number),
        capacity: Number(form.capacity),
        status: form.status,
      };
      let result = editingTable
        ? await updateTable(editingTable.id, payload)
        : await createTable(payload);

      if (editingTable && editingTable.number !== payload.number) {
        result = await regenerateTableQr(editingTable.id);
      }

      setTables((current) => {
        if (editingTable) {
          return current.map((table) =>
            table.id === editingTable.id ? result.table : table
          );
        }

        return [...current, result.table].sort((a, b) => a.number - b.number);
      });
      toast.success(editingTable ? "Meja berhasil diperbarui." : "Meja berhasil ditambahkan.");
      setFormOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan meja.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (table: DiningTable, status: TableStatus) => {
    try {
      const result = await updateTable(table.id, { status });
      setTables((current) =>
        current.map((item) => (item.id === table.id ? result.table : item))
      );
      toast.success(`Status meja ${table.number} diperbarui.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah status meja.");
    }
  };

  const handleDelete = async (table: DiningTable) => {
    const ok = window.confirm(`Hapus Meja ${table.number}?`);
    if (!ok) return;

    try {
      await deleteTable(table.id);
      setTables((current) => current.filter((item) => item.id !== table.id));
      toast.success("Meja berhasil dihapus.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus meja.");
    }
  };

  const handleRegenerateQr = async (table: DiningTable) => {
    try {
      const result = await regenerateTableQr(table.id);
      setTables((current) =>
        current.map((item) => (item.id === table.id ? result.table : item))
      );
      setQrPreview(result.table);
      toast.success(`QR Meja ${table.number} dibuat ulang.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat QR meja.");
    }
  };

  const copyQrUrl = (table: DiningTable) => {
    if (!table.qrCodeUrl) {
      toast.error("QR belum dibuat untuk meja ini.");
      return;
    }

    navigator.clipboard.writeText(table.qrCodeUrl).catch(() => {});
    toast.success("Link QR disalin.");
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-5 overflow-x-hidden">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Meja</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            Kelola meja, status dine-in, dan QR session Supabase.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Printer className="h-5 w-5" />
            Cetak QR
          </button>
          <button
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5016] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#2D5016]/90"
          >
            <Plus className="h-5 w-5" />
            Tambah Meja
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nomor meja..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#2D5016]/50 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                filter === tab.id
                  ? "bg-[#2D5016] text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#2D5016]" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-2">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-[#2D5016]/50 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div
                className={cn(
                  "flex items-center justify-between border-b border-neutral-100 p-3 dark:border-neutral-800",
                  table.status === "AVAILABLE"
                    ? "bg-emerald-50 dark:bg-emerald-900/10"
                    : table.status === "OCCUPIED"
                    ? "bg-amber-50 dark:bg-amber-900/10"
                    : "bg-blue-50 dark:bg-blue-900/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-[#2D5016]" />
                  <span className="font-bold text-neutral-900 dark:text-white">
                    Meja {table.number}
                  </span>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", STATUS_STYLE[table.status])}>
                  {STATUS_LABEL[table.status]}
                </span>
              </div>

              <div className="grid gap-4 p-4">
                <div className="grid grid-cols-[120px_1fr] gap-4">
                  <button
                    onClick={() => setQrPreview(table)}
                    className="rounded-xl border border-neutral-100 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    {table.qrCodeUrl ? (
                      <Image
                        src={qrImageUrl(table.qrCodeUrl)}
                        alt={`QR Meja ${table.number}`}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-lg bg-white"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-white text-neutral-300 dark:bg-neutral-950">
                        <QrCode className="h-10 w-10" />
                      </div>
                    )}
                  </button>

                  <div className="min-w-0 text-sm">
                    <p className="text-neutral-500">Kapasitas</p>
                    <p className="font-bold text-neutral-900 dark:text-white">
                      {table.capacity} orang
                    </p>
                    <p className="mt-3 text-neutral-500">QR Session</p>
                    <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                      {table.activeQrSession ? "Aktif" : "Belum aktif"}
                    </p>
                    {table.currentOrder && (
                      <div className="mt-3 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900">
                        <p className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Clock className="h-3.5 w-3.5" />
                          {table.currentOrder.orderNumber}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatPrice(table.currentOrder.totalAmount)}
                        </p>
                      </div>
                    )}
                    {!table.currentOrder && table.status === "AVAILABLE" && (
                      <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Siap digunakan
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 print:hidden">
                  <button
                    onClick={() => void handleRegenerateQr(table)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-neutral-200 py-2 text-xs font-bold dark:border-neutral-700"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    QR
                  </button>
                  <button
                    onClick={() => copyQrUrl(table)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-neutral-200 py-2 text-xs font-bold dark:border-neutral-700"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                  <button
                    onClick={() => openEditForm(table)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-neutral-200 py-2 text-xs font-bold dark:border-neutral-700"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 print:hidden">
                  {(["AVAILABLE", "OCCUPIED", "RESERVED"] as TableStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => void handleStatusChange(table, status)}
                      className={cn(
                        "rounded-lg px-2 py-2 text-[11px] font-bold",
                        table.status === status
                          ? "bg-[#2D5016] text-white"
                          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-900"
                      )}
                    >
                      {STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>

                <div className="hidden print:block">
                  <p className="break-all text-xs text-neutral-500">{table.qrCodeUrl}</p>
                </div>

                <div className="flex justify-between gap-2 print:hidden">
                  {table.qrCodeUrl ? (
                    <Link
                      href={table.qrCodeUrl}
                      target="_blank"
                      className="flex items-center gap-1 text-xs font-bold text-[#2D5016]"
                    >
                      Buka QR <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span className="text-xs text-neutral-400">QR belum dibuat</span>
                  )}
                  <button
                    onClick={() => void handleDelete(table)}
                    className="flex items-center gap-1 text-xs font-bold text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredTables.length === 0 && (
            <div className="col-span-full py-16 text-center text-neutral-500">
              Tidak ada meja yang ditemukan.
            </div>
          )}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 print:hidden">
          <div className="mx-auto my-10 max-w-xl rounded-xl bg-white shadow-xl dark:bg-neutral-950">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingTable ? "Edit Meja" : "Tambah Meja"}
                </h2>
                <p className="text-sm text-neutral-500">
                  Meja baru otomatis dibuatkan QR session.
                </p>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold">
                  Nomor Meja
                  <input
                    value={form.number}
                    onChange={(event) => setForm({ ...form, number: event.target.value })}
                    type="number"
                    min="1"
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[#2D5016]/30 dark:border-neutral-700 dark:bg-neutral-900"
                    required
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold">
                  Kapasitas
                  <input
                    value={form.capacity}
                    onChange={(event) => setForm({ ...form, capacity: event.target.value })}
                    type="number"
                    min="1"
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[#2D5016]/30 dark:border-neutral-700 dark:bg-neutral-900"
                    required
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-sm font-semibold">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as TableStatus })
                  }
                  className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[#2D5016]/30 dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <option value="AVAILABLE">Tersedia</option>
                  <option value="OCCUPIED">Terisi</option>
                  <option value="RESERVED">Reservasi</option>
                </select>
              </label>

              <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold dark:border-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5016] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Meja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 print:hidden">
          <div className="mx-auto my-10 max-w-sm rounded-xl bg-white p-5 text-center shadow-xl dark:bg-neutral-950">
            <div className="flex items-center justify-between text-left">
              <div>
                <h2 className="text-lg font-bold">QR Meja {qrPreview.number}</h2>
                <p className="text-sm text-neutral-500">Scan untuk membuka menu meja.</p>
              </div>
              <button
                onClick={() => setQrPreview(null)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex justify-center rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
              {qrPreview.qrCodeUrl ? (
                <Image
                  src={qrImageUrl(qrPreview.qrCodeUrl)}
                  alt={`QR Meja ${qrPreview.number}`}
                  width={192}
                  height={192}
                  className="h-48 w-48 rounded-lg bg-white"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-white text-neutral-300 dark:bg-neutral-950">
                  <QrCode className="h-16 w-16" />
                </div>
              )}
            </div>
            <p className="mt-3 break-all text-xs text-neutral-500">
              {qrPreview.qrCodeUrl ?? "QR belum dibuat."}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => copyQrUrl(qrPreview)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold dark:border-neutral-700"
              >
                Salin Link
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-xl bg-[#2D5016] px-4 py-2 text-sm font-bold text-white"
              >
                Cetak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
