"use client"

import { useEffect, useState } from "react"
import { useUIStore } from "@/stores/ui-store"

interface ClaimItem {
  id: string
  description: string
  amount: number
  categoryName: string
}

interface Claim {
  id: string
  claimNumber: string
  title: string
  description: string | null
  status: string
  totalAmount: number
  createdAt: string
  submittedById: string
  items: ClaimItem[]
}

interface CategoryBreakdown {
  name: string
  total: number
  pct: number
}

interface RecurringExpense {
  id: string
  description: string
  amount: number
  frequency: string
  nextDueDate: string
}

interface Kpis {
  totalExpenses: number
  pendingClaimsTotal: number
  approvedTotal: number
  recurringTotal: number
}

interface ExpensesResponse {
  kpis: Kpis
  categoryBreakdown: CategoryBreakdown[]
  claims: Claim[]
  recurringExpenses: RecurringExpense[]
}

const statusStyles: Record<string, string> = {
  APPROVED: "bg-secondary/10 text-secondary",
  PAID: "bg-primary/10 text-primary",
  SUBMITTED: "bg-tertiary/10 text-tertiary",
  DRAFT: "bg-surface-container-high text-outline",
  REJECTED: "bg-error/10 text-error",
}

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
}

const kpiIcons: Record<string, string> = {
  totalExpenses: "account_balance",
  pendingClaimsTotal: "pending_actions",
  approvedTotal: "verified",
  recurringTotal: "repeat",
}

function fmt(v: number) {
  return "RWF " + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function ExpensesPage() {
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const [data, setData] = useState<ExpensesResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/admin/financial/expenses").then((r) => r.json())
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
        { key: "totalExpenses", label: "Total Expenses", value: data.kpis.totalExpenses },
        { key: "pendingClaimsTotal", label: "Pending Claims", value: data.kpis.pendingClaimsTotal },
        { key: "approvedTotal", label: "Approved", value: data.kpis.approvedTotal },
        { key: "recurringTotal", label: "Recurring", value: data.kpis.recurringTotal },
      ]
    : []

  return (
    <div className="space-y-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">{"Expenses"}</h2>
          <p className="font-body-md text-body-md text-outline mt-1">Track and manage business expenses</p>
        </div>
        <button className="md:hidden p-2 text-on-surface-variant" onClick={() => setMobileMenuOpen(true)}>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-outline">{"Loading..."}</div>
      ) : !data ? (
        <div className="text-center py-12 text-outline">{"Failed to load expenses"}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {kpiEntries.map((kpi) => (
              <div key={kpi.key} className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">{kpiIcons[kpi.key]}</span>
                </div>
                <div>
                  <p className="text-label-sm font-label-sm text-outline">{kpi.label}</p>
                  <p className="text-headline-sm font-headline-sm text-on-surface">{fmt(kpi.value)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            <div className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-4">{"Expenses by Category"}</h3>
              {data.categoryBreakdown.length === 0 ? (
                <p className="text-outline font-body-md">{"No expense data yet"}</p>
              ) : (
                <div className="space-y-4">
                  {data.categoryBreakdown.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex justify-between text-label-sm font-label-sm text-on-surface mb-1">
                        <span>{cat.name}</span>
                        <span>{cat.pct}%</span>
                      </div>
                      <div className="w-full bg-outline-variant/10 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${cat.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-4">{"Recurring Expenses"}</h3>
              {data.recurringExpenses.length === 0 ? (
                <p className="text-outline font-body-md">{"No recurring expenses"}</p>
              ) : (
                <div className="space-y-3">
                  {data.recurringExpenses.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                      <div>
                        <p className="font-label-md text-on-surface">{r.description}</p>
                        <p className="text-label-sm text-outline">{r.frequency} &middot; Next: {fmtDate(r.nextDueDate)}</p>
                      </div>
                      <p className="font-label-md text-on-surface">{fmt(r.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10 overflow-x-auto">
            <h3 className="font-headline-md text-headline-md mb-1">{"Recent Expense Claims"}</h3>
            <p className="text-outline font-label-md mb-xl">{data.claims.length} claims</p>
            {data.claims.length === 0 ? (
              <p className="text-center py-12 text-outline">{"No expense claims yet"}</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-label-sm font-label-sm text-outline uppercase">
                    <th className="pb-3 pr-4">Claim</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 pr-4 text-right">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.claims.map((c) => (
                    <tr key={c.id} className="border-b border-outline-variant/10 last:border-0">
                      <td className="py-3 pr-4">
                        <span className="font-label-md text-on-surface">{c.claimNumber}</span>
                      </td>
                      <td className="py-3 pr-4 font-label-md text-on-surface-variant">{fmtDate(c.createdAt)}</td>
                      <td className="py-3 pr-4">
                        <span className="font-label-md text-on-surface-variant">
                          {c.items.map((i) => i.categoryName).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-label-md text-on-surface">{c.title}</span>
                        {c.description && <p className="text-label-sm text-outline">{c.description}</p>}
                      </td>
                      <td className="py-3 pr-4 font-label-md text-right text-on-surface">{fmt(c.totalAmount)}</td>
                      <td className="py-3">
                        <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${statusStyles[c.status] || "bg-surface-container-high text-outline"}`}>
                          {statusLabels[c.status] || c.status}
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
