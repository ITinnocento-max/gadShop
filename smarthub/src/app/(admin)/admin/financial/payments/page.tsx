"use client";

import { useTranslation } from "@/hooks/useTranslation";

const gateways = [
  { icon: "smartphone", name: "MTN MoMo", total: "Rwf 45,200", successful: 342, failed: 12, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  { icon: "smartphone", name: "Airtel Money", total: "Rwf 28,400", successful: 198, failed: 8, color: "text-error", bg: "bg-error/10" },
  { icon: "credit_card", name: "Visa", total: "Rwf 38,100", successful: 156, failed: 3, color: "text-primary", bg: "bg-primary/10" },
  { icon: "credit_card", name: "Mastercard", total: "Rwf 12,630", successful: 67, failed: 2, color: "text-secondary", bg: "bg-secondary/10" },
  { icon: "payments", name: "Cash on Delivery", total: "Rwf 4,100", successful: 89, failed: 5, color: "text-tertiary", bg: "bg-tertiary/10" },
];

const statusSummaries = [
  { icon: "check_circle", key: "successful_payments", count: 852, amount: "Rwf 128,430", color: "text-secondary", bg: "bg-secondary/10" },
  { icon: "cancel", key: "failed_payments", count: 30, amount: "Rwf 4,520", color: "text-error", bg: "bg-error/10" },
  { icon: "schedule", key: "pending_payments", count: 45, amount: "Rwf 6,780", color: "text-tertiary", bg: "bg-tertiary/10" },
  { icon: "undo", key: "refunds", count: 22, amount: "Rwf 3,210", color: "text-outline", bg: "bg-surface-container-high" },
];

const recentTransactions = [
  { id: "TXN-89234", date: "2026-07-08", gateway: "MTN MoMo", customer: "Alex Johnson", amount: "Rwf 1,240.00", status: "successful", reference: "INV-9082" },
  { id: "TXN-89233", date: "2026-07-08", gateway: "Visa", customer: "Modern Tech Ltd", amount: "Rwf 5,800.00", status: "successful", reference: "INV-9081" },
  { id: "TXN-89232", date: "2026-07-07", gateway: "Mastercard", customer: "Sarah Williams", amount: "Rwf 450.00", status: "pending", reference: "INV-9080" },
  { id: "TXN-89231", date: "2026-07-07", gateway: "Airtel Money", customer: "Growth Corp", amount: "Rwf 12,000.00", status: "failed", reference: "INV-9079" },
  { id: "TXN-89230", date: "2026-07-06", gateway: "Cash on Delivery", customer: "Emily Davis", amount: "Rwf 89.00", status: "refunded", reference: "INV-9078" },
  { id: "TXN-89229", date: "2026-07-06", gateway: "MTN MoMo", customer: "James Wilson", amount: "Rwf 320.00", status: "successful", reference: "INV-9077" },
];

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    successful: "bg-secondary/10 text-secondary",
    failed: "bg-error/10 text-error",
    pending: "bg-tertiary/10 text-tertiary",
    refunded: "bg-surface-container-high text-outline",
  };
  return styles[status] || "bg-surface-container-high text-outline";
};

export default function PaymentsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{t("admin.payment_monitoring")}</h2>
        <p className="font-body-md text-body-md text-outline mt-1">Monitor and reconcile payment transactions across all gateways</p>
      </div>
      {/* Gateway Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-md">
        {gateways.map((gw) => (
          <div key={gw.name} className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${gw.bg} ${gw.color} rounded-xl flex items-center justify-center`}>
                <span className="material-symbols-outlined">{gw.icon}</span>
              </div>
              <span className="font-label-md text-on-surface font-semibold">{gw.name}</span>
            </div>
            <div>
              <p className="text-headline-md font-headline-md text-on-surface">{gw.total}</p>
            </div>
            <div className="flex justify-between text-label-sm font-label-sm text-outline">
              <span>{gw.successful} Successful</span>
              <span>{gw.failed} Failed</span>
            </div>
          </div>
        ))}
      </div>
      {/* Transaction Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {statusSummaries.map((s) => (
          <div key={s.key} className="bg-surface p-md rounded-xl shadow-soft border border-outline-variant/10 flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="text-outline font-label-sm text-label-sm">{t(`admin.${s.key}`)}</p>
              <p className="text-headline-sm font-headline-sm text-on-surface">{s.count}</p>
              <p className="text-label-sm font-label-sm text-on-surface-variant">{s.amount}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Recent Transactions Table */}
      <div className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10 overflow-x-auto">
        <h3 className="font-headline-md text-headline-md mb-1">Recent Transactions</h3>
        <p className="text-outline font-label-md mb-xl">Latest payment activity across all gateways</p>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/10 text-label-sm font-label-sm text-outline uppercase">
              <th className="pb-3 pr-4">Transaction ID</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4">Gateway</th>
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4 text-right">Amount</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Reference</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-outline-variant/10 last:border-0">
                <td className="py-3 pr-4 font-label-md text-on-surface">{tx.id}</td>
                <td className="py-3 pr-4 font-label-md text-on-surface-variant">{tx.date}</td>
                <td className="py-3 pr-4 font-label-md text-on-surface-variant">{tx.gateway}</td>
                <td className="py-3 pr-4 font-label-md text-on-surface">{tx.customer}</td>
                <td className="py-3 pr-4 font-label-md text-right text-on-surface">{tx.amount}</td>
                <td className="py-3 pr-4">
                  <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${statusBadge(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-3 font-label-md text-outline">{tx.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Settlement Reports Button */}
      <div className="flex justify-end">
        <a
          href="#"
          className="inline-flex items-center gap-2 bg-surface px-lg py-3 rounded-xl shadow-soft border border-outline-variant/10 text-primary font-label-md hover:bg-surface-container-high transition-all active:scale-[0.97]"
        >
          <span className="material-symbols-outlined">description</span>
          Settlement Reports
        </a>
      </div>
    </div>
  );
}
