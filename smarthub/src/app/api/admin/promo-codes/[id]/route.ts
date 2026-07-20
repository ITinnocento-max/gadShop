import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        _count: { select: { usages: true } },
        usages: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { usedAt: "desc" },
          take: 50,
        },
      },
    });

    if (!promoCode) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    const result = {
      ...promoCode,
      currentUses: promoCode._count.usages,
      _count: undefined,
    };

    return NextResponse.json(serializeResponse(result));
  } catch (error) {
    console.error("Admin promo code GET error:", error);
    return NextResponse.json({ error: "Failed to fetch promo code" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const body = await request.json();
    const { discountType, discountValue, productId, userId, maxUses, isActive, description } = body;

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    const updated = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
        ...(productId !== undefined && { productId: productId || null }),
        ...(userId !== undefined && { userId: userId || null }),
        ...(maxUses !== undefined && { maxUses: parseInt(maxUses) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(description !== undefined && { description: description || null }),
      },
    });

    return NextResponse.json(serializeResponse(updated));
  } catch (error) {
    console.error("Admin promo code PATCH error:", error);
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    await prisma.promoCode.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin promo code DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}
