"use client";
import { useState } from "react";
import { useNotesStore } from "@/store/notes-store";
import { cn } from "@/lib/utils";
import { Sparkles, Users, Calendar, Clock, FileText, Wand2, Download, Tag } from "lucide-react";

const MEETINGS = [
  { id: "m1", title: "Sprint 14 Planning", date: "2026-03-19" },
  { id: "m2", title: "Product Roadmap Review", date: "2026-03-18" },
  { id: "m3", title: "Team Standup", date: "2026-03-20" },
  { id: "m4", title: "Client Demo Prep", date: "2026-03-17" },
];

export function MeetingNotesPanel() {
  const { notes, selectedNoteId, updateNote } = useNotesStore();
  const note = notes.find((n) => n.id === selectedNoteId);
  const [generating, setGenerating] = useState<string | null>(null);
  const [linkedMeeting, setLinkedMeeting] = useState(note?.meetingId || "");

  if (!note) return (
    <div className="flex items-center justify-center h-full opacity-40" style={{ color: "var(--foreground)" }}>
      <p className="text-sm">Select a note to view meeting details</p>
    </div>
  );

  const simulateAI = (action: string) => {
    setGenerating(action);
    setTimeout(() => setGenerating(null), 1500);
  };

  const aiActions = [
    {
      id: "summary",
      label: "Generate Meeting Summary",
      icon: Sparkles,
      description: "Extract key points, decisions, and next steps",
    },
    {
      id: "action-items",
      label: "Extract Action Items",
      icon: Wand2,
      description: "Auto-identify tasks with owners and deadlines",
    },
    {
      id: "mom",
      label: "Format as MoM",
      icon: FileText,
      description: "Reformat note as official Minutes of Meeting",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="px-6 py-5 space-y-5">
        {/* Meeting metadata */}
        <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <h3 className="text-sm font-semibold opacity-70">Meeting Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Link to meeting */}
            <div className="col-span-2">
              <label className="text-xs opacity-50 mb-1 block">Link to Meeting</label>
              <select
                value={linkedMeeting}
                onChange={(e) => {
                  setLinkedMeeting(e.target.value);
                  updateNote(note.id, { meetingId: e.target.value });
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                <option value="" style={{ backgroundColor: "var(--card)" }}>None</option>
                {MEETINGS.map((m) => (
                  <option key={m.id} value={m.id} style={{ backgroundColor: "var(--card)" }}>
                    {m.title} — {m.date}
                  </option>
                ))}
              </select>
            </div>

            <InfoField icon={Users} label="Attendees" value="Alice, Bob, Carol, David" />
            <InfoField icon={Calendar} label="Date" value={new Date(note.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })} />
            <InfoField icon={Clock} label="Duration" value="45 minutes" />
            <InfoField icon={Tag} label="Template" value={note.template.replace("-", " ").replace(/^\w/, c => c.toUpperCase())} />
          </div>
        </div>

        {/* AI Actions */}
        <div>
          <h3 className="text-sm font-semibold opacity-70 mb-3">AI Assistant</h3>
          <div className="space-y-2">
            {aiActions.map((action) => (
              <button
                key={action.id}
                onClick={() => simulateAI(action.id)}
                disabled={generating !== null}
                className="w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:opacity-90 disabled:opacity-50"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
              >
                <div className="rounded-lg p-2 flex-shrink-0" style={{ backgroundColor: "rgba(139,92,246,0.15)" }}>
                  {generating === action.id ? (
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary)" }} />
                  ) : (
                    <action.icon size={16} style={{ color: "var(--primary)" }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs opacity-50 mt-0.5">{action.description}</p>
                </div>
                {generating === action.id && (
                  <span className="ml-auto text-xs opacity-50 self-center">Generating...</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Export options */}
        <div>
          <h3 className="text-sm font-semibold opacity-70 mb-3">Export</h3>
          <div className="flex gap-2 flex-wrap">
            {["PDF", "DOCX", "Markdown", "Email"].map((fmt) => (
              <button
                key={fmt}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:opacity-80"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                <Download size={12} /> {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Note summary preview */}
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <h3 className="text-sm font-semibold opacity-70 mb-2">Quick Summary</h3>
          <div className="space-y-2">
            <SummarySection label="Key Points" items={["Sprint 13 velocity: 42 points", "Sprint 14 target: 38 points", "Auth redesign is top priority"]} />
            <SummarySection label="Decisions" items={note.decisions.map((d) => d.decision).slice(0, 3)} />
            <SummarySection label="Next Steps" items={note.actionItems.filter((a) => !a.done).map((a) => a.text).slice(0, 3)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <label className="text-xs opacity-50 mb-1 block">{label}</label>
      <div className="flex items-center gap-1.5 text-sm">
        <Icon size={13} className="opacity-40" />
        {value}
      </div>
    </div>
  );
}

function SummarySection({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-medium opacity-50 mb-1">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs opacity-70 flex items-start gap-1.5">
            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--primary)" }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
