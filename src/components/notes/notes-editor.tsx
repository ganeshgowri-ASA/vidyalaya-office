"use client";
import { useNotesStore } from "@/store/notes-store";
import { NotesToolbar } from "./notes-toolbar";
import { MeetingNotesPanel } from "./meeting-notes-panel";
import { DecisionsPanel } from "./decisions-panel";
import { ActionItemsPanel } from "./action-items-panel";

export function NotesEditorArea() {
  const { notes, selectedNoteId, activeTab, updateNote } = useNotesStore();
  const note = notes.find((n) => n.id === selectedNoteId);

  if (!note) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: "var(--background)" }}>
        <NotesToolbar />
        <div className="flex-1 flex items-center justify-center opacity-30" style={{ color: "var(--foreground)" }}>
          <p className="text-sm">Select a note or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--background)" }}>
      <NotesToolbar />
      <div className="flex-1 overflow-hidden">
        {activeTab === "editor" && (
          <div className="h-full flex flex-col">
            {/* Title */}
            <div className="px-8 pt-8 pb-4">
              <input
                value={note.title}
                onChange={(e) => updateNote(note.id, { title: e.target.value })}
                className="w-full text-2xl font-bold bg-transparent outline-none placeholder:opacity-30"
                style={{ color: "var(--foreground)" }}
                placeholder="Note title..."
              />
              <div className="flex items-center gap-3 mt-2 text-xs opacity-40" style={{ color: "var(--foreground)" }}>
                <span>Last edited {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span>·</span>
                <span className="capitalize">{note.folder}</span>
                {note.tags.length > 0 && (
                  <>
                    <span>·</span>
                    {note.tags.map((t) => (
                      <span key={t} className="rounded-full px-2 py-0.5" style={{ backgroundColor: "rgba(139,92,246,0.15)", color: "var(--primary)" }}>
                        #{t}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <textarea
                value={note.content}
                onChange={(e) => updateNote(note.id, { content: e.target.value })}
                className="w-full h-full min-h-[400px] bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:opacity-30 font-mono"
                style={{ color: "var(--foreground)" }}
                placeholder="Start writing your note... (Markdown supported)"
              />
            </div>
          </div>
        )}
        {activeTab === "meeting" && <MeetingNotesPanel />}
        {activeTab === "decisions" && <DecisionsPanel />}
        {activeTab === "actions" && <ActionItemsPanel />}
      </div>
    </div>
  );
}
