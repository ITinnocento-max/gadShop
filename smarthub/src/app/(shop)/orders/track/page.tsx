"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/store/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { formatDateSmart } from "@/lib/utils";

interface OrderItem {
  id: string; name: string; price: number; quantity: number; image: string | null;
  product: { images: string[] };
}

interface Order {
  id: string; status: string; total: number; paymentMethod: string | null;
  createdAt: string; items: OrderItem[];
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending", PROCESSING: "Processing", SHIPPED: "In Transit",
  DELIVERED: "Delivered", CANCELLED: "Cancelled",
};

const statusIcons: Record<string, string> = {
  PENDING: "schedule", PROCESSING: "settings_suggest", SHIPPED: "local_shipping",
  DELIVERED: "check_circle", CANCELLED: "cancel",
};

function TrackContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchOrders = async (query: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await fetchOrders(email);
  };

  useEffect(() => {
    if (email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchOrders(email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header showBack title="SmartHub Store" />
      <main className="flex-grow pt-24 pb-28 px-margin-mobile max-w-4xl mx-auto w-full">
        <section className="mb-lg">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface dark:text-white">Track Your Order</h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline mt-1">Enter the email address used at checkout to view your orders.</p>
        </section>
        <form onSubmit={handleSearch} className="mb-lg flex gap-md">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 h-12 bg-surface-container-low dark:bg-surface-variant/10 border-none rounded-lg px-md focus:ring-2 focus:ring-primary dark:focus:ring-inverse-primary transition-all"
            required
          />
          <button type="submit" className="bg-primary text-on-primary h-12 px-6 rounded-full font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">search</span>
            Search
          </button>
        </form>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        ) : searched && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">receipt_long</span>
            <h3 className="font-headline-md text-on-surface dark:text-white mb-2">No orders found</h3>
            <p className="font-body-md text-on-surface-variant dark:text-outline mb-6">No orders were found for this email address. Please check and try again.</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
            {orders.map((order) => {
              const status = statusLabels[order.status] || order.status;
              const icon = statusIcons[order.status] || "receipt";
              return (
                <div key={order.id} className="bg-surface dark:bg-inverse-surface shadow-soft dark:shadow-none dark:border dark:border-outline-variant/10 rounded-xl p-md border border-outline-variant/20">
                  <div className="flex justify-between items-start mb-md">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-high dark:bg-surface-variant/20 flex items-center justify-center">
                        <span className="material-symbols-outlined" style={order.status === "DELIVERED" ? { color: "#006b55" } : undefined}>{icon}</span>
                      </div>
                      <div>
                        <span className="font-label-sm text-label-sm text-outline dark:text-outline-variant uppercase tracking-wider">Order #{order.id}</span>
                        <h3 className={`font-headline-md text-headline-md ${order.status === "CANCELLED" ? "text-error" : "text-on-surface dark:text-white"}`}>{status}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-label-md text-label-md text-on-surface dark:text-white">{formatDateSmart(order.createdAt)}</p>
                      <p className="font-headline-md text-headline-md text-primary dark:text-inverse-primary">RWF {order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-md">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-surface dark:border-inverse-surface bg-cover bg-center" style={{ backgroundImage: `url(${item.product.images[0] || item.image || ""})` }} />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-full border-2 border-surface dark:border-inverse-surface bg-surface-container-high dark:bg-surface-variant/20 flex items-center justify-center font-label-sm text-label-sm text-on-surface-variant dark:text-outline">+{order.items.length - 3}</div>
                      )}
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline truncate">{order.items.map((i) => i.name).join(", ")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </main>
      <BottomNav />
    </>
  );
}

export default function GuestOrderTrackPage() {
  return (
    <Suspense fallback={
      <>
        <Header showBack title="SmartHub Store" />
        <main className="flex-grow pt-24 pb-28 px-margin-mobile max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        </main>
      </>
    }>
      <TrackContent />
    </Suspense>
  );
}
