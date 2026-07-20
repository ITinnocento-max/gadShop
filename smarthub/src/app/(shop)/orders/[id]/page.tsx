"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { CustomerGuard } from "@/components/customer/customer-guard";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDateTime } from "@/lib/utils";

interface OrderItem {
  id: string; name: string; price: number; quantity: number;
  image: string | null; variant: string | null; color: string | null;
  product: { images: string[] };
}

interface Payment {
  id: string; method: string; status: string; amount: number;
}

interface Address {
  street: string; city: string; state: string; zip: string; country: string;
}

interface OrderDetail {
  id: string; status: string; total: number; paymentMethod: string | null;
  subtotal: number | null; createdAt: string; paidAt: string | null;
  deliveredAt: string | null;
  items: OrderItem[];
  payments: Payment[];
  shippingAddress: Address;
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending", PROCESSING: "Processing", SHIPPED: "In Transit",
  DELIVERED: "Delivered", CANCELLED: "Cancelled",
};

const timelineSteps = [
  "order_placed", "payment_confirmed", "processing",
  "shipped", "out_for_delivery", "delivered",
];

const statusToStep: Record<string, number> = {
  PENDING: 1, PROCESSING: 2, SHIPPED: 3, DELIVERED: 5,
};

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setOrder(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [params?.id]);

  if (loading) {
    return (
      <CustomerGuard>
        <Header showBack title={t("orders.order_details")} />
        <main className="flex-grow pt-4 pb-28 px-margin-mobile max-w-5xl mx-auto w-full flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <BottomNav />
      </CustomerGuard>
    );
  }

  if (!order) {
    return (
      <CustomerGuard>
        <Header showBack title={t("orders.order_details")} />
        <main className="flex-grow pt-4 pb-28 px-margin-mobile max-w-5xl mx-auto w-full flex flex-col items-center justify-center min-h-[60vh]">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-3">block</span>
          <h3 className="font-headline-md">Order not found</h3>
        </main>
        <BottomNav />
      </CustomerGuard>
    );
  }

  const status = statusLabels[order.status] || order.status;
  const paidAt = order.paidAt ? formatDateTime(order.paidAt) : null;
  const deliveredAt = order.deliveredAt ? formatDateTime(order.deliveredAt) : null;
  const completedStep = statusToStep[order.status] || 1;
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = order.total - subtotal;

  return (
    <CustomerGuard>
      <Header showBack title={t("orders.order_details")} />
      <main className="flex-grow pt-4 pb-28 px-margin-mobile max-w-5xl mx-auto w-full">
        <section className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-lg shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 border border-outline-variant/10 mb-lg">
          <div className="flex items-center justify-between mb-md">
            <div>
              <p className="font-label-sm text-outline dark:text-outline-variant uppercase tracking-wider">{t("common.order_number")}{order.id}</p>
              <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white mt-0.5">{status}</h2>
            </div>
            <span className="font-headline-md text-headline-md text-primary dark:text-inverse-primary">Rwf {order.total.toFixed(2)}</span>
          </div>
          <p className="font-label-md text-on-surface-variant dark:text-outline">{t("orders.placed_on")} {formatDateTime(order.createdAt)}</p>
        </section>

        <section className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-lg shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 border border-outline-variant/10 mb-lg">
          <h3 className="font-label-md text-on-surface dark:text-white mb-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary dark:text-inverse-primary">local_shipping</span>
            {t("orders.tracking_timeline")}
          </h3>
          <div className="space-y-0">
            {timelineSteps.map((step, i) => {
              const completed = i < completedStep;
              return (
              <div key={step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completed ? "bg-secondary text-on-secondary" : "bg-surface-container-high dark:bg-surface-variant/20 text-outline dark:text-outline-variant"}`}>
                    {completed ? (
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-outline-variant dark:bg-outline-variant/30" />
                    )}
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div className={`w-0.5 h-8 ${completed ? "bg-secondary" : "bg-outline-variant/30 dark:bg-outline-variant/30"}`} />
                  )}
                </div>
                <div className={`pb-6 ${i === timelineSteps.length - 1 ? "pb-0" : ""}`}>
                  <p className={`font-label-md ${completed ? "text-on-surface dark:text-white" : "text-on-surface-variant dark:text-outline"}`}>{t(`orders.${step}`)}</p>
                  <p className="font-label-sm text-outline dark:text-outline-variant">
                    {step === "delivered" && deliveredAt ? deliveredAt :
                     step === "shipped" && paidAt && completed ? paidAt :
                     step === "payment_confirmed" && paidAt ? paidAt :
                     step === "order_placed" ? formatDateTime(order.createdAt) : ""}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </section>

        <section className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-lg shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 border border-outline-variant/10 mb-lg">
          <h3 className="font-label-md text-on-surface dark:text-white mb-md">{t("orders.order_items")}</h3>
          <div className="space-y-md">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-md">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container dark:bg-surface-variant/10 shrink-0">
                  <Image className="w-full h-full object-cover" src={item.product.images[0] || item.image || ""} alt={item.name} width={64} height={64} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-on-surface dark:text-white truncate">{item.name}</p>
                  <p className="font-label-sm text-on-surface-variant dark:text-outline">
                    {[item.color, item.variant].filter(Boolean).join(" \u2022 ")}{item.color || item.variant ? " \u2022 " : ""}Qty: {item.quantity}
                  </p>
                  <p className="font-label-md text-primary dark:text-inverse-primary">Rwf {item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
          <section className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-lg shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 border border-outline-variant/10">
            <h3 className="font-label-md text-on-surface dark:text-white mb-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary dark:text-inverse-primary">location_on</span>
              {t("orders.shipping_address")}
            </h3>
            <p className="font-body-md text-on-surface-variant dark:text-outline">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
          </section>
          <section className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-lg shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 border border-outline-variant/10">
            <h3 className="font-label-md text-on-surface dark:text-white mb-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary dark:text-inverse-primary">payments</span>
              {t("orders.payment_method")}
            </h3>
            <p className="font-body-md text-on-surface-variant dark:text-outline">{order.paymentMethod || order.payments[0]?.method || "N/A"}</p>
          </section>
        </div>

        <section className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-lg shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 border border-outline-variant/10 mb-lg">
          <h3 className="font-label-md text-on-surface dark:text-white mb-md">{t("orders.payment_summary")}</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-body-md text-on-surface-variant dark:text-outline">
              <span>{t("orders.subtotal")}</span>
              <span>Rwf {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body-md text-on-surface-variant dark:text-outline">
              <span>{t("orders.shipping")}</span>
              <span className="text-secondary">{t("orders.free")}</span>
            </div>
            <div className="flex justify-between text-body-md text-on-surface-variant dark:text-outline">
              <span>{t("orders.tax")}</span>
              <span>Rwf {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-headline-md text-headline-md pt-md border-t border-outline-variant/20 dark:border-outline-variant/30">
              <span>{t("orders.total")}</span>
              <span className="text-primary dark:text-inverse-primary">Rwf {order.total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <div className="flex gap-md">
          <button onClick={() => router.push("/orders")} className="flex-1 py-3 border border-outline-variant dark:border-outline-variant/30 text-on-surface-variant dark:text-outline rounded-xl font-label-md hover:bg-surface-container-low dark:hover:bg-surface-variant/10 active:scale-[0.98] transition-all">
            {t("orders.back_to_orders")}
          </button>
          <button onClick={() => router.push("/products")} className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label-md active:scale-[0.98] transition-all shadow-md">
            {t("orders.buy_again")}
          </button>
        </div>
      </main>
      <BottomNav />
    </CustomerGuard>
  );
}
