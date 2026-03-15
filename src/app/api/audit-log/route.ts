import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ fallback: true, logs: [] });
  }
  try {
    const prisma = await getDb();
    if (!prisma) return NextResponse.json({ fallback: true, logs: [] });
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ fallback: true, logs: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ fallback: true });
  }
  try {
    const prisma = await getDb();
    if (!prisma) return NextResponse.json({ fallback: true });
    const body = await req.json();
    const log = await prisma.auditLog.create({
      data: {
        action: body.action,
        entityType: body.entityType,
        entityId: body.entityId || null,
        userId: body.userId || null,
        details: body.details || null,
      },
    });
    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
