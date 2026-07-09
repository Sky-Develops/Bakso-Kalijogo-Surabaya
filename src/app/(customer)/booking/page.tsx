"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/lib/booking-api";
import { toast } from "sonner";
import { Calendar, Users, Phone, User, Loader2 } from "lucide-react";

export default function BookingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    bookingDate: "",
    pax: "2",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBooking({
        ...form,
        pax: Number(form.pax)
      });
      toast.success("Reservasi berhasil dibuat!");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat reservasi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 py-8">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
        <h1 className="text-2xl font-bold text-center mb-2">Reservasi Meja</h1>
        <p className="text-neutral-500 text-center text-sm mb-6">Pesan tempat untuk makan di tempat</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold mb-1 block">Nama Lengkap</span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Budi Santoso" />
            </div>
          </label>
          
          <label className="block">
            <span className="text-sm font-semibold mb-1 block">Nomor HP/WhatsApp</span>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input required type="tel" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="08123456789" />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold mb-1 block">Tanggal & Waktu</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input required type="datetime-local" value={form.bookingDate} onChange={e => setForm({...form, bookingDate: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold mb-1 block">Jumlah Orang</span>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input required type="number" min="1" value={form.pax} onChange={e => setForm({...form, pax: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold mb-1 block">Catatan Tambahan (Opsional)</span>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary/50 outline-none resize-none" rows={3} placeholder="Permintaan khusus..." />
          </label>
          
          <button type="submit" disabled={submitting} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors hover:bg-primary/90">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buat Reservasi"}
          </button>
        </form>
      </div>
    </div>
  );
}
