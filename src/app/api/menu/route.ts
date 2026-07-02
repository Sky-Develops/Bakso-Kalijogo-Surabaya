import { NextResponse } from "next/server";
import { z } from "zod";
import { mapCategory, mapProduct, RawMenuCategory, RawMenuItem } from "@/lib/menu-mapper";
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

export async function GET() {
  const supabase = await createClient();

  const [categoryResult, productResult] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("id,name,icon,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select(MENU_SELECT)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (categoryResult.error) {
    return NextResponse.json({ error: categoryResult.error.message }, { status: 500 });
  }

  if (productResult.error) {
    return NextResponse.json({ error: productResult.error.message }, { status: 500 });
  }

  const categories = ((categoryResult.data ?? []) as RawMenuCategory[]).map(mapCategory);
  const activeCategoryIds = new Set(categories.map((category) => category.id));
  const products = ((productResult.data ?? []) as RawMenuItem[])
    .filter((product) => activeCategoryIds.has(product.category_id))
    .map(mapProduct);

  return NextResponse.json({ categories, products });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Login admin dibutuhkan untuk menambah menu." },
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
  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      category_id: payload.categoryId,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      image_url: payload.imageUrl || null,
      image_alt: payload.imageAlt || null,
      badge: payload.badge ?? null,
      rating: payload.rating ?? 4.8,
      stock_quantity: payload.stockQuantity ?? 20,
      is_available: payload.isAvailable && (payload.stockQuantity ?? 20) > 0,
      spice_level: payload.spiceLevel || null,
      toppings: payload.toppings ?? [],
      serving_time: payload.servingTime || null,
      recommendations: payload.recommendations ?? [],
    })
    .select(MENU_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: mapProduct(data as RawMenuItem) }, { status: 201 });
}
