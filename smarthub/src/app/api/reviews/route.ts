import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const { productId, rating, title, comment } = body;

  if (!productId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "productId and rating (1-5) are required" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const review = await prisma.review.create({
      data: {
        rating: Math.round(rating),
        title: title || null,
        comment: comment || null,
        productId,
        userId: user!.id,
      },
    });

    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating ?? 0,
        numReviews: stats._count.rating,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      );
    }
    throw e;
  }
}
