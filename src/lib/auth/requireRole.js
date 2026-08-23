import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { ROLE_HIERARCHY } from "@/constants/roles";

// Role guard for API routes. Usage:
//   const { error, session, profile } = await requireRole('manager')
//   if (error) return error
export async function requireRole(requiredRole) {
  const { session, profile } = await getSession();

  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
      profile: null,
    };
  }

  const userLevel = ROLE_HIERARCHY[profile?.role] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 999;

  if (userLevel < requiredLevel) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
      profile: null,
    };
  }

  return { error: null, session, profile };
}
