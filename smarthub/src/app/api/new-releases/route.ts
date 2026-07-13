import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

export async function GET() {
  try {
    const releases = await prisma.newRelease.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(serializeResponse(releases));
  } catch (error) {
    console.error("New releases API error:", error);
    return NextResponse.json({ error: "Failed to fetch new releases" }, { status: 500 });
  }
}
