"use client";

import { useAuthStore } from "@/stores/auth-store";
import {
  hasPermission,
  canAccessAny,
  type Resource,
  type Action,
  type Role,
} from "@/lib/permissions";

const DB_ROLE_MAP: Record<string, Role> = {
  ADMIN: "super_admin",
  VENDOR: "store_manager",
  CUSTOMER: "customer_support",
};

function resolveRole(user: { role?: Role; dbRole?: string } | null): Role | null {
  if (!user) return null;
  if (user.role && user.role in ({} as Record<Role, 1>)) return user.role;
  if (user.dbRole && user.dbRole in DB_ROLE_MAP) return DB_ROLE_MAP[user.dbRole];
  return null;
}

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = resolveRole(user);

  return {
    role,
    can: (resource: Resource, action: Action) =>
      hasPermission(role, resource, action),
    canAccess: (resource: Resource) => canAccessAny(role, resource),
    is: (...roles: Role[]) => role !== null && roles.includes(role),
  };
}
