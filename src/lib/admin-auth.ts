import { createClient } from "@/utils/supabase/server";

export type AdminRole = "OWNER" | "ADMIN" | "KASIR";

export type AdminProfile = {
  id: string;
  fullName: string | null;
  role: AdminRole;
};

export const ALL_ADMIN_ROLES: AdminRole[] = ["OWNER", "ADMIN", "KASIR"];
export const MANAGER_ROLES: AdminRole[] = ["OWNER", "ADMIN"];

export function canAccessAdminPath(role: AdminRole, pathname: string) {
  if (role === "OWNER" || role === "ADMIN") return true;

  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/orders") ||
    pathname.startsWith("/admin/tables")
  );
}

export async function getAdminProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null };

  const { data } = await supabase
    .from("profiles")
    .select("id,full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data
    ? ({
        id: data.id as string,
        fullName: (data.full_name as string | null) ?? null,
        role: data.role as AdminRole,
      } satisfies AdminProfile)
    : null;

  return { supabase, user, profile };
}

export async function requireAdminRole(allowedRoles: AdminRole[] = ALL_ADMIN_ROLES) {
  const { supabase, user, profile } = await getAdminProfile();

  if (!user) {
    return { supabase, user, profile, error: "Login admin dibutuhkan.", status: 401 };
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return { supabase, user, profile, error: "Role admin tidak memiliki akses.", status: 403 };
  }

  return { supabase, user, profile, error: null, status: null };
}
