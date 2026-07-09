"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface Gateway {
  name: string;
  key: string;
  amount: number;
  pct: number;
}

interface Transaction {
  id: string;
  name: string;
  amount: number;
  status: string;
  method: string;
}

interface FinancialData {
  summary: { totalRevenue: number; grossProfit: number; netProfit: number; cashFlow: number };
  gatewayBreakdown: Gateway[];
  recentTransactions: Transaction[];
}

const quickLinks = [
  { icon: "description", key: "reports", href: "/admin/financial/reports" },
  { icon: "account_balance", key: "banking", href: "/admin/financial/banking" },
  { icon: "receipt", key: "expenses", href: "/admin/financial/expenses" },
  { icon: "request_quote", key: "tax", href: "/admin/financial/tax" },
  { icon: "receipt_long", key: "invoicing", href: "/admin/financial/invoicing" },
  { icon: "payments", key: "payments", href: "/admin/financial/payments" },
  { icon: "insights", key: "analytics", href: "/admin/financial/analytics" },
];

const summaryMeta = [
  { icon: "payments", key: "total_revenue", color: "text-primary", bg: "bg-primary/10" },
  { icon: "account_balance_wallet", key: "gross_profit", color: "text-secondary", bg: "bg-secondary/10" },
  { icon: "show_chart", key: "net_profit", color: "text-tertiary", bg: "bg-tertiary/10" },
  { icon: "account_tree", key: "cash_flow", color: "text-outline", bg: "bg-surface-container-high" },
];

const gatewayColors = ["bg-[#f9db3d]", "bg-error", "bg-primary", "bg-secondary", "bg-tertiary"];

export default function FinancialOverviewPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/financial")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = (v: number) => "RWF " + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{t("admin.financial_overview")}</h2>
        <p className="font-body-md text-body-md text-outline mt-1">{t("admin.yearly_performance")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        {summaryMeta.map((card, i) => {
          const keys = ["totalRevenue", "grossProfit", "netProfit", "cashFlow"] as const;
          const value = data ? data.summary[keys[i]] : 0;
          return (
            <div key={card.key} className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10 flex flex-col justify-between hover:translate-y-[-2px] transition-all">
              <div className="flex justify-between items-start mb-md">
                <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <span className="text-secondary font-label-sm text-label-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>—
                </span>
              </div>
              <div>
                <p className="text-outline font-label-md text-label-md">{t(`admin.${card.key}`)}</p>
                <h3 className="text-headline-lg font-headline-lg mt-xs">{loading ? "—" : fmt(value)}</h3>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-md">
        {quickLinks.map((link) => (
          <a
            key={link.key}
            href={link.href}
            className="flex flex-col items-center gap-2 p-md bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:bg-surface-container hover:shadow-sm transition-all active:scale-[0.97]"
          >
            <span className="material-symbols-outlined text-primary text-[24px]">{link.icon}</span>
            <span className="font-label-sm text-label-sm text-center text-on-surface-variant">{t(`admin.${link.key}`)}</span>
          </a>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="bg-surface p-lg rounded-2xl shadow-soft border border-outline-variant/10">
          <h3 className="font-headline-md text-headline-md mb-1">{t("checkout.payment_method")}</h3>
          <p className="text-outline font-label-md mb-xl">{t("admin.transaction_breakdown")}</p>
          <div className="space-y-lg">
            {loading ? (
              <div className="text-center py-8 text-outline">{t("common.loading")}</div>
            ) : data?.gatewayBreakdown.map((gw, i) => (
              <div key={gw.key}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-on-surface">{gw.name}</span>
                  </div>
                  <span className="font-label-md text-primary">{fmt(gw.amount)}</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className={`${gatewayColors[i % gatewayColors.length]} h-full rounded-full transition-all`} style={{ width: `${gw.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface p-lg rounded-2xl shadow-soft border border-outline-variant/10">
          <h3 className="font-headline-md text-headline-md mb-1">{t("orders.title")}</h3>
          <p className="text-outline font-label-md mb-xl">{t("orders.subtitle")}</p>
          <div className="space-y-md">
            {loading ? (
              <div className="text-center py-8 text-outline">{t("common.loading")}</div>
            ) : data?.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className="text-label-sm font-bold text-on-surface-variant">{tx.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface">{tx.name}</p>
                    <p className="font-label-sm text-outline">{tx.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-label-md text-primary">{fmt(tx.amount)}</p>
                  <span className={`font-label-sm px-2 py-0.5 rounded-full ${tx.status === "completed" ? "bg-secondary-container/30 text-on-secondary-container" : "bg-error-container/20 text-error"}`}>
                    {t(`account.${tx.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
