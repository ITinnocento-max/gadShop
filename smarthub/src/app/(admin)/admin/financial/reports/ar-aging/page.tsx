"use client";

import { useTranslation } from "@/hooks/useTranslation";

const summaryCards = [
  { label: "Total Receivables", value: "Rwf 385,000", color: "" },
  { label: "Current (0-30 Days)", value: "Rwf 210,000", color: "" },
  { label: "31-60 Days", value: "Rwf 98,000", color: "" },
  { label: "61-90 Days", value: "Rwf 45,000", color: "" },
  { label: "Over 90 Days", value: "Rwf 32,000", color: "text-red-500" },
];

const customers = [
  { name: "TechCorp Ltd", total: "Rwf 92,500", current: "Rwf 45,000", d30: "Rwf 28,000", d60: "Rwf 12,000", d90: "Rwf 5,000", over90: "Rwf 2,500" },
  { name: "GlobalTrade Inc", total: "Rwf 78,200", current: "Rwf 60,000", d30: "Rwf 10,200", d60: "Rwf 8,000", d90: "Rwf 0", over90: "Rwf 0" },
  { name: "BlueSky Services", total: "Rwf 63,800", current: "Rwf 35,000", d30: "Rwf 15,000", d60: "Rwf 8,800", d90: "Rwf 5,000", over90: "Rwf 0" },
  { name: "NovaWorks GmbH", total: "Rwf 85,000", current: "Rwf 40,000", d30: "Rwf 25,000", d60: "Rwf 10,000", d90: "Rwf 7,000", over90: "Rwf 3,000" },
  { name: "Pacific Solutions", total: "Rwf 65,500", current: "Rwf 30,000", d30: "Rwf 19,800", d60: "Rwf 9,200", d90: "Rwf 3,500", over90: "Rwf 3,000" },
];

export default function ArAgingPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.ar_aging")}</h1>
        <p className="text-gray-400 text-sm mt-1">As of December 31, 2024</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-5">
            <p className="text-sm text-gray-400">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/10 text-gray-400">
              <th className="text-left p-4">Customer Name</th>
              <th className="text-right p-4">Total Due</th>
              <th className="text-right p-4">Current</th>
              <th className="text-right p-4">1-30 Days</th>
              <th className="text-right p-4">31-60 Days</th>
              <th className="text-right p-4">61-90 Days</th>
              <th className="text-right p-4">Over 90 Days</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((row) => (
              <tr key={row.name} className="border-b border-outline-variant/10 last:border-0">
                <td className="p-4 font-medium">{row.name}</td>
                <td className="p-4 text-right font-medium">{row.total}</td>
                <td className="p-4 text-right">{row.current}</td>
                <td className="p-4 text-right">{row.d30}</td>
                <td className="p-4 text-right">{row.d60}</td>
                <td className="p-4 text-right">{row.d90}</td>
                <td className="p-4 text-right text-red-500">{row.over90}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
