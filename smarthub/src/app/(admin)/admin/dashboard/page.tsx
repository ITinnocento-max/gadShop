"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUIStore } from "@/stores/ui-store";

interface DashboardData {
  todaySales: number;
  todaySalesChange: number;
  totalRevenue: number;
  activeOrders: number;
  newCustomers: number;
  lowStockItems: number;
  lowStockProducts: { id: string; name: string; slug: string; stock: number; image: string | null; category: string }[];
  recentOrders: { id: string; orderNumber: string; total: number; status: string; customerName: string; itemName: string; createdAt: string }[];
}

const statusStyles: Record<string, string> = {
  DELIVERED: "bg-secondary-container/30 text-on-secondary-container",
  SHIPPED: "bg-secondary-container/30 text-on-secondary-container",
  PROCESSING: "bg-primary-container/20 text-primary dark:text-inverse-primary",
  PENDING: "bg-tertiary-container/20 text-tertiary dark:text-tertiary-fixed",
  CANCELLED: "bg-error-container/20 text-error",
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatCurrency = (v: number) =>
    "RWF " + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 shadow-soft bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button className="md:hidden material-symbols-outlined text-on-surface-variant dark:text-outline active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>menu</button>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary dark:text-inverse-primary tracking-tighter">{t("common.app_name")}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative material-symbols-outlined text-on-surface-variant dark:text-outline active:scale-95 transition-transform">
              notifications
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error ring-2 ring-surface dark:ring-inverse-surface" />
            </button>
            <div className="h-9 w-9 rounded-full overflow-hidden border border-outline-variant/30">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtCW-FBTsBEr84QsObtVXSMlblJ03MU02wyJKZJ40gfXpqi6YbQlKqUahpD1y0xyjMO4R00MdPloZ7moihgaIpjucPKV3WXsVsUGUQA8YEZqgsQ_fYFo5P6BqZbO3-una2V7w_6pcAyV8LqpJvY18JbVk_K-eitrHDuNI_15FEyp-8ZQJ7XtP4q9L0f4e4hY5oi9bjx6uRa0g4Bo7GxdQczEp16GBF1ZWKi8dOzad1HfEniGp754GuLA"
                alt="Admin avatar"
              />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop pt-lg pb-28 md:pb-12 space-y-lg">
          <section>
            <div className="flex flex-col">
              <p className="font-label-md text-label-md text-on-surface-variant dark:text-outline uppercase tracking-wider">{t("admin.super_admin")}</p>
              <h2 className="font-headline-md text-headline-md-mobile text-on-surface dark:text-white">{t("admin.welcome_back")}</h2>
            </div>
          </section>
          <section className="grid grid-cols-2 gap-md">
            <div className="col-span-2 bg-surface/70 dark:bg-inverse-surface/70 backdrop-blur-md border border-outline-variant/20 rounded-xl p-md shadow-soft">
              <div className="flex justify-between items-start mb-base">
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant dark:text-outline">{t("admin.todays_sales")}</p>
                  <p className="font-headline-md text-headline-md text-primary dark:text-inverse-primary">
                    {loading ? "—" : formatCurrency(data?.todaySales ?? 0)}
                  </p>
                </div>
                {data && (
                  <span className="text-secondary dark:text-secondary-fixed flex items-center font-label-sm text-label-sm bg-secondary-container/20 px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    +{data.todaySalesChange}%
                  </span>
                )}
              </div>
              <div className="h-24 w-full flex items-end gap-1 px-1">
                {[30, 45, 40, 65, 55, 85, 70].map((h, i) => (
                  <div key={i} className={`w-full rounded-t-sm ${i === 5 ? "bg-primary dark:bg-inverse-primary" : "bg-primary/20 dark:bg-inverse-primary/20"} ${i === 3 ? "bg-primary/40 dark:bg-inverse-primary/40" : ""} ${i === 4 ? "bg-primary/30 dark:bg-inverse-primary/30" : ""}`} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="bg-surface/70 dark:bg-inverse-surface/70 backdrop-blur-md border border-outline-variant/20 rounded-xl p-md shadow-soft">
              <div className="flex items-center gap-2 mb-xs">
                <span className="material-symbols-outlined text-secondary dark:text-secondary-fixed text-[20px]">payments</span>
                <p className="font-label-md text-label-md text-on-surface-variant dark:text-outline">{t("admin.revenue")}</p>
              </div>
              <p className="font-headline-md text-headline-md text-on-surface dark:text-white">
                {loading ? "—" : formatCurrency(data?.totalRevenue ?? 0)}
              </p>
            </div>
            <div className="bg-surface/70 dark:bg-inverse-surface/70 backdrop-blur-md border border-outline-variant/20 rounded-xl p-md shadow-soft">
              <div className="flex items-center gap-2 mb-xs">
                <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-[20px]">package_2</span>
                <p className="font-label-md text-label-md text-on-surface-variant dark:text-outline">{t("admin.active_orders")}</p>
              </div>
              <p className="font-headline-md text-headline-md text-on-surface dark:text-white">
                {loading ? "—" : (data?.activeOrders ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-surface/70 dark:bg-inverse-surface/70 backdrop-blur-md border border-outline-variant/20 rounded-xl p-md shadow-soft">
              <div className="flex items-center gap-2 mb-xs">
                <span className="material-symbols-outlined text-tertiary dark:text-tertiary-fixed-dim text-[20px]">person_add</span>
                <p className="font-label-md text-label-md text-on-surface-variant dark:text-outline">{t("admin.new_customers")}</p>
              </div>
              <p className="font-headline-md text-headline-md text-on-surface dark:text-white">
                {loading ? "—" : (data?.newCustomers ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-error-container/10 border border-error/20 rounded-xl p-md shadow-soft">
              <div className="flex items-center gap-2 mb-xs">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                <p className="font-label-md text-label-md text-error">{t("admin.low_stock")}</p>
              </div>
              <p className="font-headline-md text-headline-md text-on-error-container">
                {loading ? "—" : `${data?.lowStockItems ?? 0} Items`}
              </p>
            </div>
          </section>
          <section className="space-y-md">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-on-surface dark:text-white">{t("admin.recent_orders")}</h3>
              <button className="text-primary dark:text-inverse-primary font-label-md text-label-md hover:underline">{t("common.view_all")}</button>
            </div>
            <div className="space-y-sm">
              {loading ? (
                <div className="text-center py-8 text-on-surface-variant">{t("common.loading")}</div>
              ) : data?.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-md bg-surface-container-low dark:bg-surface-variant/10 rounded-xl border border-outline-variant/10">
                  <div className="flex items-center gap-md">
                    <div className="h-12 w-12 rounded-lg bg-surface-variant dark:bg-surface-container-highest flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant dark:text-outline">shopping_bag</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface dark:text-white">{order.orderNumber}</p>
                      <p className="text-label-sm text-on-surface-variant dark:text-outline">{order.customerName} &bull; {formatCurrency(order.total)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${statusStyles[order.status] || "bg-surface-container-high text-on-surface-variant"}`}>
                    {t(`orders.${order.status.toLowerCase()}`)}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="space-y-md">
            <h3 className="font-headline-md text-on-surface dark:text-white">{t("admin.inventory_alerts")}</h3>
            <div className="flex gap-md overflow-x-auto no-scrollbar pb-xs">
              {loading ? (
                <div className="text-center py-8 text-on-surface-variant w-full">{t("common.loading")}</div>
              ) : data?.lowStockProducts.map((p) => (
                <div key={p.id} className="min-w-[200px] bg-surface/70 dark:bg-inverse-surface/70 backdrop-blur-md border border-outline-variant/20 rounded-xl overflow-hidden shadow-soft">
                  <div className="h-32 w-full relative">
                    <img
                      className="w-full h-full object-cover"
                      src={p.image || "https://placehold.co/200x150?text=No+Image"}
                      alt={p.name}
                    />
                    <div className="absolute top-2 right-2 bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ONLY {p.stock} LEFT
                    </div>
                  </div>
                  <div className="p-base">
                    <p className="font-label-md text-label-md text-on-surface dark:text-white truncate">{p.name}</p>
                    <p className="text-label-sm text-on-surface-variant dark:text-outline">{p.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-2 h-16 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <a className="flex flex-col items-center justify-center text-primary bg-primary-container/30 rounded-full px-4 py-1" href="/admin/dashboard">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-label-sm text-label-sm">{t("admin.dashboard")}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/products">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-sm text-label-sm">{t("admin.products")}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/financial">
            <span className="material-symbols-outlined">account_balance</span>
            <span className="font-label-sm text-label-sm">{t("admin.financial_reports")}</span>
          </a>
          <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/profit-loss">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-sm text-label-sm">{t("admin.settings")}</span>
          </a>
        </nav>
      </main>
  );
}
