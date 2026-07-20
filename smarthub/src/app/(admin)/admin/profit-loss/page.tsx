"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function AdminProfitLossPage() {
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

  const trendMonths = months.map((r) => {
    const [, m] = r.month.split("-");
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return { label: names[parseInt(m) - 1] || r.month, revenue: r.revenue, netProfit: r.netProfit, cogs: r.cogs };
  });

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 w-full sticky top-0 bg-surface/80 backdrop-blur-md z-40 border-b border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-on-surface-variant active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md text-primary font-bold">{"Financial Reports"}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body-md w-48" placeholder={"Search products..."} type="text" />
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
              <h2 className="font-headline-lg text-headline-lg text-on-surface">{"Profit & Loss"}</h2>
              <p className="font-body-md text-body-md text-outline">
                {loading ? "" : `${data?.summary.totalOrders ?? 0} orders consolidated`} &bull; Fiscal Year {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-surface-container rounded-lg p-1">
                <button className="px-4 py-1.5 rounded-md bg-surface-container-lowest shadow-sm text-label-md font-bold text-primary">{"Monthly"}</button>
                <button className="px-4 py-1.5 rounded-md text-label-md text-outline hover:text-on-surface">{"Quarterly"}</button>
                <button className="px-4 py-1.5 rounded-md text-label-md text-outline hover:text-on-surface">{"Yearly"}</button>
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
                <span className="text-outline font-label-sm uppercase tracking-wide">{"Total Revenue"}</span>
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
                <span className="text-outline font-label-sm uppercase tracking-wide">{"Gross Profit"}</span>
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
                <span className="text-outline font-label-sm uppercase tracking-wide">{"Operating Expenses"}</span>
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
                <span className="text-on-primary/70 font-label-sm uppercase tracking-wide">{"Net Profit"}</span>
                <div className="text-headline-md font-bold">{loading ? "—" : fmt(data!.summary.netProfit)}</div>
              </div>
            </div>
          </section>
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden mb-xl">
            <div className="p-lg border-b border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-headline-md text-on-surface">{"Income Summary"}</h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant text-label-md hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-base">filter_list</span> {"Filter"}
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant text-label-md hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-base">ios_share</span> {"Export"}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-lg py-4 font-label-sm text-outline uppercase tracking-wider">{"Category"}</th>
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
                    <td className="px-lg py-3 font-label-md text-primary font-bold" colSpan={months.length + 2}>&quot;TOTAL REVENUE (SALES)&quot;</td>
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
                    <td className="px-lg py-3 font-label-md text-primary font-bold" colSpan={months.length + 2}>{"COGS"}</td>
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
                    <td className="px-lg py-3 font-label-md text-primary font-bold" colSpan={months.length + 2}>&quot;OPERATING EXPENSES&quot;</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-4 font-body-md">Operating Expenses</td>
                    {months.map((r) => (
                      <td key={r.month} className="px-lg py-4 text-right font-body-md">({fmtShort(r.expenses)})</td>
                    ))}
                    <td className="px-lg py-4 text-right font-label-md font-bold">({fmtShort(data?.totals.expenses ?? 0)})</td>
                  </tr>
                  <tr className="bg-primary/5 font-bold border-t border-primary/20">
                    <td className="px-lg py-5 font-headline-md text-on-surface">{"Net Profit"} (EBITDA)</td>
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
                <h3 className="font-headline-md text-on-surface">{"Profit Trend Analysis"}</h3>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-label-sm text-outline">{"Revenue"}</span>
                  <span className="w-3 h-3 rounded-full bg-secondary ml-2" />
                  <span className="font-label-sm text-outline">{"Net Profit"}</span>
                </div>
              </div>
              {loading ? (
                <div className="h-72 flex items-center justify-center text-outline">{"Loading..."}</div>
              ) : trendMonths.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-outline">{"No data available"}</div>
              ) : (() => {
                const chartW = 700;
                const chartH = 260;
                const padL = 60;
                const padR = 16;
                const padT = 16;
                const padB = 36;
                const innerW = chartW - padL - padR;
                const innerH = chartH - padT - padB;
                const barCount = trendMonths.length;
                const groupW = innerW / barCount;
                const barW = Math.min(groupW * 0.55, 48);
                const maxVal = Math.max(...trendMonths.map((r) => Math.max(r.revenue, 0)), 1);
                const niceMax = Math.ceil(maxVal / (maxVal > 100000 ? 100000 : maxVal > 10000 ? 10000 : maxVal > 1000 ? 1000 : 100)) * (maxVal > 100000 ? 100000 : maxVal > 10000 ? 10000 : maxVal > 1000 ? 1000 : 100);
                const gridLines = 5;

                const x = (i: number) => padL + groupW * i + groupW / 2;
                const lineY = (val: number) => padT + innerH - (Math.max(val, 0) / niceMax) * innerH;

                const profitPts = trendMonths.map((r, i) => `${x(i)},${lineY(r.netProfit)}`).join(" ");

                return (
                  <div className="w-full overflow-x-auto">
                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" style={{ minWidth: 400 }}>
                      {Array.from({ length: gridLines + 1 }, (_, i) => {
                        const val = (niceMax / gridLines) * i;
                        const y = padT + innerH - (val / niceMax) * innerH;
                        return (
                          <g key={i}>
                            <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="currentColor" className="text-outline-variant/30" strokeWidth="1" />
                            <text x={padL - 8} y={y + 4} textAnchor="end" className="fill-current text-outline" fontSize="10" fontFamily="sans-serif">
                              {niceMax >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : niceMax >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(0)}
                            </text>
                          </g>
                        );
                      })}
                      <line x1={padL} y1={padT + innerH} x2={chartW - padR} y2={padT + innerH} stroke="currentColor" className="text-outline-variant/30" strokeWidth="1" />

                      {trendMonths.map((r, i) => {
                        const cx = x(i);
                        const bh = Math.max(((r.revenue - r.cogs) / niceMax) * innerH, 0);
                        const rh = Math.max((r.revenue / niceMax) * innerH, 0);
                        return (
                          <g key={i}>
                            <rect
                              x={cx - barW / 2}
                              y={padT + innerH - rh}
                              width={barW}
                              height={rh}
                              rx={3}
                              fill="currentColor"
                              className="text-primary/25"
                            />
                            {r.cogs > 0 && (
                              <rect
                                x={cx - barW / 2}
                                y={padT + innerH - rh}
                                width={barW}
                                height={Math.max(bh, 0)}
                                rx={3}
                                fill="currentColor"
                                className="text-primary/70"
                              />
                            )}
                            <title>{`Revenue: ${fmt(r.revenue)}`}</title>
                          </g>
                        );
                      })}

                      <polyline
                        points={profitPts}
                        fill="none"
                        stroke="currentColor"
                        className="text-secondary"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      {trendMonths.map((r, i) => (
                        <g key={`dot-${i}`}>
                          <circle cx={x(i)} cy={lineY(r.netProfit)} r="4.5" fill="currentColor" className="text-secondary" stroke="white" strokeWidth="2" />
                          <title>{`Net Profit: ${fmt(r.netProfit)}`}</title>
                        </g>
                      ))}

                      {trendMonths.map((r, i) => (
                        <text key={`lbl-${i}`} x={x(i)} y={chartH - 6} textAnchor="middle" className="fill-current text-outline" fontSize="11" fontFamily="sans-serif">
                          {r.label}
                        </text>
                      ))}
                    </svg>
                  </div>
                );
              })()}
              {trendMonths.length > 0 && (
                <div className="flex justify-between mt-3 px-4 text-label-sm text-outline uppercase">
                  {trendMonths.map((r, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <span className="text-on-surface font-label-sm">{fmtShort(r.revenue)}</span>
                      <span className={r.netProfit >= 0 ? "text-secondary" : "text-error"}>{fmtShort(r.netProfit)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col">
              <h3 className="font-headline-md text-on-surface mb-lg">{"Expense Breakdown"}</h3>
              <div className="flex-1 flex flex-col items-center">
                {loading ? (
                  <div className="text-center py-8 text-outline">{"Loading..."}</div>
                ) : data?.expenseBreakdown && data.expenseBreakdown.length > 0 ? (
                  <>
                    <svg viewBox="0 0 200 200" className="w-44 h-44 mb-lg">
                      {(() => {
                        const cx = 100, cy = 100, r = 80, strokeW = 24;
                        const totalPct = data.expenseBreakdown.reduce((s, e) => s + e.pct, 0);
                        const donutColors = ["#6750A4", "#625B71", "#7D5260", "#938F99"];
                        let offset = 0;
                        const circumference = 2 * Math.PI * r;
                        return data.expenseBreakdown.map((e, i) => {
                          const pct = totalPct > 0 ? e.pct / totalPct : 0;
                          const dash = pct * circumference;
                          const gap = circumference - dash;
                          const rotation = (offset / totalPct) * 360 - 90;
                          offset += e.pct;
                          return (
                            <circle
                              key={i}
                              cx={cx}
                              cy={cy}
                              r={r}
                              fill="none"
                              stroke={donutColors[i % donutColors.length]}
                              strokeWidth={strokeW}
                              strokeDasharray={`${dash} ${gap}`}
                              strokeLinecap="butt"
                              transform={`rotate(${rotation} ${cx} ${cy})`}
                              className="transition-all duration-700"
                            />
                          );
                        });
                      })()}
                      <circle cx={100} cy={100} r={56} fill="currentColor" className="text-surface-container-lowest" />
                      <text x={100} y={94} textAnchor="middle" className="fill-current text-on-surface" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
                        {data!.expenseBreakdown.reduce((s, e) => s + e.pct, 0)}%
                      </text>
                      <text x={100} y={112} textAnchor="middle" className="fill-current text-outline" fontSize="10" fontFamily="sans-serif">
                        Total
                      </text>
                    </svg>
                    <div className="space-y-3 w-full">
                      {data?.expenseBreakdown.map((e, i) => {
                        const donutColors = ["bg-primary", "bg-secondary", "bg-tertiary-container", "bg-outline"];
                        return (
                          <div key={e.name}>
                            <div className="flex justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${donutColors[i % donutColors.length]}`} />
                                <span className="font-body-sm text-on-surface">{e.name}</span>
                              </div>
                              <span className="font-label-sm font-bold text-on-surface">{fmtShort(e.amount)} ({e.pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                              <div className={`h-full ${donutColors[i % donutColors.length]} rounded-full transition-all duration-700`} style={{ width: `${e.pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-outline">{"No expenses recorded"}</div>
                )}
              </div>
              <Link
                href="/admin/financial"
                className="mt-lg w-full py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary/5 transition-all active:scale-95 text-center block"
              >
                {"View Detailed Audit"}
              </Link>
            </div>
          </section>
        </div>
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-2 h-16 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-sm text-label-sm">{"Dashboard"}</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/products">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-sm text-label-sm">{"Products"}</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-primary bg-primary-container/30 rounded-full px-4 py-1" href="/admin/profit-loss">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            <span className="font-label-sm text-label-sm">{"Profit & Loss"}</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/financial">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span className="font-label-sm text-label-sm">{"Financial Reports"}</span>
          </Link>
        </nav>
      </main>
  );
}
