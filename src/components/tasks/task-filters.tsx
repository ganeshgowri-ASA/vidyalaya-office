"use client";
import { useTasksStore } from "@/store/tasks-store";
import type { Priority, TaskLabel } from "@/store/tasks-store";
import { cn } from "@/lib/utils";
import {
  Search, Filter, LayoutGrid, GanttChartSquare, List, Users, Plus,
  Mail, CalendarDays, StickyNote, SlidersHorizontal,
} from "lucide-react";

const ASSIGNEES = ["Alice Chen", "Bob Kumar", "Carol White", "David Lee"];
const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];
const LABELS: TaskLabel[] = ["Bug", "Feature", "Enhancement", "Documentation", "Urgent"];

const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Medium: "#06b6d4",
  Low: "#6b7280",
};

const LABEL_COLORS: Record<TaskLabel, string> = {
  Bug: "#ef4444",
  Feature: "#8b5cf6",
  Enhancement: "#06b6d4",
  Documentation: "#10b981",
  Urgent: "#f59e0b",
};

export function TaskFilters() {
  const {
    viewMode, setViewMode, searchQuery, setSearch, filterPriority, setFilterPriority,
    filterAssignee, setFilterAssignee, filterLabel, setFilterLabel,
    myTasksOnly, toggleMyTasks, createTask, selectedIds, bulkUpdateStatus, bulkDelete, clearSelection,
  } = useTasksStore();

  return (
    <div
      className="flex-shrink-0 border-b px-4 py-3 space-y-2"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
    >
      {/* Top row */}
      <div className="flex items-center gap-3">
        {/* View toggles */}
        <div className="flex items-center rounded-lg border overflow-hidden flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          {([
            { mode: "kanban" as const, icon: LayoutGrid, label: "Kanban" },
            { mode: "gantt" as const, icon: GanttChartSquare, label: "Gantt" },
            { mode: "list" as const, icon: List, label: "List" },
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={label}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors", viewMode === mode ? "opacity-100" : "opacity-50 hover:opacity-80")}
              style={{
                backgroundColor: viewMode === mode ? "var(--sidebar-accent)" : "transparent",
                color: viewMode === mode ? "white" : "var(--foreground)",
              }}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" style={{ color: "var(--foreground)" }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-lg border py-1.5 pl-7 pr-3 text-xs bg-transparent outline-none"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        {/* My tasks toggle */}
        <button
          onClick={toggleMyTasks}
          className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors flex-shrink-0", myTasksOnly ? "opacity-100" : "opacity-60 hover:opacity-80")}
          style={{
            backgroundColor: myTasksOnly ? "var(--sidebar-accent)" : "var(--muted)",
            color: myTasksOnly ? "white" : "var(--foreground)",
          }}
        >
          <Users size={13} /> My Tasks
        </button>

        <div className="flex-1" />

        {/* Quick create */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => createTask()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus size={13} /> New Task
          </button>
          <button className="rounded-lg border p-1.5 opacity-50 hover:opacity-100 transition-colors" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} title="Create from email">
            <Mail size={13} />
          </button>
          <button className="rounded-lg border p-1.5 opacity-50 hover:opacity-100 transition-colors" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} title="Create from meeting">
            <CalendarDays size={13} />
          </button>
          <button className="rounded-lg border p-1.5 opacity-50 hover:opacity-100 transition-colors" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} title="Create from notes">
            <StickyNote size={13} />
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal size={12} className="opacity-40" style={{ color: "var(--foreground)" }} />

        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | "All")}
          className="rounded-lg border px-2 py-1 text-xs bg-transparent outline-none"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <option value="All" style={{ backgroundColor: "var(--card)" }}>All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p} style={{ backgroundColor: "var(--card)" }}>{p}</option>
          ))}
        </select>

        {/* Assignee filter */}
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="rounded-lg border px-2 py-1 text-xs bg-transparent outline-none"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <option value="" style={{ backgroundColor: "var(--card)" }}>All Assignees</option>
          {ASSIGNEES.map((a) => (
            <option key={a} value={a} style={{ backgroundColor: "var(--card)" }}>{a}</option>
          ))}
        </select>

        {/* Label filter */}
        <select
          value={filterLabel}
          onChange={(e) => setFilterLabel(e.target.value as TaskLabel | "All")}
          className="rounded-lg border px-2 py-1 text-xs bg-transparent outline-none"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <option value="All" style={{ backgroundColor: "var(--card)" }}>All Labels</option>
          {LABELS.map((l) => (
            <option key={l} value={l} style={{ backgroundColor: "var(--card)" }}>{l}</option>
          ))}
        </select>

        {/* Active filter chips */}
        {filterPriority !== "All" && (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs cursor-pointer hover:opacity-70"
            style={{ backgroundColor: PRIORITY_COLORS[filterPriority] + "22", color: PRIORITY_COLORS[filterPriority] }}
            onClick={() => setFilterPriority("All")}
          >
            {filterPriority} ×
          </span>
        )}
        {filterLabel !== "All" && (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs cursor-pointer hover:opacity-70"
            style={{ backgroundColor: LABEL_COLORS[filterLabel] + "22", color: LABEL_COLORS[filterLabel] }}
            onClick={() => setFilterLabel("All")}
          >
            {filterLabel} ×
          </span>
        )}
        {filterAssignee && (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs cursor-pointer hover:opacity-70"
            style={{ backgroundColor: "rgba(139,92,246,0.15)", color: "var(--primary)" }}
            onClick={() => setFilterAssignee("")}
          >
            {filterAssignee} ×
          </span>
        )}

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs opacity-50">{selectedIds.length} selected</span>
            <select
              onChange={(e) => { if (e.target.value) { bulkUpdateStatus(e.target.value as any); e.target.value = ""; } }}
              className="rounded border px-2 py-1 text-xs bg-transparent outline-none"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="">Move to...</option>
              {(["Backlog", "To Do", "In Progress", "Review", "Done"] as const).map((s) => (
                <option key={s} value={s} style={{ backgroundColor: "var(--card)" }}>{s}</option>
              ))}
            </select>
            <button onClick={bulkDelete} className="rounded px-2 py-1 text-xs text-red-400 hover:opacity-80">Delete</button>
            <button onClick={clearSelection} className="rounded px-2 py-1 text-xs opacity-50 hover:opacity-80">Clear</button>
          </div>
        )}
      </div>
    </div>
  );
}
