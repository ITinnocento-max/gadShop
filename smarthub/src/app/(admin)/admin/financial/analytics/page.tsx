"use client"

import { useEffect, useState, useCallback } from "react"
import { useUIStore } from "@/stores/ui-store"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Doughnut } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

interface Metric {
  value: number
  trend: "up" | "down" | "neutral"
}

interface TrendPoint {
  label: string
  revenue: number
  expenses: number
}

interface GatewayData {
  name: string
  total: number
  pct: number
  count: number
}

interface AnalyticsResponse {
  metrics: Record<string, Metric>
  trendData: TrendPoint[]
  gatewayData: GatewayData[]
  summary: {
    totalOrders: number
    totalRevenue: number
    totalCustomers: number
    totalProducts: number
    avgOrderValue: number
    totalExpenses: number
    profit: number
  }
}

const timePeriods = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "yearly", label: "Yearly" },
]

const metricConfig: Record<string, { icon: string; label: string }> = {
  sales_analytics: { icon: "shopping_cart", label: "Sales Analytics" },
  customer_analytics: { icon: "people", label: "Customer Analytics" },
  product_analytics: { icon: "inventory_2", label: "Product Analytics" },
  payment_analytics: { icon: "payments", label: "Payment Analytics" },
  revenue_analytics: { icon: "trending_up", label: "Revenue Analytics" },
  profit_analytics: { icon: "savings", label: "Profit Analytics" },
  expense_analytics: { icon: "money_off", label: "Expense Analytics" },
}

const gatewayColors: Record<string, string> = {
  "MTN MoMo": "#f59e0b",
  "Airtel Money": "#ef4444",
  CARD: "#3b82f6",
  Visa: "#3b82f6",
  Mastercard: "#6366f1",
  "Cash on Delivery": "#14b8a6",
}

function fmt(v: number) {
  if (v >= 1_000_000) return "RWF " + (v / 1_000_000).toFixed(1) + "M"
  if (v >= 1_000) return "RWF " + (v / 1_000).toFixed(1) + "K"
  return "RWF " + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtRaw(v: number) {
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function AnalyticsPage() {
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("monthly")

  const fetchData = useCallback(async (p: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/financial/analytics?period=${p}`).then((r) => r.json())
      setData(res)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(period)
  }, [period, fetchData])

  const lineData = data ? {
    labels: data.trendData.map((d) => d.label),
    datasets: [
      {
        label: "Revenue",
        data: data.trendData.map((d) => d.revenue),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Expenses",
        data: data.trendData.map((d) => d.expenses),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  } : null

  const lineOptions: import("chart.js").ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: RWF ${Number(ctx.parsed.y).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#888" } },
      y: {
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: {
          color: "#888",
          callback: (v) => Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}K` : `${v}`,
        },
      },
    },
  }

  const doughnutData = data ? {
    labels: data.gatewayData.map((g) => g.name),
    datasets: [
      {
        data: data.gatewayData.map((g) => g.total),
        backgroundColor: data.gatewayData.map((g) => gatewayColors[g.name] || "#64748b"),
        borderWidth: 0,
      },
    ],
  } : null

  const doughnutOptions: import("chart.js").ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: RWF ${Number(ctx.parsed).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        },
      },
    },
  }

  return (
    <div className="space-y-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">{"Analytics"}</h2>
          <p className="font-body-md text-body-md text-outline mt-1">Interactive dashboards with daily, weekly, monthly, quarterly, and yearly comparisons</p>
        </div>
        <button className="md:hidden p-2 text-on-surface-variant" onClick={() => setMobileMenuOpen(true)}>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-outline">{"Loading..."}</div>
      ) : !data ? (
        <div className="text-center py-12 text-outline">{"Failed to load analytics data"}</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {timePeriods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-xl font-label-md text-label-md transition-all active:scale-[0.97] ${
                  period === p.key
                    ? "bg-primary text-on-primary shadow-soft"
                    : "bg-surface text-outline border border-outline-variant/10 hover:bg-surface-container-high"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-md">
            {Object.entries(metricConfig).map(([key, cfg]) => {
              const m = data.metrics[key]
              if (!m) return null
              return (
                <div key={key} className="bg-surface p-md rounded-xl shadow-soft border border-outline-variant/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">{cfg.icon}</span>
                    </div>
                    {m.trend !== "neutral" && (
                      <span className={`material-symbols-outlined text-sm ${m.trend === "up" ? "text-secondary" : "text-error"}`}>
                        {m.trend === "up" ? "arrow_upward" : "arrow_downward"}
                      </span>
                    )}
                  </div>
                  <p className="text-headline-sm font-headline-sm text-on-surface">{fmt(m.value)}</p>
                  <p className="text-label-sm font-label-sm text-outline">{cfg.label}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <div className="lg:col-span-2 bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10">
              <h3 className="font-headline-md text-headline-md mb-1">{"Revenue vs Expenses Trend"}</h3>
              <p className="text-outline font-label-md mb-lg">
                {period === "daily" ? "Last 30 days" : period === "weekly" ? "Last 90 days" : period === "monthly" ? "Last 12 months" : period === "quarterly" ? "Last 3 years" : "Last 5 years"}
              </p>
              {data.trendData.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-outline">{"No data for this period"}</div>
              ) : (
                <div className="h-72">
                  {lineData && <Line data={lineData} options={lineOptions} />}
                </div>
              )}
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                  <span className="text-label-sm font-label-sm text-outline">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="text-label-sm font-label-sm text-outline">Expenses</span>
                </div>
              </div>
            </div>

            <div className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10">
              <h3 className="font-headline-md text-headline-md mb-1">{"Payment Gateway Distribution"}</h3>
              <p className="text-outline font-label-md mb-lg">Transaction volume by gateway</p>
              {data.gatewayData.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-outline">{"No payment data"}</div>
              ) : (
                <>
                  <div className="h-48 flex items-center justify-center">
                    {doughnutData && <Doughnut data={doughnutData} options={doughnutOptions} />}
                  </div>
                  <div className="mt-4 space-y-2">
                    {data.gatewayData.map((gw) => (
                      <div key={gw.name} className="flex items-center justify-between text-label-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gatewayColors[gw.name] || "#64748b" }} />
                          <span className="text-on-surface">{gw.name}</span>
                        </div>
                        <span className="text-outline">{gw.pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10">
            <h3 className="font-headline-md text-headline-md mb-4">{"Summary"}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-lg">
              <div>
                <p className="text-label-sm font-label-sm text-outline">Total Orders</p>
                <p className="text-headline-sm font-headline-sm text-on-surface">{data.summary.totalOrders}</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-outline">Total Revenue</p>
                <p className="text-headline-sm font-headline-sm text-on-surface">{fmt(data.summary.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-outline">Total Customers</p>
                <p className="text-headline-sm font-headline-sm text-on-surface">{data.summary.totalCustomers}</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-outline">Total Products</p>
                <p className="text-headline-sm font-headline-sm text-on-surface">{data.summary.totalProducts}</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-outline">Avg Order Value</p>
                <p className="text-headline-sm font-headline-sm text-on-surface">{fmt(data.summary.avgOrderValue)}</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-outline">Total Expenses</p>
                <p className="text-headline-sm font-headline-sm text-on-surface">{fmt(data.summary.totalExpenses)}</p>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-outline">Profit</p>
                <p className={`text-headline-sm font-headline-sm ${data.summary.profit >= 0 ? "text-secondary" : "text-error"}`}>
                  {fmt(data.summary.profit)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
