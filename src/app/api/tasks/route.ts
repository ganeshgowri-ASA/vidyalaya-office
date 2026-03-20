import { NextRequest, NextResponse } from "next/server";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  tags: string[];
  projectId: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// In-memory store
const tasks: Task[] = [
  {
    id: "task-1",
    title: "Implement AI summarization API",
    description: "Build the /api/ai/summarize endpoint with support for multiple providers. Include rate limiting and error handling.",
    status: "in_progress",
    priority: "high",
    assignee: "Dev Kumar",
    dueDate: "2026-03-22T00:00:00Z",
    tags: ["api", "ai"],
    projectId: "proj-1",
    projectName: "Vidyalaya Core",
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-18T14:00:00Z",
  },
  {
    id: "task-2",
    title: "Design onboarding flow",
    description: "Create wireframes and hi-fi designs for the new user onboarding tour. Cover 5 key feature highlights.",
    status: "done",
    priority: "medium",
    assignee: "Priya Sharma",
    dueDate: "2026-03-15T00:00:00Z",
    tags: ["design", "ux"],
    projectId: "proj-2",
    projectName: "UX Improvements",
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-14T17:00:00Z",
    completedAt: "2026-03-14T17:00:00Z",
  },
  {
    id: "task-3",
    title: "Fix spreadsheet formula parser",
    description: "SUM and AVERAGE formulas break when referencing cells across sheets. Repro: =Sheet2!A1+Sheet1!B2.",
    status: "todo",
    priority: "urgent",
    assignee: "Rahul Verma",
    dueDate: "2026-03-20T00:00:00Z",
    tags: ["bug", "spreadsheet"],
    projectId: "proj-1",
    projectName: "Vidyalaya Core",
    createdAt: "2026-03-16T11:00:00Z",
    updatedAt: "2026-03-16T11:00:00Z",
  },
  {
    id: "task-4",
    title: "Write API documentation",
    description: "Document all public API endpoints with request/response examples using OpenAPI 3.0 spec.",
    status: "todo",
    priority: "medium",
    assignee: "Anita Patel",
    dueDate: "2026-03-28T00:00:00Z",
    tags: ["docs", "api"],
    projectId: "proj-3",
    projectName: "Documentation",
    createdAt: "2026-03-12T08:00:00Z",
    updatedAt: "2026-03-12T08:00:00Z",
  },
  {
    id: "task-5",
    title: "Performance audit - PDF renderer",
    description: "PDF rendering is slow for documents over 50 pages. Profile and identify bottlenecks. Target: < 2s for 100-page docs.",
    status: "review",
    priority: "high",
    assignee: "Dev Kumar",
    dueDate: "2026-03-25T00:00:00Z",
    tags: ["performance", "pdf"],
    projectId: "proj-1",
    projectName: "Vidyalaya Core",
    createdAt: "2026-03-11T13:00:00Z",
    updatedAt: "2026-03-17T16:00:00Z",
  },
  {
    id: "task-6",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions workflow for automated testing, linting, and deployment to Vercel on merge to main.",
    status: "in_progress",
    priority: "high",
    assignee: "Rahul Verma",
    dueDate: "2026-03-21T00:00:00Z",
    tags: ["devops", "ci"],
    projectId: "proj-4",
    projectName: "Infrastructure",
    createdAt: "2026-03-08T09:00:00Z",
    updatedAt: "2026-03-18T10:00:00Z",
  },
  {
    id: "task-7",
    title: "User acceptance testing - Email module",
    description: "Conduct UAT sessions with 3 pilot users. Document feedback and prioritize bug fixes before GA launch.",
    status: "todo",
    priority: "medium",
    assignee: "Anita Patel",
    dueDate: "2026-03-30T00:00:00Z",
    tags: ["testing", "email"],
    projectId: "proj-2",
    projectName: "UX Improvements",
    createdAt: "2026-03-15T14:00:00Z",
    updatedAt: "2026-03-15T14:00:00Z",
  },
  {
    id: "task-8",
    title: "Integrate Stripe for billing",
    description: "Implement subscription management with Stripe. Support monthly/annual plans, upgrade/downgrade, and invoice generation.",
    status: "todo",
    priority: "low",
    assignee: "Admin User",
    dueDate: "2026-04-15T00:00:00Z",
    tags: ["billing", "integration"],
    projectId: "proj-5",
    projectName: "Monetization",
    createdAt: "2026-03-18T09:00:00Z",
    updatedAt: "2026-03-18T09:00:00Z",
  },
];

let nextId = 9;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const assignee = searchParams.get("assignee");
  let result = [...tasks];
  if (status) result = result.filter((t) => t.status === status);
  if (assignee) result = result.filter((t) => t.assignee === assignee);
  return NextResponse.json({ tasks: result });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const task: Task = {
      id: `task-${nextId++}`,
      title: body.title || "Untitled Task",
      description: body.description || "",
      status: body.status || "todo",
      priority: body.priority || "medium",
      assignee: body.assignee || "Admin User",
      dueDate: body.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      tags: body.tags || [],
      projectId: body.projectId || "proj-1",
      projectName: body.projectName || "General",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.unshift(task);
    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    return NextResponse.json({ task: tasks[idx] });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    tasks[idx] = {
      ...tasks[idx],
      status,
      updatedAt: new Date().toISOString(),
      completedAt: status === "done" ? new Date().toISOString() : tasks[idx].completedAt,
    };
    return NextResponse.json({ task: tasks[idx] });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    tasks.splice(idx, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
