"use client";

import { useState } from "react";
import {
  LayoutGrid,
  BarChart3,
  CalendarDays,
  Filter,
  ChevronDown,
  Flag,
  Clock,
  User,
  CheckSquare,
  Square,
  MoreHorizontal,
  GripVertical,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/planner-store";
import type { PlannerTask } from "@/store/planner-store";

// ── Helpers ──────────────────────────────────────────────

const bucketConfig: Record<PlannerTask["bucket"], { label: string; color: string }> = {
  todo: { label: "To Do", color: "#6366f1" },
  "in-progress": { label: "In Progress", color: "#3b82f6" },
  review: { label: "Review", color: "#f59e0b" },
  done: { label: "Done", color: "#10b981" },
};

const priorityConfig: Record<PlannerTask["priority"], { label: string; color: string; icon: React.ReactNode }> = {
  urgent: { label: "Urgent", color: "#ef4444", icon: <AlertCircle size={12} /> },
  important: { label: "Important", color: "#f59e0b", icon: <ArrowUp size={12} /> },
  medium: { label: "Medium", color: "#3b82f6", icon: <Minus size={12} /> },
  low: { label: "Low", color: "#6b7280", icon: <ArrowDown size={12} /> },
};

function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(d: string) {
  return new Date(d) < new Date("2026-03-25");
}

// ── Toolbar ──────────────────────────────────────────────

function PlannerToolbar() {
  const { activeView, setActiveView, planName, filterAssignee, setFilterAssignee, filterPriority, setFilterPriority, tasks } =
    usePlannerStore();

  const views: { key: typeof activeView; label: string; icon: React.ReactNode }[] = [
    { key: "board", label: "Board", icon: <LayoutGrid size={16} /> },
    { key: "charts", label: "Charts", icon: <BarChart3 size={16} /> },
    { key: "schedule", label: "Schedule", icon: <CalendarDays size={16} /> },
  ];

  const assignees = Array.from(new Set(tasks.map((t) => t.assignee)));

  return (
    <div
      className="flex items-center gap-2 border-b px-4 py-2"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
    >
      <h2 className="mr-3 text-sm font-bold" style={{ color: "var(--foreground)" }}>{planName}</h2>

      <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ backgroundColor: "var(--muted)" }}>
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setActiveView(v.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeView === v.key ? "shadow-sm" : "opacity-60 hover:opacity-100"
            )}
            style={
              activeView === v.key
                ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                : { color: "var(--foreground)" }
            }
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      <div className="mx-2 h-5 w-px" style={{ backgroundColor: "var(--border)" }} />

      <div className="flex items-center gap-2">
        <Filter size={14} style={{ color: "var(--muted-foreground)" }} />
        <select
          value={filterAssignee || ""}
          onChange={(e) => setFilterAssignee(e.target.value || null)}
          className="rounded border px-2 py-1 text-xs"
          style={{
            backgroundColor: "var(--muted)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <option value="">All Members</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          value={filterPriority || ""}
          onChange={(e) => setFilterPriority(e.target.value || null)}
          className="rounded border px-2 py-1 text-xs"
          style={{
            backgroundColor: "var(--muted)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="important">Important</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
}

// ── Task Card ────────────────────────────────────────────

function TaskCard({ task }: { task: PlannerTask }) {
  const { selectedTaskId, setSelectedTaskId } = usePlannerStore();
  const isSelected = selectedTaskId === task.id;
  const doneCount = task.checklist.filter((c) => c.done).length;
  const totalCount = task.checklist.length;
  const overdue = task.bucket !== "done" && isOverdue(task.dueDate);

  return (
    <div
      onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
      className={cn(
        "cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md",
        isSelected ? "ring-2" : ""
      )}
      style={{
        borderColor: isSelected ? "var(--primary)" : "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label}
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="mb-2 text-sm font-medium leading-snug" style={{ color: "var(--foreground)" }}>
        {task.title}
      </p>

      {/* Checklist progress */}
      {totalCount > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: "var(--muted)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(doneCount / totalCount) * 100}%`,
                backgroundColor: doneCount === totalCount ? "#10b981" : "var(--primary)",
              }}
            />
          </div>
          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            {doneCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: task.assigneeColor }}
          title={task.assignee}
        >
          {task.assigneeAvatar}
        </div>

        <div className="flex items-center gap-1" style={{ color: priorityConfig[task.priority].color }}>
          {priorityConfig[task.priority].icon}
          <span className="text-[10px] font-medium">{priorityConfig[task.priority].label}</span>
        </div>

        <div className="flex-1" />

        <div
          className="flex items-center gap-1 text-[10px]"
          style={{ color: overdue ? "#ef4444" : "var(--muted-foreground)" }}
        >
          <Clock size={10} />
          {formatShortDate(task.dueDate)}
        </div>
      </div>
    </div>
  );
}

// ── Board View ───────────────────────────────────────────

function BoardView() {
  const { tasks, filterAssignee, filterPriority } = usePlannerStore();

  const filteredTasks = tasks.filter((t) => {
    if (filterAssignee && t.assignee !== filterAssignee) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const buckets: PlannerTask["bucket"][] = ["todo", "in-progress", "review", "done"];

  return (
    <div className="flex flex-1 gap-4 overflow-x-auto p-4">
      {buckets.map((bucket) => {
        const bucketTasks = filteredTasks.filter((t) => t.bucket === bucket);
        const config = bucketConfig[bucket];
        return (
          <div key={bucket} className="flex w-72 shrink-0 flex-col">
            {/* Bucket header */}
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{config.label}</span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                {bucketTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div
              className="flex flex-1 flex-col gap-2 rounded-lg p-2"
              style={{ backgroundColor: "var(--muted)", minHeight: 200 }}
            >
              {bucketTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Charts View ──────────────────────────────────────────

function ChartsView() {
  const { tasks } = usePlannerStore();

  const buckets: PlannerTask["bucket"][] = ["todo", "in-progress", "review", "done"];
  const bucketCounts = buckets.map((b) => ({ bucket: b, count: tasks.filter((t) => t.bucket === b).length }));
  const maxCount = Math.max(...bucketCounts.map((b) => b.count), 1);

  const priorities: PlannerTask["priority"][] = ["urgent", "important", "medium", "low"];
  const priorityCounts = priorities.map((p) => ({ priority: p, count: tasks.filter((t) => t.priority === p).length }));
  const maxPriority = Math.max(...priorityCounts.map((p) => p.count), 1);

  const assignees = Array.from(new Set(tasks.map((t) => t.assignee)));
  const assigneeCounts = assignees.map((a) => ({
    name: a,
    avatar: tasks.find((t) => t.assignee === a)!.assigneeAvatar,
    color: tasks.find((t) => t.assignee === a)!.assigneeColor,
    total: tasks.filter((t) => t.assignee === a).length,
    done: tasks.filter((t) => t.assignee === a && t.bucket === "done").length,
  }));

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.bucket === "done").length;

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Summary */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {buckets.map((b) => {
          const count = tasks.filter((t) => t.bucket === b).length;
          return (
            <div
              key={b}
              className="rounded-lg border p-4"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: bucketConfig[b].color }} />
                <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{bucketConfig[b].label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{count}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bucket bar chart */}
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--foreground)" }}>Tasks by Status</h3>
          <div className="space-y-3">
            {bucketCounts.map((b) => (
              <div key={b.bucket} className="flex items-center gap-3">
                <span className="w-24 text-xs" style={{ color: "var(--muted-foreground)" }}>{bucketConfig[b.bucket].label}</span>
                <div className="flex-1">
                  <div className="h-6 w-full rounded" style={{ backgroundColor: "var(--muted)" }}>
                    <div
                      className="flex h-full items-center rounded px-2 text-[10px] font-medium text-white transition-all"
                      style={{
                        width: `${(b.count / maxCount) * 100}%`,
                        backgroundColor: bucketConfig[b.bucket].color,
                        minWidth: b.count > 0 ? 24 : 0,
                      }}
                    >
                      {b.count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority chart */}
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--foreground)" }}>Tasks by Priority</h3>
          <div className="space-y-3">
            {priorityCounts.map((p) => (
              <div key={p.priority} className="flex items-center gap-3">
                <span className="flex w-24 items-center gap-1 text-xs" style={{ color: priorityConfig[p.priority].color }}>
                  {priorityConfig[p.priority].icon}
                  {priorityConfig[p.priority].label}
                </span>
                <div className="flex-1">
                  <div className="h-6 w-full rounded" style={{ backgroundColor: "var(--muted)" }}>
                    <div
                      className="flex h-full items-center rounded px-2 text-[10px] font-medium text-white transition-all"
                      style={{
                        width: `${(p.count / maxPriority) * 100}%`,
                        backgroundColor: priorityConfig[p.priority].color,
                        minWidth: p.count > 0 ? 24 : 0,
                      }}
                    >
                      {p.count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member workload */}
        <div className="rounded-lg border p-4 md:col-span-2" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--foreground)" }}>Member Workload</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {assigneeCounts.map((a) => (
              <div key={a.name} className="rounded-lg p-3" style={{ backgroundColor: "var(--muted)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: a.color }}
                  >
                    {a.avatar}
                  </div>
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{a.name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                  <span>{a.total} tasks</span>
                  <span>{a.done} done</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Schedule View ────────────────────────────────────────

function ScheduleView() {
  const { tasks, filterAssignee, filterPriority } = usePlannerStore();

  const filteredTasks = tasks.filter((t) => {
    if (filterAssignee && t.assignee !== filterAssignee) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // Group by week
  const weeks: Record<string, PlannerTask[]> = {};
  sortedTasks.forEach((task) => {
    const d = new Date(task.dueDate);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(task);
  });

  return (
    <div className="flex-1 overflow-auto p-6">
      {Object.entries(weeks).map(([weekStart, weekTasks]) => {
        const ws = new Date(weekStart);
        const we = new Date(ws);
        we.setDate(ws.getDate() + 6);
        return (
          <div key={weekStart} className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Week of {formatShortDate(weekStart)} — {formatShortDate(we.toISOString())}
            </h3>
            <div className="space-y-2">
              {weekTasks.map((task) => {
                const overdue = task.bucket !== "done" && isOverdue(task.dueDate);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
                  >
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: bucketConfig[task.bucket].color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{bucketConfig[task.bucket].label}</span>
                        <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>·</span>
                        {task.labels.map((l) => (
                          <span key={l} className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{l}</span>
                        ))}
                      </div>
                    </div>
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ backgroundColor: task.assigneeColor }}
                    >
                      {task.assigneeAvatar}
                    </div>
                    <div className="flex items-center gap-1" style={{ color: priorityConfig[task.priority].color }}>
                      {priorityConfig[task.priority].icon}
                    </div>
                    <span
                      className="text-[11px]"
                      style={{ color: overdue ? "#ef4444" : "var(--muted-foreground)" }}
                    >
                      {formatShortDate(task.dueDate)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Editor ──────────────────────────────────────────

export default function PlannerEditor() {
  const { activeView } = usePlannerStore();

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <PlannerToolbar />
      {activeView === "board" && <BoardView />}
      {activeView === "charts" && <ChartsView />}
      {activeView === "schedule" && <ScheduleView />}
    </div>
  );
}
