"use client";

import { useAuthStore } from "@/stores/auth-store";
import {
  hasPermission,
  canAccessAny,
  type Resource,
  type Action,
  type Role,
} from "@/lib/permissions";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? null;

  return {
    role,
    can: (resource: Resource, action: Action) =>
      hasPermission(role, resource, action),
    canAccess: (resource: Resource) => canAccessAny(role, resource),
    is: (...roles: Role[]) => role !== null && roles.includes(role),
  };
}
