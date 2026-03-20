"use client";
import { useNotesStore } from "@/store/notes-store";
import { NotesList } from "./notes-list";
import { NotesEditorArea } from "./notes-editor";
import { AINotesPanel } from "./ai-notes-panel";
import { TemplateModal } from "./template-modal";

export function NotesMain() {
  const { aiPanelOpen } = useNotesStore();

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
      {/* Left: Notes list */}
      <NotesList />

      {/* Center: Editor */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <NotesEditorArea />
      </div>

      {/* Right: AI panel */}
      {aiPanelOpen && <AINotesPanel />}

      {/* Template modal */}
      <TemplateModal />
    </div>
  );
}
