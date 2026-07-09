"use client";

import { useTranslation } from "@/hooks/useTranslation";

const reports = [
  { key: "balance_sheet", href: "/admin/financial/reports/balance-sheet" },
  { key: "income_statement", href: "/admin/profit-loss" },
  { key: "cash_flow_statement", href: "/admin/financial/reports/cash-flow" },
  { key: "equity_changes", href: "#" },
  { key: "trial_balance", href: "#" },
  { key: "general_ledger", href: "#" },
  { key: "journal_report", href: "#" },
  { key: "ar_aging", href: "/admin/financial/reports/ar-aging" },
  { key: "ap_aging", href: "/admin/financial/reports/ap-aging" },
  { key: "sales_report", href: "#" },
  { key: "purchase_report", href: "#" },
  { key: "inventory_valuation", href: "#" },
  { key: "inventory_movement", href: "#" },
  { key: "expense_report", href: "#" },
  { key: "revenue_report", href: "#" },
  { key: "tax_summary", href: "#" },
  { key: "vat_gst", href: "/admin/financial/reports/vat-gst" },
  { key: "payroll_report", href: "#" },
  { key: "profitability_report", href: "#" },
  { key: "budget_vs_actual", href: "#" },
  { key: "cogs_report", href: "#" },
  { key: "customer_statement", href: "#" },
  { key: "supplier_statement", href: "#" },
  { key: "bank_reconciliation_report", href: "#" },
  { key: "payment_method_report", href: "#" },
  { key: "daily_sales", href: "#" },
  { key: "weekly_sales", href: "#" },
  { key: "monthly_sales", href: "#" },
  { key: "quarterly_sales", href: "#" },
  { key: "annual_financial", href: "#" },
  { key: "custom_report", href: "#" },
];

export default function ReportsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{t("admin.reports")}</h2>
        <p className="font-body-md text-body-md text-outline mt-1">{t("admin.reports_subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        {reports.map((report) =>
          report.href === "#" ? (
            <div
              key={report.key}
              className="flex flex-col items-center gap-2 p-md bg-surface-container-lowest rounded-xl border border-outline-variant/10 opacity-70 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-outline text-[24px]">description</span>
              <span className="font-label-sm text-label-sm text-center text-outline">{t(`admin.${report.key}`)}</span>
            </div>
          ) : (
            <a
              key={report.key}
              href={report.href}
              className="flex flex-col items-center gap-2 p-md bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:bg-surface-container hover:shadow-sm transition-all active:scale-[0.97]"
            >
              <span className="material-symbols-outlined text-primary text-[24px]">description</span>
              <span className="font-label-sm text-label-sm text-center text-on-surface-variant">{t(`admin.${report.key}`)}</span>
            </a>
          )
        )}
      </div>
    </div>
  );
}
