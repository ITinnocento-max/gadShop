import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

export async function POST(request: Request) {
  try {
    const { userId, items, paymentMethod, total, shippingAddress } = await request.json();

    if (!userId || !items?.length || total == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    const order = await prisma.order.create({
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
