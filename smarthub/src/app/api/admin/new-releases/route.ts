import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const { user, error } = await requireAdmin();
  if (error) return error;
  try {
    const releases = await prisma.newRelease.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(serializeResponse(releases));
  } catch (error) {
    console.error("Admin new releases list error:", error);
    return NextResponse.json({ error: "Failed to fetch new releases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await request.json();
    const { label, title, subtitle, description, buttonText, buttonLink, imageUrl, isActive, sortOrder } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const release = await prisma.newRelease.create({
      data: {
        label: label || "New Release",
        title,
        subtitle: subtitle || null,
        description: description || null,
        buttonText: buttonText || "Shop Now",
        buttonLink: buttonLink || "/products",
        imageUrl: imageUrl || null,
        isActive: isActive !== false,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(serializeResponse(release), { status: 201 });
  } catch (error) {
    console.error("Admin new release create error:", error);
    return NextResponse.json({ error: "Failed to create new release" }, { status: 500 });
  }
}
