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
  login: (user: User) => void;
  logout: () => void;
  setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        set({ user: null, isAuthenticated: false });
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
    }
  )
);
