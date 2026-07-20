import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const current = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const previousStatus = current.status;
    const data: Record<string, unknown> = { status };
    if (status === "DELIVERED") data.deliveredAt = new Date();

    const order = await prisma.$transaction(async (tx) => {
      const isCancelling = status === "CANCELLED" && previousStatus !== "CANCELLED";
      const isUncancelling = previousStatus === "CANCELLED" && status !== "CANCELLED";

      if (isCancelling || isUncancelling) {
        const items = await tx.orderItem.findMany({
          where: { orderId: id },
          select: { productId: true, quantity: true },
        });

        for (const item of items) {
          if (isCancelling) {
            const updated = await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
              select: { id: true, stock: true },
            });
            if (updated.stock > 0) {
              await tx.product.update({
                where: { id: item.productId },
                data: { inStock: true },
              });
            }
          } else {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { stock: true },
            });
            if (!product || product.stock < item.quantity) {
              throw new Error(`Insufficient stock to fulfill order. Product "${item.productId}" has only ${product?.stock ?? 0} units.`);
            }
            const updated = await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
              select: { id: true, stock: true },
            });
            if (updated.stock <= 0) {
              await tx.product.update({
                where: { id: item.productId },
                data: { inStock: false },
              });
            }
          }
        }
      }

      return tx.order.update({
        where: { id },
        data,
        include: {
          user: { select: { id: true, name: true, email: true } },
          shippingAddress: { select: { street: true, city: true, state: true, zip: true, country: true } },
          items: { select: { id: true, name: true, price: true, quantity: true } },
          payments: { select: { method: true, status: true, amount: true } },
        },
      });
    });

    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
