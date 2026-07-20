"use client";

import { useEffect, useState, useCallback } from "react";
import { useUIStore } from "@/stores/ui-store";
import jsPDF from "jspdf";

interface PaymentUser { id: string; name: string; email: string; }
interface PaymentOrder { id: string; total: number; status: string; }

interface Payment {
  id: string; method: string; status: string; transactionId: string | null;
  amount: number; createdAt: string;
  user: PaymentUser; order: PaymentOrder;
}

interface MethodSummary { method: string; count: number; total: number; }
interface StatusSummary { status: string; count: number; total: number; }

interface PaymentsResponse {
  payments: Payment[];
  total: number; page: number; limit: number; totalPages: number;
  methodSummary: MethodSummary[];
  statusSummary: StatusSummary[];
}

const paymentMethods: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  "MTN MoMo": { icon: "smartphone", label: "MTN MoMo", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  "Airtel Money": { icon: "smartphone", label: "Airtel Money", color: "text-error", bg: "bg-error/10" },
  CARD: { icon: "credit_card", label: "Card", color: "text-primary", bg: "bg-primary/10" },
  Visa: { icon: "credit_card", label: "Visa", color: "text-primary", bg: "bg-primary/10" },
  Mastercard: { icon: "credit_card", label: "Mastercard", color: "text-secondary", bg: "bg-secondary/10" },
  "Cash on Delivery": { icon: "payments", label: "Cash on Delivery", color: "text-tertiary", bg: "bg-tertiary/10" },
};

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-secondary/10 text-secondary",
  FAILED: "bg-error/10 text-error",
  PENDING: "bg-tertiary/10 text-tertiary",
  REFUNDED: "bg-surface-container-high text-outline",
};

const statusBgIcons: Record<string, string> = {
  COMPLETED: "bg-secondary/10",
  FAILED: "bg-error/10",
  PENDING: "bg-tertiary/10",
  REFUNDED: "bg-surface-container-high",
};

const statusLabels: Record<string, string> = {
  COMPLETED: "Completed",
  FAILED: "Failed",
  PENDING: "Pending",
  REFUNDED: "Refunded",
};

const statusFlow: Record<string, string[]> = {
  PENDING: ["COMPLETED", "FAILED"],
  COMPLETED: ["REFUNDED"],
  FAILED: ["PENDING"],
  REFUNDED: [],
};

function fmt(v: number) {
  return "RWF " + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PaymentsPage() {
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = useCallback(() => {
    setDownloading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let y = 30;

      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageW, 20, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text("Payment Monitoring", margin, 13);
      const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      pdf.setFontSize(8);
      pdf.text(`Generated: ${dateStr}`, pageW - margin, 13, { align: "right" });

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Payment Monitoring", margin, y);
      y += 10;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Manage and reconcile payment transactions across all gateways", margin, y);
      y += 10;
      pdf.setTextColor(0, 0, 0);

      if (data) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Method Summary", margin, y);
        y += 8;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        for (const m of data.methodSummary) {
          if (y > 260) { pdf.addPage(); y = 30; }
          pdf.text(`${m.method}: ${fmt(m.total)} (${m.count} payments)`, margin, y);
          y += 6;
        }
        y += 5;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Status Summary", margin, y);
        y += 8;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        for (const s of data.statusSummary) {
          if (y > 260) { pdf.addPage(); y = 30; }
          pdf.text(`${statusLabels[s.status] || s.status}: ${fmt(s.total)} (${s.count} payments)`, margin, y);
          y += 6;
        }
        y += 5;

        if (data.payments.length > 0) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text("Recent Transactions", margin, y);
          y += 8;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          for (const tx of data.payments.slice(0, 20)) {
            if (y > 260) { pdf.addPage(); y = 30; }
            pdf.text(`#${tx.id.slice(-8).toUpperCase()} | ${tx.user.name} | ${fmt(tx.amount)} | ${statusLabels[tx.status] || tx.status}`, margin, y);
            y += 5;
          }
        }
      }

      y = Math.max(y, 275);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text("SmartHub Shop - Payment Report", margin, y + 5);
      pdf.text(`Page ${pdf.getNumberOfPages()}`, pageW - margin, y + 5, { align: "right" });

      pdf.save(`Payment_Monitoring_${dateStr.replace(/\s+/g, "_")}.pdf`);
    } catch { window.print(); } finally { setDownloading(false); }
  }, [data]);

  const printReport = useCallback(() => { window.print(); }, []);

  const emailReport = useCallback(() => {
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    let content = `Payment Monitoring\nGenerated: ${dateStr}\n\n`;
    if (data) {
      content += "Method Summary:\n";
      for (const m of data.methodSummary) content += `${m.method}: ${fmt(m.total)} (${m.count} payments)\n`;
      content += "\nStatus Summary:\n";
      for (const s of data.statusSummary) content += `${statusLabels[s.status] || s.status}: ${fmt(s.total)} (${s.count} payments)\n`;
    }
    window.open(`mailto:?subject=${encodeURIComponent("Payment Monitoring - SmartHub Shop")}&body=${encodeURIComponent(content)}`, "_blank");
  }, [data]);

  const [refetchKey, setRefetchKey] = useState(0);
  const refetch = useCallback(() => setRefetchKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (methodFilter !== "all") params.set("method", methodFilter);
    params.set("page", String(page));
    params.set("limit", "20");
    fetch(`/api/admin/payments?${params}`)
      .then((r) => r.json())
      .then((res) => { if (!cancelled) setData(res); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search, statusFilter, methodFilter, page, refetchKey]);

  const updateStatus = async (paymentId: string, newStatus: string) => {
    setUpdating(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
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

  const gatewayIcons: Record<string, string> = {
    "MTN MoMo": "smartphone",
    "Airtel Money": "smartphone",
    CARD: "credit_card",
    Visa: "credit_card",
    Mastercard: "credit_card",
    "Cash on Delivery": "payments",
  };

  const inputCls = "w-full h-10 md:h-12 px-3 md:px-4 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20";
  const selectCls = "h-10 px-3 bg-surface-container-low border border-outline-variant/20 rounded-lg font-body-md outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="space-y-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">{"Payment Monitoring"}</h2>
          <p className="font-body-md text-body-md text-outline mt-1">Manage and reconcile payment transactions across all gateways</p>
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

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {data.methodSummary.map((m) => {
            const cfg = paymentMethods[m.method] || { icon: "payments", label: m.method, color: "text-primary", bg: "bg-primary/10" };
            return (
              <div key={m.method} className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${cfg.bg} ${cfg.color} rounded-xl flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-[20px]">{cfg.icon}</span>
                  </div>
                  <span className="font-label-md text-on-surface font-semibold">{cfg.label}</span>
                </div>
                <p className="text-headline-md font-headline-md text-on-surface">{fmt(m.total)}</p>
                <div className="flex justify-between text-label-sm font-label-sm text-outline">
                  <span>{m.count} Payments</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
          {data.statusSummary.map((s) => (
            <div key={s.status} className="bg-surface p-xl rounded-2xl shadow-soft border border-outline-variant/10 flex items-center gap-5">
              <div className={`w-16 h-16 ${statusBgIcons[s.status] || "bg-surface-container-high"} rounded-2xl flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-[28px] text-on-surface-variant">{s.status === "COMPLETED" ? "check_circle" : s.status === "FAILED" ? "cancel" : s.status === "PENDING" ? "schedule" : "undo"}</span>
              </div>
              <div>
                <p className="text-outline font-label-md text-label-md">{statusLabels[s.status] || s.status}</p>
                <p className="text-headline-md font-headline-md text-on-surface">{s.count}</p>
                <p className="text-body-md font-body-md text-on-surface-variant">{fmt(s.total)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-md">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={inputCls}
            placeholder="Search by transaction ID, order ID, or customer..."
          />
        </div>
        <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="all">{"All Gateways"}</option>
          {data?.methodSummary.map((m) => (
            <option key={m.method} value={m.method}>{m.method}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="all">{"All Statuses"}</option>
          {["PENDING", "COMPLETED", "FAILED", "REFUNDED"].map((s) => (
            <option key={s} value={s}>{statusLabels[s] || s}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface p-lg rounded-xl shadow-soft border border-outline-variant/10 overflow-x-auto">
        <h3 className="font-headline-md text-headline-md mb-1">{"Transactions"}</h3>
        <p className="text-outline font-label-md mb-xl">{data ? `${data.total} total transactions` : ""}</p>
        {loading ? (
          <div className="text-center py-12 text-outline">{"Loading..."}</div>
        ) : data?.payments.length === 0 ? (
          <div className="text-center py-12 text-outline">{"No transactions found"}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 text-label-sm font-label-sm text-outline uppercase">
                <th className="pb-3 pr-4">Transaction</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Gateway</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4 text-right">Amount</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.payments.map((tx) => {
                const allowedStatuses = statusFlow[tx.status] || [];
                const icon = gatewayIcons[tx.method] || "payments";
                return (
                <tr key={tx.id} className="border-b border-outline-variant/10 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="font-label-md text-on-surface">#{tx.id.slice(-8).toUpperCase()}</div>
                    <div className="text-label-sm text-outline">{tx.transactionId || "—"}</div>
                  </td>
                  <td className="py-3 pr-4 font-label-md text-on-surface-variant">{fmtDate(tx.createdAt)}</td>
                  <td className="py-3 pr-4 flex items-center gap-2 font-label-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    {tx.method}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-label-md text-on-surface">{tx.user.name}</div>
                    <div className="text-label-sm text-outline">{tx.user.email}</div>
                  </td>
                  <td className="py-3 pr-4 font-label-md text-right text-on-surface">{fmt(tx.amount)}</td>
                  <td className="py-3 pr-4">
                    {allowedStatuses.length > 0 ? (
                      <select
                        value={tx.status}
                        onChange={(e) => updateStatus(tx.id, e.target.value)}
                        disabled={updating === tx.id}
                        className="px-2 py-1 rounded-lg font-label-sm text-label-sm border border-outline-variant/20 bg-surface-container-low outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      >
                        <option value={tx.status} disabled>{statusLabels[tx.status] || tx.status}</option>
                        {allowedStatuses.map((s) => (
                          <option key={s} value={s}>{statusLabels[s] || s}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${statusStyles[tx.status] || "bg-surface-container-high text-outline"}`}>
                        {statusLabels[tx.status] || tx.status}
                      </span>
                    )}
                    {updating === tx.id && (
                      <span className="material-symbols-outlined text-[14px] animate-spin ml-1 align-middle">hourglass_top</span>
                    )}
                  </td>
                  <td className="py-3">
                    {tx.status === "COMPLETED" && (
                      <button
                        onClick={() => updateStatus(tx.id, "REFUNDED")}
                        disabled={updating === tx.id}
                        className="text-label-sm font-label-sm text-error hover:bg-error-container/20 px-2 py-1 rounded-lg transition-colors"
                      >
                        {"Refund"}
                      </button>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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
  );
}
