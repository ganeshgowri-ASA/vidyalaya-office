"use client";

import React, { useState, useEffect, useRef } from "react";
import { History, ChevronDown, RotateCcw, RotateCw } from "lucide-react";

interface HistoryEntry {
  label: string;
  timestamp: string;
}

interface HistoryPanelProps {
  undoCount: number;
  redoCount: number;
  onUndo: () => void;
  onRedo: () => void;
  module?: string;
}

function now(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const ACTION_LABELS: Record<string, string[]> = {
  document: ["Typed text", "Applied formatting", "Inserted element", "Deleted content", "Changed style", "Updated heading", "Modified paragraph", "Pasted content", "Cut content", "Changed font"],
  spreadsheet: ["Edited cell", "Applied formula", "Formatted cells", "Inserted row", "Deleted column", "Pasted data", "Sorted range", "Merged cells", "Applied style", "Updated value"],
  presentation: ["Added element", "Moved element", "Resized element", "Applied theme", "Changed text", "Added slide", "Deleted slide", "Updated style", "Changed layout", "Applied animation"],
};

export function HistoryPanel({ undoCount, redoCount, onUndo, onRedo, module = "document" }: HistoryPanelProps) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([
    { label: "Initial state", timestamp: now() },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevUndoCount = useRef(undoCount);
  const prevRedoCount = useRef(redoCount);
  const ref = useRef<HTMLDivElement>(null);
  const labels = ACTION_LABELS[module] ?? ACTION_LABELS.document;

  useEffect(() => {
    const diff = undoCount - prevUndoCount.current;
    if (diff > 0) {
      // New actions were pushed
      const newEntries = Array.from({ length: diff }, (_, i) => ({
        label: labels[Math.floor(Math.random() * labels.length)],
        timestamp: now(),
      }));
      setEntries((prev) => {
        const next = [...prev, ...newEntries].slice(-20);
        setCurrentIndex(next.length - 1);
        return next;
      });
    } else if (diff < 0) {
      // Undo happened
      setCurrentIndex((prev) => Math.max(0, prev + diff));
    }
    prevUndoCount.current = undoCount;
  }, [undoCount, labels]);

  useEffect(() => {
    const diff = redoCount - prevRedoCount.current;
    if (diff < 0 && prevRedoCount.current > 0) {
      // Redo happened
      setCurrentIndex((prev) => Math.min(entries.length - 1, prev - diff));
    }
    prevRedoCount.current = redoCount;
  }, [redoCount, entries.length]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const jumpToIndex = (targetIndex: number) => {
    const diff = currentIndex - targetIndex;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) onUndo();
    } else if (diff < 0) {
      for (let i = 0; i < -diff; i++) onRedo();
    }
    setCurrentIndex(targetIndex);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-0.5 rounded px-1 py-0.5 text-xs hover:opacity-80 transition-colors"
        style={{ color: "var(--muted-foreground)" }}
        title="History"
      >
        <History size={13} />
        <ChevronDown size={10} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border shadow-xl"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-3 py-2"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
              History
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onUndo(); setCurrentIndex((p) => Math.max(0, p - 1)); }}
                disabled={undoCount === 0}
                className="rounded p-0.5 hover:opacity-80 disabled:opacity-30"
                style={{ color: "var(--foreground)" }}
                title="Undo"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={() => { onRedo(); setCurrentIndex((p) => Math.min(entries.length - 1, p + 1)); }}
                disabled={redoCount === 0}
                className="rounded p-0.5 hover:opacity-80 disabled:opacity-30"
                style={{ color: "var(--foreground)" }}
                title="Redo"
              >
                <RotateCw size={12} />
              </button>
            </div>
          </div>

          {/* Entry list - newest first */}
          <div className="max-h-64 overflow-y-auto py-1">
            {[...entries].reverse().map((entry, i) => {
              const actualIndex = entries.length - 1 - i;
              const isCurrent = actualIndex === currentIndex;
              const isFuture = actualIndex > currentIndex;
              return (
                <button
                  key={`${actualIndex}-${entry.timestamp}`}
                  onClick={() => jumpToIndex(actualIndex)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: isCurrent ? "var(--accent)" : "transparent",
                    color: isFuture ? "var(--muted-foreground)" : "var(--foreground)",
                    opacity: isFuture ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <span
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: "var(--primary)" }}
                      />
                    )}
                    {!isCurrent && <span className="h-1.5 w-1.5 flex-shrink-0" />}
                    <span className="truncate">{entry.label}</span>
                  </div>
                  <span className="ml-2 flex-shrink-0 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {entry.timestamp}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="border-t px-3 py-1.5 text-[10px]"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            {entries.length} action{entries.length !== 1 ? "s" : ""} &bull; Click to jump to state
          </div>
        </div>
      )}
    </div>
  );
}
