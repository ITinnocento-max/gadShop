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
      const result = await prisma.$queryRaw`SELECT 1 as ok`;
      checks.DB_CONNECTION = "OK";
    } catch (dbErr: unknown) {
      checks.DB_CONNECTION = "FAILED";
      checks.DB_ERROR = dbErr instanceof Error ? dbErr.message : String(dbErr);
    }

    return NextResponse.json(checks);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
