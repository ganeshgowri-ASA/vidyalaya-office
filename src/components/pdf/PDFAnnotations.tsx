"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Highlighter,
  StickyNote,
  Pen,
  Underline,
  Trash2,
  X,
  Check,
  PenLine,
} from "lucide-react";

type AnnotationTool = "highlight" | "note" | "draw" | "underline" | null;
type HighlightColor = "yellow" | "green" | "blue" | "pink";

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: "rgba(253, 224, 71, 0.5)",
  green: "rgba(74, 222, 128, 0.5)",
  blue: "rgba(96, 165, 250, 0.5)",
  pink: "rgba(244, 114, 182, 0.5)",
};

interface Note {
  id: string;
  x: number;
  y: number;
  text: string;
  page: number;
}

interface DrawPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  page: number;
}

interface AnnotationState {
  notes: Note[];
  draws: DrawPath[];
}

interface PDFAnnotationsProps {
  currentPage: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function PDFAnnotationToolbar({
  activeTool,
  onToolChange,
  highlightColor,
  onHighlightColorChange,
  drawColor,
  onDrawColorChange,
  onClearAll,
}: {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  highlightColor: HighlightColor;
  onHighlightColorChange: (c: HighlightColor) => void;
  drawColor: string;
  onDrawColorChange: (c: string) => void;
  onClearAll: () => void;
}) {
  return (
    <div
      className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
    >
      <span className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
        Annotations:
      </span>

      {/* Highlight */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onToolChange(activeTool === "highlight" ? null : "highlight")}
          className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-all ${
            activeTool === "highlight" ? "opacity-100" : "opacity-60 hover:opacity-80"
          }`}
          style={{
            backgroundColor: activeTool === "highlight" ? "var(--accent)" : "transparent",
            color: "var(--foreground)",
          }}
        >
          <Highlighter size={14} />
          Highlight
        </button>
        {activeTool === "highlight" && (
          <div className="flex gap-1">
            {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => (
              <button
                key={color}
                onClick={() => onHighlightColorChange(color)}
                className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: HIGHLIGHT_COLORS[color],
                  borderColor: highlightColor === color ? "var(--foreground)" : "transparent",
                }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Underline */}
      <button
        onClick={() => onToolChange(activeTool === "underline" ? null : "underline")}
        className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-all ${
          activeTool === "underline" ? "opacity-100" : "opacity-60 hover:opacity-80"
        }`}
        style={{
          backgroundColor: activeTool === "underline" ? "var(--accent)" : "transparent",
          color: "var(--foreground)",
        }}
      >
        <Underline size={14} />
        Underline
      </button>

      {/* Sticky note */}
      <button
        onClick={() => onToolChange(activeTool === "note" ? null : "note")}
        className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-all ${
          activeTool === "note" ? "opacity-100" : "opacity-60 hover:opacity-80"
        }`}
        style={{
          backgroundColor: activeTool === "note" ? "var(--accent)" : "transparent",
          color: "var(--foreground)",
        }}
      >
        <StickyNote size={14} />
        Note
      </button>

      {/* Draw */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onToolChange(activeTool === "draw" ? null : "draw")}
          className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-all ${
            activeTool === "draw" ? "opacity-100" : "opacity-60 hover:opacity-80"
          }`}
          style={{
            backgroundColor: activeTool === "draw" ? "var(--accent)" : "transparent",
            color: "var(--foreground)",
          }}
        >
          <PenLine size={14} />
          Draw
        </button>
        {activeTool === "draw" && (
          <input
            type="color"
            value={drawColor}
            onChange={(e) => onDrawColorChange(e.target.value)}
            className="h-6 w-6 cursor-pointer rounded border"
            style={{ borderColor: "var(--border)" }}
            title="Draw color"
          />
        )}
      </div>

      <div className="flex-1" />

      {/* Clear all */}
      <button
        onClick={onClearAll}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-opacity hover:opacity-80"
        style={{ color: "#ef4444" }}
      >
        <Trash2 size={14} />
        Clear
      </button>
    </div>
  );
}

// Drawing canvas overlay
interface DrawingCanvasProps {
  active: boolean;
  color: string;
  page: number;
  draws: DrawPath[];
  onAddPath: (path: DrawPath) => void;
}

export function DrawingCanvas({ active, color, page, draws, onAddPath }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const currentPath = useRef<{ x: number; y: number }[]>([]);

  // Redraw all paths on the canvas whenever draws change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pagePaths = draws.filter((d) => d.page === page);

    for (const path of pagePaths) {
      if (path.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    }
  }, [draws, page]);

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!active) return;
    drawing.current = true;
    currentPath.current = [getPos(e)];
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!active || !drawing.current) return;
    const pos = getPos(e);
    currentPath.current.push(pos);

    // Draw live
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pts = currentPath.current;
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  }

  function onMouseUp() {
    if (!active || !drawing.current) return;
    drawing.current = false;
    if (currentPath.current.length > 1) {
      onAddPath({
        id: Date.now().toString(),
        points: [...currentPath.current],
        color,
        page,
      });
    }
    currentPath.current = [];
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        width: "100%",
        height: "100%",
        cursor: active ? "crosshair" : "default",
        pointerEvents: active ? "all" : "none",
      }}
      width={800}
      height={1100}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
}

// Sticky note component
interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function StickyNoteWidget({ note, onUpdate, onDelete }: StickyNoteProps) {
  const [editing, setEditing] = useState(!note.text);
  const [text, setText] = useState(note.text);

  return (
    <div
      className="absolute z-30 w-40 rounded-lg shadow-lg"
      style={{
        left: note.x,
        top: note.y,
        backgroundColor: "#fef08a",
        color: "#1a1a1a",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg px-2 py-1" style={{ backgroundColor: "#fde047" }}>
        <StickyNote size={12} />
        <div className="flex gap-1">
          {editing && (
            <button
              onClick={() => {
                onUpdate(note.id, text);
                setEditing(false);
              }}
            >
              <Check size={12} />
            </button>
          )}
          <button onClick={() => onDelete(note.id)}>
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full resize-none rounded-b-lg p-2 text-xs outline-none"
          rows={3}
          style={{ backgroundColor: "#fef08a", color: "#1a1a1a" }}
          placeholder="Type your note..."
        />
      ) : (
        <div
          className="cursor-pointer rounded-b-lg p-2 text-xs"
          onClick={() => setEditing(true)}
          style={{ minHeight: 40 }}
        >
          {text || <span style={{ opacity: 0.5 }}>Click to edit</span>}
        </div>
      )}
    </div>
  );
}

// Main annotation overlay manager (exported hook)
export function useAnnotations() {
  const [activeTool, setActiveTool] = useState<AnnotationTool>(null);
  const [highlightColor, setHighlightColor] = useState<HighlightColor>("yellow");
  const [drawColor, setDrawColor] = useState("#e74c3c");
  const [notes, setNotes] = useState<Note[]>([]);
  const [draws, setDraws] = useState<DrawPath[]>([]);

  function addNote(x: number, y: number, page: number) {
    setNotes((prev) => [
      ...prev,
      { id: Date.now().toString(), x, y, text: "", page },
    ]);
  }

  function updateNote(id: string, text: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function addDraw(path: DrawPath) {
    setDraws((prev) => [...prev, path]);
  }

  function clearAll() {
    setNotes([]);
    setDraws([]);
  }

  return {
    activeTool,
    setActiveTool,
    highlightColor,
    setHighlightColor,
    drawColor,
    setDrawColor,
    notes,
    addNote,
    updateNote,
    deleteNote,
    draws,
    addDraw,
    clearAll,
  };
}
