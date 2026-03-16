"use client";

import { useState, useCallback } from "react";
import { X, Plus, Trash2, Edit3, Check } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

export function NamedRangesDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const namedRanges = useSpreadsheetStore((s) => s.namedRanges);
  const setNamedRange = useSpreadsheetStore((s) => s.setNamedRange);
  const deleteNamedRange = useSpreadsheetStore((s) => s.deleteNamedRange);
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const setActiveCell = useSpreadsheetStore((s) => s.setActiveCell);
  const setSelection = useSpreadsheetStore((s) => s.setSelection);

  const [newName, setNewName] = useState("");
  const [newRange, setNewRange] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editRange, setEditRange] = useState("");
  const [error, setError] = useState("");

  const getSelectionRange = useCallback(() => {
    if (!selectionStart || !selectionEnd) return "";
    const minC = Math.min(selectionStart.col, selectionEnd.col);
    const maxC = Math.max(selectionStart.col, selectionEnd.col);
    const minR = Math.min(selectionStart.row, selectionEnd.row);
    const maxR = Math.max(selectionStart.row, selectionEnd.row);
    return `${colToLetter(minC)}${minR + 1}:${colToLetter(maxC)}${maxR + 1}`;
  }, [selectionStart, selectionEnd]);

  const handleAdd = useCallback(() => {
    const name = newName.trim();
    if (!name) {
      setError("Name is required");
      return;
    }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      setError("Invalid name. Use letters, numbers, underscores.");
      return;
    }
    const range = newRange.trim() || getSelectionRange();
    if (!range) {
      setError("Select a range or enter one manually");
      return;
    }
    setNamedRange(name, range);
    setNewName("");
    setNewRange("");
    setError("");
  }, [newName, newRange, getSelectionRange, setNamedRange]);

  const handleSaveEdit = useCallback((name: string) => {
    if (editRange.trim()) {
      setNamedRange(name, editRange.trim());
    }
    setEditingName(null);
    setEditRange("");
  }, [editRange, setNamedRange]);

  const navigateToRange = useCallback((range: string) => {
    const match = range.match(/^([A-Z]+)(\d+)/i);
    if (match) {
      const col = match[1].toUpperCase().split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
      const row = parseInt(match[2]) - 1;
      setActiveCell(col, row);
    }
  }, [setActiveCell]);

  if (!open) return null;

  const entries = Object.entries(namedRanges);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[480px] max-h-[70vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">Named Ranges</h2>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {/* Add new */}
          <div className="space-y-2">
            <div className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Add New Range</div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 text-xs rounded px-2 py-1.5 border outline-none"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setError(""); }}
                placeholder="Range name (e.g., Sales_Data)"
              />
              <input
                type="text"
                className="flex-1 text-xs rounded px-2 py-1.5 border outline-none font-mono"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                value={newRange || getSelectionRange()}
                onChange={(e) => setNewRange(e.target.value)}
                placeholder="A1:D10"
              />
              <button
                className="p-1.5 rounded hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                onClick={handleAdd}
                title="Add"
              >
                <Plus size={14} />
              </button>
            </div>
            {error && <div className="text-xs text-red-500">{error}</div>}
          </div>

          {/* Existing ranges */}
          <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
              Defined Names ({entries.length})
            </div>
            {entries.length === 0 ? (
              <div className="text-xs italic py-4 text-center" style={{ color: "var(--muted-foreground)" }}>
                No named ranges defined yet
              </div>
            ) : (
              <div className="space-y-1">
                {entries.map(([name, range]) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs"
                    style={{ backgroundColor: "var(--muted)" }}
                  >
                    <span className="font-semibold flex-1">{name}</span>
                    {editingName === name ? (
                      <>
                        <input
                          type="text"
                          className="w-28 text-xs rounded px-1.5 py-0.5 border outline-none font-mono"
                          style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                          value={editRange}
                          onChange={(e) => setEditRange(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(name);
                            if (e.key === "Escape") setEditingName(null);
                          }}
                        />
                        <button onClick={() => handleSaveEdit(name)} className="hover:opacity-70" title="Save">
                          <Check size={12} className="text-green-500" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="font-mono hover:underline cursor-pointer"
                          style={{ color: "var(--primary)" }}
                          onClick={() => navigateToRange(range)}
                          title="Go to range"
                        >
                          {range}
                        </button>
                        <button
                          onClick={() => { setEditingName(name); setEditRange(range); }}
                          className="hover:opacity-70"
                          title="Edit"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button onClick={() => deleteNamedRange(name)} className="hover:opacity-70 text-red-400" title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
