"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useUIStore((s) => s.setTheme);
  const setLanguage = useUIStore((s) => s.setLanguage);
  const language = useUIStore((s) => s.language);

  useEffect(() => {
    const savedTheme = localStorage.getItem("smarthub-theme") as "light" | "dark" | null;
    const savedLanguage = localStorage.getItem("smarthub-language") as "en" | "fr" | "sw" | "rw" | null;

    if (savedTheme) {
      setTheme(savedTheme);
    }

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, [setTheme, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <>{children}</>;
}
