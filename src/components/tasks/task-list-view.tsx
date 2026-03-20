"use client";
import { useTasksStore } from "@/store/tasks-store";
import type { Priority, TaskLabel, TaskStatus } from "@/store/tasks-store";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, Circle, Calendar, AlertTriangle, Flame, ArrowUp, Minus, ChevronDown, Plus,
} from "lucide-react";

const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: "#ef4444", High: "#f59e0b", Medium: "#06b6d4", Low: "#6b7280",
};

const LABEL_COLORS: Record<TaskLabel, string> = {
  Bug: "#ef4444", Feature: "#8b5cf6", Enhancement: "#06b6d4", Documentation: "#10b981", Urgent: "#f59e0b",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  Backlog: "#6b7280", "To Do": "#06b6d4", "In Progress": "#f59e0b", Review: "#8b5cf6", Done: "#10b981",
};

export function TaskListView() {
  const { tasks, searchQuery, filterPriority, filterAssignee, filterLabel, myTasksOnly, selectTask, selectedTaskId, moveTask, createTask, selectedIds, toggleSelect } = useTasksStore();

  const filtered = tasks.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    if (filterAssignee && t.assignee !== filterAssignee) return false;
    if (filterLabel !== "All" && !t.labels.includes(filterLabel)) return false;
    if (myTasksOnly && t.assignee !== "Alice Chen") return false;
    return true;
  });

  return (
    <div className="h-full overflow-auto" style={{ backgroundColor: "var(--background)" }}>
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--card)" }}>
          <tr>
            <th className="w-8 px-4 py-3 text-left">
              <input type="checkbox" className="accent-purple-500" onChange={() => {}} />
            </th>
            {["Task", "Status", "Priority", "Assignee", "Deadline", "Labels"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold opacity-50 whitespace-nowrap border-b" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((task, i) => {
            const isSelected = selectedTaskId === task.id;
            const isChecked = selectedIds.includes(task.id);
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "Done";
            const initials = task.assignee.split(" ").map((w: string) => w[0]).join("").slice(0, 2);

            return (
              <tr
                key={task.id}
                onClick={() => selectTask(isSelected ? null : task.id)}
                className="cursor-pointer transition-colors hover:opacity-90"
                style={{
                  backgroundColor: isSelected ? "rgba(139,92,246,0.08)" : i % 2 === 0 ? "var(--card)" : "transparent",
                }}
              >
                <td className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(task.id); }}
                    onClick={(e) => e.stopPropagation()}
                    className="accent-purple-500"
                  />
                </td>

                {/* Title */}
                <td className="px-4 py-2.5 border-b max-w-[300px]" style={{ borderColor: "var(--border)" }}>
                  <p className={cn("text-sm font-medium truncate", task.status === "Done" && "line-through opacity-50")} style={{ color: "var(--foreground)" }}>
                    {task.title}
                  </p>
                  {task.subtasks.length > 0 && (
                    <p className="text-[10px] opacity-40 mt-0.5" style={{ color: "var(--foreground)" }}>
                      {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks
                    </p>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-2.5 border-b whitespace-nowrap" style={{ borderColor: "var(--border)" }}>
                  <select
                    value={task.status}
                    onChange={(e) => moveTask(task.id, e.target.value as TaskStatus)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium border-0 outline-none cursor-pointer"
                    style={{ backgroundColor: STATUS_COLORS[task.status] + "22", color: STATUS_COLORS[task.status] }}
                  >
                    {(["Backlog", "To Do", "In Progress", "Review", "Done"] as TaskStatus[]).map((s) => (
                      <option key={s} value={s} style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}>{s}</option>
                    ))}
                  </select>
                </td>

                {/* Priority */}
                <td className="px-4 py-2.5 border-b whitespace-nowrap" style={{ borderColor: "var(--border)" }}>
                  <span className="text-xs font-medium" style={{ color: PRIORITY_COLORS[task.priority] }}>{task.priority}</span>
                </td>

                {/* Assignee */}
                <td className="px-4 py-2.5 border-b whitespace-nowrap" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: task.assigneeColor }}>
                      {initials}
                    </div>
                    <span className="text-xs opacity-70" style={{ color: "var(--foreground)" }}>{task.assignee}</span>
                  </div>
                </td>

                {/* Deadline */}
                <td className="px-4 py-2.5 border-b whitespace-nowrap" style={{ borderColor: "var(--border)" }}>
                  {task.deadline ? (
                    <span className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-red-400" : "opacity-50")} style={isOverdue ? {} : { color: "var(--foreground)" }}>
                      <Calendar size={11} />
                      {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {isOverdue && " ⚠"}
                    </span>
                  ) : <span className="opacity-30 text-xs" style={{ color: "var(--foreground)" }}>—</span>}
                </td>

                {/* Labels */}
                <td className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex gap-1 flex-wrap">
                    {task.labels.map((label: TaskLabel) => (
                      <span key={label} className="rounded-full px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap" style={{ backgroundColor: LABEL_COLORS[label] + "22", color: LABEL_COLORS[label] }}>
                        {label}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Add task row */}
      <button
        onClick={() => createTask()}
        className="w-full flex items-center gap-2 px-4 py-3 text-xs opacity-40 hover:opacity-70 transition-opacity border-b"
        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <Plus size={13} /> Add task...
      </button>

      {filtered.length === 0 && (
        <div className="text-center py-16 opacity-30" style={{ color: "var(--foreground)" }}>
          <p className="text-sm">No tasks match your filters</p>
        </div>
      )}
    </div>
  );
}
