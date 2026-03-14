"use client";

import { useState, useRef, useEffect } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { Plus, X } from "lucide-react";

export function SheetTabs() {
  const sheets = useSpreadsheetStore((s) => s.sheets);
  const activeSheetId = useSpreadsheetStore((s) => s.activeSheetId);
  const setActiveSheet = useSpreadsheetStore((s) => s.setActiveSheet);
  const addSheet = useSpreadsheetStore((s) => s.addSheet);
  const deleteSheet = useSpreadsheetStore((s) => s.deleteSheet);
  const renameSheet = useSpreadsheetStore((s) => s.renameSheet);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleDoubleClick = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      renameSheet(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      className="flex items-center border-t px-1 py-0.5 gap-0.5 overflow-x-auto"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--muted)",
      }}
    >
      {sheets.map((sheet) => (
        <div
          key={sheet.id}
          className="flex items-center gap-1 px-3 py-1 text-xs rounded-t cursor-pointer select-none group"
          style={{
            backgroundColor:
              sheet.id === activeSheetId ? "var(--background)" : "transparent",
            color: "var(--foreground)",
            borderBottom:
              sheet.id === activeSheetId ? "2px solid var(--primary)" : "2px solid transparent",
          }}
          onClick={() => setActiveSheet(sheet.id)}
          onDoubleClick={() => handleDoubleClick(sheet.id, sheet.name)}
        >
          {editingId === sheet.id ? (
            <input
              ref={inputRef}
              className="w-20 text-xs px-1 outline-none bg-transparent border-b"
              style={{ borderColor: "var(--primary)", color: "var(--foreground)" }}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setEditingId(null);
              }}
              onBlur={commitRename}
            />
          ) : (
            <span>{sheet.name}</span>
          )}
          {sheets.length > 1 && (
            <button
              className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                deleteSheet(sheet.id);
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
      <button
        className="p-1 rounded hover:opacity-80"
        style={{ color: "var(--muted-foreground)" }}
        onClick={addSheet}
        title="Add Sheet"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
