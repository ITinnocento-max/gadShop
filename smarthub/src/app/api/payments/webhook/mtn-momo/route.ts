import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const referenceId = body.externalId || body.financialTransactionId || body.referenceId;

    if (!referenceId) {
      console.warn("MTN webhook: no reference ID found", body);
      return NextResponse.json({ received: true });
    }

    let status: "COMPLETED" | "FAILED" | "PENDING" = "PENDING";
    if (body.status === "SUCCESSFUL") status = "COMPLETED";
    else if (body.status === "FAILED") status = "FAILED";

    const payment = await prisma.payment.findFirst({
      where: { transactionId: referenceId },
      include: { order: true },
    });

    if (!payment) {
      console.warn("MTN webhook: payment not found for reference", referenceId);
      return NextResponse.json({ received: true });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status },
    });

    if (status === "COMPLETED") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PROCESSING", paidAt: new Date() },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("MTN webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
