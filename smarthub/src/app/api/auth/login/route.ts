import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const userData = { id: user.id, name: user.name, email: user.email, role: user.role, dbRole: user.role };

    const cookiePayload = JSON.stringify({
      state: { user: userData, isAuthenticated: true },
      version: 0,
    });

    const response = NextResponse.json({
      user: userData,
      message: "Login successful",
    });

    response.cookies.set("auth-storage", encodeURIComponent(cookiePayload), {
      path: "/",
      maxAge: 86400,
      sameSite: "none",
      secure: true,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
