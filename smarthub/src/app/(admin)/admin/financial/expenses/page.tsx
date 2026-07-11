"use client"

import { useEffect, useState, useCallback } from "react"
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

interface Category { id: string; name: string }

interface ExpensesResponse {
  kpis: Kpis
  categoryBreakdown: CategoryBreakdown[]
  claims: Claim[]
  recurringExpenses: RecurringExpense[]
  categories: Category[]
}

interface FormItem {
  description: string
  amount: string
  categoryId: string
}

const statusFlow: Record<string, string[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["APPROVED", "REJECTED"],
  APPROVED: ["PAID"],
  REJECTED: ["SUBMITTED"],
  PAID: [],
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
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formItems, setFormItems] = useState<FormItem[]>([
    { description: "", amount: "", categoryId: "" },
  ])
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/financial/expenses").then((r) => r.json())
      setData(res)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetForm = () => {
    setFormTitle("")
    setFormDescription("")
    setFormItems([{ description: "", amount: "", categoryId: "" }])
  }

  const addItem = () => {
    setFormItems((prev) => [...prev, { description: "", amount: "", categoryId: "" }])
  }

  const removeItem = (idx: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: keyof FormItem, value: string) => {
    setFormItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = async () => {
    if (!formTitle || formItems.some((i) => !i.description || !i.amount || !i.categoryId)) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/financial/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || undefined,
          submittedById: "admin",
          items: formItems.map((i) => ({
            description: i.description,
            amount: parseFloat(i.amount),
            categoryId: i.categoryId,
          })),
        }),
      })
      if (res.ok) {
        setModalOpen(false)
        resetForm()
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (claimId: string, newStatus: string) => {
    setUpdating(claimId)
    try {
      const res = await fetch(`/api/admin/financial/expenses/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) fetchData()
    } catch {
      // ignore
    } finally {
      setUpdating(null)
    }
  }

  const itemTotal = formItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)

  const kpiEntries = data
    ? [
        { key: "totalExpenses", label: "Total Expenses", value: data.kpis.totalExpenses },
        { key: "pendingClaimsTotal", label: "Pending Claims", value: data.kpis.pendingClaimsTotal },
        { key: "approvedTotal", label: "Approved", value: data.kpis.approvedTotal },
        { key: "recurringTotal", label: "Recurring", value: data.kpis.recurringTotal },
      ]
    : []

  return (
    <>
    <div className="space-y-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">{"Expenses"}</h2>
          <p className="font-body-md text-body-md text-outline mt-1">Track and manage business expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="h-10 px-4 bg-primary text-white rounded-lg font-label-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {"New Expense"}
          </button>
          <button className="md:hidden p-2 text-on-surface-variant" onClick={() => setMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
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
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Actions</th>
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
                      <td className="py-3 pr-4">
                        <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${statusStyles[c.status] || "bg-surface-container-high text-outline"}`}>
                          {statusLabels[c.status] || c.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {statusFlow[c.status]?.length > 0 ? (
                          <select
                            value=""
                            onChange={(e) => updateStatus(c.id, e.target.value)}
                            disabled={updating === c.id}
                            className="px-2 py-1 rounded-lg font-label-sm text-label-sm border border-outline-variant/20 bg-surface-container-low outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          >
                            <option value="" disabled>{"Actions"}</option>
                            {statusFlow[c.status].map((s) => (
                              <option key={s} value={s}>{statusLabels[s] || s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-label-sm text-outline">{"—"}</span>
                        )}
                        {updating === c.id && (
                          <span className="material-symbols-outlined text-[14px] animate-spin ml-1 align-middle">hourglass_top</span>
                        )}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModalOpen(false)}>
          <div
            className="bg-surface w-[calc(100vw-2rem)] max-w-5xl rounded-2xl shadow-xl border border-outline-variant/10 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface">{"New Expense Claim"}</h3>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-label-sm font-label-sm text-outline mb-1.5">{"Title"}</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Office supplies for Q3"
                />
              </div>

              <div>
                <label className="block text-label-sm font-label-sm text-outline mb-1.5">{"Description (optional)"}</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full h-20 px-3 py-2 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Additional details..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-label-sm font-label-sm text-outline">{"Items"}</label>
                  <button
                    onClick={addItem}
                    className="text-label-sm font-label-sm text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    {"Add Item"}
                  </button>
                </div>
                <div className="space-y-3">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <select
                        value={item.categoryId}
                        onChange={(e) => updateItem(idx, "categoryId", e.target.value)}
                        className="w-44 h-11 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">{"Category"}</option>
                        {data?.categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        className="flex-1 h-11 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Description"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.amount}
                        onChange={(e) => updateItem(idx, "amount", e.target.value)}
                        className="w-28 h-11 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Amount"
                      />
                      {formItems.length > 1 && (
                        <button
                          onClick={() => removeItem(idx)}
                          className="h-11 w-11 flex items-center justify-center text-error hover:bg-error/10 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-right mt-2 text-label-sm font-label-sm text-on-surface-variant">
                  {"Total: "}{fmt(itemTotal)}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => { setModalOpen(false); resetForm(); }}
                  className="h-10 px-5 border border-outline-variant/20 rounded-lg font-label-md text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                >
                  {"Cancel"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formTitle || formItems.some((i) => !i.description || !i.amount || !i.categoryId)}
                  className="h-10 px-5 bg-primary text-white rounded-lg font-label-md hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center gap-2"
                >
                  {submitting && <span className="material-symbols-outlined text-[16px] animate-spin">hourglass_top</span>}
                  {"Submit Claim"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
