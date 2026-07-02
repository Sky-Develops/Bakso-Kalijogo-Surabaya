import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const tableNumber = Number(searchParams.get("table"));
  const token = searchParams.get("token")?.trim();

  if (!tableNumber || !token) {
    return NextResponse.json(
      { valid: false, error: "QR session tidak lengkap." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("qr_sessions")
    .select("id,table_id,table_number,token,is_active,expires_at")
    .eq("table_number", tableNumber)
    .eq("token", token)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { valid: false, error: "QR session tidak aktif." },
      { status: 404 }
    );
  }

  const expired = new Date(data.expires_at as string).getTime() <= Date.now();

  if (expired) {
    return NextResponse.json(
      { valid: false, error: "QR session sudah kedaluwarsa." },
      { status: 410 }
    );
  }

  return NextResponse.json({
    valid: true,
    session: {
      id: data.id,
      tableId: data.table_id,
      tableNumber: data.table_number,
      token: data.token,
      expiresAt: data.expires_at,
    },
  });
}
