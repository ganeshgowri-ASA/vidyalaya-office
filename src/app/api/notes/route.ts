import { NextRequest, NextResponse } from "next/server";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// In-memory store
const notes: Note[] = [
  {
    id: "note-1",
    title: "Meeting Notes - Product Standup",
    content: "Discussed Q1 roadmap priorities. Key items: 1) Launch AI assistant beta, 2) Improve export pipeline, 3) Fix spreadsheet formula bugs. Next steps: assign owners by Friday.",
    tags: ["meetings", "product"],
    color: "#3b82f6",
    pinned: true,
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-15T10:30:00Z",
    createdBy: "Admin User",
  },
  {
    id: "note-2",
    title: "Research: AI Integration Patterns",
    content: "Key findings from literature review on RAG architectures. Vector databases comparison: Pinecone vs Weaviate vs Chroma. Recommendation: Start with Chroma for local dev, migrate to Pinecone for production.",
    tags: ["research", "ai"],
    color: "#8b5cf6",
    pinned: false,
    createdAt: "2026-03-14T14:00:00Z",
    updatedAt: "2026-03-16T09:15:00Z",
    createdBy: "Admin User",
  },
  {
    id: "note-3",
    title: "Client Call - Acme Corp",
    content: "Requirements gathered: Need multi-user collaboration, SSO integration with Okta, custom branding support. Budget approved for enterprise tier. Follow up with contract team.",
    tags: ["client", "sales"],
    color: "#16a34a",
    pinned: true,
    createdAt: "2026-03-12T11:00:00Z",
    updatedAt: "2026-03-12T11:45:00Z",
    createdBy: "Admin User",
  },
  {
    id: "note-4",
    title: "Deployment Checklist",
    content: "Pre-deploy: Run all tests, update changelog, bump version. Deploy: Push to staging, smoke test, merge to main. Post-deploy: Monitor error rates, notify team in Slack.",
    tags: ["devops", "checklist"],
    color: "#f59e0b",
    pinned: false,
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-17T08:00:00Z",
    createdBy: "Admin User",
  },
  {
    id: "note-5",
    title: "Ideas: Dashboard Improvements",
    content: "Potential features: 1) Customizable widget layout, 2) Real-time collaboration indicators, 3) Advanced analytics charts, 4) Quick actions toolbar, 5) Keyboard shortcut hints on hover.",
    tags: ["ideas", "ux"],
    color: "#ec4899",
    pinned: false,
    createdAt: "2026-03-08T16:00:00Z",
    updatedAt: "2026-03-18T10:00:00Z",
    createdBy: "Admin User",
  },
];

let nextId = 6;

export async function GET() {
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const note: Note = {
      id: `note-${nextId++}`,
      title: body.title || "Untitled Note",
      content: body.content || "",
      tags: body.tags || [],
      color: body.color || "#3b82f6",
      pinned: body.pinned ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: body.createdBy || "Admin User",
    };
    notes.unshift(note);
    return NextResponse.json({ note }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    notes[idx] = { ...notes[idx], ...updates, updatedAt: new Date().toISOString() };
    return NextResponse.json({ note: notes[idx] });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    notes.splice(idx, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
