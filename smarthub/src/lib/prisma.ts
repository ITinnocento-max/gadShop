import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const sslCaPath = process.env.DATABASE_SSL_CA;
const ssl = sslCaPath && fs.existsSync(path.resolve(sslCaPath))
  ? { ca: fs.readFileSync(path.resolve(sslCaPath)).toString() }
  : undefined;

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "smarthub",
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  ssl: process.env.DATABASE_SSL === "REQUIRED" ? (ssl || true) : undefined,
  connectionLimit: 5,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
