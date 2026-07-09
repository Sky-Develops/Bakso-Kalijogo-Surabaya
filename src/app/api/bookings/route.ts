import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const bookingSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  bookingDate: z.string(),
  pax: z.number().int().min(1),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Data booking tidak valid." }, { status: 400 });
  }

  const payload = parsed.data;
  const orderNumber = `BKG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const notes = `BOOKING: ${payload.bookingDate} | Pax: ${payload.pax}${payload.notes ? ` | Catatan: ${payload.notes}` : ''}`;

  const { data, error } = await supabase.from("orders").insert({
    order_number: orderNumber,
    status: "PENDING",
    order_type: "DINE_IN",
    customer_name: payload.customerName,
    customer_phone: payload.customerPhone,
    notes: notes,
    total_amount: 0,
    subtotal: 0,
    shipping_fee: 0,
    service_fee: 0
  }).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ booking: data }, { status: 201 });
}
