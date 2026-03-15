import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConnected } from "@/lib/db";

export async function GET() {
  if (!isDbConnected() || !prisma) {
    return NextResponse.json({ fallback: true, documents: [] });
  }
  try {
    const documents = await prisma.document.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    return NextResponse.json({ documents });
  } catch {
    return NextResponse.json({ fallback: true, documents: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConnected() || !prisma) {
    return NextResponse.json({ fallback: true, message: "No database connection" }, { status: 200 });
  }
  try {
    const body = await req.json();
    const count = await prisma.document.count();
    const year = new Date().getFullYear();
    const docId = `DOC-${year}-${String(count + 1).padStart(3, "0")}`;

    const document = await prisma.document.create({
      data: {
        docId,
        name: body.name || "Untitled Document",
        content: body.content || "",
        department: body.department || null,
        routePath: body.routePath || null,
        status: body.status || "Draft",
        version: "1.0",
        retentionPeriod: body.retentionPeriod || null,
        classification: body.classification || "Internal",
        tags: body.tags || [],
        createdBy: body.createdBy || "System User",
        headerConfig: body.headerConfig || null,
        footerConfig: body.footerConfig || null,
        versions: {
          create: {
            version: "1.0",
            content: body.content || "",
            changeNotes: "Initial version",
            createdBy: body.createdBy || "System User",
          },
        },
      },
    });
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
