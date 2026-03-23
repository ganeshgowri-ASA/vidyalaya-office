"use client";
import { useState, useEffect } from "react";
import { X, Pin, Tag, Calendar, Bell, Palette, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStickyNotesStore,
  STICKY_COLORS,
  PRIORITY_CONFIG,
  formatTimestamp,
  type StickyColor,
  type StickyPriority,
} from "@/store/sticky-notes-store";

export function StickyNoteEditor() {
  const { notes, editingId, setEditing, updateNote, deleteNote } = useStickyNotesStore();
  const note = notes.find((n) => n.id === editingId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<StickyColor>("yellow");
  const [priority, setPriority] = useState<StickyPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [pinnedLabel, setPinnedLabel] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color);
      setPriority(note.priority);
      setDueDate(note.dueDate || "");
      setTags(note.tags);
      setPinnedLabel(note.pinnedTo?.label || "");
    }
  }, [editingId, note]);

  if (!note) return null;

  const colors = STICKY_COLORS[color];

  const handleSave = () => {
    updateNote(note.id, {
      title: title.trim() || "Untitled",
      content,
      color,
      priority,
      dueDate: dueDate || null,
      tags,
      pinnedTo: pinnedLabel
        ? { type: "document", id: "doc-" + note.id, label: pinnedLabel }
        : null,
    });
    setEditing(null);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => handleSave()}
    >
      <div
        className="w-[420px] rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ borderColor: colors.border + "66", backgroundColor: colors.border + "22" }}
        >
          <div className="flex items-center gap-2">
            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => { setShowColorPicker(!showColorPicker); setShowPriorityPicker(false); }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ color: colors.text, backgroundColor: colors.border + "33" }}
              >
                <Palette size={11} />
                <span>{STICKY_COLORS[color].label}</span>
                <ChevronDown size={10} />
              </button>
              {showColorPicker && (
                <div
                  className="absolute top-7 left-0 z-50 rounded-xl border p-2 shadow-xl flex gap-1.5"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  {(Object.keys(STICKY_COLORS) as StickyColor[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => { setColor(c); setShowColorPicker(false); }}
                      className={cn("w-6 h-6 rounded-full border-2 transition-transform hover:scale-110", color === c && "scale-110")}
                      style={{ backgroundColor: STICKY_COLORS[c].bg, borderColor: STICKY_COLORS[c].border }}
                      title={STICKY_COLORS[c].label}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Priority picker */}
            <div className="relative">
              <button
                onClick={() => { setShowPriorityPicker(!showPriorityPicker); setShowColorPicker(false); }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ color: colors.text, backgroundColor: colors.border + "33" }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_CONFIG[priority].color }} />
                <span>{PRIORITY_CONFIG[priority].label}</span>
                <ChevronDown size={10} />
              </button>
              {showPriorityPicker && (
                <div
                  className="absolute top-7 left-0 z-50 rounded-xl border py-1 shadow-xl w-32"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  {(Object.keys(PRIORITY_CONFIG) as StickyPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPriority(p); setShowPriorityPicker(false); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:opacity-80 transition-opacity"
                      style={{ color: "var(--foreground)" }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_CONFIG[p].color }} />
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="rounded-lg p-1.5 transition-opacity hover:opacity-80"
            style={{ color: colors.text }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content area */}
        <div className="p-4 space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title…"
            className="w-full bg-transparent font-semibold text-base placeholder:opacity-40 outline-none"
            style={{ color: colors.text }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here…"
            rows={6}
            className="w-full bg-transparent text-sm leading-relaxed placeholder:opacity-40 outline-none resize-none"
            style={{ color: colors.text }}
          />
        </div>

        {/* Meta fields */}
        <div
          className="px-4 py-3 space-y-2.5 border-t"
          style={{ borderColor: colors.border + "44" }}
        >
          {/* Due date */}
          <div className="flex items-center gap-2">
            <Calendar size={13} style={{ color: colors.text }} className="opacity-60 shrink-0" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: colors.text }}
            />
          </div>

          {/* Pin to document/meeting */}
          <div className="flex items-center gap-2">
            <Pin size={13} style={{ color: colors.text }} className="opacity-60 shrink-0" />
            <input
              value={pinnedLabel}
              onChange={(e) => setPinnedLabel(e.target.value)}
              placeholder="Pin to document or meeting…"
              className="flex-1 bg-transparent text-xs placeholder:opacity-40 outline-none"
              style={{ color: colors.text }}
            />
          </div>

          {/* Tags */}
          <div className="flex items-start gap-2">
            <Tag size={13} style={{ color: colors.text }} className="opacity-60 shrink-0 mt-1" />
            <div className="flex-1 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => removeTag(tag)}
                  className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ backgroundColor: colors.border + "44", color: colors.text }}
                >
                  #{tag} <X size={8} />
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
                }}
                placeholder="Add tag…"
                className="bg-transparent text-xs placeholder:opacity-40 outline-none w-20"
                style={{ color: colors.text }}
              />
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div
          className="flex items-center justify-between px-4 py-2 border-t"
          style={{ borderColor: colors.border + "44", color: colors.text, opacity: 0.6 }}
        >
          <span className="text-[10px]">Created {formatTimestamp(note.createdAt)}</span>
          {note.updatedAt !== note.createdAt && (
            <span className="text-[10px] italic">Edited {formatTimestamp(note.updatedAt)}</span>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: colors.border + "44" }}
        >
          <button
            onClick={() => { deleteNote(note.id); setEditing(null); }}
            className="text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            Delete note
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: colors.border, color: colors.bg }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
