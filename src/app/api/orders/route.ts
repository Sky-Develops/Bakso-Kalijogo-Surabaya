import { NextResponse } from "next/server";
import { z } from "zod";
import { SERVICE_FEE, generateOrderNumber } from "@/lib/mock-data";
import { mapOrder, RawOrder } from "@/lib/order-mapper";
import { createClient } from "@/utils/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

const createOrderSchema = z
  .object({
    customerName: z.string().min(3),
    customerPhone: z.string().min(1),
    deliveryAddress: z.string().optional(),
    deliveryArea: z.string().optional(),
    tableNumber: z.string().optional(),
    notes: z.string().optional(),
    orderType: z.enum(["ONLINE", "TAKEAWAY", "DINE_IN"]),
    paymentMethod: z.enum(["CASH", "QRIS", "TRANSFER_BANK"]),
    shippingFee: z.number().min(0),
    serviceFee: z.number().min(0).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().optional(),
          productName: z.string().min(1),
          productImage: z.string().nullable().optional(),
          quantity: z.number().int().positive(),
          price: z.number().positive(),
          notes: z.string().optional(),
        })
      )
      .min(1),
  })
  .refine(
    (value) =>
      value.orderType !== "ONLINE" ||
      (!!value.deliveryAddress && value.deliveryAddress.length >= 10),
    {
      path: ["deliveryAddress"],
      message: "Alamat lengkap wajib diisi untuk delivery.",
    }
  )
  .refine(
    (value) =>
      value.orderType === "DINE_IN" || /^[0-9]{10,13}$/.test(value.customerPhone),
    {
      path: ["customerPhone"],
      message: "Nomor WhatsApp tidak valid.",
    }
  );

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone")?.trim();

  if (!phone) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Login admin dibutuhkan untuk melihat semua pesanan." },
        { status: 401 }
      );
    }
  }

  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(phone ? 50 : 100);

  if (phone) {
    query = query.eq("customer_phone", phone);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: ((data ?? []) as RawOrder[]).map(mapOrder),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data pesanan tidak valid." },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const orderId = crypto.randomUUID();
  const menuIds = payload.items
    .map((item) => item.productId)
    .filter((id): id is string => !!id && UUID_RE.test(id));

  const { data: menuRows, error: menuError } = menuIds.length
    ? await supabase
        .from("menu_items")
        .select("id,name,price,image_url,is_available,stock_quantity")
        .in("id", menuIds)
    : { data: [], error: null };

  if (menuError) {
    return NextResponse.json({ error: menuError.message }, { status: 500 });
  }

  const menuById = new Map(
    (menuRows ?? []).map((item) => [
      item.id as string,
      {
        id: item.id as string,
        name: item.name as string,
        price: Number(item.price),
        imageUrl: item.image_url as string | null,
        isAvailable: Boolean(item.is_available),
        stockQuantity:
          typeof item.stock_quantity === "number" ? item.stock_quantity : null,
      },
    ])
  );

  const verifiedItems: typeof payload.items = [];

  for (const item of payload.items) {
    const menu = item.productId ? menuById.get(item.productId) : null;

    if (!menu) {
      verifiedItems.push(item);
      continue;
    }

    if (!menu.isAvailable || (menu.stockQuantity !== null && menu.stockQuantity <= 0)) {
      return NextResponse.json({ error: `${menu.name} sedang habis.` }, { status: 409 });
    }

    if (menu.stockQuantity !== null && item.quantity > menu.stockQuantity) {
      return NextResponse.json(
        { error: `Stok ${menu.name} tersisa ${menu.stockQuantity}.` },
        { status: 409 }
      );
    }

    verifiedItems.push({
      ...item,
      productName: menu.name,
      productImage: menu.imageUrl,
      price: menu.price,
    });
  }

  const subtotal = verifiedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const serviceFee = payload.serviceFee ?? SERVICE_FEE;
  const totalAmount = subtotal + payload.shippingFee + serviceFee;
  const paymentStatus = "UNPAID";
  let tableId: string | null = null;

  if (payload.orderType === "DINE_IN" && payload.tableNumber) {
    const { data: table, error: tableError } = await supabase
      .from("dining_tables")
      .select("id")
      .eq("number", Number(payload.tableNumber))
      .maybeSingle();

    if (tableError) {
      return NextResponse.json({ error: tableError.message }, { status: 500 });
    }

    tableId = (table?.id as string | undefined) ?? null;
  }

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    order_number: generateOrderNumber(),
    status: "PENDING",
    order_type: payload.orderType,
    payment_method: payload.paymentMethod,
    payment_status: paymentStatus,
    subtotal,
    shipping_fee: payload.shippingFee,
    service_fee: serviceFee,
    total_amount: totalAmount,
    customer_name: payload.customerName,
    customer_phone: payload.customerPhone,
    delivery_address: payload.deliveryAddress,
    delivery_area: payload.deliveryArea,
    table_number: payload.tableNumber,
    table_id: tableId,
    notes: payload.notes,
  });

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    verifiedItems.map((item) => ({
      order_id: orderId,
      menu_item_id:
        item.productId && UUID_RE.test(item.productId) ? item.productId : null,
      product_name: item.productName,
      product_image: item.productImage,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes,
    }))
  );

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    order_id: orderId,
    method: payload.paymentMethod,
    amount: totalAmount,
    status: paymentStatus,
    reference_code: `${payload.paymentMethod}-${orderId.slice(0, 8).toUpperCase()}`,
  });

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      order: mapOrder(data as RawOrder),
      paymentWarning: paymentError?.message,
    },
    { status: 201 }
  );
}
