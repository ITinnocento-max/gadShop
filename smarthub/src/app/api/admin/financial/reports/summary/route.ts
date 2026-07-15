import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const { user, error } = await requireAdmin();
  if (error) return error;
  try {
    const [orderAgg, paymentAgg, claimAgg, productCount] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.expenseClaim.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json(
      serializeResponse({
        total_revenue: orderAgg._sum.total || 0,
        total_orders: orderAgg._count.id,
        total_payments: paymentAgg._sum.amount || 0,
        total_expenses: claimAgg._sum.totalAmount || 0,
        active_products: productCount,
      })
    );
  } catch (error) {
    console.error("Reports summary API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report summary" },
      { status: 500 }
    );
  }
}
