"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.dbRole !== "ADMIN") {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [isAuthenticated, user, router, pathname]);

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-body-md text-on-surface-variant">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
