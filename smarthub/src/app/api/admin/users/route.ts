import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const role = searchParams.get("role");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const sortBy = searchParams.get("sortBy") || "newest";

    const where: Record<string, unknown> = {};

    if (role && role !== "all") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sortBy === "name") orderBy = { name: "asc" };
    else if (sortBy === "email") orderBy = { email: "asc" };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, email: true, role: true, phone: true,
          emailVerified: true, createdAt: true, updatedAt: true,
          adminRole: { select: { id: true, name: true, displayName: true } },
          _count: { select: { orders: true, products: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(
      serializeResponse({
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    );
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await request.json();
    const { name, email, password, role, phone, adminRoleId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "CUSTOMER",
        phone: phone || null,
        adminRoleId: adminRoleId || null,
      },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        emailVerified: true, createdAt: true,
        adminRole: { select: { id: true, name: true, displayName: true } },
      },
    });

    return NextResponse.json(serializeResponse(user), { status: 201 });
  } catch (error) {
    console.error("Admin user create error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
