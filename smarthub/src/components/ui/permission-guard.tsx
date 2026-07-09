"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Resource, Action } from "@/lib/permissions";

interface CanProps {
  resource: Resource;
  action: Action;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ resource, action, fallback = null, children }: CanProps) {
  const { can } = usePermissions();
  if (can(resource, action)) return <>{children}</>;
  return <>{fallback}</>;
}

interface CanAccessProps {
  resource: Resource;
  fallback?: ReactNode;
  children: ReactNode;
}

export function CanAccess({
  resource,
  fallback = null,
  children,
}: CanAccessProps) {
  const { canAccess } = usePermissions();
  if (canAccess(resource)) return <>{children}</>;
  return <>{fallback}</>;
}
