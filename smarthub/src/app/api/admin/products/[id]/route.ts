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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        vendor: { select: { id: true, name: true, email: true } },
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
  } catch (error) {
    console.error("Admin product detail error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, brand, price, originalPrice, costPrice, stock, images, categoryId, vendorId, specs, featured } = body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.product.findUnique({ where: { slug } });
      if (slugConflict) {
        return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(brand !== undefined && { brand }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(costPrice !== undefined && { costPrice: costPrice ? parseFloat(costPrice) : null }),
        ...(stock !== undefined && { stock: parseInt(stock), inStock: parseInt(stock) > 0 }),
        ...(images !== undefined && { images }),
        ...(categoryId !== undefined && { categoryId }),
        ...(vendorId !== undefined && { vendorId }),
        ...(specs !== undefined && { specs }),
        ...(featured !== undefined && { featured }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        vendor: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(serializeResponse(product));
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin product delete error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
