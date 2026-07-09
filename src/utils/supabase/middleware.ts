import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type AdminRole = "OWNER" | "ADMIN" | "KASIR" | "DAPUR";

/**
 * Returns true if the given role is allowed to access the given admin path.
 * OWNER and ADMIN can access everything.
 * KASIR can access dashboard, cashier, orders, tables, menu, and categories.
 * DAPUR can only see the dashboard and orders.
 */
function canAccessAdminPath(role: AdminRole, pathname: string) {
  if (role === "OWNER" || role === "ADMIN") return true;

  if (role === "KASIR") {
    return (
      pathname === "/admin" ||
      pathname.startsWith("/admin/cashier") ||
      pathname.startsWith("/admin/orders") ||
      pathname.startsWith("/admin/tables") ||
      pathname.startsWith("/admin/menu") ||
      pathname.startsWith("/admin/categories")
    );
  }

  if (role === "DAPUR") {
    return pathname === "/admin" || pathname.startsWith("/admin/orders");
  }

  return false;
}

function normalizeAdminRole(role: unknown): AdminRole | null {
  if (typeof role !== "string") return null;

  const normalizedRole = role.trim().toUpperCase();
  if (
    normalizedRole === "OWNER" ||
    normalizedRole === "ADMIN" ||
    normalizedRole === "KASIR" ||
    normalizedRole === "DAPUR"
  ) {
    return normalizedRole;
  }

  return null;
}

/** Public admin paths that bypass auth/role checks */
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/unauthorized",
  "/admin/reset-password",
];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => pathname === p);

  if (!isAdminPath || isPublicAdminPath) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Not logged in → redirect to /admin/login (except public admin pages)
  if (!user && isAdminPath && !isPublicAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // 2. Logged in → fetch role and check access
  if (user && isAdminPath && !isPublicAdminPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = normalizeAdminRole(profile?.role);

    // No profile row found — block access
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/unauthorized";
      return NextResponse.redirect(url);
    }

    // Role exists but doesn't have permission for this path
    if (!canAccessAdminPath(role, pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  // 3. Logged in and on /admin/login → go to dashboard
  if (user && pathname === "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
