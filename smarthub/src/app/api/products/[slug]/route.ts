import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const serialized = serializeResponse(product);
  if (serialized.reviews && serialized.reviews.length > 0) {
    const total = serialized.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0);
    serialized.rating = total / serialized.reviews.length;
    serialized.numReviews = serialized.reviews.length;
  } else {
    serialized.rating = 0;
    serialized.numReviews = 0;
  }

  return NextResponse.json(serialized);
}
