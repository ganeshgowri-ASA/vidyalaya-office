"use client";
import { useState } from "react";
import { Flame, ArrowUp, Minus, ArrowDown, Check, Trash2, GripVertical, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MatrixTask, MatrixQuadrant, usePriorityMatrixStore } from "@/store/priority-matrix-store";

const PRIORITY_CONFIG = {
  Critical: { icon: Flame, color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  High:     { icon: ArrowUp, color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  Medium:   { icon: Minus, color: "#eab308", bg: "rgba(234,179,8,0.15)" },
  Low:      { icon: ArrowDown, color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
};

interface Props {
  task: MatrixTask;
  quadrantAccent: string;
}

export function MatrixTaskCard({ task, quadrantAccent }: Props) {
  const { completeTask, deleteTask, setDraggedTask, selectTask, selectedTaskId } = usePriorityMatrixStore();
  const [hovered, setHovered] = useState(false);

  const pc = PRIORITY_CONFIG[task.priority];
  const PriorityIcon = pc.icon;
  const daysLeft = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000);
  const isOverdue = daysLeft < 0;
  const isSelected = selectedTaskId === task.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
    setDraggedTask(task.id);
  };
  const handleDragEnd = () => setDraggedTask(null);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => selectTask(isSelected ? null : task.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative rounded-lg border p-2.5 cursor-grab active:cursor-grabbing transition-all duration-150",
        task.completed && "opacity-50"
      )}
      style={{
        backgroundColor: isSelected ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        borderColor: isSelected ? quadrantAccent : "var(--border)",
        boxShadow: isSelected ? `0 0 0 1px ${quadrantAccent}40` : undefined,
      }}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <GripVertical size={14} className="mt-0.5 shrink-0 opacity-20 group-hover:opacity-50" style={{ color: "var(--foreground)" }} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5">
            {/* Complete checkbox */}
            <button
              onClick={(e) => { e.stopPropagation(); completeTask(task.id); }}
              className={cn(
                "mt-0.5 shrink-0 w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors",
              )}
              style={{
                borderColor: task.completed ? quadrantAccent : "var(--border)",
                backgroundColor: task.completed ? quadrantAccent : "transparent",
              }}
            >
              {task.completed && <Check size={9} color="#fff" strokeWidth={3} />}
            </button>

            <p
              className={cn("text-xs font-medium leading-snug flex-1 min-w-0", task.completed && "line-through")}
              style={{ color: "var(--foreground)" }}
            >
              {task.title}
            </p>
          </div>

          {/* Meta row */}
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {/* Priority badge */}
            <span
              className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: pc.bg, color: pc.color }}
            >
              <PriorityIcon size={9} />
              {task.priority}
            </span>

            {/* Deadline */}
            <span
              className="flex items-center gap-0.5 text-[10px]"
              style={{ color: isOverdue ? "#ef4444" : "var(--muted-foreground)" }}
            >
              <Calendar size={9} />
              {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Today" : `${daysLeft}d`}
            </span>

            {/* Assignee */}
            <span
              className="flex items-center gap-0.5 text-[10px] rounded-full px-1 py-0.5 font-medium"
              style={{ backgroundColor: task.assigneeColor + "25", color: task.assigneeColor }}
            >
              {task.assignee.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </span>

            {/* Labels */}
            {task.labels.slice(0, 1).map((l) => (
              <span
                key={l}
                className="rounded px-1 py-0.5 text-[10px]"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "var(--muted-foreground)" }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Delete */}
        {(hovered || isSelected) && (
          <button
            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
            className="shrink-0 rounded p-0.5 opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: "#ef4444" }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
