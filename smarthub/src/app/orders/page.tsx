"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { CustomerGuard } from "@/components/customer/customer-guard";
import { useTranslation } from "@/hooks/useTranslation";

interface OrderItem {
  id: string; name: string; price: number; quantity: number; image: string | null;
  product: { images: string[] };
}

interface Order {
  id: string; status: string; total: number; paymentMethod: string | null;
  createdAt: string; items: OrderItem[];
}

const statusColors: Record<string, string> = {
  PENDING: "text-tertiary",
  PROCESSING: "text-tertiary",
  SHIPPED: "text-secondary",
  DELIVERED: "text-secondary",
  CANCELLED: "text-error",
};

const statusIcons: Record<string, string> = {
  PENDING: "schedule",
  PROCESSING: "settings_suggest",
  SHIPPED: "local_shipping",
  DELIVERED: "check_circle",
  CANCELLED: "cancel",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) {
    return `Today, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatPrice(amount: number) {
  return `RWF ${amount.toFixed(2)}`;
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/orders?userId=${userId}`)
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = statusFilter === "All"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  return (
    <CustomerGuard>
      <Header showBack title="SmartHub Store" />
      <main className="flex-grow pt-24 pb-28 px-margin-mobile max-w-7xl mx-auto w-full">
        <section className="mb-lg space-y-md">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface dark:text-white">{t("orders.title")}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline mt-1">{t("orders.subtitle")}</p>
            </div>
          </div>
          <div className="flex gap-sm overflow-x-auto pb-2 no-scrollbar">
            {["All", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-5 py-2 rounded-full font-label-md text-label-md whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high dark:bg-surface-variant/20 text-on-surface-variant dark:text-outline hover:bg-surface-container-highest dark:hover:bg-surface-variant/30 transition-colors"
                }`}
              >
                {s === "All" ? t("orders.all_orders") : statusLabels[s] || s}
              </button>
            ))}
          </div>
        </section>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">receipt_long</span>
            <h3 className="font-headline-md text-on-surface dark:text-white mb-2">{t("orders.no_orders")}</h3>
            <p className="font-body-md text-on-surface-variant dark:text-outline mb-6">{t("orders.no_orders_desc")}</p>
            <button onClick={() => router.push("/products")} className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md">{t("cart.browse_products")}</button>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          {filtered.map((order) => {
            const status = statusLabels[order.status] || order.status;
            const icon = statusIcons[order.status] || "receipt";
            return (
            <div key={order.id} className="bg-surface dark:bg-inverse-surface shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 rounded-xl p-md border border-outline-variant/20 transition-all hover:shadow-raised hover:-translate-y-0.5 group">
              <div className="flex justify-between items-start mb-md">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-surface-container-high dark:bg-surface-variant/20 flex items-center justify-center`}>
                    <span className="material-symbols-outlined" style={order.status === "DELIVERED" ? { color: "#006b55" } : undefined}>{icon}</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm text-outline dark:text-outline-variant uppercase tracking-wider">{t("common.order_number")}{order.id}</span>
                    <h3 className={`font-headline-md text-headline-md ${statusColors[order.status] || "text-on-surface dark:text-white"}`}>{status}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-label-md text-label-md text-on-surface dark:text-white">{formatDate(order.createdAt)}</p>
                  <p className="font-headline-md text-headline-md text-primary dark:text-inverse-primary">{formatPrice(order.total)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-lg">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-surface dark:border-inverse-surface bg-cover bg-center" style={{ backgroundImage: `url(${item.product.images[0] || item.image || ""})` }} />
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-10 h-10 rounded-full border-2 border-surface dark:border-inverse-surface bg-surface-container-high dark:bg-surface-variant/20 flex items-center justify-center font-label-sm text-label-sm text-on-surface-variant dark:text-outline">+{order.items.length - 3}</div>
                  )}
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">{order.items.map((i) => i.name).join(", ")}</p>
              </div>
              <div className="flex items-center justify-between pt-md border-t border-outline-variant/30">
                <button onClick={() => router.push(`/orders/${order.id}`)} className="font-label-md text-label-md text-primary dark:text-inverse-primary hover:bg-primary-container/10 flex items-center gap-1 px-4 py-2 rounded-lg transition-colors">
                  {t("orders.view_details")} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                  <button className="font-label-md text-label-md text-error hover:bg-error-container/20 px-4 py-2 rounded-lg transition-colors">
                    {t("orders.cancel_order")}
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
        )}
      </main>
      <BottomNav />
    </CustomerGuard>
  );
}
