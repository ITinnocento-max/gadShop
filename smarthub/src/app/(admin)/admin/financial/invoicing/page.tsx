"use client"

import { useEffect, useState } from "react"
import { useUIStore } from "@/stores/ui-store"

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
        <button className="md:hidden p-2 text-on-surface-variant" onClick={() => setMobileMenuOpen(true)}>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-outline">{"Loading..."}</div>
      ) : !data ? (
        <div className="text-center py-12 text-outline">{"Failed to load invoicing data"}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {kpiEntries.map((kpi) => (
              <div key={kpi.key} className={`bg-surface p-lg rounded-xl shadow-soft border ${kpi.error ? "border-error/20" : "border-outline-variant/10"} flex items-center gap-4`}>
                <div className={`w-12 h-12 ${kpi.error ? "bg-error/10 text-error" : "bg-primary/10 text-primary"} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[24px]">{kpi.icon}</span>
                </div>
                <div>
                  <p className="text-label-sm font-label-sm text-outline">{kpi.label}</p>
                  <p className={`text-headline-sm font-headline-sm ${kpi.error ? "text-error" : "text-on-surface"}`}>{fmt(kpi.value)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
            {data.statusSummary.filter((s) => s.status !== "Cancelled").map((s) => (
              <div key={s.status} className="bg-surface p-xl rounded-2xl shadow-soft border border-outline-variant/10 flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${s.status === "Paid" ? "bg-secondary/10" : s.status === "Overdue" ? "bg-error/10" : "bg-tertiary/10"}`}>
                  <span className="material-symbols-outlined text-[28px] text-on-surface-variant">{statusIcons[s.status]}</span>
                </div>
                <div>
                  <p className="text-outline font-label-md text-label-md">{s.status}</p>
                  <p className="text-headline-md font-headline-md text-on-surface">{s.count}</p>
                  <p className="text-body-md font-body-md text-on-surface-variant">{fmt(s.total)}</p>
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
        </>
      )}
    </div>
  )
}
