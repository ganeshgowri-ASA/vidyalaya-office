import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConnected } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConnected() || !prisma) {
    return NextResponse.json({ fallback: true, versions: [] });
  }
  try {
    const versions = await prisma.documentVersion.findMany({
      where: { documentId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ versions });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConnected() || !prisma) {
    return NextResponse.json({ fallback: true });
  }
  try {
    const body = await req.json();
    const version = await prisma.documentVersion.create({
      data: {
        documentId: id,
        version: body.version,
        content: body.content,
        changeNotes: body.changeNotes || "",
        createdBy: body.createdBy || "System User",
      },
    });
    // Update document version
    await prisma.document.update({
      where: { id },
      data: { version: body.version, content: body.content },
    });
    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
