import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase();
  const category = searchParams.get("category");
  const sortBy = searchParams.get("sortBy");

  const where: Record<string, unknown> = {};

  if (category && category !== "all") {
      where.category = { name: { equals: category } };
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { brand: { contains: search } },
    ];
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

  return NextResponse.json(serializeResponse(products));
}
