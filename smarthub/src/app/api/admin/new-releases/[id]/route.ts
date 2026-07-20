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
    const release = await prisma.newRelease.findUnique({ where: { id } });

    if (!release) {
      return NextResponse.json({ error: "New release not found" }, { status: 404 });
    }

    return NextResponse.json(serializeResponse(release));
  } catch (error) {
    console.error("Admin new release detail error:", error);
    return NextResponse.json({ error: "Failed to fetch new release" }, { status: 500 });
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
    const { label, title, subtitle, description, buttonText, buttonLink, imageUrl, isActive, sortOrder } = body;

    const existing = await prisma.newRelease.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "New release not found" }, { status: 404 });
    }

    const release = await prisma.newRelease.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle: subtitle || null }),
        ...(description !== undefined && { description: description || null }),
        ...(buttonText !== undefined && { buttonText }),
        ...(buttonLink !== undefined && { buttonLink }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(serializeResponse(release));
  } catch (error) {
    console.error("Admin new release update error:", error);
    return NextResponse.json({ error: "Failed to update new release" }, { status: 500 });
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
    const existing = await prisma.newRelease.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "New release not found" }, { status: 404 });
    }

    await prisma.newRelease.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin new release delete error:", error);
    return NextResponse.json({ error: "Failed to delete new release" }, { status: 500 });
  }
}
