import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { userId, items, paymentMethod, total, shippingAddress, guestInfo } = await request.json();

    if (!items?.length || total == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let effectiveUserId = userId;

    if (!effectiveUserId && guestInfo?.email) {
      let guestUser = await prisma.user.findUnique({ where: { email: guestInfo.email } });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            name: guestInfo.name || guestInfo.email.split("@")[0],
            email: guestInfo.email,
            phone: guestInfo.phone || null,
            password: await bcrypt.hash(Math.random().toString(36).slice(2) + Date.now().toString(36), 10),
            role: "CUSTOMER",
          },
        });
      }
      effectiveUserId = guestUser.id;
    }

    if (!effectiveUserId) {
      return NextResponse.json({ error: "User identification required" }, { status: 400 });
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
        street: shippingAddress?.street || "N/A",
        city: shippingAddress?.city || "N/A",
        state: shippingAddress?.state || "N/A",
        zip: shippingAddress?.zip || "00000",
        country: shippingAddress?.country || "RW",
        userId: effectiveUserId,
      },
    });

    const paymentStatus = paymentMethod === "COD" ? "COMPLETED" : "PENDING";
    const paidAt = paymentMethod === "COD" ? new Date() : null;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
          select: { id: true, stock: true },
        });
        if (updated.stock <= 0) {
          await tx.product.update({
            where: { id: item.id },
            data: { inStock: false },
          });
        }
      }

      return tx.order.create({
        data: {
          userId: effectiveUserId,
          total,
          paymentMethod,
          shippingAddressId: address.id,
          status: "PENDING",
          paidAt,
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
              status: paymentStatus,
              amount: total,
              userId: effectiveUserId,
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
  const email = searchParams.get("email");

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json([]);
    }
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
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
