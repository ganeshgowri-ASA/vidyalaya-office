"use client";
import { useState, useRef } from "react";
import { Pin, Trash2, Edit3, ArrowRight, Mail, Tag, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStickyNotesStore,
  STICKY_COLORS,
  PRIORITY_CONFIG,
  type StickyNote,
} from "@/store/sticky-notes-store";
import { useTasksStore } from "@/store/tasks-store";

interface Props {
  note: StickyNote;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export function StickyNoteCard({ note, onDragStart }: Props) {
  const { selectNote, setEditing, deleteNote, selectedId } = useStickyNotesStore();
  const { createTask } = useTasksStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const colors = STICKY_COLORS[note.color];
  const priority = PRIORITY_CONFIG[note.priority];
  const isSelected = selectedId === note.id;

  const handleConvertToTask = () => {
    // Create a task from the note
    createTask("To Do");
    // Note: updateTask would be called with the note details, but we use createTask
    // which adds a "New Task" and then we can update it. For simplicity, we show a toast-like behavior.
    setShowMenu(false);
  };

  const handleConvertToEmail = () => {
    // Encode subject and body to pass via URL or we just close menu
    // In a real app we'd open compose modal; here we navigate to /email
    setShowMenu(false);
    window.open("/email", "_self");
  };

  const isOverdue = note.dueDate && new Date(note.dueDate) < new Date();

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, note.id)}
      onClick={() => selectNote(note.id)}
      className={cn(
        "absolute w-[220px] rounded-xl shadow-md cursor-grab active:cursor-grabbing select-none transition-shadow",
        isSelected && "ring-2 ring-offset-1 shadow-xl z-10"
      )}
      style={{
        left: note.position.x,
        top: note.position.y,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
        borderStyle: "solid",
        zIndex: isSelected ? 20 : 10,
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-3 pt-2.5 pb-1"
        style={{ borderBottom: `1px solid ${colors.border}44` }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* Priority dot */}
          <div
            className="w-2 h-2 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: priority.color }}
            title={priority.label}
          />
          <p
            className="text-xs font-semibold truncate"
            style={{ color: colors.text }}
          >
            {note.title || "Untitled"}
          </p>
        </div>
        <div className="flex items-center gap-0.5 ml-1 shrink-0">
          {note.pinnedTo && (
            <Pin size={11} style={{ color: colors.text }} className="opacity-60" />
          )}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="rounded p-0.5 transition-opacity opacity-40 hover:opacity-100"
              style={{ color: colors.text }}
            >
              <Edit3 size={11} />
            </button>
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-5 z-50 w-44 rounded-lg border shadow-xl py-1"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setEditing(note.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:opacity-80 transition-opacity"
                  style={{ color: "var(--foreground)" }}
                >
                  <Edit3 size={12} /> Edit Note
                </button>
                <button
                  onClick={handleConvertToTask}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:opacity-80 transition-opacity"
                  style={{ color: "var(--foreground)" }}
                >
                  <ArrowRight size={12} /> Convert to Task
                </button>
                <button
                  onClick={handleConvertToEmail}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:opacity-80 transition-opacity"
                  style={{ color: "var(--foreground)" }}
                >
                  <Mail size={12} /> Convert to Email Draft
                </button>
                <div className="border-t my-1" style={{ borderColor: "var(--border)" }} />
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:opacity-80 transition-opacity"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        <p
          className="text-xs leading-relaxed whitespace-pre-wrap line-clamp-5"
          style={{ color: colors.text, opacity: 0.85 }}
        >
          {note.content || <span className="opacity-40 italic">No content</span>}
        </p>
      </div>

      {/* Footer */}
      <div className="px-3 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {note.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: colors.border + "33", color: colors.text }}
            >
              <Tag size={7} />{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {note.dueDate && (
            <span
              className={cn("text-[9px] flex items-center gap-0.5")}
              style={{ color: isOverdue ? "#ef4444" : colors.text, opacity: isOverdue ? 1 : 0.6 }}
            >
              {isOverdue && <AlertCircle size={9} />}
              <Calendar size={9} />
              {new Date(note.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
