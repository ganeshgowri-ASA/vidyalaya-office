"use client";
import { useState } from "react";
import { useTasksStore } from "@/store/tasks-store";
import type { TaskStatus } from "@/store/tasks-store";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";
import { Plus, MoreHorizontal } from "lucide-react";

const COLUMNS: Array<{ status: TaskStatus; color: string }> = [
  { status: "Backlog", color: "#6b7280" },
  { status: "To Do", color: "#06b6d4" },
  { status: "In Progress", color: "#f59e0b" },
  { status: "Review", color: "#8b5cf6" },
  { status: "Done", color: "#10b981" },
  { status: "Blocked", color: "#ef4444" },
];

export function KanbanBoard() {
  const { tasks, searchQuery, filterPriority, filterAssignee, filterLabel, myTasksOnly, createTask, moveTask } = useTasksStore();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const filtered = tasks.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    if (filterAssignee && t.assignee !== filterAssignee) return false;
    if (filterLabel !== "All" && !t.labels.includes(filterLabel)) return false;
    if (myTasksOnly && t.assignee !== "Alice Chen") return false;
    return true;
  });

  const handleDrop = (status: TaskStatus) => {
    if (draggedId) {
      moveTask(draggedId, status);
      setDraggedId(null);
      setDragOverCol(null);
    }
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto p-4">
      {COLUMNS.map(({ status, color }) => {
        const col = filtered.filter((t) => t.status === status);
        const isOver = dragOverCol === status;

        return (
          <div
            key={status}
            className="flex flex-col rounded-xl min-w-[260px] max-w-[280px] flex-shrink-0"
            style={{ backgroundColor: "var(--card)" }}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(status); }}
            onDrop={() => handleDrop(status)}
            onDragLeave={() => setDragOverCol(null)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{status}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: color + "22", color }}
                >
                  {col.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => createTask(status)}
                  className="rounded p-1 opacity-40 hover:opacity-100 transition-colors"
                  style={{ color: "var(--foreground)" }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Drop zone */}
            <div
              className={cn(
                "flex-1 overflow-y-auto px-2 pb-2 space-y-2 rounded-lg transition-colors min-h-[100px]",
                isOver && "ring-0"
              )}
              style={{ outline: isOver ? `2px solid ${color}` : undefined }}
            >
              {col.length === 0 && !isOver && (
                <div className="flex items-center justify-center py-8 opacity-20" style={{ color: "var(--foreground)" }}>
                  <p className="text-xs">Drop tasks here</p>
                </div>
              )}
              {col.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedId(task.id)}
                  onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                  className={cn("transition-opacity", draggedId === task.id && "opacity-40")}
                >
                  <TaskCard task={task} compact />
                </div>
              ))}
            </div>

            {/* Add task button */}
            <button
              onClick={() => createTask(status)}
              className="flex items-center gap-1.5 mx-2 mb-2 px-2 py-1.5 rounded-lg text-xs opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: "var(--foreground)" }}
            >
              <Plus size={12} /> Add task
            </button>
          </div>
        );
      })}
    </div>
  );
}
