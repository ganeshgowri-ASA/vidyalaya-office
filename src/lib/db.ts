/* eslint-disable @typescript-eslint/no-explicit-any */

let prismaInstance: any = null;
let prismaInitialized = false;

async function initPrisma(): Promise<any> {
  if (prismaInitialized) return prismaInstance;
  prismaInitialized = true;

  if (!process.env.DATABASE_URL) return null;

  try {
    const mod: any = await import("@prisma/client");
    const PrismaClient = mod.PrismaClient || mod.default?.PrismaClient;
    const globalForPrisma = globalThis as unknown as { prisma: any };
    if (globalForPrisma.prisma) {
      prismaInstance = globalForPrisma.prisma;
    } else {
      prismaInstance = new PrismaClient();
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance;
      }
    }
    return prismaInstance;
  } catch {
    return null;
  }
}

export async function getDb(): Promise<any> {
  return initPrisma();
}

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
