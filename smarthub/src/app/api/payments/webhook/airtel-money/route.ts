import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const transactionId =
      body.transaction?.id || body.transactionId || body.reference;

    if (!transactionId) {
      console.warn("Airtel webhook: no transaction ID found", body);
      return NextResponse.json({ received: true });
    }

    let status: "COMPLETED" | "FAILED" | "PENDING" = "PENDING";
    const gatewayStatus = body.transaction?.status || body.status || "";
    if (gatewayStatus === "SUCCESS") status = "COMPLETED";
    else if (gatewayStatus === "FAILED" || gatewayStatus === "REJECTED") status = "FAILED";

    const payment = await prisma.payment.findFirst({
      where: { transactionId: String(transactionId) },
      include: { order: true },
    });

    if (!payment) {
      console.warn("Airtel webhook: payment not found for transaction", transactionId);
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
    console.error("Airtel webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
