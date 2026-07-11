"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUIStore } from "@/stores/ui-store"
import jsPDF from "jspdf"

const reportMeta: Record<string, { label: string; desc: string; icon: string }> = {
  "balance-sheet": { label: "Balance Sheet", desc: "Snapshot of assets, liabilities, and equity", icon: "account_balance" },
  "cash-flow": { label: "Cash Flow Statement", desc: "Cash inflows and outflows over a period", icon: "payments" },
  "equity-changes": { label: "Equity Changes", desc: "Changes in owner's equity over time", icon: "trending_up" },
  "trial-balance": { label: "Trial Balance", desc: "List of all general ledger accounts and their balances", icon: "list_alt" },
  "general-ledger": { label: "General Ledger", desc: "Complete record of all financial transactions", icon: "book" },
  "journal-report": { label: "Journal Report", desc: "Chronological record of transactions", icon: "receipt_long" },
  "ar-aging": { label: "AR Aging", desc: "Accounts receivable categorized by age", icon: "calendar_month" },
  "ap-aging": { label: "AP Aging", desc: "Accounts payable categorized by age", icon: "calendar_month" },
  "sales-report": { label: "Sales Report", desc: "Summary of sales transactions", icon: "shopping_cart" },
  "purchase-report": { label: "Purchase Report", desc: "Summary of purchase transactions", icon: "inventory" },
  "inventory-valuation": { label: "Inventory Valuation", desc: "Value of current inventory stock", icon: "warehouse" },
  "inventory-movement": { label: "Inventory Movement", desc: "Stock movements in and out", icon: "move_up" },
  "expense-report": { label: "Expense Report", desc: "Breakdown of business expenses", icon: "receipt" },
  "revenue-report": { label: "Revenue Report", desc: "Breakdown of revenue streams", icon: "trending_up" },
  "tax-summary": { label: "Tax Summary", desc: "Summary of tax liabilities and payments", icon: "account_balance" },
  "vat-gst": { label: "VAT/GST", desc: "Value-added tax and goods and services tax details", icon: "receipt_long" },
  "payroll-report": { label: "Payroll Report", desc: "Employee salary and wage details", icon: "badge" },
  "profitability-report": { label: "Profitability Report", desc: "Profit analysis by product or segment", icon: "analytics" },
  "budget-vs-actual": { label: "Budget vs Actual", desc: "Comparison of budgeted vs actual figures", icon: "compare_arrows" },
  "cogs-report": { label: "COGS Report", desc: "Cost of goods sold breakdown", icon: "manufacturing" },
  "customer-statement": { label: "Customer Statement", desc: "Customer account activity and balances", icon: "people" },
  "supplier-statement": { label: "Supplier Statement", desc: "Supplier account activity and balances", icon: "local_shipping" },
  "bank-reconciliation": { label: "Bank Reconciliation", desc: "Match bank statements with internal records", icon: "account_balance" },
  "payment-method-report": { label: "Payment Method Report", desc: "Transactions grouped by payment method", icon: "credit_card" },
  "daily-sales": { label: "Daily Sales", desc: "Sales activity summarized by day", icon: "today" },
  "weekly-sales": { label: "Weekly Sales", desc: "Sales activity summarized by week", icon: "date_range" },
  "monthly-sales": { label: "Monthly Sales", desc: "Sales activity summarized by month", icon: "calendar_month" },
  "quarterly-sales": { label: "Quarterly Sales", desc: "Sales activity summarized by quarter", icon: "calendar_view_quarter" },
  "annual-financial": { label: "Annual Financial", desc: "Yearly financial performance overview", icon: "calendar_today" },
  "custom-report": { label: "Custom Report", desc: "Build a custom financial report", icon: "tune" },
}

function fmt(v: number) {
  return "RWF " + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ReportDetailPage() {
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const meta = reportMeta[slug]
  const reportRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const [summaryData, setSummaryData] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!meta) { setLoading(false); return }
    setLoading(true)
    fetch("/api/admin/financial/reports/summary")
      .then((r) => r.json())
      .then((d) => setSummaryData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug, meta])

  const buildReportContent = useCallback(() => {
    const reportTitle = meta?.label || slug
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    let content = `${reportTitle}\n${meta?.desc || ""}\nGenerated: ${dateStr}\n\n`

    if (summaryData) {
      for (const [key, val] of Object.entries(summaryData)) {
        content += `${key.replace(/_/g, " ")}: ${fmt(val)}\n`
      }
    }
    return { reportTitle, dateStr, content }
  }, [meta, slug, summaryData])

  const downloadPDF = useCallback(() => {
    setDownloading(true)
    try {
      const { reportTitle, dateStr } = buildReportContent()
      const pdf = new jsPDF("p", "mm", "a4")
      const pageW = pdf.internal.pageSize.getWidth()
      const margin = 20
      const yStart = 30
      let y = yStart

      const heading = (text: string, size: number, style: "bold" | "normal" = "bold") => {
        pdf.setFont("helvetica", style)
        pdf.setFontSize(size)
        pdf.text(text, margin, y)
        y += size * 0.5
      }

      const body = (text: string, size = 10) => {
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(size)
        const lines = pdf.splitTextToSize(text, pageW - margin * 2)
        for (const line of lines) {
          if (y > 270) { pdf.addPage(); y = yStart }
          pdf.text(line as string, margin, y)
          y += size * 0.45
        }
      }

      const separator = () => {
        y += 3
        pdf.setDrawColor(200, 200, 200)
        pdf.line(margin, y, pageW - margin, y)
        y += 6
      }

      // Header
      pdf.setFillColor(59, 130, 246)
      pdf.rect(0, 0, pageW, 20, "F")
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(14)
      pdf.setTextColor(255, 255, 255)
      pdf.text(reportTitle, margin, 13)
      pdf.setFontSize(8)
      pdf.text(`Generated: ${dateStr}`, pageW - margin, 13, { align: "right" })

      pdf.setTextColor(0, 0, 0)
      heading(reportTitle, 18)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(meta?.desc || "", margin, y)
      y += 8
      pdf.setTextColor(0, 0, 0)

      separator()

      // Summary section
      if (summaryData && Object.keys(summaryData).length > 0) {
        heading("Summary", 14)
        y += 2

        const entries = Object.entries(summaryData)
        const colW = (pageW - margin * 2) / 2

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(9)
        pdf.setTextColor(100, 100, 100)
        pdf.text("Metric", margin, y)
        pdf.text("Value", margin + colW, y)
        y += 5
        pdf.setDrawColor(200, 200, 200)
        pdf.line(margin, y, pageW - margin, y)
        y += 4

        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)

        for (const [key, val] of entries) {
          if (y > 260) { pdf.addPage(); y = yStart }
          pdf.text(key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), margin, y)
          pdf.text(fmt(val), margin + colW, y)
          y += 7
        }
      }

      separator()

      // Footer
      y = Math.max(y, 275)
      pdf.setFont("helvetica", "italic")
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text("SmartHub Shop - Financial Report", margin, y + 5)
      pdf.text(`Page ${pdf.getNumberOfPages()}`, pageW - margin, y + 5, { align: "right" })

      pdf.save(`${reportTitle.replace(/\s+/g, "_")}_${dateStr.replace(/\s+/g, "_")}.pdf`)
    } catch {
      window.print()
    } finally {
      setDownloading(false)
    }
  }, [buildReportContent, summaryData, meta])

  const printReport = useCallback(() => {
    window.print()
  }, [])

  const emailReport = useCallback(() => {
    const { reportTitle, dateStr, content } = buildReportContent()
    const subject = encodeURIComponent(`${reportTitle} - SmartHub Shop`)
    const body = encodeURIComponent(content)
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
  }, [buildReportContent])

  if (!meta) {
    return (
      <div className="space-y-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">{"Report Not Found"}</h2>
            <p className="font-body-md text-body-md text-outline mt-1">The requested report does not exist</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-variant/50 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">{meta.label}</h2>
            <p className="font-body-md text-body-md text-outline mt-1">{meta.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="h-9 px-3 bg-surface text-on-surface-variant border border-outline-variant/20 rounded-lg font-label-sm text-label-sm hover:bg-surface-variant/50 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">{downloading ? "hourglass_top" : "download"}</span>
            <span className="hidden sm:inline">{"PDF"}</span>
          </button>
          <button
            onClick={printReport}
            className="h-9 px-3 bg-surface text-on-surface-variant border border-outline-variant/20 rounded-lg font-label-sm text-label-sm hover:bg-surface-variant/50 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span className="hidden sm:inline">{"Print"}</span>
          </button>
          <button
            onClick={emailReport}
            className="h-9 px-3 bg-surface text-on-surface-variant border border-outline-variant/20 rounded-lg font-label-sm text-label-sm hover:bg-surface-variant/50 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">email</span>
            <span className="hidden sm:inline">{"Email"}</span>
          </button>
          <button className="md:hidden p-2 text-on-surface-variant" onClick={() => setMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-outline">{"Loading..."}</div>
      ) : (
        <div ref={reportRef} className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">{meta.icon}</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">{meta.label}</h3>
              <p className="font-body-md text-body-md text-outline">{meta.desc}</p>
            </div>
          </div>

          {summaryData && Object.keys(summaryData).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-6">
              {Object.entries(summaryData).map(([key, val]) => (
                <div key={key} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/10">
                  <p className="text-label-sm font-label-sm text-outline capitalize">{key.replace(/_/g, " ")}</p>
                  <p className="text-headline-sm font-headline-sm text-on-surface">{fmt(val)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant/10 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline">construction</span>
            <p className="text-body-md font-body-md text-outline mt-3">{"Detailed report view is under development"}</p>
            <p className="text-label-sm font-label-sm text-outline mt-1">{"Filters, date ranges, and export options will be available soon"}</p>
          </div>
        </div>
      )}
    </div>
  )
}
