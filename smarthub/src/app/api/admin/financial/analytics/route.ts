import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";

    const now = new Date();
    let startDate: Date;
    let dateFormat: "day" | "week" | "month" | "quarter" | "year";

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        dateFormat = "day";
        break;
      case "weekly":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
        dateFormat = "week";
        break;
      case "monthly":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        dateFormat = "month";
        break;
      case "quarterly":
        startDate = new Date(now.getFullYear() - 3, now.getMonth(), 1);
        dateFormat = "month";
        break;
      case "yearly":
        startDate = new Date(now.getFullYear() - 5, 0, 1);
        dateFormat = "year";
        break;
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        dateFormat = "month";
    }

    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      totalPayments,
      totalExpenses,
      paymentMethodData,
      ordersByPeriod,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, _count: { id: true } }),
      prisma.expenseClaim.aggregate({ _sum: { totalAmount: true } }),
      prisma.payment.groupBy({
        by: ["method"],
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        select: { total: true, createdAt: true },
      }),
    ]);

    const totalExpensesSum = Number(totalExpenses._sum.totalAmount || 0);
    const revenue = Number(totalRevenue._sum.total || 0);
    const profit = revenue - totalExpensesSum;
    const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

    const metrics = {
      sales_analytics: { value: revenue, trend: revenue > 0 ? "up" : "neutral" as const },
      customer_analytics: { value: totalCustomers, trend: totalCustomers > 0 ? "up" : "neutral" as const },
      product_analytics: { value: totalProducts, trend: totalProducts > 0 ? "up" : "neutral" as const },
      payment_analytics: { value: totalPayments._count.id, trend: totalPayments._count.id > 0 ? "up" : "neutral" as const },
      revenue_analytics: { value: revenue, trend: revenue > 0 ? "up" : "neutral" as const },
      profit_analytics: { value: profit, trend: profit >= 0 ? "up" : "down" as const },
      expense_analytics: { value: totalExpensesSum, trend: totalExpensesSum > 0 ? "up" : "neutral" as const },
    };

    const periodTotals: Record<string, { revenue: number; expenses: number }> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (const order of ordersByPeriod) {
      const d = new Date(order.createdAt);
      let key: string;
      if (dateFormat === "day") {
        key = `${d.getMonth() + 1}/${d.getDate()}`;
      } else if (dateFormat === "week") {
        const weekNum = Math.ceil(d.getDate() / 7);
        key = `${monthNames[d.getMonth()]} W${weekNum}`;
      } else if (dateFormat === "month") {
        key = monthNames[d.getMonth()];
      } else if (dateFormat === "year") {
        key = String(d.getFullYear());
      } else {
        key = monthNames[d.getMonth()];
      }
      if (!periodTotals[key]) periodTotals[key] = { revenue: 0, expenses: 0 };
      periodTotals[key].revenue += Number(order.total);
    }

    const trendData = Object.entries(periodTotals).map(([label, vals]) => ({
      label,
      revenue: Math.round(vals.revenue * 100) / 100,
      expenses: Math.round(vals.expenses * 100) / 100,
    }));

    const totalMethodPayments = paymentMethodData.reduce((s, m) => s + Number(m._sum.amount || 0), 0);
    const gatewayData = paymentMethodData.map((m) => ({
      name: m.method,
      total: Number(m._sum.amount || 0),
      pct: totalMethodPayments > 0 ? Math.round((Number(m._sum.amount || 0) / totalMethodPayments) * 100) : 0,
      count: m._count.id,
    }));

    return NextResponse.json(
      serializeResponse({
        metrics,
        trendData,
        gatewayData,
        summary: {
          totalOrders,
          totalRevenue: revenue,
          totalCustomers,
          totalProducts,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          totalExpenses: totalExpensesSum,
          profit,
        },
      })
    );
  } catch (error) {
    console.error("Admin analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
