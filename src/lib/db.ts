import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient | null = null;

function createPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  try {
    return new PrismaClient();
  } catch {
    return null;
  }
}

export const prisma: PrismaClient | null =
  globalForPrisma.prisma || createPrismaClient();

if (prismaInstance && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaInstance;
}

export function isDbConnected(): boolean {
  return !!process.env.DATABASE_URL && prisma !== null;
}
