"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useUIStore } from "@/stores/ui-store"
import jsPDF from "jspdf"

interface Invoice {
  id: string
  fullId: string
  customer: string
  date: string
  amount: number
  status: string
  paymentMethod: string | null
}

interface StatusSummary {
  status: string
  total: number
  count: number
}

interface Kpis {
  totalInvoiced: number
  paid: number
  outstanding: number
  overdue: number
}

interface InvoicingResponse {
  kpis: Kpis
  invoices: Invoice[]
  statusSummary: StatusSummary[]
}

const statusStyles: Record<string, string> = {
  Paid: "bg-secondary/10 text-secondary",
  Unpaid: "bg-tertiary/10 text-tertiary",
  Overdue: "bg-error/10 text-error",
  Cancelled: "bg-surface-container-high text-outline",
}

const statusIcons: Record<string, string> = {
  Paid: "check_circle",
  Unpaid: "pending",
  Overdue: "error",
  Cancelled: "cancel",
}

function fmt(v: number) {
  return "RWF " + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function InvoicingPage() {
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const [data, setData] = useState<InvoicingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/admin/financial/invoicing").then((r) => r.json())
        setData(res)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const downloadPDF = useCallback(() => {
    setDownloading(true)
    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const pageW = pdf.internal.pageSize.getWidth()
      const margin = 20
      let y = 30
      const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

      pdf.setFillColor(59, 130, 246)
      pdf.rect(0, 0, pageW, 20, "F")
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(14)
      pdf.setTextColor(255, 255, 255)
      pdf.text("Invoicing", margin, 13)
      pdf.setFontSize(8)
      pdf.text(`Generated: ${dateStr}`, pageW - margin, 13, { align: "right" })
      pdf.setTextColor(0, 0, 0)

      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(18)
      pdf.text("Invoicing", margin, y)
      y += 10
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text("Create and manage invoices", margin, y)
      y += 10
      pdf.setTextColor(0, 0, 0)

      if (data) {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(12)
        pdf.text("Summary", margin, y)
        y += 8
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        const summaryItems = [
          ["Total Invoiced", fmt(data.kpis.totalInvoiced)],
          ["Paid", fmt(data.kpis.paid)],
          ["Outstanding", fmt(data.kpis.outstanding)],
          ["Overdue", fmt(data.kpis.overdue)],
        ]
        for (const [label, val] of summaryItems) {
          if (y > 260) { pdf.addPage(); y = 30 }
          pdf.text(`${label}: ${val}`, margin, y)
          y += 6
        }
        y += 5

        if (data.invoices.length > 0) {
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(12)
          pdf.text("Recent Invoices", margin, y)
          y += 8
          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(9)
          for (const inv of data.invoices.slice(0, 30)) {
            if (y > 260) { pdf.addPage(); y = 30 }
            pdf.text(`#${inv.id} | ${inv.customer} | ${fmt(inv.amount)} | ${inv.status}`, margin, y)
            y += 5
          }
        }
      }

      y = Math.max(y, 275)
      pdf.setFont("helvetica", "italic")
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text("SmartHub Shop - Invoice Report", margin, y + 5)
      pdf.text(`Page ${pdf.getNumberOfPages()}`, pageW - margin, y + 5, { align: "right" })
      pdf.save(`Invoicing_${dateStr.replace(/\s+/g, "_")}.pdf`)
    } catch { window.print() } finally { setDownloading(false) }
  }, [data])

  const printReport = useCallback(() => { window.print() }, [])

  const emailReport = useCallback(() => {
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    let content = `Invoicing Report\nGenerated: ${dateStr}\n\n`
    if (data) {
      content += `Total Invoiced: ${fmt(data.kpis.totalInvoiced)}\nPaid: ${fmt(data.kpis.paid)}\nOutstanding: ${fmt(data.kpis.outstanding)}\nOverdue: ${fmt(data.kpis.overdue)}\n\n`
      content += "Recent Invoices:\n"
      for (const inv of data.invoices.slice(0, 20)) content += `#${inv.id} | ${inv.customer} | ${fmt(inv.amount)} | ${inv.status}\n`
    }
    window.open(`mailto:?subject=${encodeURIComponent("Invoicing Report - SmartHub Shop")}&body=${encodeURIComponent(content)}`, "_blank")
  }, [data])

  const kpiEntries = data
    ? [
        { key: "totalInvoiced", label: "Total Invoiced", value: data.kpis.totalInvoiced, icon: "receipt_long" },
        { key: "paid", label: "Paid", value: data.kpis.paid, icon: "check_circle" },
        { key: "outstanding", label: "Outstanding", value: data.kpis.outstanding, icon: "account_balance" },
        { key: "overdue", label: "Overdue", value: data.kpis.overdue, icon: "warning", error: true },
      ]
    : []

  return (
    <div className="space-y-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">{"Invoicing"}</h2>
          <p className="font-body-md text-body-md text-outline mt-1">Create and manage invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadPDF} disabled={downloading} className="h-9 px-3 bg-surface text-on-surface-variant border border-outline-variant/20 rounded-lg font-label-sm text-label-sm hover:bg-surface-variant/50 transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">{downloading ? "hourglass_top" : "download"}</span>
            <span className="hidden sm:inline">{"PDF"}</span>
          </button>
          <button onClick={printReport} className="h-9 px-3 bg-surface text-on-surface-variant border border-outline-variant/20 rounded-lg font-label-sm text-label-sm hover:bg-surface-variant/50 transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span className="hidden sm:inline">{"Print"}</span>
          </button>
          <button onClick={emailReport} className="h-9 px-3 bg-surface text-on-surface-variant border border-outline-variant/20 rounded-lg font-label-sm text-label-sm hover:bg-surface-variant/50 transition-colors flex items-center gap-1.5">
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
      ) : !data ? (
        <div className="text-center py-12 text-outline">{"Failed to load invoicing data"}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {kpiEntries.map((kpi) => (
              <div key={kpi.key} className={`bg-surface p-lg rounded-xl shadow-soft border ${kpi.error ? "border-error/20" : "border-outline-variant/10"} flex items-center gap-3`}>
                <div className={`w-10 h-10 ${kpi.error ? "bg-error/10 text-error" : "bg-primary/10 text-primary"} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[18px]">{kpi.icon}</span>
                </div>
                <div>
                  <p className="text-label-sm font-label-sm text-outline">{kpi.label}</p>
                  <p className={`text-label-lg font-label-lg ${kpi.error ? "text-error" : "text-on-surface"}`}>{fmt(kpi.value)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
            {data.statusSummary.filter((s) => s.status !== "Cancelled").map((s) => (
              <div key={s.status} className="bg-surface px-lg py-md rounded-2xl shadow-soft border border-outline-variant/10 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.status === "Paid" ? "bg-secondary/10" : s.status === "Overdue" ? "bg-error/10" : "bg-tertiary/10"}`}>
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{statusIcons[s.status]}</span>
                </div>
                <div>
                  <p className="text-outline font-label-sm text-label-sm">{s.status}</p>
                  <p className="text-label-lg font-label-lg text-on-surface">{s.count}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">{fmt(s.total)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10 overflow-x-auto">
            <h3 className="font-headline-md text-headline-md mb-1">{"Recent Invoices"}</h3>
            <p className="text-outline font-label-md mb-xl">{data.invoices.length} invoices</p>
            {data.invoices.length === 0 ? (
              <p className="text-center py-12 text-outline">{"No invoices found"}</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-label-sm font-label-sm text-outline uppercase">
                    <th className="pb-3 pr-4">Invoice #</th>
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Payment</th>
                    <th className="pb-3 pr-4 text-right">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.invoices.map((inv) => (
                    <tr key={inv.fullId} className="border-b border-outline-variant/10 last:border-0">
                      <td className="py-3 pr-4">
                        <span className="font-label-md text-on-surface">#{inv.id}</span>
                      </td>
                      <td className="py-3 pr-4 font-label-md text-on-surface-variant">{inv.customer}</td>
                      <td className="py-3 pr-4 font-label-md text-on-surface-variant">{fmtDate(inv.date)}</td>
                      <td className="py-3 pr-4 font-label-md text-on-surface-variant">{inv.paymentMethod || "—"}</td>
                      <td className="py-3 pr-4 font-label-md text-right text-on-surface">{fmt(inv.amount)}</td>
                      <td className="py-3">
                        <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${statusStyles[inv.status] || "bg-surface-container-high text-outline"}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">{"Quick Actions"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Sales Invoices", "Purchase Invoices", "Credit Notes", "Debit Notes", "Quotations", "Receipts"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10 flex items-center gap-3 text-on-surface font-label-md hover:bg-outline-variant/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-icon text-on-surface-variant">description</span>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
