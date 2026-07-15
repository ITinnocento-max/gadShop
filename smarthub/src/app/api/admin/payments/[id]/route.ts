import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
      include: {
        order: { select: { id: true, total: true, status: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(payment);
  } catch {
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
