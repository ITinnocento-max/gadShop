import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

const statusFlow: Record<string, string[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["APPROVED", "REJECTED"],
  APPROVED: ["PAID"],
  REJECTED: ["SUBMITTED"],
  PAID: [],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    const existing = await prisma.expenseClaim.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Expense claim not found" }, { status: 404 });
    }

    const allowed = statusFlow[existing.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${existing.status} to ${status}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "APPROVED") updateData.approvedAt = new Date();
    if (status === "PAID") updateData.paidAt = new Date();

    const claim = await prisma.expenseClaim.update({
      where: { id },
      data: updateData,
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
        status: claim.status,
        totalAmount: Number(claim.totalAmount),
        approvedAt: claim.approvedAt,
        paidAt: claim.paidAt,
        items: claim.items.map((i) => ({
          id: i.id,
          description: i.description,
          amount: Number(i.amount),
          categoryName: i.category.name,
        })),
      })
    );
  } catch (error) {
    console.error("Admin expenses PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update expense claim" },
      { status: 500 }
    );
  }
}
