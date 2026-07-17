"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { usePermissions } from "@/hooks/usePermissions";
import { ROLE_LABELS } from "@/lib/permissions";

const navItems = [
  { icon: "dashboard", key: "dashboard", href: "/admin/dashboard", resource: "dashboard" as const },
  { icon: "group", key: "users", href: "/admin/users", resource: "users" as const },
  { icon: "receipt_long", key: "orders", href: "/admin/orders", resource: "orders" as const },
  { icon: "inventory_2", key: "products", href: "/admin/products", resource: "products" as const },
  { icon: "new_releases", key: "new_releases", href: "/admin/new-releases", resource: "content" as const },
  { icon: "finance", key: "financial_overview", href: "/admin/financial", resource: "financial" as const },
  { icon: "description", key: "reports", href: "/admin/financial/reports", resource: "reports" as const },
  { icon: "account_balance", key: "banking", href: "/admin/financial/banking", resource: "banking" as const },
  { icon: "receipt", key: "expenses", href: "/admin/financial/expenses", resource: "expenses" as const },
  { icon: "request_quote", key: "tax", href: "/admin/financial/tax", resource: "tax" as const },
  { icon: "receipt_long", key: "invoicing", href: "/admin/financial/invoicing", resource: "invoicing" as const },
  { icon: "payments", key: "payments", href: "/admin/financial/payments", resource: "payments" as const },
  { icon: "insights", key: "analytics", href: "/admin/financial/analytics", resource: "analytics" as const },
  { icon: "analytics", key: "profit_loss", href: "/admin/profit-loss", resource: "profit_loss" as const },
  { icon: "local_offer", key: "promo_codes", href: "/admin/promo-codes", resource: "marketing" as const },
];

export function AdminSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { role, canAccess } = usePermissions();

  const visibleItems = navItems.filter((item) => canAccess(item.resource));

  return (
    <aside className="hidden md:flex flex-col w-72 bg-surface-container-low border-r border-outline-variant/20 shrink-0">
      <Link href="/admin/dashboard" className="p-lg flex items-center gap-3 border-b border-outline-variant/10 hover:bg-surface-variant/30 transition-colors">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined">account_balance</span>
        </div>
        <div className="flex flex-col">
          <span className="font-headline-md text-headline-md text-primary">{t("common.app_name")}</span>
          <span className="font-label-sm text-label-sm text-outline">{t("admin.enterprise_management")}</span>
        </div>
      </Link>
      <nav className="flex-1 px-sm py-md overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 mx-2 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-bold shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              <span className="font-body-md text-body-md">{t(`admin.${item.key}`)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-lg border-t border-outline-variant/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-on-surface">{t("common.app_name")} Admin</span>
          <span className="font-label-sm text-label-sm text-outline">{role ? ROLE_LABELS[role] : "—"}</span>
        </div>
      </div>
    </aside>
  );
}
