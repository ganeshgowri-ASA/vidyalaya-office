"use client";
import { useNotesStore, type NoteTemplate } from "@/store/notes-store";
import { X, FileText, Users, RotateCcw, MessageSquare, Lightbulb, Briefcase } from "lucide-react";

const TEMPLATES: Array<{ key: NoteTemplate; label: string; icon: React.ElementType; description: string; color: string }> = [
  { key: "blank", label: "Blank", icon: FileText, description: "Start with a clean slate", color: "#6b7280" },
  { key: "mom", label: "Minutes of Meeting", icon: Users, description: "Agenda, discussion, decisions, action items", color: "#8b5cf6" },
  { key: "standup", label: "Daily Standup", icon: RotateCcw, description: "Yesterday, today, blockers", color: "#06b6d4" },
  { key: "retro", label: "Sprint Retrospective", icon: RotateCcw, description: "Went well, improve, action items", color: "#10b981" },
  { key: "one-on-one", label: "1-on-1 Meeting", icon: MessageSquare, description: "Check-in, goals, feedback", color: "#f59e0b" },
  { key: "brainstorm", label: "Brainstorm", icon: Lightbulb, description: "Ideas, themes, prioritization", color: "#ef4444" },
  { key: "project-brief", label: "Project Brief", icon: Briefcase, description: "Overview, goals, scope, timeline", color: "#3b82f6" },
];

export function TemplateModal() {
  const { templateModalOpen, setTemplateModal, createNote } = useNotesStore();

  if (!templateModalOpen) return null;

  const handleSelect = (key: NoteTemplate) => {
    createNote(key);
    setTemplateModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div
        className="rounded-2xl border shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Choose a Template</h2>
            <p className="text-sm opacity-50 mt-0.5" style={{ color: "var(--foreground)" }}>Start with a structured template or blank note</p>
          </div>
          <button onClick={() => setTemplateModal(false)} className="rounded-lg p-1.5 opacity-50 hover:opacity-100 transition-colors" style={{ color: "var(--foreground)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Templates grid */}
        <div className="p-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              onClick={() => handleSelect(t.key)}
              className="flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all hover:scale-[1.02] hover:opacity-90"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
            >
              <div className="rounded-lg p-2.5" style={{ backgroundColor: t.color + "22" }}>
                <t.icon size={20} style={{ color: t.color }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{t.label}</p>
                <p className="text-xs opacity-50 mt-0.5 leading-relaxed" style={{ color: "var(--foreground)" }}>{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
