import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (method && method !== "all") where.method = method;

    if (search) {
      where.OR = [
        { transactionId: { contains: search } },
        { order: { id: { contains: search } } },
        { user: { name: { contains: search } } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: { select: { id: true, total: true, status: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    const methodSummary = await prisma.payment.groupBy({
      by: ["method"],
      _count: { id: true },
      _sum: { amount: true },
    });

    const statusSummary = await prisma.payment.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { amount: true },
    });

    return NextResponse.json(
      serializeResponse({
        payments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        methodSummary: methodSummary.map((m) => ({
          method: m.method,
          count: m._count.id,
          total: Number(m._sum.amount || 0),
        })),
        statusSummary: statusSummary.map((s) => ({
          status: s.status,
          count: s._count.id,
          total: Number(s._sum.amount || 0),
        })),
      })
    );
  } catch (error) {
    console.error("Admin payments API error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
