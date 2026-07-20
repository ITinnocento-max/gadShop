"use client"

import { useEffect, useState, useCallback } from "react"
import { useUIStore } from "@/stores/ui-store"
import jsPDF from "jspdf"
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

export default function AnalyticsPage() {
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("monthly")
  const [downloading, setDownloading] = useState(false)

  const downloadPDF = useCallback(() => {
    setDownloading(true)
    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const pageW = pdf.internal.pageSize.getWidth()
      const margin = 20
      let y = 30
      const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

      pdf.setFillColor(59, 130, 246)
      pdf.rect(0, 0, pageW, 20, "F")
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(14)
      pdf.setTextColor(255, 255, 255)
      pdf.text("Analytics", margin, 13)
      pdf.setFontSize(8)
      pdf.text(`Generated: ${dateStr}`, pageW - margin, 13, { align: "right" })
      pdf.setTextColor(0, 0, 0)

      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(18)
      pdf.text("Analytics Dashboard", margin, y)
      y += 10
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, margin, y)
      y += 10
      pdf.setTextColor(0, 0, 0)

      if (data) {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(12)
        pdf.text("Key Metrics", margin, y)
        y += 8
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        for (const [key, cfg] of Object.entries(metricConfig)) {
          const m = data.metrics[key]
          if (!m) continue
          if (y > 260) { pdf.addPage(); y = 30 }
          pdf.text(`${cfg.label}: ${fmt(m.value)}`, margin, y)
          y += 6
        }
        y += 5

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(12)
        pdf.text("Summary", margin, y)
        y += 8
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        const summaryItems = [
          ["Total Orders", String(data.summary.totalOrders)],
          ["Total Revenue", fmt(data.summary.totalRevenue)],
          ["Total Customers", String(data.summary.totalCustomers)],
          ["Total Products", String(data.summary.totalProducts)],
          ["Avg Order Value", fmt(data.summary.avgOrderValue)],
          ["Total Expenses", fmt(data.summary.totalExpenses)],
          ["Profit", fmt(data.summary.profit)],
        ]
        for (const [label, val] of summaryItems) {
          if (y > 260) { pdf.addPage(); y = 30 }
          pdf.text(`${label}: ${val}`, margin, y)
          y += 6
        }
      }

      y = Math.max(y, 275)
      pdf.setFont("helvetica", "italic")
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text("SmartHub Shop - Analytics Report", margin, y + 5)
      pdf.text(`Page ${pdf.getNumberOfPages()}`, pageW - margin, y + 5, { align: "right" })
      pdf.save(`Analytics_${dateStr.replace(/\s+/g, "_")}.pdf`)
    } catch { window.print() } finally { setDownloading(false) }
  }, [data, period])

  const printReport = useCallback(() => { window.print() }, [])

  const emailReport = useCallback(() => {
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    let content = `Analytics Dashboard - ${period}\nGenerated: ${dateStr}\n\n`
    if (data) {
      content += "Key Metrics:\n"
      for (const [key, cfg] of Object.entries(metricConfig)) {
        const m = data.metrics[key]
        if (m) content += `${cfg.label}: ${fmt(m.value)}\n`
      }
      content += "\nSummary:\n"
      content += `Total Orders: ${data.summary.totalOrders}\nTotal Revenue: ${fmt(data.summary.totalRevenue)}\nTotal Customers: ${data.summary.totalCustomers}\nTotal Products: ${data.summary.totalProducts}\nAvg Order Value: ${fmt(data.summary.avgOrderValue)}\nTotal Expenses: ${fmt(data.summary.totalExpenses)}\nProfit: ${fmt(data.summary.profit)}\n`
    }
    window.open(`mailto:?subject=${encodeURIComponent(`Analytics Report - ${period} - SmartHub Shop`)}&body=${encodeURIComponent(content)}`, "_blank")
  }, [data, period])

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fetch(`/api/admin/financial/analytics?period=${period}`)
      .then((r) => r.json())
      .then((res) => { if (!cancelled) setData(res) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [period])

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
        <div className="flex items-center gap-2">
          <button onClick={downloadPDF} disabled={downloading} className="h-9 px-3 bg-surface text-on-surface-variant border border-outline-variant/20 rounded-lg font-label-sm text-label-sm hover:bg-surface-variant/50 transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">{downloading ? "hourglass_top" : "download"}</span>
            <span className="hidden sm:inline">{"PDF"}</span>
          </button>
          <button onClick={printReport} className="h-9 px-3 bg-surface text-on-surface-variant border border-outline-variant/20 rounded-lg font-label-sm text-label-sm hover:bg-surface-variant/50 transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span className="hidden sm:inline">{"Print"}</span>
          </button>
          <button onClick={emailReport} className="h-9 px-3 bg-surface text-on-surface-variant border border-outline-variant/20 rounded-lg font-label-sm text-label-sm hover:bg-surface-variant/50 transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">email</span>
            <span className="hidden sm:inline">{"Email"}</span>
          </button>
          <button className="md:hidden p-2 text-on-surface-variant" onClick={() => setMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
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
