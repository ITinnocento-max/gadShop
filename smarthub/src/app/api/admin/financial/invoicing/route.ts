import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

function invoiceStatus(order: { status: string; paidAt: Date | null; createdAt: Date }) {
  if (order.status === "CANCELLED") return "Cancelled";
  if (order.status === "DELIVERED" || order.paidAt) return "Paid";
  const daysSinceCreation = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceCreation > 30) return "Overdue";
  return "Unpaid";
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true } },
        payments: { select: { status: true, amount: true, method: true } },
      },
    });

    const invoices = orders.map((o) => {
      const status = invoiceStatus(o);
      return {
        id: o.id.slice(-8).toUpperCase(),
        fullId: o.id,
        customer: o.user.name,
        date: o.createdAt,
        amount: Number(o.total),
        status,
        paymentMethod: o.payments.length > 0 ? o.payments[0].method : null,
      };
    });

    const totalInvoiced = invoices
      .filter((i) => i.status !== "Cancelled")
      .reduce((s, i) => s + i.amount, 0);

    const paid = invoices
      .filter((i) => i.status === "Paid")
      .reduce((s, i) => s + i.amount, 0);

    const outstanding = invoices
      .filter((i) => i.status === "Unpaid" || i.status === "Overdue")
      .reduce((s, i) => s + i.amount, 0);

    const overdue = invoices
      .filter((i) => i.status === "Overdue")
      .reduce((s, i) => s + i.amount, 0);

    const statusSummary = [
      { status: "Paid", total: paid, count: invoices.filter((i) => i.status === "Paid").length },
      { status: "Unpaid", total: outstanding - overdue, count: invoices.filter((i) => i.status === "Unpaid").length },
      { status: "Overdue", total: overdue, count: invoices.filter((i) => i.status === "Overdue").length },
      { status: "Cancelled", total: totalInvoiced - paid - outstanding, count: invoices.filter((i) => i.status === "Cancelled").length },
    ];

    return NextResponse.json(
      serializeResponse({
        kpis: {
          totalInvoiced,
          paid,
          outstanding,
          overdue,
        },
        invoices,
        statusSummary,
      })
    );
  } catch (error) {
    console.error("Admin invoicing API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoicing data" },
      { status: 500 }
    );
  }
}
