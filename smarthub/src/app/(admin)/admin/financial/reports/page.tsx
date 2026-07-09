"use client";

const reports = [
  { key: "balance_sheet", label: "Balance Sheet", href: "/admin/financial/reports/balance-sheet" },
  { key: "income_statement", label: "Income Statement", href: "/admin/profit-loss" },
  { key: "cash_flow_statement", label: "Cash Flow Statement", href: "/admin/financial/reports/cash-flow" },
  { key: "equity_changes", label: "Equity Changes", href: "#" },
  { key: "trial_balance", label: "Trial Balance", href: "#" },
  { key: "general_ledger", label: "General Ledger", href: "#" },
  { key: "journal_report", label: "Journal Report", href: "#" },
  { key: "ar_aging", label: "AR Aging", href: "/admin/financial/reports/ar-aging" },
  { key: "ap_aging", label: "AP Aging", href: "/admin/financial/reports/ap-aging" },
  { key: "sales_report", label: "Sales Report", href: "#" },
  { key: "purchase_report", label: "Purchase Report", href: "#" },
  { key: "inventory_valuation", label: "Inventory Valuation", href: "#" },
  { key: "inventory_movement", label: "Inventory Movement", href: "#" },
  { key: "expense_report", label: "Expense Report", href: "#" },
  { key: "revenue_report", label: "Revenue Report", href: "#" },
  { key: "tax_summary", label: "Tax Summary", href: "#" },
  { key: "vat_gst", label: "VAT/GST", href: "/admin/financial/reports/vat-gst" },
  { key: "payroll_report", label: "Payroll Report", href: "#" },
  { key: "profitability_report", label: "Profitability Report", href: "#" },
  { key: "budget_vs_actual", label: "Budget vs Actual", href: "#" },
  { key: "cogs_report", label: "COGS Report", href: "#" },
  { key: "customer_statement", label: "Customer Statement", href: "#" },
  { key: "supplier_statement", label: "Supplier Statement", href: "#" },
  { key: "bank_reconciliation_report", label: "Bank Reconciliation", href: "#" },
  { key: "payment_method_report", label: "Payment Method Report", href: "#" },
  { key: "daily_sales", label: "Daily Sales", href: "#" },
  { key: "weekly_sales", label: "Weekly Sales", href: "#" },
  { key: "monthly_sales", label: "Monthly Sales", href: "#" },
  { key: "quarterly_sales", label: "Quarterly Sales", href: "#" },
  { key: "annual_financial", label: "Annual Financial", href: "#" },
  { key: "custom_report", label: "Custom Report", href: "#" },
];

export default function ReportsPage() {

  return (
    <div className="space-y-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{"Reports"}</h2>
        <p className="font-body-md text-body-md text-outline mt-1">{"View and generate financial reports"}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        {reports.map((report) =>
          report.href === "#" ? (
            <div
              key={report.key}
              className="flex flex-col items-center gap-2 p-md bg-surface-container-lowest rounded-xl border border-outline-variant/10 opacity-70 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-outline text-[24px]">description</span>
              <span className="font-label-sm text-label-sm text-center text-outline">{report.label}</span>
            </div>
          ) : (
            <a
              key={report.key}
              href={report.href}
              className="flex flex-col items-center gap-2 p-md bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:bg-surface-container hover:shadow-sm transition-all active:scale-[0.97]"
            >
              <span className="material-symbols-outlined text-primary text-[24px]">description</span>
              <span className="font-label-sm text-label-sm text-center text-on-surface-variant">{report.label}</span>
            </a>
          )
        )}
      </div>
    </div>
  );
}
