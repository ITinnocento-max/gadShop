"use client";

const reports = [
  { key: "balance-sheet", label: "Balance Sheet", href: "/admin/financial/reports/balance-sheet" },
  { key: "income-statement", label: "Income Statement", href: "/admin/profit-loss" },
  { key: "cash-flow", label: "Cash Flow Statement", href: "/admin/financial/reports/cash-flow" },
  { key: "equity-changes", label: "Equity Changes", href: "/admin/financial/reports/equity-changes" },
  { key: "trial-balance", label: "Trial Balance", href: "/admin/financial/reports/trial-balance" },
  { key: "general-ledger", label: "General Ledger", href: "/admin/financial/reports/general-ledger" },
  { key: "journal-report", label: "Journal Report", href: "/admin/financial/reports/journal-report" },
  { key: "ar-aging", label: "AR Aging", href: "/admin/financial/reports/ar-aging" },
  { key: "ap-aging", label: "AP Aging", href: "/admin/financial/reports/ap-aging" },
  { key: "sales-report", label: "Sales Report", href: "/admin/financial/reports/sales-report" },
  { key: "purchase-report", label: "Purchase Report", href: "/admin/financial/reports/purchase-report" },
  { key: "inventory-valuation", label: "Inventory Valuation", href: "/admin/financial/reports/inventory-valuation" },
  { key: "inventory-movement", label: "Inventory Movement", href: "/admin/financial/reports/inventory-movement" },
  { key: "expense-report", label: "Expense Report", href: "/admin/financial/reports/expense-report" },
  { key: "revenue-report", label: "Revenue Report", href: "/admin/financial/reports/revenue-report" },
  { key: "tax-summary", label: "Tax Summary", href: "/admin/financial/reports/tax-summary" },
  { key: "vat-gst", label: "VAT/GST", href: "/admin/financial/reports/vat-gst" },
  { key: "payroll-report", label: "Payroll Report", href: "/admin/financial/reports/payroll-report" },
  { key: "profitability-report", label: "Profitability Report", href: "/admin/financial/reports/profitability-report" },
  { key: "budget-vs-actual", label: "Budget vs Actual", href: "/admin/financial/reports/budget-vs-actual" },
  { key: "cogs-report", label: "COGS Report", href: "/admin/financial/reports/cogs-report" },
  { key: "customer-statement", label: "Customer Statement", href: "/admin/financial/reports/customer-statement" },
  { key: "supplier-statement", label: "Supplier Statement", href: "/admin/financial/reports/supplier-statement" },
  { key: "bank-reconciliation", label: "Bank Reconciliation", href: "/admin/financial/reports/bank-reconciliation" },
  { key: "payment-method-report", label: "Payment Method Report", href: "/admin/financial/reports/payment-method-report" },
  { key: "daily-sales", label: "Daily Sales", href: "/admin/financial/reports/daily-sales" },
  { key: "weekly-sales", label: "Weekly Sales", href: "/admin/financial/reports/weekly-sales" },
  { key: "monthly-sales", label: "Monthly Sales", href: "/admin/financial/reports/monthly-sales" },
  { key: "quarterly-sales", label: "Quarterly Sales", href: "/admin/financial/reports/quarterly-sales" },
  { key: "annual-financial", label: "Annual Financial", href: "/admin/financial/reports/annual-financial" },
  { key: "custom-report", label: "Custom Report", href: "/admin/financial/reports/custom-report" },
];

export default function ReportsPage() {

  return (
    <div className="space-y-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{"Reports"}</h2>
        <p className="font-body-md text-body-md text-outline mt-1">{"View and generate financial reports"}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        {reports.map((report) => (
          <a
            key={report.key}
            href={report.href}
            className="flex flex-col items-center gap-2 p-md bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:bg-surface-container hover:shadow-sm transition-all active:scale-[0.97]"
          >
            <span className="material-symbols-outlined text-primary text-[24px]">description</span>
            <span className="font-label-sm text-label-sm text-center text-on-surface-variant">{report.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
