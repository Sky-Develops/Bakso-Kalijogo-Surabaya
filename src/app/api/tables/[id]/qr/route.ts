import { NextResponse } from "next/server";
import { mapDiningTable, RawDiningTable, RawQrSession } from "@/lib/table-mapper";
import { createClient } from "@/utils/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function originFromRequest(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto ?? url.protocol.replace(":", "")}://${forwardedHost}`;
  }

  return url.origin;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Login admin dibutuhkan untuk membuat QR meja." },
      { status: 401 }
    );
  }

  const { data: table, error: tableError } = await supabase
    .from("dining_tables")
    .select("id,number,capacity,status,qr_code_url,created_at,updated_at")
    .eq("id", id)
    .single();

  if (tableError) {
    return NextResponse.json({ error: tableError.message }, { status: 404 });
  }

  await supabase
    .from("qr_sessions")
    .update({ is_active: false })
    .eq("table_id", id)
    .eq("is_active", true);

  const { data: session, error: sessionError } = await supabase
    .from("qr_sessions")
    .insert({
      table_id: id,
      table_number: table.number,
      is_active: true,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    })
    .select("id,table_id,table_number,token,is_active,expires_at,created_at")
    .single();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  const qrCodeUrl = `${originFromRequest(request)}/table/${table.number}?session=${
    session.token
  }`;
  const { data: updatedTable, error: updateError } = await supabase
    .from("dining_tables")
    .update({ qr_code_url: qrCodeUrl })
    .eq("id", id)
    .select("id,number,capacity,status,qr_code_url,created_at,updated_at")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    table: mapDiningTable(updatedTable as RawDiningTable, session as RawQrSession),
  });
}
