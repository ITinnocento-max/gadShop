"use client";

import { useEffect, useState, useCallback } from "react";
import { useUIStore } from "@/stores/ui-store";
import Link from "next/link";
import { formatDate, formatPricePlain } from "@/lib/utils";

interface OrderItem {
  id: string; name: string; price: number; quantity: number;
}

interface Payment {
  method: string; status: string; amount: number;
}

interface ShippingAddress {
  street: string; city: string; state: string; zip: string; country: string;
}

interface Order {
  id: string; status: string; total: number; paymentMethod: string | null;
  createdAt: string; paidAt: string | null;
  user: { id: string; name: string; email: string };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  payments: Payment[];
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-tertiary-container/20 text-tertiary",
  PROCESSING: "bg-primary-container/20 text-primary",
  SHIPPED: "bg-secondary-container/30 text-on-secondary-container",
  DELIVERED: "bg-secondary-container/30 text-on-secondary-container",
  CANCELLED: "bg-error-container/20 text-error",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusFlow: Record<string, string[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const [refetchKey, setRefetchKey] = useState(0);
  const refetch = useCallback(() => setRefetchKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", "20");
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((res) => { if (!cancelled) setData(res); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search, statusFilter, page, refetchKey]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) refetch();
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  const selectCls = "px-2 py-1 rounded-lg font-label-sm text-label-sm border border-outline-variant/20 bg-surface-container-low outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer";
  const inputCls = "w-full h-10 md:h-12 px-3 md:px-4 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-on-surface-variant active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline-md text-headline-md-mobile md:text-headline-md text-primary">{"Manage Orders"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-label-sm text-outline">{data ? `${data.total} orders` : ""}</span>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-lg pb-28 md:pb-12 space-y-lg">
        <div className="flex flex-col md:flex-row gap-md">
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={inputCls}
              placeholder="Search by order ID or customer name..."
            />
          </div>
          <div className="flex gap-sm overflow-x-auto no-scrollbar">
            {["all", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {s === "all" ? "All" : statusLabels[s] || s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-outline">{"Loading..."}</div>
        ) : data?.orders.length === 0 ? (
          <div className="text-center py-16 text-outline">{"No orders found"}</div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/10 text-label-sm text-outline uppercase">
                  <th className="p-md pr-2">Order ID</th>
                  <th className="p-md pr-2">Customer</th>
                  <th className="p-md pr-2">Items</th>
                  <th className="p-md pr-2 text-right">Total</th>
                  <th className="p-md pr-2">Shipping</th>
                  <th className="p-md pr-2">Payment</th>
                  <th className="p-md pr-2">Status</th>
                  <th className="p-md">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.orders.map((order) => {
                  const addr = order.shippingAddress;
                  const allowedStatuses = statusFlow[order.status] || [];
                  return (
                  <tr key={order.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-variant/20 transition-colors">
                    <td className="p-md pr-2 font-label-md text-on-surface">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="p-md pr-2">
                      <div className="font-label-md text-on-surface">{order.user.name}</div>
                      <div className="text-label-sm text-outline">{order.user.email}</div>
                    </td>
                    <td className="p-md pr-2 font-body-md text-on-surface-variant">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      <div className="text-label-sm text-outline truncate max-w-[160px]">{order.items.map((i) => i.name).join(", ")}</div>
                    </td>
                    <td className="p-md pr-2 font-label-md text-right text-on-surface">{formatPricePlain(order.total)}</td>
                    <td className="p-md pr-2">
                      <div className="font-label-sm text-on-surface">{addr?.street}</div>
                      <div className="text-label-sm text-outline">{addr?.city}, {addr?.state} {addr?.zip}</div>
                    </td>
                    <td className="p-md pr-2">
                      <span className={`font-label-sm ${order.payments?.[0]?.status === "COMPLETED" ? "text-secondary" : "text-tertiary"}`}>
                        {order.payments?.[0]?.method || "—"}
                      </span>
                    </td>
                    <td className="p-md pr-2">
                      {allowedStatuses.length > 0 ? (
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className={selectCls}
                        >
                          <option value={order.status} disabled>{statusLabels[order.status] || order.status}</option>
                          {allowedStatuses.map((s) => (
                            <option key={s} value={s}>{statusLabels[s] || s}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${statusColors[order.status] || "bg-surface-container-high text-on-surface-variant"}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      )}
                      {updating === order.id && (
                        <span className="material-symbols-outlined text-[14px] animate-spin ml-1 align-middle">hourglass_top</span>
                      )}
                    </td>
                    <td className="p-md font-label-md text-outline">{formatDate(order.createdAt)}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 h-10 border border-outline-variant rounded-lg font-label-md text-on-surface-variant hover:bg-surface-variant/50 disabled:opacity-30 transition-colors"
            >
              {"Previous"}
            </button>
            <span className="font-label-md text-on-surface-variant">Page {data.page} of {data.totalPages}</span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 h-10 border border-outline-variant rounded-lg font-label-md text-on-surface-variant hover:bg-surface-variant/50 disabled:opacity-30 transition-colors"
            >
              {"Next"}
            </button>
          </div>
        )}
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-2 h-16 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/dashboard"><span className="material-symbols-outlined">dashboard</span><span className="font-label-sm text-label-sm">{"Dashboard"}</span></Link>
        <Link className="flex flex-col items-center justify-center text-primary bg-primary-container/30 rounded-full px-4 py-1" href="/admin/orders"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span><span className="font-label-sm text-label-sm">{"Orders"}</span></Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/products"><span className="material-symbols-outlined">inventory_2</span><span className="font-label-sm text-label-sm">{"Products"}</span></Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" href="/admin/financial"><span className="material-symbols-outlined">account_balance</span><span className="font-label-sm text-label-sm">{"Financial"}</span></Link>
      </nav>
    </main>
  );
}
