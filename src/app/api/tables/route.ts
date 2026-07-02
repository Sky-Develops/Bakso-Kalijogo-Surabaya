import { NextResponse } from "next/server";
import { z } from "zod";
import {
  mapDiningTable,
  RawDiningTable,
  RawQrSession,
  RawTableOrder,
} from "@/lib/table-mapper";
import { createClient } from "@/utils/supabase/server";

const tableSchema = z.object({
  number: z.number().int().positive(),
  capacity: z.number().int().positive(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]),
});

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

function originFromRequest(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto ?? url.protocol.replace(":", "")}://${forwardedHost}`;
  }

  return url.origin;
}

async function createQrForTable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: RawDiningTable,
  origin: string
) {
  await supabase
    .from("qr_sessions")
    .update({ is_active: false })
    .eq("table_id", table.id)
    .eq("is_active", true);

  const { data: session, error } = await supabase
    .from("qr_sessions")
    .insert({
      table_id: table.id,
      table_number: table.number,
      is_active: true,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    })
    .select("id,table_id,table_number,token,is_active,expires_at,created_at")
    .single();

  if (error) throw new Error(error.message);

  const qrCodeUrl = `${origin}/table/${table.number}?session=${session.token}`;
  await supabase
    .from("dining_tables")
    .update({ qr_code_url: qrCodeUrl })
    .eq("id", table.id);

  return { ...(session as RawQrSession), qrCodeUrl };
}

export async function GET() {
  const supabase = await createClient();
  const [tablesResult, qrResult, ordersResult] = await Promise.all([
    supabase
      .from("dining_tables")
      .select("id,number,capacity,status,qr_code_url,created_at,updated_at")
      .order("number", { ascending: true }),
    supabase
      .from("qr_sessions")
      .select("id,table_id,table_number,token,is_active,expires_at,created_at")
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id,order_number,status,total_amount,table_id,table_number,created_at")
      .eq("order_type", "DINE_IN")
      .in("status", ["PENDING", "CONFIRMED", "PREPARING", "DELIVERING"])
      .order("created_at", { ascending: false }),
  ]);

  if (tablesResult.error) {
    return NextResponse.json({ error: tablesResult.error.message }, { status: 500 });
  }

  if (qrResult.error) {
    return NextResponse.json({ error: qrResult.error.message }, { status: 500 });
  }

  if (ordersResult.error) {
    return NextResponse.json({ error: ordersResult.error.message }, { status: 500 });
  }

  const sessions = (qrResult.data ?? []) as RawQrSession[];
  const orders = (ordersResult.data ?? []) as RawTableOrder[];
  const sessionByTable = new Map<string, RawQrSession>();
  const orderByTable = new Map<string, RawTableOrder>();
  const orderByNumber = new Map<string, RawTableOrder>();

  sessions.forEach((session) => {
    if (!sessionByTable.has(session.table_id)) sessionByTable.set(session.table_id, session);
  });

  orders.forEach((order) => {
    if (order.table_id && !orderByTable.has(order.table_id)) {
      orderByTable.set(order.table_id, order);
    }
    if (order.table_number && !orderByNumber.has(order.table_number)) {
      orderByNumber.set(order.table_number, order);
    }
  });

  return NextResponse.json({
    tables: ((tablesResult.data ?? []) as RawDiningTable[]).map((table) =>
      mapDiningTable(
        table,
        sessionByTable.get(table.id),
        orderByTable.get(table.id) ?? orderByNumber.get(String(table.number))
      )
    ),
  });
}

export async function POST(request: Request) {
  const { supabase, user } = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { error: "Login admin dibutuhkan untuk menambah meja." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = tableSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data meja tidak valid." },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const { data, error } = await supabase
    .from("dining_tables")
    .insert({
      number: payload.number,
      capacity: payload.capacity,
      status: payload.status,
    })
    .select("id,number,capacity,status,qr_code_url,created_at,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const table = data as RawDiningTable;
  const session = await createQrForTable(supabase, table, originFromRequest(request));

  return NextResponse.json(
    {
      table: mapDiningTable(
        { ...table, qr_code_url: session.qrCodeUrl },
        session,
        null
      ),
    },
    { status: 201 }
  );
}
