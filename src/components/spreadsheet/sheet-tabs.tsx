"use client";

import { useState, useRef, useEffect } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

const TAB_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#6b7280", "#000000",
];

export function SheetTabs() {
  const sheets = useSpreadsheetStore((s) => s.sheets);
  const activeSheetId = useSpreadsheetStore((s) => s.activeSheetId);
  const setActiveSheet = useSpreadsheetStore((s) => s.setActiveSheet);
  const addSheet = useSpreadsheetStore((s) => s.addSheet);
  const deleteSheet = useSpreadsheetStore((s) => s.deleteSheet);
  const renameSheet = useSpreadsheetStore((s) => s.renameSheet);
  const setSheetTabColor = useSpreadsheetStore((s) => s.setSheetTabColor);
  const duplicateSheet = useSpreadsheetStore((s) => s.duplicateSheet);
  const moveSheet = useSpreadsheetStore((s) => s.moveSheet);
  const hideSheet = useSpreadsheetStore((s) => s.hideSheet);
  const unhideSheet = useSpreadsheetStore((s) => s.unhideSheet);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; sheetId: string }>({
    visible: false, x: 0, y: 0, sheetId: "",
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showUnhide, setShowUnhide] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (!contextMenu.visible) return;
    const close = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu.visible]);

  const handleDoubleClick = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) renameSheet(editingId, editName.trim());
    setEditingId(null);
  };

  const handleContextMenuOpen = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, sheetId: id });
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: direction === "left" ? -120 : 120, behavior: "smooth" });
    }
  };

  const visibleSheets = sheets.filter((s) => !s.hidden);
  const hiddenSheets = sheets.filter((s) => s.hidden);

  return (
    <>
      <div
        className="flex items-center border-t px-1 py-0.5 gap-0.5"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}
      >
        {/* Navigation arrows */}
        <button
          className="p-0.5 rounded hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
          onClick={() => scrollTabs("left")}
          title="Scroll tabs left"
        >
          <ChevronLeft size={12} />
        </button>
        <button
          className="p-0.5 rounded hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
          onClick={() => scrollTabs("right")}
          title="Scroll tabs right"
        >
          <ChevronRight size={12} />
        </button>

        {/* Sheet tabs */}
        <div ref={tabsRef} className="flex items-center gap-0.5 overflow-x-auto flex-1 scrollbar-hide">
          {visibleSheets.map((sheet) => (
            <div
              key={sheet.id}
              className="flex items-center gap-1 px-3 py-1 text-xs rounded-t cursor-pointer select-none group whitespace-nowrap"
              style={{
                backgroundColor: sheet.id === activeSheetId ? "var(--background)" : "transparent",
                color: "var(--foreground)",
                borderBottom: sheet.id === activeSheetId
                  ? `2px solid ${sheet.tabColor || "var(--primary)"}`
                  : sheet.tabColor
                    ? `2px solid ${sheet.tabColor}40`
                    : "2px solid transparent",
                minWidth: "fit-content",
              }}
              onClick={() => setActiveSheet(sheet.id)}
              onDoubleClick={() => handleDoubleClick(sheet.id, sheet.name)}
              onContextMenu={(e) => handleContextMenuOpen(sheet.id, e)}
            >
              {/* Tab color indicator */}
              {sheet.tabColor && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sheet.tabColor }} />
              )}

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
                  onClick={(e) => { e.stopPropagation(); deleteSheet(sheet.id); }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add sheet button */}
        <button
          className="p-1 rounded hover:opacity-80"
          style={{ color: "var(--muted-foreground)" }}
          onClick={addSheet}
          title="Add Sheet"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Context menu */}
      {contextMenu.visible && (
        <div
          className="fixed rounded shadow-lg border py-1 z-50 text-xs"
          style={{
            left: contextMenu.x, top: contextMenu.y - 200,
            backgroundColor: "var(--card)", borderColor: "var(--border)",
            color: "var(--foreground)", minWidth: 160,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => { addSheet(); setContextMenu((p) => ({ ...p, visible: false })); }}>Insert Sheet</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              if (sheets.length > 1) deleteSheet(contextMenu.sheetId);
              setContextMenu((p) => ({ ...p, visible: false }));
            }}>Delete Sheet</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              const sheet = sheets.find((s) => s.id === contextMenu.sheetId);
              if (sheet) { setEditingId(sheet.id); setEditName(sheet.name); }
              setContextMenu((p) => ({ ...p, visible: false }));
            }}>Rename</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              duplicateSheet(contextMenu.sheetId);
              setContextMenu((p) => ({ ...p, visible: false }));
            }}>Move or Copy...</button>
          <div className="mx-2 my-1 border-t" style={{ borderColor: "var(--border)" }} />
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => { moveSheet(contextMenu.sheetId, "left"); setContextMenu((p) => ({ ...p, visible: false })); }}>Move Left</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => { moveSheet(contextMenu.sheetId, "right"); setContextMenu((p) => ({ ...p, visible: false })); }}>Move Right</button>
          <div className="mx-2 my-1 border-t" style={{ borderColor: "var(--border)" }} />
          <div className="relative">
            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowColorPicker(!showColorPicker)}>Tab Color</button>
            {showColorPicker && (
              <div className="absolute left-full top-0 ml-1 p-2 rounded shadow-lg border grid grid-cols-5 gap-1 z-50"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {TAB_COLORS.map((c) => (
                  <button key={c} className="w-5 h-5 rounded border" style={{ backgroundColor: c, borderColor: "var(--border)" }}
                    onClick={() => {
                      setSheetTabColor(contextMenu.sheetId, c);
                      setShowColorPicker(false);
                      setContextMenu((p) => ({ ...p, visible: false }));
                    }} />
                ))}
                <button className="col-span-5 text-[10px] text-center py-0.5 rounded hover:bg-gray-100"
                  onClick={() => {
                    setSheetTabColor(contextMenu.sheetId, "");
                    setShowColorPicker(false);
                    setContextMenu((p) => ({ ...p, visible: false }));
                  }}>No Color</button>
              </div>
            )}
          </div>
          <div className="mx-2 my-1 border-t" style={{ borderColor: "var(--border)" }} />
          <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              hideSheet(contextMenu.sheetId);
              setContextMenu((p) => ({ ...p, visible: false }));
            }}>Hide</button>
          {hiddenSheets.length > 0 && (
            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => { setShowUnhide(true); setContextMenu((p) => ({ ...p, visible: false })); }}>Unhide...</button>
          )}
        </div>
      )}

      {/* Unhide dialog */}
      {showUnhide && hiddenSheets.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-lg shadow-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)", minWidth: 250 }}>
            <div className="text-sm font-semibold mb-2">Unhide Sheet</div>
            {hiddenSheets.map((sheet) => (
              <button key={sheet.id} className="w-full text-left text-xs px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                onClick={() => { unhideSheet(sheet.id); setShowUnhide(false); }}>
                {sheet.name}
              </button>
            ))}
            <button className="mt-2 text-xs px-3 py-1 rounded border" style={{ borderColor: "var(--border)" }}
              onClick={() => setShowUnhide(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
