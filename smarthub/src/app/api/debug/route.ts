import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const checks: Record<string, unknown> = {};

    // Check env vars exist
    checks.DATABASE_HOST = !!process.env.DATABASE_HOST;
    checks.DATABASE_USER = !!process.env.DATABASE_USER;
    checks.DATABASE_PASSWORD = !!process.env.DATABASE_PASSWORD;
    checks.DATABASE_NAME = process.env.DATABASE_NAME;
    checks.DATABASE_PORT = process.env.DATABASE_PORT;
    checks.DATABASE_SSL = process.env.DATABASE_SSL;
    checks.DATABASE_SSL_CA = process.env.DATABASE_SSL_CA;

    // Check CA cert file exists
    const caPath = process.env.DATABASE_SSL_CA;
    if (caPath) {
      const resolved = path.resolve(caPath);
      checks.CA_CERT_RESOLVED = resolved;
      checks.CA_CERT_EXISTS = fs.existsSync(resolved);
      if (fs.existsSync(resolved)) {
        checks.CA_CERT_SIZE = fs.statSync(resolved).size;
      }
    }

    // Check CWD
    checks.CWD = process.cwd();

    // Test DB connection
    try {
      await prisma.$queryRaw`SELECT 1 as ok`;
      checks.DB_CONNECTION = "OK";
    } catch (dbErr: unknown) {
      checks.DB_CONNECTION = "FAILED";
      checks.DB_ERROR = dbErr instanceof Error ? dbErr.message : String(dbErr);
    }

    // Test user lookup
    try {
      const user = await prisma.user.findUnique({ where: { email: "admin@smarthub.com" } });
      checks.USER_FOUND = !!user;
      if (user) {
        checks.USER_NAME = user.name;
        checks.USER_ROLE = user.role;
        checks.PASSWORD_HASH_LENGTH = user.password.length;
        checks.PASSWORD_HASH_PREFIX = user.password.substring(0, 7);
      }
    } catch (userErr: unknown) {
      checks.USER_LOOKUP = "FAILED";
      checks.USER_ERROR = userErr instanceof Error ? userErr.message : String(userErr);
    }

    // Test bcrypt compare
    try {
      const bcrypt = await import("bcryptjs");
      const user = await prisma.user.findUnique({ where: { email: "admin@smarthub.com" } });
      if (user) {
        const valid = await bcrypt.compare("1234567890", user.password);
        checks.PASSWORD_MATCH = valid;
      }
    } catch (bcryptErr: unknown) {
      checks.BCRYPT_ERROR = bcryptErr instanceof Error ? bcryptErr.message : String(bcryptErr);
    }

    return NextResponse.json(checks);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
