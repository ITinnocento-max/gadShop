"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useUIStore } from "@/stores/ui-store";

const navItems = [
  { icon: "dashboard", key: "dashboard", href: "/admin/dashboard" },
  { icon: "group", key: "users", href: "/admin/users" },
  { icon: "inventory_2", key: "products", href: "/admin/products" },
  { icon: "finance", key: "financial_overview", href: "/admin/financial" },
  { icon: "description", key: "reports", href: "/admin/financial/reports" },
  { icon: "account_balance", key: "banking", href: "/admin/financial/banking" },
  { icon: "receipt", key: "expenses", href: "/admin/financial/expenses" },
  { icon: "request_quote", key: "tax", href: "/admin/financial/tax" },
  { icon: "receipt_long", key: "invoicing", href: "/admin/financial/invoicing" },
  { icon: "payments", key: "payments", href: "/admin/financial/payments" },
  { icon: "insights", key: "analytics", href: "/admin/financial/analytics" },
  { icon: "analytics", key: "profit_loss", href: "/admin/profit-loss" },
];

export function AdminDrawerMenu() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isOpen = useUIStore((s) => s.isMobileMenuOpen);
  const setOpen = useUIStore((s) => s.setMobileMenuOpen);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-surface-container-lowest shadow-overlay z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-md border-b border-outline-variant/20">
          <h2 className="font-headline-md text-headline-md text-primary tracking-tighter">{t("common.app_name")}</h2>
          <button onClick={() => setOpen(false)} className="text-on-surface-variant active:scale-90 transition-transform">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="p-md space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container font-bold"
                    : "text-on-surface-variant hover:bg-surface-variant/50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
                <span className="font-label-md text-label-md">{t(`admin.${item.key}`)}</span>
              </a>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
