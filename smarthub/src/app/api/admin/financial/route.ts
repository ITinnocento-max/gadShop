import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

export async function GET() {
  try {
    const [totalRevenueAgg, payments, recentPayments] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["DELIVERED", "SHIPPED"] } },
      }),
      prisma.payment.groupBy({
        by: ["method"],
        _sum: { amount: true },
        _count: true,
        where: { status: "COMPLETED" },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
    ]);

    const totalRevenue = Number(totalRevenueAgg._sum.total || 0);
    const totalPayments = payments.reduce((sum, p) => sum + Number(p._sum.amount || 0), 0);
    const estimatedCOGS = totalRevenue * 0.42;
    const grossProfit = totalRevenue - estimatedCOGS;
    const estimatedExpenses = totalRevenue * 0.22;
    const netProfit = grossProfit - estimatedExpenses;
    const cashFlow = totalRevenue - estimatedCOGS - estimatedExpenses;

    const gatewayLabels: Record<string, string> = {
      MTN_MOMO: "MTN MoMo",
      AIRTEL_MONEY: "Airtel Money",
      VISA: "Visa",
      MASTERCARD: "Mastercard",
      COD: "Cash on Delivery",
      CARD: "Card",
      MOMO: "MoMo",
    };

    const gatewayBreakdown = payments
      .map((p) => {
        const method = p.method.toUpperCase();
        const amount = Number(p._sum.amount || 0);
        return {
          name: gatewayLabels[method] || p.method,
          key: method.toLowerCase(),
          amount,
          pct: totalPayments > 0 ? Math.round((amount / totalPayments) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const recentTransactions = recentPayments.map((p) => ({
      id: `#TR-${p.id.slice(-4).toUpperCase()}`,
      name: p.user.name,
      amount: Number(p.amount),
      status: p.status.toLowerCase(),
      method: gatewayLabels[p.method.toUpperCase()] || p.method,
    }));

    return NextResponse.json(
      serializeResponse({
        summary: {
          totalRevenue,
          grossProfit,
          netProfit,
          cashFlow,
        },
        gatewayBreakdown,
        recentTransactions,
      })
    );
  } catch (error) {
    console.error("Admin financial API error:", error);
    return NextResponse.json({ error: "Failed to fetch financial data" }, { status: 500 });
  }
}
