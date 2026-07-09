"use client"

const kpis = [
  { label: "Total Invoiced", value: "Rwf 892,400" },
  { label: "Paid", value: "Rwf 645,300" },
  { label: "Outstanding", value: "Rwf 247,100" },
  { label: "Overdue", value: "Rwf 38,500", error: true },
]

const invoices = [
  { id: "INV-2026-001", customer: "Rwanda Tech Solutions", date: "2026-07-01", amount: "Rwf 24,500", status: "Paid" },
  { id: "INV-2026-002", customer: "Kigali Heights Ltd", date: "2026-07-03", amount: "Rwf 18,200", status: "Unpaid" },
  { id: "INV-2026-003", customer: "East Africa Logistics", date: "2026-06-28", amount: "Rwf 42,000", status: "Paid" },
  { id: "INV-2026-004", customer: "Mountain View Hotel", date: "2026-06-15", amount: "Rwf 9,800", status: "Overdue" },
  { id: "INV-2026-005", customer: "Green Energy Rwanda", date: "2026-07-05", amount: "Rwf 31,500", status: "Unpaid" },
]

const quickLinks = ["Sales Invoices", "Purchase Invoices", "Credit Notes", "Debit Notes", "Quotations", "Receipts"]

export default function InvoicingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">{"Invoicing"}</h1>
        <p className="text-text-secondary mt-1">Create and manage invoices</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-6">
            <p className="text-text-secondary text-sm">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.error ? "text-red-500" : "text-text"}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Recent Invoices</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 text-text-secondary">
                <th className="pb-3 font-medium">Invoice #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-outline-variant/10 text-text">
                  <td className="py-3">{inv.id}</td>
                  <td className="py-3">{inv.customer}</td>
                  <td className="py-3">{inv.date}</td>
                  <td className="py-3">{inv.amount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      inv.status === "Paid" ? "bg-green-500/10 text-green-600" :
                      inv.status === "Overdue" ? "bg-red-500/10 text-red-600" :
                      "bg-amber-500/10 text-amber-600"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-5 flex items-center gap-3 text-text font-medium hover:bg-outline-variant/5 transition-colors"
            >
              <span className="material-symbols-outlined text-icon">description</span>
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
