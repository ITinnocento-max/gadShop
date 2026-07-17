import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import { requireAdmin } from "@/lib/api-auth";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PROMO-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const activeFilter = searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (activeFilter === "true") where.isActive = true;
    if (activeFilter === "false") where.isActive = false;

    const [codes, total] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { usages: true } },
        },
      }),
      prisma.promoCode.count({ where }),
    ]);

    const result = codes.map((c: typeof codes[number]) => ({
      ...c,
      currentUses: c._count.usages,
      _count: undefined,
    }));

    return NextResponse.json(
      serializeResponse({
        promoCodes: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    );
  } catch (error) {
    console.error("Admin promo codes GET error:", error);
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await request.json();
    const { code: providedCode, discountType, discountValue, productId, userId, maxUses, description } = body;

    if (!discountType || discountValue == null) {
      return NextResponse.json({ error: "discountType and discountValue are required" }, { status: 400 });
    }
    if (!["percentage", "fixed_amount"].includes(discountType)) {
      return NextResponse.json({ error: "discountType must be 'percentage' or 'fixed_amount'" }, { status: 400 });
    }
    if (discountType === "percentage" && (discountValue <= 0 || discountValue > 100)) {
      return NextResponse.json({ error: "Percentage must be between 1 and 100" }, { status: 400 });
    }

    let code = providedCode?.trim().toUpperCase();
    if (!code) {
      let attempts = 0;
      do {
        code = generateCode();
        attempts++;
      } while (attempts < 10);
    }

    const existing = await prisma.promoCode.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: `Code "${code}" already exists` }, { status: 409 });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code,
        discountType,
        discountValue: parseFloat(discountValue),
        productId: productId || null,
        userId: userId || null,
        maxUses: maxUses != null ? parseInt(maxUses) : 1,
        description: description || null,
      },
    });

    return NextResponse.json(serializeResponse(promoCode), { status: 201 });
  } catch (error) {
    console.error("Admin promo code create error:", error);
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 });
  }
}
