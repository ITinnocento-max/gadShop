import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Role } from "@/lib/permissions";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: Role;
  dbRole?: string;
}

interface AuthResult {
  user: AuthUser | null;
  error: NextResponse | null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth-storage");
  if (!authCookie?.value) return null;
  try {
    const decoded = decodeURIComponent(authCookie.value);
    const parsed = JSON.parse(decoded);
    const state = parsed.state ?? parsed;
    if (state?.isAuthenticated && state?.user) {
      return state.user as AuthUser;
    }
  } catch {
    return null;
  }
  return null;
}

export async function requireAuth(): Promise<AuthResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export async function requireAdmin(): Promise<AuthResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (user.dbRole !== "ADMIN") {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user, error: null };
}

export async function requireRole(...roles: string[]): Promise<AuthResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (user.dbRole && !roles.includes(user.dbRole)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user, error: null };
}
