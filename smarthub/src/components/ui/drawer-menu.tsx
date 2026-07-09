"use client";

import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { useTranslation } from "@/hooks/useTranslation";

const menuItemKeys = [
  { icon: "home", key: "home", href: "/" },
  { icon: "grid_view", key: "shop", href: "/products" },
  { icon: "receipt_long", key: "orders", href: "/orders" },
  { icon: "favorite", key: "wishlist", href: "/wishlist" },
  { icon: "person", key: "my_account", href: "/account" },
  { icon: "local_mall", key: "cart", href: "/cart" },
];

export function DrawerMenu() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isOpen = useUIStore((s) => s.isMobileMenuOpen);
  const setOpen = useUIStore((s) => s.setMobileMenuOpen);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-surface-container-lowest dark:bg-inverse-surface shadow-overlay z-50 transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-md border-b border-outline-variant/20 dark:border-outline-variant/30">
          <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary tracking-tighter">{t("common.app_name")}</h2>
          <button onClick={() => setOpen(false)} className="text-on-surface-variant dark:text-outline active:scale-90 transition-transform">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="p-md space-y-1">
          {menuItemKeys.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="flex items-center gap-4 px-md py-3 rounded-xl text-on-surface-variant dark:text-outline hover:bg-primary-container/10 hover:text-primary transition-all active:scale-[0.98]"
              onClick={() => setOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-label-md text-label-md">{t(`nav.${item.key}`)}</span>
            </a>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-md border-t border-outline-variant/20 dark:border-outline-variant/30">
          <p className="font-label-sm text-label-sm text-outline dark:text-outline-variant text-center">&copy; 2024 {t("common.app_name")}</p>
        </div>
      </aside>
    </>
  );
}
