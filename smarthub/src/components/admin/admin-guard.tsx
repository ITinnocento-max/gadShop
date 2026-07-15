"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore, type User } from "@/stores/auth-store";

function readAuthFromStorage(): { user: User | null; isAuthenticated: boolean } {
  if (typeof window === "undefined") return { user: null, isAuthenticated: false };
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return { user: null, isAuthenticated: false };
    const parsed = JSON.parse(raw);
    const state = parsed.state ?? parsed;
    if (state?.user && state?.isAuthenticated) {
      return { user: state.user, isAuthenticated: true };
    }
  } catch {}
  return { user: null, isAuthenticated: false };
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storeState = useAuthStore.getState();
    let user = storeState.user;
    let isAuthenticated = storeState.isAuthenticated;

    if (!user || !isAuthenticated) {
      const fromStorage = readAuthFromStorage();
      user = fromStorage.user;
      isAuthenticated = fromStorage.isAuthenticated;
      if (user && isAuthenticated) {
        useAuthStore.setState({ user, isAuthenticated, hydrated: true });
      }
    }

    if (!isAuthenticated || !user) {
      window.location.href = `/login?from=${encodeURIComponent(pathname)}`;
      return;
    }
    if (user.dbRole !== "ADMIN") {
      window.location.href = "/";
      return;
    }
    setReady(true);
  }, [pathname]);

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
