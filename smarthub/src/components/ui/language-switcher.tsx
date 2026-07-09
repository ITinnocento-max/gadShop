"use client";

import { useState, useRef, useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

const languages = [
  { code: "en", label: "English", flag: "US" },
  { code: "fr", label: "Français", flag: "FR" },
  { code: "sw", label: "Kiswahili", flag: "KE" },
  { code: "rw", label: "Ikinyarwanda", flag: "RW" },
] as const;

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = languages.find((l) => l.code === language) ?? languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">language</span>
        <span>{current.label}</span>
        <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-surface-container-low rounded-xl shadow-raised border border-outline-variant/10 overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left font-body-md transition-colors hover:bg-surface-container-high ${
                language === lang.code
                  ? "text-primary bg-primary-container/20"
                  : "text-on-surface"
              }`}
            >
              <span className="text-[16px]">{lang.label}</span>
              {language === lang.code && (
                <span className="material-symbols-outlined text-[16px] ml-auto">
                  check
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
