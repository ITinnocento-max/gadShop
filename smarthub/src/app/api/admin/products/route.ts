import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const category = searchParams.get("category");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const sortBy = searchParams.get("sortBy") || "newest";
    const stockStatus = searchParams.get("stock");

    const where: Record<string, unknown> = {};

    if (category && category !== "all") {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    if (stockStatus === "low") {
      where.stock = { lte: 5 };
    } else if (stockStatus === "out") {
      where.stock = 0;
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sortBy === "price_asc") orderBy = { price: "asc" };
    else if (sortBy === "price_desc") orderBy = { price: "desc" };
    else if (sortBy === "name") orderBy = { name: "asc" };
    else if (sortBy === "stock") orderBy = { stock: "asc" };
    else if (sortBy === "rating") orderBy = { rating: "desc" };

    const vendorParam = searchParams.get("vendor");

    if (vendorParam && vendorParam !== "all") {
      where.vendorId = vendorParam;
    }

    const [products, total, vendors] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          vendor: { select: { id: true, name: true } },
        },
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        select: { vendor: { select: { id: true, name: true } } },
        distinct: ["vendorId"],
      }),
    ]);

    const uniqueVendors = vendors.map((v) => v.vendor);

    return NextResponse.json(
      serializeResponse({
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        vendors: uniqueVendors,
      })
    );
  } catch (error) {
    console.error("Admin products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, brand, price, originalPrice, stock, images, categoryId, vendorId, specs, featured } = body;

    if (!name || !slug || !description || !brand || price == null || !categoryId || !vendorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        brand,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: stock != null ? parseInt(stock) : 0,
        images: images || [],
        categoryId,
        vendorId,
        specs: specs || null,
        featured: featured || false,
        inStock: stock == null || parseInt(stock) > 0,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        vendor: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(serializeResponse(product), { status: 201 });
  } catch (error) {
    console.error("Admin product create error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
