import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const { user, error } = await requireAdmin();
  if (error) return error;
  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: ["DELIVERED", "SHIPPED"] } },
      select: {
        total: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: { costPrice: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const monthlyMap: Record<string, { revenue: number; cogs: number; count: number }> = {};
    for (const order of orders) {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, cogs: 0, count: 0 };
      monthlyMap[key].revenue += Number(order.total);
      monthlyMap[key].count += 1;

      for (const item of order.items) {
        const cost = item.product.costPrice ? Number(item.product.costPrice) : 0;
        monthlyMap[key].cogs += cost * item.quantity;
      }
    }

    const months = Object.entries(monthlyMap).sort(([a], [b]) => a.localeCompare(b));
    const totalRevenue = months.reduce((s, [, v]) => s + v.revenue, 0);
    const totalOrders = months.reduce((s, [, v]) => s + v.count, 0);

    const placeholderExpenseCategories = [
      { name: "Marketing (Social Ads)", rate: 0.09 },
      { name: "Cloud Infrastructure", rate: 0.04 },
      { name: "Salaries & Wages", rate: 0.09 },
    ];

    const monthlyRows = months.map(([month, data]) => {
      const revenue = data.revenue;
      const cogs = data.cogs;
      const grossProfit = revenue - cogs;
      const expenses = placeholderExpenseCategories.reduce((s, c) => s + revenue * c.rate, 0);
      const netProfit = grossProfit - expenses;
      return { month, revenue, cogs, grossProfit, expenses, netProfit };
    });

    const totals = monthlyRows.reduce(
      (acc, row) => ({
        revenue: acc.revenue + row.revenue,
        cogs: acc.cogs + row.cogs,
        grossProfit: acc.grossProfit + row.grossProfit,
        expenses: acc.expenses + row.expenses,
        netProfit: acc.netProfit + row.netProfit,
      }),
      { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 }
    );

    const expenseBreakdown = placeholderExpenseCategories.map((c) => ({
      name: c.name,
      amount: totalRevenue * c.rate,
      pct: Math.round(c.rate * 100),
    }));

    return NextResponse.json(
      serializeResponse({
        summary: {
          totalRevenue,
          totalOrders,
          grossProfit: totals.grossProfit,
          operatingExpenses: totals.expenses,
          netProfit: totals.netProfit,
        },
        monthlyRows,
        totals,
        expenseBreakdown,
      })
    );
  } catch (error) {
    console.error("Admin profit-loss API error:", error);
    return NextResponse.json({ error: "Failed to fetch profit-loss data" }, { status: 500 });
  }
}
