import { NextResponse } from "next/server";
import { z } from "zod";
import { mapDiningTable, RawDiningTable } from "@/lib/table-mapper";
import { createClient } from "@/utils/supabase/server";

const tableUpdateSchema = z.object({
  number: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]).optional(),
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
      { error: "Login admin dibutuhkan untuk mengubah meja." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = tableUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data meja tidak valid." },
      { status: 400 }
    );
  }

  const updates: Record<string, number | string> = {};
  if (parsed.data.number !== undefined) updates.number = parsed.data.number;
  if (parsed.data.capacity !== undefined) updates.capacity = parsed.data.capacity;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;

  const { data, error } = await supabase
    .from("dining_tables")
    .update(updates)
    .eq("id", id)
    .select("id,number,capacity,status,qr_code_url,created_at,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ table: mapDiningTable(data as RawDiningTable) });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const { supabase, user } = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { error: "Login admin dibutuhkan untuk menghapus meja." },
      { status: 401 }
    );
  }

  const { error } = await supabase.from("dining_tables").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
