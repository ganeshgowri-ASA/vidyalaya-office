import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured()) {
    return NextResponse.json({ fallback: true });
  }
  try {
    const prisma = await getDb();
    if (!prisma) return NextResponse.json({ fallback: true });
    const document = await prisma.document.findUnique({
      where: { id },
      include: { versions: { orderBy: { createdAt: "desc" } } },
    });
    if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured()) {
    return NextResponse.json({ fallback: true });
  }
  try {
    const prisma = await getDb();
    if (!prisma) return NextResponse.json({ fallback: true });
    const body = await req.json();
    const document = await prisma.document.update({
      where: { id },
      data: {
        name: body.name,
        content: body.content,
        department: body.department,
        routePath: body.routePath,
        status: body.status,
        version: body.version,
        retentionPeriod: body.retentionPeriod,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        headerConfig: body.headerConfig,
        footerConfig: body.footerConfig,
        classification: body.classification,
        tags: body.tags,
      },
    });
    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured()) {
    return NextResponse.json({ fallback: true });
  }
  try {
    const prisma = await getDb();
    if (!prisma) return NextResponse.json({ fallback: true });
    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
