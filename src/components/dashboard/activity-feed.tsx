"use client";

import { useState } from "react";
import {
  Activity,
  FileText,
  StickyNote,
  CheckSquare,
  Mail,
  Calendar,
  Edit3,
  Plus,
  CheckCircle,
  Send,
  Trash2,
  Share2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ModuleType = "document" | "note" | "task" | "email" | "meeting" | "all";
type ActionType = "created" | "edited" | "completed" | "sent" | "deleted" | "shared" | "scheduled";

interface ActivityEntry {
  id: string;
  module: ModuleType;
  action: ActionType;
  description: string;
  item: string;
  user: string;
  userInitials: string;
  userColor: string;
  timestamp: string;
}

const sampleActivities: ActivityEntry[] = [
  {
    id: "a1",
    module: "document",
    action: "edited",
    description: "edited document",
    item: "Q4 Business Report",
    user: "Admin User",
    userInitials: "AU",
    userColor: "#8b5cf6",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "a2",
    module: "task",
    action: "completed",
    description: "completed task",
    item: "Design onboarding flow",
    user: "Priya Sharma",
    userInitials: "PS",
    userColor: "#ec4899",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "a3",
    module: "email",
    action: "sent",
    description: "sent email",
    item: "Project Update - Acme Corp",
    user: "Rahul Verma",
    userInitials: "RV",
    userColor: "#3b82f6",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "a4",
    module: "note",
    action: "created",
    description: "created note",
    item: "Meeting Notes - Product Standup",
    user: "Admin User",
    userInitials: "AU",
    userColor: "#8b5cf6",
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: "a5",
    module: "meeting",
    action: "scheduled",
    description: "scheduled meeting",
    item: "Design Review - Sprint 12",
    user: "Anita Patel",
    userInitials: "AP",
    userColor: "#16a34a",
    timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
  },
  {
    id: "a6",
    module: "document",
    action: "shared",
    description: "shared document",
    item: "Sales Dashboard 2024",
    user: "Dev Kumar",
    userInitials: "DK",
    userColor: "#f59e0b",
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    id: "a7",
    module: "task",
    action: "created",
    description: "created task",
    item: "Fix spreadsheet formula parser",
    user: "Rahul Verma",
    userInitials: "RV",
    userColor: "#3b82f6",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "a8",
    module: "note",
    action: "edited",
    description: "edited note",
    item: "Research: AI Integration Patterns",
    user: "Admin User",
    userInitials: "AU",
    userColor: "#8b5cf6",
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  },
  {
    id: "a9",
    module: "email",
    action: "sent",
    description: "sent email",
    item: "Invoice #INV-2026-042",
    user: "Anita Patel",
    userInitials: "AP",
    userColor: "#16a34a",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "a10",
    module: "document",
    action: "created",
    description: "created document",
    item: "Annual Performance Review Template",
    user: "Priya Sharma",
    userInitials: "PS",
    userColor: "#ec4899",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "a11",
    module: "task",
    action: "completed",
    description: "completed task",
    item: "Set up CI/CD pipeline",
    user: "Rahul Verma",
    userInitials: "RV",
    userColor: "#3b82f6",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "a12",
    module: "meeting",
    action: "scheduled",
    description: "scheduled meeting",
    item: "Client Demo - Acme Corp",
    user: "Dev Kumar",
    userInitials: "DK",
    userColor: "#f59e0b",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "a13",
    module: "document",
    action: "deleted",
    description: "deleted document",
    item: "Outdated Budget Template v1",
    user: "Admin User",
    userInitials: "AU",
    userColor: "#8b5cf6",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "a14",
    module: "note",
    action: "created",
    description: "created note",
    item: "Client Call - Acme Corp",
    user: "Anita Patel",
    userInitials: "AP",
    userColor: "#16a34a",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
  {
    id: "a15",
    module: "email",
    action: "sent",
    description: "sent email",
    item: "Q1 Roadmap Highlights",
    user: "Priya Sharma",
    userInitials: "PS",
    userColor: "#ec4899",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "a16",
    module: "task",
    action: "created",
    description: "created task",
    item: "User acceptance testing - Email module",
    user: "Anita Patel",
    userInitials: "AP",
    userColor: "#16a34a",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "a17",
    module: "document",
    action: "edited",
    description: "edited document",
    item: "Product Launch Deck",
    user: "Dev Kumar",
    userInitials: "DK",
    userColor: "#f59e0b",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  },
  {
    id: "a18",
    module: "meeting",
    action: "scheduled",
    description: "scheduled meeting",
    item: "Sprint Planning - Week 13",
    user: "Admin User",
    userInitials: "AU",
    userColor: "#8b5cf6",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "a19",
    module: "note",
    action: "edited",
    description: "edited note",
    item: "Ideas: Dashboard Improvements",
    user: "Priya Sharma",
    userInitials: "PS",
    userColor: "#ec4899",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
  },
  {
    id: "a20",
    module: "document",
    action: "shared",
    description: "shared document",
    item: "Research Paper Draft",
    user: "Rahul Verma",
    userInitials: "RV",
    userColor: "#3b82f6",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const moduleIcons: Record<ModuleType, React.ElementType> = {
  all: Activity,
  document: FileText,
  note: StickyNote,
  task: CheckSquare,
  email: Mail,
  meeting: Calendar,
};

const actionIcons: Record<ActionType, React.ElementType> = {
  created: Plus,
  edited: Edit3,
  completed: CheckCircle,
  sent: Send,
  deleted: Trash2,
  shared: Share2,
  scheduled: Calendar,
};

const actionColors: Record<ActionType, string> = {
  created: "#16a34a",
  edited: "var(--primary)",
  completed: "#16a34a",
  sent: "#3b82f6",
  deleted: "#dc2626",
  shared: "#8b5cf6",
  scheduled: "#f59e0b",
};

const PAGE_SIZE = 8;

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day === 1) return "yesterday";
  return `${day}d ago`;
}

const moduleFilters: { label: string; value: ModuleType }[] = [
  { label: "All", value: "all" },
  { label: "Docs", value: "document" },
  { label: "Notes", value: "note" },
  { label: "Tasks", value: "task" },
  { label: "Email", value: "email" },
  { label: "Meetings", value: "meeting" },
];

export function ActivityFeed() {
  const [filter, setFilter] = useState<ModuleType>("all");
  const [page, setPage] = useState(1);

  const filtered = filter === "all"
    ? sampleActivities
    : sampleActivities.filter((a) => a.module === filter);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Activity size={14} /> Activity Feed
        </h2>
        {/* Module filter chips */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {moduleFilters.map((f) => {
            const Icon = moduleIcons[f.value];
            return (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                className={cn("flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors")}
                style={{
                  backgroundColor: filter === f.value ? "var(--primary)" : "var(--secondary)",
                  color: filter === f.value ? "var(--primary-foreground)" : "var(--muted-foreground)",
                }}
              >
                <Icon size={10} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="rounded-xl border divide-y"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {visible.length === 0 ? (
          <div className="p-8 text-center">
            <Activity size={32} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No activity yet</p>
          </div>
        ) : (
          <>
            {visible.map((entry) => {
              const ModuleIcon = moduleIcons[entry.module];
              const ActionIcon = actionIcons[entry.action];
              const actionColor = actionColors[entry.action];
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-4 py-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* User avatar */}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: entry.userColor }}
                  >
                    {entry.userInitials}
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm" style={{ color: "var(--card-foreground)" }}>
                      <span className="font-medium">{entry.user}</span>{" "}
                      <span style={{ color: "var(--muted-foreground)" }}>{entry.description}</span>{" "}
                      <span className="font-medium">{entry.item}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <ModuleIcon size={10} style={{ color: "var(--muted-foreground)" }} />
                      <span className="text-xs capitalize" style={{ color: "var(--muted-foreground)" }}>
                        {entry.module}
                      </span>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>·</span>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {formatTimeAgo(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  {/* Action badge */}
                  <div
                    className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: `${actionColor}15`, color: actionColor }}
                  >
                    <ActionIcon size={9} />
                    {entry.action}
                  </div>
                </div>
              );
            })}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="flex w-full items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                <ChevronDown size={14} />
                Load more ({filtered.length - visible.length} remaining)
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
