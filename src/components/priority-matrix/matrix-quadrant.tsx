"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatrixTask, MatrixQuadrant } from "@/store/priority-matrix-store";
import { usePriorityMatrixStore } from "@/store/priority-matrix-store";
import { MatrixTaskCard } from "./matrix-task-card";
import { QuickAddModal } from "./quick-add-modal";

const QUADRANT_CONFIG: Record<
  MatrixQuadrant,
  { title: string; subtitle: string; action: string; color: string; bg: string; border: string }
> = {
  q1: {
    title: "Q1 — Do First",
    subtitle: "Urgent + Important",
    action: "Crisis mode — tackle immediately",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.3)",
  },
  q2: {
    title: "Q2 — Schedule",
    subtitle: "Not Urgent + Important",
    action: "Plan & invest time here — high value",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.3)",
  },
  q3: {
    title: "Q3 — Delegate",
    subtitle: "Urgent + Not Important",
    action: "Assign to someone else if possible",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.3)",
  },
  q4: {
    title: "Q4 — Eliminate",
    subtitle: "Neither Urgent nor Important",
    action: "Drop, defer, or automate these",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.06)",
    border: "rgba(107,114,128,0.3)",
  },
};

interface Props {
  quadrant: MatrixQuadrant;
  tasks: MatrixTask[];
}

export function MatrixQuadrant({ quadrant, tasks }: Props) {
  const { moveTask, setDraggedTask, draggedTaskId } = usePriorityMatrixStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const cfg = QUADRANT_CONFIG[quadrant];
  const completedCount = tasks.filter((t) => t.completed).length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) moveTask(taskId, quadrant);
    setDraggedTask(null);
  };

  return (
    <>
      <div
        className={cn("flex flex-col rounded-xl border transition-all duration-150 overflow-hidden")}
        style={{
          backgroundColor: dragOver ? cfg.bg.replace("0.06", "0.12") : cfg.bg,
          borderColor: dragOver ? cfg.color : cfg.border,
          boxShadow: dragOver ? `0 0 0 2px ${cfg.color}30` : undefined,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div
          className="px-3 py-2.5 border-b flex items-start justify-between"
          style={{ borderColor: cfg.border }}
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
              <h3 className="text-xs font-bold tracking-wide" style={{ color: cfg.color }}>
                {cfg.title}
              </h3>
              <span
                className="text-[10px] rounded-full px-1.5 py-0.5 font-semibold"
                style={{ backgroundColor: cfg.color + "20", color: cfg.color }}
              >
                {tasks.length}
              </span>
            </div>
            <p className="text-[10px] mt-0.5 ml-4.5" style={{ color: "var(--muted-foreground)" }}>
              {cfg.subtitle}
            </p>
            <p className="text-[10px] mt-0.5 italic" style={{ color: cfg.color, opacity: 0.7 }}>
              {cfg.action}
            </p>
          </div>

          <button
            onClick={() => setShowQuickAdd(true)}
            className="shrink-0 rounded-lg p-1 transition-opacity hover:opacity-70 ml-2"
            style={{ backgroundColor: cfg.color + "20", color: cfg.color }}
            title={`Add task to ${cfg.title}`}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="px-3 py-1.5" style={{ borderBottom: `1px solid ${cfg.border}` }}>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 rounded-full h-1"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedCount / tasks.length) * 100}%`,
                    backgroundColor: cfg.color,
                  }}
                />
              </div>
              <span className="text-[10px] shrink-0" style={{ color: "var(--muted-foreground)" }}>
                {completedCount}/{tasks.length}
              </span>
            </div>
          </div>
        )}

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[120px]">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 opacity-40">
              <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                Drop tasks here
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <MatrixTaskCard key={task.id} task={task} quadrantAccent={cfg.color} />
            ))
          )}
        </div>

        {/* Footer add button */}
        <div className="px-2 pb-2">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="w-full rounded-lg py-1.5 text-xs transition-opacity hover:opacity-70 flex items-center justify-center gap-1"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              color: "var(--muted-foreground)",
              border: `1px dashed ${cfg.border}`,
            }}
          >
            <Plus size={12} />
            Quick add
          </button>
        </div>
      </div>

      {showQuickAdd && (
        <QuickAddModal quadrant={quadrant} onClose={() => setShowQuickAdd(false)} />
      )}
    </>
  );
}
