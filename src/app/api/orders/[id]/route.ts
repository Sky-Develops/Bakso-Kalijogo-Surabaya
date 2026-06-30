import { NextResponse } from "next/server";
import { z } from "zod";
import { mapOrder, RawOrder } from "@/lib/order-mapper";
import { createClient } from "@/utils/supabase/server";

const ORDER_SELECT = `
  *,
  order_items (
    id,
    menu_item_id,
    product_name,
    product_image,
    quantity,
    price,
    notes,
    menu_items (
      image_url
    )
  )
`;

const updateOrderSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "PREPARING", "DELIVERING", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
  driverName: z.string().nullable().optional(),
  driverPhone: z.string().nullable().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ order: mapOrder(data as RawOrder) });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Login admin dibutuhkan untuk memperbarui pesanan." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = updateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Update pesanan tidak valid." },
      { status: 400 }
    );
  }

  const updates: Record<string, string | null> = {};

  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.paymentStatus) updates.payment_status = parsed.data.paymentStatus;
  if ("driverName" in parsed.data) updates.driver_name = parsed.data.driverName ?? null;
  if ("driverPhone" in parsed.data) updates.driver_phone = parsed.data.driverPhone ?? null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diperbarui." }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (parsed.data.paymentStatus) {
    await supabase
      .from("payments")
      .update({
        status: parsed.data.paymentStatus,
        paid_at: parsed.data.paymentStatus === "PAID" ? new Date().toISOString() : null,
      })
      .eq("order_id", id);
  }

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: mapOrder(data as RawOrder) });
}
