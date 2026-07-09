"use client"

import { useTranslation } from "@/hooks/useTranslation"

const accounts = [
  { name: "Main Operating Account", balance: 284500.0, bank: "Chase Bank", last4: "4521" },
  { name: "Savings Account", balance: 150000.0, bank: "Chase Bank", last4: "7890" },
  { name: "RWF Business Account", balance: 95200.0, bank: "Bank of Kigali", last4: "3321" },
]

const transfers = [
  { date: "2026-07-05", from: "Main Operating", to: "Savings", amount: "+Rwf 50,000.00", status: "Completed" },
  { date: "2026-07-03", from: "RWF Business", to: "Main Operating", amount: "+Rwf 12,500.00", status: "Completed" },
  { date: "2026-07-01", from: "Main Operating", to: "Vendor Payment", amount: "-Rwf 8,200.00", status: "Pending" },
  { date: "2026-06-28", from: "Revenue Account", to: "Main Operating", amount: "+Rwf 94,300.00", status: "Completed" },
]

const quickActions = ["New Transfer", "Reconcile", "Deposit", "Withdrawal"]

export default function BankingPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">{t("admin.banking")}</h1>
        <p className="text-text-secondary mt-1">Manage bank accounts and transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.name} className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">{acc.name}</span>
              <span className="material-symbols-outlined text-icon">account_balance</span>
            </div>
            <p className="text-3xl font-bold text-text">RWF {acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-text-secondary text-sm">{acc.bank} &bull; ****{acc.last4}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Recent Transfers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 text-text-secondary">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">From</th>
                <th className="pb-3 font-medium">To</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((tr) => (
                <tr key={tr.date + tr.to} className="border-b border-outline-variant/10 text-text">
                  <td className="py-3">{tr.date}</td>
                  <td className="py-3">{tr.from}</td>
                  <td className="py-3">{tr.to}</td>
                  <td className="py-3">{tr.amount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tr.status === "Completed" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {tr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {quickActions.map((action) => (
          <a
            key={action}
            href="#"
            className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft px-6 py-3 text-text font-medium hover:bg-outline-variant/5 transition-colors"
          >
            {action}
          </a>
        ))}
      </div>
    </div>
  )
}
