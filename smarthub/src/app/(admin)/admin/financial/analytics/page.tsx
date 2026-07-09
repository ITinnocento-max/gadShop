"use client";

import { useTranslation } from "@/hooks/useTranslation";

const timePeriods = ["daily", "weekly", "monthly", "quarterly", "yearly"] as const;

const metrics = [
  { key: "sales_analytics", icon: "shopping_cart", value: "Rwf 892,400", trend: "up" },
  { key: "customer_analytics", icon: "people", value: "2,847", trend: "up" },
  { key: "product_analytics", icon: "inventory_2", value: "1,243", trend: "down" },
  { key: "inventory_analytics", icon: "warehouse", value: "Rwf 620,000", trend: "down" },
  { key: "marketing_analytics", icon: "campaign", value: "Rwf 135,000", trend: "up" },
  { key: "finance_analytics", icon: "account_balance", value: "Rwf 1.2M", trend: "up" },
  { key: "tax_analytics", icon: "request_quote", value: "Rwf 142,700", trend: "up" },
  { key: "payment_analytics", icon: "payments", value: "924", trend: "up" },
  { key: "revenue_analytics", icon: "trending_up", value: "Rwf 1.45M", trend: "up" },
  { key: "profit_analytics", icon: "savings", value: "Rwf 520,712", trend: "up" },
  { key: "expense_analytics", icon: "money_off", value: "Rwf 320,450", trend: "down" },
];

const barData = [
  { label: "Jan", value: 65 },
  { label: "Feb", value: 72 },
  { label: "Mar", value: 68 },
  { label: "Apr", value: 85 },
  { label: "May", value: 78 },
  { label: "Jun", value: 92 },
];

const gatewayDistribution = [
  { name: "MTN MoMo", pct: 35, color: "bg-[#f59e0b]" },
  { name: "Airtel Money", pct: 22, color: "bg-error" },
  { name: "Visa", pct: 30, color: "bg-primary" },
  { name: "Mastercard", pct: 10, color: "bg-secondary" },
  { name: "Cash on Delivery", pct: 3, color: "bg-tertiary" },
];

export default function AnalyticsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{t("admin.analytics")}</h2>
        <p className="font-body-md text-body-md text-outline mt-1">Interactive dashboards with daily, weekly, monthly, quarterly, and yearly comparisons</p>
      </div>
      {/* Time Period Filter */}
      <div className="flex flex-wrap gap-2">
        {timePeriods.map((period, i) => (
          <button
            key={period}
            className={`px-4 py-2 rounded-xl font-label-md text-label-md transition-all active:scale-[0.97] ${
              i === 0
                ? "bg-primary text-on-primary shadow-soft"
                : "bg-surface text-outline border border-outline-variant/10 hover:bg-surface-container-high"
            }`}
          >
            {t(`admin.${period}`)}
          </button>
        ))}
      </div>
      {/* Analytics Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-md">
        {metrics.map((m) => (
          <div key={m.key} className="bg-surface p-md rounded-xl shadow-soft border border-outline-variant/10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
              </div>
              <span className={`material-symbols-outlined text-sm ${m.trend === "up" ? "text-secondary" : "text-error"}`}>
                {m.trend === "up" ? "arrow_upward" : "arrow_downward"}
              </span>
            </div>
            <p className="text-headline-sm font-headline-sm text-on-surface">{m.value}</p>
            <p className="text-label-sm font-label-sm text-outline">{t(`admin.${m.key}`)}</p>
          </div>
        ))}
      </div>
      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Revenue vs Expenses Trend */}
        <div className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10">
          <h3 className="font-headline-md text-headline-md mb-1">Revenue vs Expenses Trend</h3>
          <p className="text-outline font-label-md mb-lg">Monthly comparison for the current year</p>
          <div className="h-64 flex items-end gap-3 justify-center">
            {barData.map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-2 w-12">
                <div className="w-full flex flex-col items-center gap-0.5">
                  <div
                    className="w-full bg-primary rounded-t-md"
                    style={{ height: `${b.value}%`, maxHeight: "180px", minHeight: "20px" }}
                  />
                  <div
                    className="w-full bg-error/60 rounded-t-md"
                    style={{ height: `${b.value * 0.55}%`, maxHeight: "100px", minHeight: "10px" }}
                  />
                </div>
                <span className="text-label-sm font-label-sm text-outline">{b.label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-label-sm font-label-sm text-outline">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-error/60" />
              <span className="text-label-sm font-label-sm text-outline">Expenses</span>
            </div>
          </div>
        </div>
        {/* Payment Gateway Distribution */}
        <div className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10">
          <h3 className="font-headline-md text-headline-md mb-1">Payment Gateway Distribution</h3>
          <p className="text-outline font-label-md mb-lg">Transaction volume by gateway</p>
          <div className="h-64 flex flex-col justify-center gap-4 px-4">
            {gatewayDistribution.map((gw) => (
              <div key={gw.name} className="flex items-center gap-4">
                <span className="w-32 text-label-sm font-label-sm text-on-surface shrink-0">{gw.name}</span>
                <div className="flex-1 h-5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className={`${gw.color} h-full rounded-full transition-all`} style={{ width: `${gw.pct}%` }} />
                </div>
                <span className="text-label-sm font-label-sm text-outline w-10 text-right">{gw.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
