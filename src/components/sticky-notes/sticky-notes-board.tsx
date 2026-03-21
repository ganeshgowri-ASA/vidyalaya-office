"use client";
import { useRef, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  StickyNote,
  Bell,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStickyNotesStore,
  STICKY_COLORS,
  PRIORITY_CONFIG,
  type StickyColor,
  type StickyPriority,
} from "@/store/sticky-notes-store";
import { StickyNoteCard } from "./sticky-note-card";
import { StickyNoteEditor } from "./sticky-note-editor";

export function StickyNotesBoard() {
  const {
    notes,
    editingId,
    selectedId,
    searchQuery,
    filterColor,
    filterPriority,
    createNote,
    moveNote,
    selectNote,
    setSearch,
    setFilterColor,
    setFilterPriority,
  } = useStickyNotesStore();

  const boardRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [newColor, setNewColor] = useState<StickyColor>("yellow");

  // Filter notes
  const filtered = notes.filter((n) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.content.toLowerCase().includes(q)) return false;
    }
    if (filterColor !== "all" && n.color !== filterColor) return false;
    if (filterPriority !== "all" && n.priority !== filterPriority) return false;
    return true;
  });

  // Stats
  const overdueCount = notes.filter(
    (n) => n.dueDate && new Date(n.dueDate) < new Date()
  ).length;
  const urgentCount = notes.filter((n) => n.priority === "urgent").length;
  const pinnedCount = notes.filter((n) => n.pinnedTo).length;

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingId || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - boardRect.left - dragOffset.x);
    const y = Math.max(0, e.clientY - boardRect.top - dragOffset.y);
    moveNote(draggingId, { x, y });
    setDraggingId(null);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 border-b shrink-0"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center gap-2">
          <StickyNote size={18} style={{ color: "var(--primary)" }} />
          <h1 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
            Sticky Notes
          </h1>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4">
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle size={12} /> {overdueCount} overdue
            </span>
          )}
          {urgentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-orange-400">
              <Bell size={12} /> {urgentCount} urgent
            </span>
          )}
          {pinnedCount > 0 && (
            <span className="flex items-center gap-1 text-xs opacity-50" style={{ color: "var(--foreground)" }}>
              <CheckSquare size={12} /> {pinnedCount} pinned
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 border text-xs"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
          >
            <Search size={12} style={{ color: "var(--muted-foreground)" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="bg-transparent outline-none w-32"
              style={{ color: "var(--foreground)" }}
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs border transition-colors",
              showFilters ? "opacity-100" : "opacity-60 hover:opacity-100"
            )}
            style={{
              borderColor: showFilters ? "var(--primary)" : "var(--border)",
              color: showFilters ? "var(--primary)" : "var(--foreground)",
              backgroundColor: "var(--background)",
            }}
          >
            <Filter size={12} /> Filters
          </button>

          {/* Color picker for new note */}
          <div className="flex items-center gap-1">
            {(Object.keys(STICKY_COLORS) as StickyColor[]).map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                  newColor === c && "scale-125 shadow-md"
                )}
                style={{
                  backgroundColor: STICKY_COLORS[c].bg,
                  borderColor: STICKY_COLORS[c].border,
                }}
                title={STICKY_COLORS[c].label}
              />
            ))}
          </div>

          {/* Add note */}
          <button
            onClick={() => createNote(newColor)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Plus size={13} /> New Note
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div
          className="flex items-center gap-4 px-4 py-2 border-b shrink-0"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
        >
          <span className="text-xs opacity-50" style={{ color: "var(--foreground)" }}>
            Color:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterColor("all")}
              className={cn(
                "px-2 py-0.5 rounded text-xs transition-opacity",
                filterColor === "all" ? "opacity-100" : "opacity-40 hover:opacity-70"
              )}
              style={{
                color: "var(--foreground)",
                backgroundColor: filterColor === "all" ? "var(--accent)" : undefined,
              }}
            >
              All
            </button>
            {(Object.keys(STICKY_COLORS) as StickyColor[]).map((c) => (
              <button
                key={c}
                onClick={() => setFilterColor(c)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                  filterColor === c && "scale-125"
                )}
                style={{ backgroundColor: STICKY_COLORS[c].bg, borderColor: STICKY_COLORS[c].border }}
                title={STICKY_COLORS[c].label}
              />
            ))}
          </div>

          <div className="w-px h-4 opacity-20" style={{ backgroundColor: "var(--border)" }} />

          <span className="text-xs opacity-50" style={{ color: "var(--foreground)" }}>
            Priority:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterPriority("all")}
              className={cn(
                "px-2 py-0.5 rounded text-xs transition-opacity",
                filterPriority === "all" ? "opacity-100" : "opacity-40 hover:opacity-70"
              )}
              style={{
                color: "var(--foreground)",
                backgroundColor: filterPriority === "all" ? "var(--accent)" : undefined,
              }}
            >
              All
            </button>
            {(Object.keys(PRIORITY_CONFIG) as StickyPriority[]).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-opacity",
                  filterPriority === p ? "opacity-100" : "opacity-40 hover:opacity-70"
                )}
                style={{
                  color: "var(--foreground)",
                  backgroundColor: filterPriority === p ? "var(--accent)" : undefined,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PRIORITY_CONFIG[p].color }} />
                {PRIORITY_CONFIG[p].label}
              </button>
            ))}
          </div>

          <div className="ml-auto text-xs opacity-40" style={{ color: "var(--foreground)" }}>
            {filtered.length} of {notes.length} notes
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={boardRef}
        className="flex-1 relative overflow-auto"
        style={{
          backgroundImage: `radial-gradient(circle, var(--border) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          minHeight: 600,
          minWidth: 900,
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => selectNote(null)}
      >
        {filtered.length === 0 && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
            style={{ color: "var(--muted-foreground)" }}
          >
            <StickyNote size={48} className="opacity-20" />
            <p className="text-sm opacity-40">
              {searchQuery || filterColor !== "all" || filterPriority !== "all"
                ? "No notes match your filters"
                : "Click 'New Note' to add your first sticky note"}
            </p>
          </div>
        )}

        {filtered.map((note) => (
          <StickyNoteCard
            key={note.id}
            note={note}
            onDragStart={handleDragStart}
          />
        ))}
      </div>

      {/* Editor modal */}
      {editingId && <StickyNoteEditor />}
    </div>
  );
}
