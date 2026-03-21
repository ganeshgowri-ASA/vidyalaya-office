"use client";
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { MatrixQuadrant, MatrixTaskPriority, usePriorityMatrixStore } from "@/store/priority-matrix-store";

const QUADRANT_LABELS: Record<MatrixQuadrant, { title: string; subtitle: string; color: string }> = {
  q1: { title: "Do First", subtitle: "Urgent + Important", color: "#ef4444" },
  q2: { title: "Schedule", subtitle: "Not Urgent + Important", color: "#3b82f6" },
  q3: { title: "Delegate", subtitle: "Urgent + Not Important", color: "#f59e0b" },
  q4: { title: "Eliminate", subtitle: "Neither", color: "#6b7280" },
};

interface Props {
  quadrant: MatrixQuadrant;
  onClose: () => void;
}

export function QuickAddModal({ quadrant, onClose }: Props) {
  const { addTask } = usePriorityMatrixStore();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<MatrixTaskPriority>("Medium");
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );

  const qInfo = QUADRANT_LABELS[quadrant];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(quadrant, title.trim(), priority, deadline);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border shadow-2xl p-5"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Add to{" "}
              <span style={{ color: qInfo.color }}>{qInfo.title}</span>
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {qInfo.subtitle}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:opacity-70 transition-opacity" style={{ color: "var(--muted-foreground)" }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
              Task title *
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MatrixTaskPriority)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border py-2 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1.5"
              style={{ backgroundColor: qInfo.color, color: "#fff" }}
            >
              <Plus size={14} />
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
