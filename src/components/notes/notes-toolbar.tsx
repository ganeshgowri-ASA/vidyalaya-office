"use client";
import { useNotesStore } from "@/store/notes-store";
import { cn } from "@/lib/utils";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote,
  Code, Heading1, Heading2, Pin, Download, Sparkles, FileText, LayoutTemplate,
  Link2, AlignLeft, AlignCenter, AlignRight,
} from "lucide-react";

export function NotesToolbar() {
  const { selectedNoteId, notes, updateNote, activeTab, setActiveTab, toggleAiPanel, aiPanelOpen, setTemplateModal } = useNotesStore();
  const note = notes.find((n) => n.id === selectedNoteId);

  const tabs: Array<{ key: typeof activeTab; label: string }> = [
    { key: "editor", label: "Editor" },
    { key: "meeting", label: "Meeting Notes" },
    { key: "decisions", label: "Decisions" },
    { key: "actions", label: "Action Items" },
  ];

  const applyFormat = (format: string) => {
    if (!note) return;
    const markers: Record<string, string> = {
      bold: "**", italic: "_", strike: "~~", code: "`",
    };
    const marker = markers[format];
    if (marker) {
      updateNote(note.id, { content: note.content + `\n${marker}text${marker}` });
    }
  };

  return (
    <div className="border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-2" style={{ backgroundColor: "var(--background)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors border-b-2",
              activeTab === tab.key ? "border-current" : "border-transparent opacity-50 hover:opacity-80"
            )}
            style={{
              color: activeTab === tab.key ? "var(--primary)" : "var(--foreground)",
              borderBottomColor: activeTab === tab.key ? "var(--primary)" : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 pb-1">
          <button
            onClick={() => setTemplateModal(true)}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs opacity-60 hover:opacity-100 transition-colors"
            style={{ color: "var(--foreground)" }}
          >
            <LayoutTemplate size={13} /> Templates
          </button>
          <button
            onClick={() => {
              if (!note) return;
              updateNote(note.id, { pinned: !note.pinned });
            }}
            className={cn("rounded p-1.5 transition-colors", note?.pinned ? "opacity-100" : "opacity-50 hover:opacity-80")}
            style={{ color: note?.pinned ? "var(--primary)" : "var(--foreground)" }}
            title="Pin note"
          >
            <Pin size={14} />
          </button>
          <button
            onClick={toggleAiPanel}
            className={cn("flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors", aiPanelOpen ? "opacity-100" : "opacity-60 hover:opacity-100")}
            style={{
              backgroundColor: aiPanelOpen ? "var(--primary)" : "transparent",
              color: aiPanelOpen ? "white" : "var(--foreground)",
            }}
          >
            <Sparkles size={13} /> AI
          </button>
          <button
            className="rounded p-1.5 opacity-50 hover:opacity-80 transition-colors"
            style={{ color: "var(--foreground)" }}
            title="Export"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Formatting toolbar (only in editor tab) */}
      {activeTab === "editor" && (
        <div
          className="flex items-center gap-0.5 px-4 py-1.5 flex-wrap"
          style={{ backgroundColor: "var(--background)" }}
        >
          {[
            { icon: Bold, label: "Bold", fmt: "bold" },
            { icon: Italic, label: "Italic", fmt: "italic" },
            { icon: Underline, label: "Underline", fmt: "underline" },
            { icon: Strikethrough, label: "Strikethrough", fmt: "strike" },
          ].map(({ icon: Icon, label, fmt }) => (
            <button
              key={label}
              onClick={() => applyFormat(fmt)}
              className="rounded p-1.5 opacity-50 hover:opacity-100 transition-colors"
              style={{ color: "var(--foreground)" }}
              title={label}
            >
              <Icon size={14} />
            </button>
          ))}
          <div className="w-px h-4 mx-1 opacity-20" style={{ backgroundColor: "var(--border)" }} />
          {[
            { icon: Heading1, label: "H1" },
            { icon: Heading2, label: "H2" },
            { icon: Quote, label: "Quote" },
            { icon: Code, label: "Code" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="rounded p-1.5 opacity-50 hover:opacity-100 transition-colors"
              style={{ color: "var(--foreground)" }}
              title={label}
            >
              <Icon size={14} />
            </button>
          ))}
          <div className="w-px h-4 mx-1 opacity-20" style={{ backgroundColor: "var(--border)" }} />
          {[
            { icon: List, label: "Bullet List" },
            { icon: ListOrdered, label: "Numbered List" },
            { icon: Link2, label: "Link" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="rounded p-1.5 opacity-50 hover:opacity-100 transition-colors"
              style={{ color: "var(--foreground)" }}
              title={label}
            >
              <Icon size={14} />
            </button>
          ))}
          <div className="w-px h-4 mx-1 opacity-20" style={{ backgroundColor: "var(--border)" }} />
          {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => (
            <button
              key={i}
              className="rounded p-1.5 opacity-50 hover:opacity-100 transition-colors"
              style={{ color: "var(--foreground)" }}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
