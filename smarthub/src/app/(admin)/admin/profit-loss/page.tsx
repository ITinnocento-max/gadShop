"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUIStore } from "@/stores/ui-store";

interface MonthlyRow {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

interface ExpenseItem {
  name: string;
  amount: number;
  pct: number;
}

interface PLData {
  summary: { totalRevenue: number; totalOrders: number; grossProfit: number; operatingExpenses: number; netProfit: number };
  monthlyRows: MonthlyRow[];
  totals: { revenue: number; cogs: number; grossProfit: number; expenses: number; netProfit: number };
  expenseBreakdown: ExpenseItem[];
}

const expenseColors = ["bg-primary", "bg-secondary", "bg-tertiary-container", "bg-outline"];

export default function AdminProfitLossPage() {
  const { t } = useTranslation();
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const [data, setData] = useState<PLData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/profit-loss")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = (v: number) =>
    (v < 0 ? "-" : "") + "RWF " + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtShort = (v: number) =>
    (v < 0 ? "-" : "") + "RWF " + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const months = data?.monthlyRows ?? [];
  const last3 = months.slice(-3);
  const quarters = last3.reduce((s, r) => s + r.revenue, 0);

  const trendMonths = months.map((r) => {
    const [, m] = r.month.split("-");
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return { label: names[parseInt(m) - 1] || r.month, revenue: r.revenue, netProfit: r.netProfit };
  });

  const maxTrend = Math.max(...trendMonths.map((r) => r.revenue), 1);

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 w-full sticky top-0 bg-surface/80 backdrop-blur-md z-40 border-b border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-on-surface-variant active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md text-primary font-bold">{t("admin.financial_reports")}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body-md w-48" placeholder={t("common.search_products")} type="text" />
            </div>
            <button className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors">
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-lg pb-28 md:pb-12">
          <section className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">{t("admin.profit_loss")}</h2>
              <p className="font-body-md text-body-md text-outline">
                {loading ? "" : `${data?.summary.totalOrders ?? 0} orders consolidated`} &bull; Fiscal Year {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-surface-container rounded-lg p-1">
                <button className="px-4 py-1.5 rounded-md bg-surface-container-lowest shadow-sm text-label-md font-bold text-primary">{t("admin.monthly")}</button>
                <button className="px-4 py-1.5 rounded-md text-label-md text-outline hover:text-on-surface">{t("admin.quarterly")}</button>
                <button className="px-4 py-1.5 rounded-md text-label-md text-outline hover:text-on-surface">{t("admin.yearly")}</button>
              </div>
            </div>
          </section>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-soft border border-outline-variant/10 flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <span className="text-secondary font-label-sm flex items-center gap-1">—</span>
              </div>
              <div className="mt-4">
                <span className="text-outline font-label-sm uppercase tracking-wide">{t("admin.total_revenue")}</span>
                <div className="text-headline-md font-bold text-on-surface">{loading ? "—" : fmt(data!.summary.totalRevenue)}</div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-soft border border-outline-variant/10 flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-secondary font-label-sm flex items-center gap-1">—</span>
              </div>
              <div className="mt-4">
                <span className="text-outline font-label-sm uppercase tracking-wide">{t("admin.gross_profit")}</span>
                <div className="text-headline-md font-bold text-on-surface">{loading ? "—" : fmt(data!.summary.grossProfit)}</div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-soft border border-outline-variant/10 flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-tertiary-container/10 text-tertiary-container rounded-lg">
                  <span className="material-symbols-outlined">shopping_cart_checkout</span>
                </div>
                <span className="text-error font-label-sm flex items-center gap-1">—</span>
              </div>
              <div className="mt-4">
                <span className="text-outline font-label-sm uppercase tracking-wide">{t("admin.operating_expenses")}</span>
                <div className="text-headline-md font-bold text-on-surface">{loading ? "—" : fmt(data!.summary.operatingExpenses)}</div>
              </div>
            </div>
            <div className="bg-primary text-on-primary p-lg rounded-xl shadow-soft border border-outline-variant/10 flex flex-col justify-between group hover:scale-[1.02] transition-all">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-white/20 text-white rounded-lg">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <span className="text-secondary-fixed font-label-sm flex items-center gap-1">—</span>
              </div>
              <div className="mt-4">
                <span className="text-on-primary/70 font-label-sm uppercase tracking-wide">{t("admin.net_profit")}</span>
                <div className="text-headline-md font-bold">{loading ? "—" : fmt(data!.summary.netProfit)}</div>
              </div>
            </div>
          </section>
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden mb-xl">
            <div className="p-lg border-b border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-headline-md text-on-surface">{t("admin.income_summary")}</h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant text-label-md hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-base">filter_list</span> {t("admin.filter")}
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant text-label-md hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-base">ios_share</span> {t("admin.export")}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">{t("checkout.shipping_method")}</th>
                    {months.map((r) => {
                      const [, m] = r.month.split("-");
                      const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      return <th key={r.month} className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-right">{names[parseInt(m) - 1]} {r.month.split("-")[0]}</th>;
                    })}
                    <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <tr className="bg-surface-container-low/20">
                    <td className="px-lg py-3 font-label-md text-primary font-bold" colSpan={months.length + 2}>{t("admin.total_revenue").toUpperCase()} (SALES)</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-4 font-body-md">Product Sales</td>
                    {months.map((r) => (
                      <td key={r.month} className="px-lg py-4 text-right font-body-md">{fmtShort(r.revenue)}</td>
                    ))}
                    <td className="px-lg py-4 text-right font-label-md font-bold">{fmtShort(data?.totals.revenue ?? 0)}</td>
                  </tr>
                  <tr className="bg-surface-container-high/30 font-bold border-t border-outline-variant/30">
                    <td className="px-lg py-4 font-label-md">Total Revenue</td>
                    {months.map((r) => (
                      <td key={r.month} className="px-lg py-4 text-right font-label-md">{fmtShort(r.revenue)}</td>
                    ))}
                    <td className="px-lg py-4 text-right font-label-md text-primary">{fmtShort(data?.totals.revenue ?? 0)}</td>
                  </tr>
                  <tr className="bg-surface-container-low/20">
                    <td className="px-lg py-3 font-label-md text-primary font-bold" colSpan={months.length + 2}>{t("admin.cogs").toUpperCase()}</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-4 font-body-md">Cost of Goods Sold</td>
                    {months.map((r) => (
                      <td key={r.month} className="px-lg py-4 text-right font-body-md">({fmtShort(r.cogs)})</td>
                    ))}
                    <td className="px-lg py-4 text-right font-label-md font-bold">({fmtShort(data?.totals.cogs ?? 0)})</td>
                  </tr>
                  <tr className="bg-surface-container-high/30 font-bold border-t border-outline-variant/30">
                    <td className="px-lg py-4 font-label-md">Gross Profit</td>
                    {months.map((r) => (
                      <td key={r.month} className="px-lg py-4 text-right font-label-md">{fmtShort(r.grossProfit)}</td>
                    ))}
                    <td className="px-lg py-4 text-right font-label-md text-secondary">{fmtShort(data?.totals.grossProfit ?? 0)}</td>
                  </tr>
                  <tr className="bg-surface-container-low/20">
                    <td className="px-lg py-3 font-label-md text-primary font-bold" colSpan={months.length + 2}>{t("admin.operating_expenses").toUpperCase()}</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-4 font-body-md">Operating Expenses</td>
                    {months.map((r) => (
                      <td key={r.month} className="px-lg py-4 text-right font-body-md">({fmtShort(r.expenses)})</td>
                    ))}
                    <td className="px-lg py-4 text-right font-label-md font-bold">({fmtShort(data?.totals.expenses ?? 0)})</td>
                  </tr>
                  <tr className="bg-primary/5 font-bold border-t border-primary/20">
                    <td className="px-lg py-5 font-headline-md text-on-surface">{t("admin.net_profit")} (EBITDA)</td>
                    {months.map((r) => (
                      <td key={r.month} className="px-lg py-5 text-right font-headline-md">{fmtShort(r.netProfit)}</td>
                    ))}
                    <td className="px-lg py-5 text-right font-headline-md text-primary">{fmtShort(data?.totals.netProfit ?? 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className="lg:col-span-2 bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/10 shadow-sm">
              <div className="flex items-center justify-between mb-lg">
                <h3 className="font-headline-md text-on-surface">{t("admin.profit_trend_analysis")}</h3>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-label-sm text-outline">{t("admin.revenue")}</span>
                  <span className="w-3 h-3 rounded-full bg-secondary ml-2" />
                  <span className="font-label-sm text-outline">{t("admin.net_profit")}</span>
                </div>
              </div>
              {loading ? (
                <div className="h-64 flex items-center justify-center text-outline">{t("common.loading")}</div>
              ) : (
                <div className="h-64 w-full flex items-end gap-2 md:gap-4 px-4 border-b border-outline-variant/20">
                  {trendMonths.map((r, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                      <div
                        className="w-full bg-secondary/60 rounded-t-sm transition-all"
                        style={{ height: `${Math.max((r.netProfit / maxTrend) * 100, 2)}%` }}
                      />
                      <div
                        className="w-full bg-primary rounded-t-sm transition-all"
                        style={{ height: `${Math.max((r.revenue / maxTrend) * 100, 4)}%` }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between mt-4 px-4 text-label-sm text-outline uppercase">
                {trendMonths.map((r, i) => (
                  <span key={i}>{r.label}</span>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col">
              <h3 className="font-headline-md text-on-surface mb-lg">{t("admin.expense_breakdown")}</h3>
              <div className="space-y-6 flex-1">
                {loading ? (
                  <div className="text-center py-8 text-outline">{t("common.loading")}</div>
                ) : (
                  data?.expenseBreakdown.map((e, i) => (
                    <div key={e.name}>
                      <div className="flex justify-between mb-2">
                        <span className="font-body-md text-on-surface">{e.name}</span>
                        <span className="font-label-md font-bold">{e.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${expenseColors[i % expenseColors.length]} rounded-full`} style={{ width: `${e.pct}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className="mt-lg w-full py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary/5 transition-all active:scale-95">{t("admin.view_detailed_audit")}</button>
            </div>
          </section>
        </div>
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-2 h-16 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-sm text-label-sm">{t("admin.dashboard")}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/products">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-sm text-label-sm">{t("admin.products")}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-primary bg-primary-container/30 rounded-full px-4 py-1" href="/admin/profit-loss">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            <span className="font-label-sm text-label-sm">{t("admin.profit_loss")}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/financial">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span className="font-label-sm text-label-sm">{t("admin.financial_reports")}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-sm text-label-sm">{t("admin.dashboard")}</span>
          </a>
        </nav>
      </main>
  );
}
