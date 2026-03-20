"use client";
import { useNotesStore } from "@/store/notes-store";
import { cn } from "@/lib/utils";
import {
  Search, Plus, Pin, Tag, FolderOpen, SortAsc, SortDesc, Trash2, Star,
} from "lucide-react";

export function NotesList() {
  const {
    notes, folders, selectedNoteId, selectedFolder, searchQuery, sortBy,
    selectNote, setFolder, setSearch, setSortBy, createNote, deleteNote,
  } = useNotesStore();

  const filtered = notes
    .filter((n) => {
      const matchFolder = selectedFolder === "All" || n.folder === selectedFolder;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      return matchFolder && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  return (
    <div
      className="flex flex-col h-full border-r"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)", minWidth: 240, maxWidth: 280, width: 260 }}
    >
      {/* Header */}
      <div className="px-3 pt-4 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Notes</span>
          <button
            onClick={() => createNote()}
            className="rounded-md p-1.5 hover:opacity-80 transition-colors text-white"
            style={{ backgroundColor: "var(--sidebar-accent)" }}
            title="New Note"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" style={{ color: "var(--sidebar-foreground)" }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full rounded-md py-1.5 pl-7 pr-2 text-xs bg-transparent border outline-none"
            style={{ borderColor: "var(--border)", color: "var(--sidebar-foreground)" }}
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSortBy("date")}
            className={cn("flex items-center gap-1 rounded px-2 py-0.5 text-[10px] transition-colors", sortBy === "date" ? "opacity-100" : "opacity-50")}
            style={{ backgroundColor: sortBy === "date" ? "var(--sidebar-accent)" : "transparent", color: "var(--sidebar-foreground)" }}
          >
            <SortDesc size={10} /> Date
          </button>
          <button
            onClick={() => setSortBy("title")}
            className={cn("flex items-center gap-1 rounded px-2 py-0.5 text-[10px] transition-colors", sortBy === "title" ? "opacity-100" : "opacity-50")}
            style={{ backgroundColor: sortBy === "title" ? "var(--sidebar-accent)" : "transparent", color: "var(--sidebar-foreground)" }}
          >
            <SortAsc size={10} /> Title
          </button>
        </div>
      </div>

      {/* Folders */}
      <div className="px-3 pb-2 space-y-0.5">
        <p className="text-[9px] font-semibold uppercase tracking-wider opacity-40 pb-1" style={{ color: "var(--sidebar-foreground)" }}>Folders</p>
        {["All", ...folders.map((f) => f.name)].map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={cn("w-full flex items-center gap-2 rounded px-2 py-1 text-xs text-left transition-colors", selectedFolder === f ? "opacity-100" : "opacity-60 hover:opacity-80")}
            style={{ backgroundColor: selectedFolder === f ? "var(--sidebar-accent)" : "transparent", color: "var(--sidebar-foreground)" }}
          >
            <FolderOpen size={12} />
            {f}
          </button>
        ))}
      </div>

      <div className="mx-3 border-t opacity-20" style={{ borderColor: "var(--border)" }} />

      {/* Note list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {pinned.length > 0 && (
          <>
            <p className="text-[9px] font-semibold uppercase tracking-wider opacity-40 px-1 pb-0.5" style={{ color: "var(--sidebar-foreground)" }}>Pinned</p>
            {pinned.map((note) => (
              <NoteItem key={note.id} note={note} isSelected={selectedNoteId === note.id} onSelect={() => selectNote(note.id)} onDelete={() => deleteNote(note.id)} />
            ))}
            <p className="text-[9px] font-semibold uppercase tracking-wider opacity-40 px-1 pb-0.5 pt-2" style={{ color: "var(--sidebar-foreground)" }}>All Notes</p>
          </>
        )}
        {unpinned.map((note) => (
          <NoteItem key={note.id} note={note} isSelected={selectedNoteId === note.id} onSelect={() => selectNote(note.id)} onDelete={() => deleteNote(note.id)} />
        ))}
        {filtered.length === 0 && (
          <p className="text-xs opacity-40 text-center py-8" style={{ color: "var(--sidebar-foreground)" }}>No notes found</p>
        )}
      </div>
    </div>
  );
}

function NoteItem({ note, isSelected, onSelect, onDelete }: {
  note: ReturnType<typeof useNotesStore.getState>["notes"][number];
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div
      onClick={onSelect}
      className="group rounded-lg px-2 py-2 cursor-pointer transition-colors relative"
      style={{
        backgroundColor: isSelected ? "var(--sidebar-accent)" : "transparent",
        color: "var(--sidebar-foreground)",
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <p className={cn("text-xs font-medium leading-tight flex-1 truncate", isSelected ? "opacity-100" : "opacity-80")}>
          {note.pinned && <Pin size={9} className="inline mr-1 opacity-60" />}
          {note.title}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 shrink-0 transition-opacity"
        >
          <Trash2 size={11} />
        </button>
      </div>
      <p className="text-[10px] opacity-50 truncate mt-0.5 leading-tight">
        {note.content.replace(/[#*`\n]/g, " ").trim().slice(0, 60)}
      </p>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[9px] opacity-40">{fmt(note.updatedAt)}</span>
        {note.tags.slice(0, 2).map((t) => (
          <span key={t} className="text-[9px] opacity-50 rounded px-1" style={{ backgroundColor: "rgba(139,92,246,0.15)" }}>
            {t}
          </span>
        ))}
        {note.actionItems.length > 0 && (
          <span className="text-[9px] opacity-40 ml-auto">{note.actionItems.filter(a => !a.done).length} actions</span>
        )}
      </div>
    </div>
  );
}
