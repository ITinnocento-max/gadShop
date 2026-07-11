import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

export async function GET() {
  try {
    const [
      claims,
      allClaims,
      recurringList,
      categoryItems,
    ] = await Promise.all([
      prisma.expenseClaim.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          items: {
            include: { category: { select: { id: true, name: true } } },
          },
        },
      }),
      prisma.expenseClaim.findMany({
        select: { id: true, status: true, totalAmount: true },
      }),
      prisma.recurringExpense.findMany({
        where: { isActive: true },
        select: { id: true, amount: true, description: true, frequency: true, nextDueDate: true },
      }),
      prisma.expenseClaimItem.groupBy({
        by: ["categoryId"],
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const categoryIds = categoryItems.map((c) => c.categoryId);
    const categories = categoryIds.length > 0
      ? await prisma.expenseCategory.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const categoryBreakdown = categoryItems
      .map((c) => ({
        categoryId: c.categoryId,
        categoryName: categoryMap.get(c.categoryId) || "Unknown",
        total: Number(c._sum.amount || 0),
        count: c._count.id,
      }))
      .sort((a, b) => b.total - a.total);

    const totalAll = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
    const categoryPercent = categoryBreakdown.map((c) => ({
      name: c.categoryName,
      total: c.total,
      pct: totalAll > 0 ? Math.round((c.total / totalAll) * 100) : 0,
    }));

    const totalExpenses = allClaims
      .filter((c) => ["APPROVED", "PAID"].includes(c.status))
      .reduce((sum, c) => sum + Number(c.totalAmount), 0);

    const pendingClaimsTotal = allClaims
      .filter((c) => c.status === "SUBMITTED")
      .reduce((sum, c) => sum + Number(c.totalAmount), 0);

    const approvedTotal = allClaims
      .filter((c) => c.status === "APPROVED")
      .reduce((sum, c) => sum + Number(c.totalAmount), 0);

    const recurringTotal = recurringList.reduce(
      (sum, r) => sum + Number(r.amount),
      0
    );

    return NextResponse.json(
      serializeResponse({
        kpis: {
          totalExpenses,
          pendingClaimsTotal,
          approvedTotal,
          recurringTotal,
        },
        categoryBreakdown: categoryPercent,
        claims: claims.map((c) => ({
          id: c.id,
          claimNumber: c.claimNumber,
          title: c.title,
          description: c.description,
          status: c.status,
          totalAmount: Number(c.totalAmount),
          createdAt: c.createdAt,
          submittedById: c.submittedById,
          items: c.items.map((i) => ({
            id: i.id,
            description: i.description,
            amount: Number(i.amount),
            categoryName: i.category.name,
          })),
        })),
        recurringExpenses: recurringList.map((r) => ({
          id: r.id,
          description: r.description,
          amount: Number(r.amount),
          frequency: r.frequency,
          nextDueDate: r.nextDueDate,
        })),
      })
    );
  } catch (error) {
    console.error("Admin expenses API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}
