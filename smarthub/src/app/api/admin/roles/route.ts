import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const { user, error } = await requireAdmin();
  if (error) return error;
  try {
    const roles = await prisma.adminRole.findMany({
      select: { id: true, name: true, displayName: true, description: true },
      orderBy: { displayName: "asc" },
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Admin roles API error:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}
