import { Order } from "@/types";

export type CreateBookingInput = {
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  pax: number;
  notes?: string;
};

export async function createBooking(payload: CreateBookingInput) {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Gagal membuat booking");
  return data as { booking: Order };
}

export async function fetchBooking(id: string) {
  const response = await fetch(`/api/bookings/${id}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Gagal memuat booking");
  return data as { booking: Order };
}
