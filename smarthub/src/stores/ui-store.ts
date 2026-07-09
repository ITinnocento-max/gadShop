import { create } from "zustand";

type Theme = "light" | "dark";
type Language = "en" | "fr" | "sw" | "rw";

interface UIState {
  theme: Theme;
  language: Language;
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;
  setCartOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "light",
  language: "en",
  isCartOpen: false,
  isMobileMenuOpen: false,
  setTheme: (theme) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("smarthub-theme", theme);
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("smarthub-theme", newTheme);
      return { theme: newTheme };
    });
  },
  setLanguage: (language) => {
    localStorage.setItem("smarthub-language", language);
    set({ language });
  },
  setCartOpen: (isCartOpen) => set({ isCartOpen }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
}));
