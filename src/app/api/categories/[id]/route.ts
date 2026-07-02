import { NextResponse } from "next/server";
import { z } from "zod";
import { mapCategory, RawMenuCategory } from "@/lib/menu-mapper";
import { createClient } from "@/utils/supabase/server";

const categorySchema = z.object({
  name: z.string().min(2),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().optional(),
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
      { error: "Login admin dibutuhkan untuk mengubah kategori." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid." },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const { data, error } = await supabase
    .from("menu_categories")
    .update({
      name: payload.name,
      icon: payload.icon || null,
      sort_order: payload.sortOrder,
      is_active: payload.isActive ?? true,
    })
    .eq("id", id)
    .select("id,name,icon,sort_order,is_active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: mapCategory(data as RawMenuCategory) });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const { supabase, user } = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { error: "Login admin dibutuhkan untuk menghapus kategori." },
      { status: 401 }
    );
  }

  const { error } = await supabase.from("menu_categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
