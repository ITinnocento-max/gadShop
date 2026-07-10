import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

export async function POST(request: Request) {
  try {
    const { userId, items, paymentMethod, total, shippingAddress } = await request.json();

    if (!userId || !items?.length || total == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i: { id: string }) => i.id) } },
      select: { id: true, stock: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p.stock]));

    for (const item of items) {
      const available = productMap.get(item.id) ?? 0;
      if (available < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${item.name}". Available: ${available}, requested: ${item.quantity}` },
          { status: 409 }
        );
      }
    }

    const address = await prisma.address.create({
      data: {
        street: shippingAddress?.street || "Default Street",
        city: shippingAddress?.city || "Default City",
        state: shippingAddress?.state || "Default State",
        zip: shippingAddress?.zip || "00000",
        country: shippingAddress?.country || "US",
        userId,
      },
    });

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId,
          total,
          paymentMethod,
          shippingAddressId: address.id,
          status: "PENDING",
          paidAt: new Date(),
          items: {
            create: items.map((item: { id: string; name: string; price: number; quantity: number; image?: string }) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || null,
              productId: item.id,
            })),
          },
          payments: {
            create: {
              method: paymentMethod || "CARD",
              status: "COMPLETED",
              amount: total,
              userId,
            },
          },
        },
        include: {
          items: { include: { product: { select: { images: true } } } },
          payments: true,
          shippingAddress: true,
        },
      });
    });

    return NextResponse.json(serializeResponse(order), { status: 201 });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json([]);
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { product: { select: { images: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(serializeResponse(orders));
}
