"use client";
import { useState } from "react";
import { useNotesStore } from "@/store/notes-store";
import type { Decision } from "@/store/notes-store";
import { cn } from "@/lib/utils";
import { Plus, Scale, Calendar, User, ChevronDown } from "lucide-react";

const STATUS_COLORS: Record<Decision["status"], string> = {
  "Open": "#f59e0b",
  "In Progress": "#06b6d4",
  "Done": "#10b981",
  "Cancelled": "#6b7280",
};

export function DecisionsPanel() {
  const { notes, selectedNoteId, addDecision, updateDecision } = useNotesStore();
  const note = notes.find((n) => n.id === selectedNoteId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ decision: "", owner: "", deadline: "", status: "Open" as Decision["status"] });

  if (!note) return (
    <div className="flex items-center justify-center h-full opacity-40" style={{ color: "var(--foreground)" }}>
      <p className="text-sm">Select a note to view decisions</p>
    </div>
  );

  const handleAdd = () => {
    if (!form.decision.trim()) return;
    addDecision(note.id, form);
    setForm({ decision: "", owner: "", deadline: "", status: "Open" });
    setShowForm(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="font-semibold text-base">Decision Tracker</h2>
          <p className="text-xs opacity-50 mt-0.5">{note.decisions.length} decisions recorded</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <Plus size={13} /> Add Decision
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mx-6 mt-4 rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <textarea
            value={form.decision}
            onChange={(e) => setForm({ ...form, decision: e.target.value })}
            placeholder="Describe the decision made..."
            rows={2}
            className="w-full bg-transparent text-sm outline-none resize-none border-b pb-2"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            autoFocus
          />
          <div className="flex gap-3 flex-wrap">
            <input
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              placeholder="Owner"
              className="flex-1 bg-transparent text-xs outline-none border rounded px-2 py-1"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", minWidth: 100 }}
            />
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="bg-transparent text-xs outline-none border rounded px-2 py-1"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Decision["status"] })}
              className="bg-transparent text-xs outline-none border rounded px-2 py-1"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {(["Open", "In Progress", "Done", "Cancelled"] as Decision["status"][]).map((s) => (
                <option key={s} value={s} style={{ backgroundColor: "var(--card)" }}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="rounded px-3 py-1 text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>Add</button>
            <button onClick={() => setShowForm(false)} className="rounded px-3 py-1 text-xs opacity-60 hover:opacity-100">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {note.decisions.length === 0 ? (
          <div className="text-center py-12 opacity-40">
            <Scale size={32} className="mx-auto mb-2" />
            <p className="text-sm">No decisions recorded yet</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--muted)" }}>
                  {["Decision", "Owner", "Deadline", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold opacity-60 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {note.decisions.map((d, i) => (
                  <tr
                    key={d.id}
                    className="border-t transition-colors hover:opacity-90"
                    style={{ borderColor: "var(--border)", backgroundColor: i % 2 === 0 ? "var(--card)" : "transparent" }}
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs leading-relaxed">{d.decision}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-xs opacity-70">
                        <User size={11} /> {d.owner || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-xs opacity-70">
                        <Calendar size={11} />
                        {d.deadline ? new Date(d.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={d.status}
                        onChange={(e) => updateDecision(note.id, d.id, { status: e.target.value as Decision["status"] })}
                        className="text-xs rounded-full px-2 py-0.5 border-0 outline-none font-medium cursor-pointer"
                        style={{ backgroundColor: STATUS_COLORS[d.status] + "22", color: STATUS_COLORS[d.status] }}
                      >
                        {(["Open", "In Progress", "Done", "Cancelled"] as Decision["status"][]).map((s) => (
                          <option key={s} value={s} style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
