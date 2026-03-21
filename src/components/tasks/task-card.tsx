"use client";
import { useState } from "react";
import { useTasksStore } from "@/store/tasks-store";
import type { Task, Priority, TaskLabel } from "@/store/tasks-store";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, Circle, Calendar, User, Tag, MessageSquare,
  ChevronDown, ChevronUp, AlertTriangle, Minus, ArrowUp, Flame,
  X, Check,
} from "lucide-react";

const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Medium: "#06b6d4",
  Low: "#6b7280",
};

const PRIORITY_ICONS: Record<Priority, React.ElementType> = {
  Critical: Flame,
  High: ArrowUp,
  Medium: Minus,
  Low: ChevronDown,
};

const LABEL_COLORS: Record<TaskLabel, string> = {
  Bug: "#ef4444",
  Feature: "#8b5cf6",
  Enhancement: "#06b6d4",
  Documentation: "#10b981",
  Urgent: "#f59e0b",
};

export function TaskCard({ task, compact = false }: { task: Task; compact?: boolean }) {
  const { selectTask, selectedTaskId, toggleSubtask, moveTask, selectedIds, toggleSelect } = useTasksStore();
  const [expanded, setExpanded] = useState(false);
  const isSelected = selectedTaskId === task.id;
  const isChecked = selectedIds.includes(task.id);

  const completedSubs = task.subtasks.filter((s) => s.done).length;
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "Done";
  const PriorityIcon = PRIORITY_ICONS[task.priority];

  const initials = task.assignee.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all cursor-pointer group",
        isSelected && "ring-1",
        compact ? "p-3" : "p-4"
      )}
      style={{
        borderColor: isSelected ? "var(--primary)" : "var(--border)",
        backgroundColor: "var(--card)",
      }}
      onClick={() => selectTask(isSelected ? null : task.id)}
    >
      {/* Top row */}
      <div className="flex items-start gap-2">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => { e.stopPropagation(); toggleSelect(task.id); }}
          className="mt-0.5 flex-shrink-0 cursor-pointer accent-purple-500"
          onClick={(e) => e.stopPropagation()}
        />

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start gap-2">
            <p className={cn("text-sm font-medium leading-tight flex-1", task.status === "Done" && "line-through opacity-50")} style={{ color: "var(--foreground)" }}>
              {task.title}
            </p>
            <PriorityIcon size={13} className="flex-shrink-0 mt-0.5" style={{ color: PRIORITY_COLORS[task.priority] }} />
          </div>

          {/* Description (compact hides) */}
          {!compact && task.description && (
            <p className="text-xs opacity-50 mt-1 leading-relaxed line-clamp-2" style={{ color: "var(--foreground)" }}>
              {task.description}
            </p>
          )}

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: LABEL_COLORS[label] + "22", color: LABEL_COLORS[label] }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {task.tags.slice(0, compact ? 2 : undefined).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-1.5 py-0.5 text-[10px] opacity-60"
                  style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Subtasks progress */}
          {task.subtasks.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] opacity-40" style={{ color: "var(--foreground)" }}>
                  {completedSubs}/{task.subtasks.length} subtasks
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${task.subtasks.length > 0 ? (completedSubs / task.subtasks.length) * 100 : 0}%`,
                    backgroundColor: "var(--primary)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Bottom row */}
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: task.assigneeColor }}
              >
                {initials}
              </div>
              {!compact && <span className="text-[10px] opacity-50 truncate max-w-[80px]" style={{ color: "var(--foreground)" }}>{task.assignee.split(" ")[0]}</span>}
            </div>

            {/* Deadline */}
            {task.deadline && (
              <span
                className={cn("flex items-center gap-1 text-[10px]", isOverdue ? "text-red-400" : "opacity-40")}
                style={isOverdue ? {} : { color: "var(--foreground)" }}
              >
                <Calendar size={10} />
                {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}

            {/* Comments */}
            {task.comments.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] opacity-40 ml-auto" style={{ color: "var(--foreground)" }}>
                <MessageSquare size={10} /> {task.comments.length}
              </span>
            )}

            {/* Blocked indicator */}
            {task.blockedBy && task.blockedBy.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-red-400">
                <AlertTriangle size={10} /> Blocked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded subtasks */}
      {!compact && expanded && task.subtasks.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: "var(--border)" }}>
          {task.subtasks.map((st) => (
            <div
              key={st.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); toggleSubtask(task.id, st.id); }}
            >
              {st.done ? (
                <CheckCircle2 size={13} style={{ color: "#10b981" }} />
              ) : (
                <Circle size={13} className="opacity-40" style={{ color: "var(--foreground)" }} />
              )}
              <span className={cn("text-xs", st.done && "line-through opacity-40")} style={{ color: "var(--foreground)" }}>
                {st.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Expand toggle */}
      {!compact && task.subtasks.length > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="mt-2 w-full flex items-center justify-center opacity-30 hover:opacity-60 transition-opacity"
          style={{ color: "var(--foreground)" }}
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      )}
    </div>
  );
}
