import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { code, productId } = await request.json();

    if (!code?.trim()) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: {
        _count: { select: { usages: true } },
      },
    });

    if (!promo) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ error: "This promo code is no longer active" }, { status: 400 });
    }

    if (promo.userId && promo.userId !== user.id) {
      return NextResponse.json({ error: "This promo code is not assigned to you" }, { status: 403 });
    }

    if (promo.productId && promo.productId !== productId) {
      return NextResponse.json({ error: "This promo code is not valid for this product" }, { status: 400 });
    }

    const currentUses = promo._count.usages;
    if (currentUses >= promo.maxUses) {
      return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 });
    }

    let productPrice = 0;
    let productName = "";
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, price: true, name: true },
      });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      productPrice = Number(product.price);
      productName = product.name;
    }

    let discountAmount = 0;
    if (promo.discountType === "percentage") {
      discountAmount = productPrice * (Number(promo.discountValue) / 100);
    } else {
      discountAmount = Number(promo.discountValue);
    }

    if (productId && discountAmount > productPrice) {
      discountAmount = productPrice;
    }

    return NextResponse.json(
      serializeResponse({
        valid: true,
        id: promo.id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount: Math.round(discountAmount * 100) / 100,
        productName: productName || undefined,
        remainingUses: promo.maxUses - currentUses,
      })
    );
  } catch (err) {
    console.error("Apply promo error:", err);
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 });
  }
}
