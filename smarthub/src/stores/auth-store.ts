"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/permissions";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: Role;
  dbRole?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setRole: (role: Role) => void;
}

function setAuthCookie(user: User | null) {
  if (typeof document === "undefined") return;
  if (!user) {
    document.cookie = "auth-storage=; path=/; max-age=0";
    return;
  }
  const cookieData = JSON.stringify({
    state: {
      user,
      isAuthenticated: true,
    },
    version: 0,
  });
  document.cookie = `auth-storage=${encodeURIComponent(cookieData)}; path=/; max-age=86400; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false,
      login: (user) => {
        set({ user, isAuthenticated: true });
        setAuthCookie(user);
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        setAuthCookie(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
      },
      setRole: (role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        useAuthStore.setState({ hydrated: true });
        if (state?.user) setAuthCookie(state.user);
      },
    }
  )
);
