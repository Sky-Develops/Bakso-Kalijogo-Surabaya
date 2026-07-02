import { NextResponse } from "next/server";
import { getAdminProfile } from "@/lib/admin-auth";

export async function GET() {
  const { user, profile } = await getAdminProfile();

  if (!user) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  if (!profile) {
    return NextResponse.json({ error: "Profil admin belum dibuat." }, { status: 403 });
  }

  return NextResponse.json({ profile });
}
