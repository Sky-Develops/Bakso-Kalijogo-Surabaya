import { NextResponse } from "next/server";
import { z } from "zod";
import { mapProduct, RawMenuItem } from "@/lib/menu-mapper";
import { createClient } from "@/utils/supabase/server";

const MENU_SELECT = `
  *,
  menu_categories (
    id,
    name,
    icon,
    sort_order
  )
`;

const menuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageAlt: z.string().optional(),
  badge: z.enum(["Terlaris", "Baru"]).nullable().optional(),
  rating: z.number().min(0).max(5).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isAvailable: z.boolean(),
  spiceLevel: z.string().optional(),
  toppings: z.array(z.string()).optional(),
  servingTime: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const { supabase, user } = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { error: "Login admin dibutuhkan untuk mengubah menu." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = menuItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data menu tidak valid." },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const stockQuantity = payload.stockQuantity ?? 0;
  const { data, error } = await supabase
    .from("menu_items")
    .update({
      category_id: payload.categoryId,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      image_url: payload.imageUrl || null,
      image_alt: payload.imageAlt || null,
      badge: payload.badge ?? null,
      rating: payload.rating ?? 4.8,
      stock_quantity: stockQuantity,
      is_available: payload.isAvailable && stockQuantity > 0,
      spice_level: payload.spiceLevel || null,
      toppings: payload.toppings ?? [],
      serving_time: payload.servingTime || null,
      recommendations: payload.recommendations ?? [],
    })
    .eq("id", id)
    .select(MENU_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: mapProduct(data as RawMenuItem) });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const { supabase, user } = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { error: "Login admin dibutuhkan untuk menghapus menu." },
      { status: 401 }
    );
  }

  const { error } = await supabase.from("menu_items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
