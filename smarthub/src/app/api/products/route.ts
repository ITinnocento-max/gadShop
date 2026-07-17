import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import { buildProductSearchWhere } from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category");
  const sortBy = searchParams.get("sortBy");

  const where: Record<string, unknown> = {};

  if (category && category !== "all") {
      where.category = { name: { equals: category } };
  }

  const searchWhere = buildProductSearchWhere(search);
  if (searchWhere) {
    if (where.OR) {
      where.AND = [where, searchWhere];
      delete where.OR;
    } else {
      Object.assign(where, searchWhere);
    }
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sortBy === "price") orderBy = { price: "asc" };
  else if (sortBy === "rating") orderBy = { rating: "desc" };
  else if (sortBy === "brand") orderBy = { brand: "asc" };
  else if (sortBy === "newest") orderBy = { createdAt: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: { select: { name: true } },
    },
  });

  const productIds = products.map((p) => p.id);
  const ratings = await prisma.review.groupBy({
    by: ["productId"],
    _avg: { rating: true },
    _count: { rating: true },
    where: { productId: { in: productIds } },
  });
  const ratingMap = new Map(
    ratings.map((r) => [r.productId, { avg: r._avg.rating ?? 0, count: r._count.rating }])
  );

  const withRatings = products.map((p) => {
    const r = ratingMap.get(p.id);
    return { ...p, rating: r?.avg ?? 0, numReviews: r?.count ?? 0 };
  });

  return NextResponse.json(serializeResponse(withRatings));
}
