import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConnected } from "@/lib/db";

export async function GET() {
  if (!isDbConnected() || !prisma) {
    return NextResponse.json({ fallback: true, departments: [] });
  }
  try {
    const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ departments });
  } catch {
    return NextResponse.json({ fallback: true, departments: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConnected() || !prisma) {
    return NextResponse.json({ fallback: true });
  }
  try {
    const body = await req.json();
    const department = await prisma.department.create({
      data: {
        name: body.name,
        code: body.code,
        head: body.head || null,
        description: body.description || null,
      },
    });
    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
