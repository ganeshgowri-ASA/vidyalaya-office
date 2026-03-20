"use client";
import { useState } from "react";
import { useTasksStore } from "@/store/tasks-store";
import type { TaskStatus, Priority, TaskLabel } from "@/store/tasks-store";
import { cn } from "@/lib/utils";
import {
  X, Calendar, User, Tag, CheckCircle2, Circle, Plus, Trash2, MessageSquare,
  Send, AlertCircle, Clock,
} from "lucide-react";

const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: "#ef4444", High: "#f59e0b", Medium: "#06b6d4", Low: "#6b7280",
};

const LABEL_COLORS: Record<TaskLabel, string> = {
  Bug: "#ef4444", Feature: "#8b5cf6", Enhancement: "#06b6d4", Documentation: "#10b981", Urgent: "#f59e0b",
};

const ALL_LABELS: TaskLabel[] = ["Bug", "Feature", "Enhancement", "Documentation", "Urgent"];

export function TaskDetailPanel() {
  const { tasks, selectedTaskId, selectTask, updateTask, deleteTask, toggleSubtask, addSubtask, addComment } = useTasksStore();
  const task = tasks.find((t) => t.id === selectedTaskId);
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");

  if (!task) return null;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask("");
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, "Alice Chen", newComment.trim());
      setNewComment("");
    }
  };

  const completedSubs = task.subtasks.filter((s) => s.done).length;
  const initials = task.assignee.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <div
      className="flex flex-col h-full border-l overflow-hidden"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", width: 340, minWidth: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-semibold text-sm truncate flex-1 mr-2" style={{ color: "var(--foreground)" }}>Task Detail</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { deleteTask(task.id); }}
            className="rounded p-1.5 text-red-400 opacity-60 hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => selectTask(null)}
            className="rounded p-1.5 opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--foreground)" }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 space-y-5">
          {/* Title */}
          <div>
            <input
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className="w-full text-base font-semibold bg-transparent outline-none border-b pb-1.5"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs opacity-50 block mb-1" style={{ color: "var(--foreground)" }}>Description</label>
            <textarea
              value={task.description}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              rows={3}
              className="w-full bg-transparent text-sm outline-none resize-none rounded-lg border px-3 py-2 leading-relaxed"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              placeholder="Add description..."
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-50 block mb-1.5" style={{ color: "var(--foreground)" }}>Status</label>
              <select
                value={task.status}
                onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                className="w-full rounded-lg border px-3 py-2 text-xs bg-transparent outline-none"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {(["Backlog", "To Do", "In Progress", "Review", "Done"] as TaskStatus[]).map((s) => (
                  <option key={s} value={s} style={{ backgroundColor: "var(--card)" }}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs opacity-50 block mb-1.5" style={{ color: "var(--foreground)" }}>Priority</label>
              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                className="w-full rounded-lg border px-3 py-2 text-xs bg-transparent outline-none"
                style={{ borderColor: "var(--border)", color: PRIORITY_COLORS[task.priority] }}
              >
                {(["Critical", "High", "Medium", "Low"] as Priority[]).map((p) => (
                  <option key={p} value={p} style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-50 block mb-1.5" style={{ color: "var(--foreground)" }}>Assignee</label>
              <select
                value={task.assignee}
                onChange={(e) => updateTask(task.id, { assignee: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-xs bg-transparent outline-none"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {["Alice Chen", "Bob Kumar", "Carol White", "David Lee"].map((a) => (
                  <option key={a} value={a} style={{ backgroundColor: "var(--card)" }}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs opacity-50 block mb-1.5" style={{ color: "var(--foreground)" }}>Deadline</label>
              <input
                type="date"
                value={task.deadline || ""}
                onChange={(e) => updateTask(task.id, { deadline: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-xs bg-transparent outline-none"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="text-xs opacity-50 block mb-2" style={{ color: "var(--foreground)" }}>Labels</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_LABELS.map((label) => {
                const active = task.labels.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => updateTask(task.id, {
                      labels: active ? task.labels.filter((l) => l !== label) : [...task.labels, label],
                    })}
                    className={cn("rounded-full px-2.5 py-1 text-[10px] font-medium transition-all", active ? "opacity-100" : "opacity-30")}
                    style={{ backgroundColor: LABEL_COLORS[label] + "22", color: LABEL_COLORS[label] }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs opacity-50" style={{ color: "var(--foreground)" }}>
                Subtasks ({completedSubs}/{task.subtasks.length})
              </label>
            </div>
            {task.subtasks.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {task.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-2 cursor-pointer group rounded-lg px-2 py-1.5 transition-colors hover:opacity-80"
                    onClick={() => toggleSubtask(task.id, st.id)}
                    style={{ backgroundColor: "var(--card)" }}
                  >
                    {st.done ? <CheckCircle2 size={14} style={{ color: "#10b981" }} /> : <Circle size={14} className="opacity-40" style={{ color: "var(--foreground)" }} />}
                    <span className={cn("text-xs flex-1", st.done && "line-through opacity-40")} style={{ color: "var(--foreground)" }}>{st.text}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                placeholder="Add subtask..."
                className="flex-1 rounded-lg border px-2.5 py-1.5 text-xs bg-transparent outline-none"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <button
                onClick={handleAddSubtask}
                disabled={!newSubtask.trim()}
                className="rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-30 transition-opacity"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="text-xs opacity-50 block mb-2" style={{ color: "var(--foreground)" }}>
              Comments ({task.comments.length})
            </label>
            <div className="space-y-3 mb-3">
              {task.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: "#8b5cf6" }}
                  >
                    {c.author.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{c.author}</span>
                      <span className="text-[10px] opacity-40" style={{ color: "var(--foreground)" }}>
                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-xs opacity-70 leading-relaxed" style={{ color: "var(--foreground)" }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Add comment..."
                className="flex-1 rounded-lg border px-2.5 py-1.5 text-xs bg-transparent outline-none"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="rounded-lg px-2.5 py-1.5 text-white disabled:opacity-30"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
