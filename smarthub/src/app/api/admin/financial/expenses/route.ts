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
      allCategories,
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
      prisma.expenseCategory.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
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
        categories: allCategories.map((c) => ({ id: c.id, name: c.name })),
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, submittedById, notes, items } = body;

    if (!title || !submittedById || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "title, submittedById, and items (non-empty array) are required" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.description || !item.amount || !item.categoryId) {
        return NextResponse.json(
          { error: "Each item requires description, amount, and categoryId" },
          { status: 400 }
        );
      }
    }

    const lastClaim = await prisma.expenseClaim.findFirst({
      orderBy: { createdAt: "desc" },
      select: { claimNumber: true },
    });
    const nextNum = lastClaim
      ? String(parseInt(lastClaim.claimNumber.replace("EXP-", ""), 10) + 1).padStart(5, "0")
      : "00001";
    const claimNumber = `EXP-${nextNum}`;

    const totalAmount = items.reduce(
      (sum: number, i: { amount: number }) => sum + Number(i.amount),
      0
    );

    const claim = await prisma.expenseClaim.create({
      data: {
        claimNumber,
        title,
        description: description || null,
        status: "DRAFT",
        totalAmount,
        notes: notes || null,
        submittedById,
        items: {
          create: items.map((i: { description: string; amount: number; categoryId: string; receiptDate?: string }) => ({
            description: i.description,
            amount: Number(i.amount),
            categoryId: i.categoryId,
            receiptDate: i.receiptDate ? new Date(i.receiptDate) : null,
          })),
        },
      },
      include: {
        items: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json(
      serializeResponse({
        id: claim.id,
        claimNumber: claim.claimNumber,
        title: claim.title,
        description: claim.description,
        status: claim.status,
        totalAmount: Number(claim.totalAmount),
        createdAt: claim.createdAt,
        submittedById: claim.submittedById,
        items: claim.items.map((i) => ({
          id: i.id,
          description: i.description,
          amount: Number(i.amount),
          categoryName: i.category.name,
        })),
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin expenses POST error:", error);
    return NextResponse.json(
      { error: "Failed to create expense claim" },
      { status: 500 }
    );
  }
}
