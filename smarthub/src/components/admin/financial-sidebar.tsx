"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { usePermissions } from "@/hooks/usePermissions";

const sections = [
  { icon: "finance", key: "financial_overview", href: "/admin/financial", resource: "financial" as const },
  { icon: "description", key: "reports", href: "/admin/financial/reports", resource: "reports" as const },
  { icon: "account_balance", key: "banking", href: "/admin/financial/banking", resource: "banking" as const },
  { icon: "receipt", key: "expenses", href: "/admin/financial/expenses", resource: "expenses" as const },
  { icon: "request_quote", key: "tax", href: "/admin/financial/tax", resource: "tax" as const },
  { icon: "receipt_long", key: "invoicing", href: "/admin/financial/invoicing", resource: "invoicing" as const },
  { icon: "payments", key: "payments", href: "/admin/financial/payments", resource: "payments" as const },
  { icon: "insights", key: "analytics", href: "/admin/financial/analytics", resource: "analytics" as const },
];

export function FinancialSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { canAccess } = usePermissions();

  const visibleSections = sections.filter((s) => canAccess(s.resource));

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-surface-container border-r border-outline-variant/20 shrink-0">
      <a href="/admin/financial" className="p-md border-b border-outline-variant/10 block hover:bg-surface-variant/30 transition-colors">
        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{t("admin.financial_reports")}</span>
      </a>
      <nav className="flex-1 p-sm space-y-0.5 overflow-y-auto">
        {visibleSections.map((section) => {
          const isActive = pathname === section.href || (section.href !== "/admin/financial" && pathname.startsWith(section.href));
          return (
            <a
              key={section.key}
              href={section.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{section.icon}</span>
              <span className="font-label-md text-label-md">{t(`admin.${section.key}`)}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
