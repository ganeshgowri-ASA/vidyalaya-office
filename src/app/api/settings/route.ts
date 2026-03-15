import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConnected } from "@/lib/db";

export async function GET() {
  if (!isDbConnected() || !prisma) {
    return NextResponse.json({ fallback: true, settings: null });
  }
  try {
    const settings = await prisma.userSettings.findFirst();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ fallback: true, settings: null });
  }
}

export async function PUT(req: NextRequest) {
  if (!isDbConnected() || !prisma) {
    return NextResponse.json({ fallback: true });
  }
  try {
    const body = await req.json();
    const userId = body.userId || "default";
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        apiKeys: body.apiKeys || null,
        preferences: body.preferences || null,
      },
      update: {
        apiKeys: body.apiKeys || undefined,
        preferences: body.preferences || undefined,
      },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
