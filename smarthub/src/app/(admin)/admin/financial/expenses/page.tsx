"use client"


const kpis = [
  { label: "Total Expenses", value: "Rwf 320,450.15" },
  { label: "Pending Claims", value: "Rwf 28,500" },
  { label: "Approved", value: "Rwf 245,000" },
  { label: "Recurring", value: "Rwf 46,950" },
]

const categories = [
  { name: "Marketing & Sales", pct: 42 },
  { name: "R&D/Engineering", pct: 28 },
  { name: "Admin & G&A", pct: 18 },
  { name: "Logistics", pct: 12 },
]

const claims = [
  { date: "2026-07-06", category: "Marketing", description: "Social media campaign Q3", amount: "Rwf 12,400", status: "Pending" },
  { date: "2026-07-04", category: "Travel", description: "Team flight to Kigali", amount: "Rwf 4,850", status: "Approved" },
  { date: "2026-07-02", category: "Office Supplies", description: "Printer toner & paper", amount: "Rwf 1,200", status: "Approved" },
  { date: "2026-06-30", category: "Logistics", description: "Warehouse lease payment", amount: "Rwf 8,000", status: "Pending" },
]

export default function ExpensesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">{"Expenses"}</h1>
        <p className="text-text-secondary mt-1">Track and manage business expenses</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-6">
            <p className="text-text-secondary text-sm">{kpi.label}</p>
            <p className="text-2xl font-bold text-text mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Expenses by Category</h2>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.name}>
              <div className="flex justify-between text-sm text-text mb-1">
                <span>{cat.name}</span>
                <span>{cat.pct}%</span>
              </div>
              <div className="w-full bg-outline-variant/10 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${cat.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Recent Expense Claims</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 text-text-secondary">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.date + c.description} className="border-b border-outline-variant/10 text-text">
                  <td className="py-3">{c.date}</td>
                  <td className="py-3">{c.category}</td>
                  <td className="py-3">{c.description}</td>
                  <td className="py-3">{c.amount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.status === "Approved" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
