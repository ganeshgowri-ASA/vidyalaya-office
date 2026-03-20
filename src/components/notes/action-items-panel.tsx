"use client";
import { useState } from "react";
import { useNotesStore } from "@/store/notes-store";
import { cn } from "@/lib/utils";
import { Plus, CheckCircle2, Circle, Calendar, User, Filter } from "lucide-react";

export function ActionItemsPanel() {
  const { notes, selectedNoteId, addActionItem, toggleActionItem } = useNotesStore();
  const note = notes.find((n) => n.id === selectedNoteId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ text: "", assignee: "", deadline: "" });
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  if (!note) return <EmptyState />;

  const items = note.actionItems.filter((ai) => {
    if (filter === "open") return !ai.done;
    if (filter === "done") return ai.done;
    return true;
  });

  const openCount = note.actionItems.filter((ai) => !ai.done).length;
  const doneCount = note.actionItems.filter((ai) => ai.done).length;

  const handleAdd = () => {
    if (!form.text.trim()) return;
    addActionItem(note.id, { ...form, done: false });
    setForm({ text: "", assignee: "", deadline: "" });
    setShowForm(false);
  };

  const isOverdue = (deadline: string) => deadline && new Date(deadline) < new Date();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="font-semibold text-base">Action Items</h2>
          <p className="text-xs opacity-50 mt-0.5">{openCount} open · {doneCount} completed</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <Plus size={13} /> Add Item
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1 px-6 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <Filter size={12} className="opacity-40 mr-1" />
        {(["all", "open", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("rounded px-2.5 py-1 text-xs capitalize transition-colors", filter === f ? "opacity-100" : "opacity-50 hover:opacity-80")}
            style={{ backgroundColor: filter === f ? "var(--muted)" : "transparent" }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mx-6 mt-4 rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <input
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            placeholder="Action item description..."
            className="w-full bg-transparent text-sm outline-none border-b pb-1.5"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 flex-1">
              <User size={12} className="opacity-40" />
              <input
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                placeholder="Assignee"
                className="flex-1 bg-transparent text-xs outline-none opacity-70"
                style={{ color: "var(--foreground)" }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="opacity-40" />
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="bg-transparent text-xs outline-none opacity-70"
                style={{ color: "var(--foreground)" }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="rounded px-3 py-1 text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>Add</button>
            <button onClick={() => setShowForm(false)} className="rounded px-3 py-1 text-xs opacity-60 hover:opacity-100">Cancel</button>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {items.length === 0 && (
          <div className="text-center py-12 opacity-40">
            <CheckCircle2 size={32} className="mx-auto mb-2" />
            <p className="text-sm">No action items yet</p>
          </div>
        )}
        {items.map((ai) => (
          <div
            key={ai.id}
            className="flex items-start gap-3 rounded-xl p-3 border transition-colors group"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
          >
            <button
              onClick={() => toggleActionItem(note.id, ai.id)}
              className="mt-0.5 flex-shrink-0 transition-colors"
              style={{ color: ai.done ? "#10b981" : "var(--foreground)" }}
            >
              {ai.done ? <CheckCircle2 size={17} /> : <Circle size={17} className="opacity-40" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm leading-tight", ai.done && "line-through opacity-50")}>{ai.text}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {ai.assignee && (
                  <span className="flex items-center gap-1 text-xs opacity-50">
                    <User size={10} /> {ai.assignee}
                  </span>
                )}
                {ai.deadline && (
                  <span className={cn("flex items-center gap-1 text-xs", isOverdue(ai.deadline) && !ai.done ? "text-red-400" : "opacity-50")}>
                    <Calendar size={10} /> {new Date(ai.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {isOverdue(ai.deadline) && !ai.done && " · Overdue"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full opacity-40" style={{ color: "var(--foreground)" }}>
      <p className="text-sm">Select a note to view action items</p>
    </div>
  );
}
