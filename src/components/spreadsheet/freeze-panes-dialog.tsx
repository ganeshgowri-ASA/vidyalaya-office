"use client";

import { useState, useCallback } from "react";
import { X, Snowflake, Columns, Rows3, LayoutGrid } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";

export function FreezePanesDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const setFrozenPanes = useSpreadsheetStore((s) => s.setFrozenPanes);

  const sheet = getActiveSheet();
  const currentFrozenRows = sheet.frozenRows || 0;
  const currentFrozenCols = sheet.frozenCols || 0;

  const [customRows, setCustomRows] = useState(String(currentFrozenRows));
  const [customCols, setCustomCols] = useState(String(currentFrozenCols));

  const handleFreeze = useCallback((rows: number, cols: number) => {
    setFrozenPanes(rows, cols);
    onClose();
  }, [setFrozenPanes, onClose]);

  const handleUnfreeze = useCallback(() => {
    setFrozenPanes(0, 0);
    onClose();
  }, [setFrozenPanes, onClose]);

  const handleCustomFreeze = useCallback(() => {
    const rows = Math.max(0, parseInt(customRows) || 0);
    const cols = Math.max(0, parseInt(customCols) || 0);
    setFrozenPanes(rows, cols);
    onClose();
  }, [customRows, customCols, setFrozenPanes, onClose]);

  if (!open) return null;

  const hasFrozen = currentFrozenRows > 0 || currentFrozenCols > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[380px] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Snowflake size={14} />
            <h2 className="text-sm font-semibold">Freeze Panes</h2>
          </div>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        <div className="p-4 space-y-3">
          {/* Current status */}
          {hasFrozen && (
            <div className="text-xs px-2 py-1.5 rounded" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "var(--primary)" }}>
              Currently frozen: {currentFrozenRows} row(s), {currentFrozenCols} column(s)
            </div>
          )}

          {/* Quick actions */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Quick Freeze</div>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs hover:opacity-80 text-left"
              style={{ backgroundColor: "var(--muted)" }}
              onClick={() => handleFreeze(1, 0)}
            >
              <Rows3 size={14} style={{ color: "var(--primary)" }} />
              <div>
                <div className="font-medium">Freeze Top Row</div>
                <div style={{ color: "var(--muted-foreground)" }}>Keep the first row visible while scrolling</div>
              </div>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs hover:opacity-80 text-left"
              style={{ backgroundColor: "var(--muted)" }}
              onClick={() => handleFreeze(0, 1)}
            >
              <Columns size={14} style={{ color: "var(--primary)" }} />
              <div>
                <div className="font-medium">Freeze First Column</div>
                <div style={{ color: "var(--muted-foreground)" }}>Keep the first column visible while scrolling</div>
              </div>
            </button>

            {activeCell && (activeCell.row > 0 || activeCell.col > 0) && (
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs hover:opacity-80 text-left"
                style={{ backgroundColor: "var(--muted)" }}
                onClick={() => handleFreeze(activeCell.row, activeCell.col)}
              >
                <LayoutGrid size={14} style={{ color: "var(--primary)" }} />
                <div>
                  <div className="font-medium">Freeze at Active Cell</div>
                  <div style={{ color: "var(--muted-foreground)" }}>
                    Freeze {activeCell.row} row(s) and {activeCell.col} column(s)
                  </div>
                </div>
              </button>
            )}

            {hasFrozen && (
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs hover:opacity-80 text-left"
                style={{ backgroundColor: "var(--muted)" }}
                onClick={handleUnfreeze}
              >
                <X size={14} style={{ color: "#ef4444" }} />
                <div>
                  <div className="font-medium text-red-400">Unfreeze Panes</div>
                  <div style={{ color: "var(--muted-foreground)" }}>Remove all frozen rows and columns</div>
                </div>
              </button>
            )}
          </div>

          {/* Custom freeze */}
          <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Custom Freeze</div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs block mb-1" style={{ color: "var(--muted-foreground)" }}>Rows</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  value={customRows}
                  onChange={(e) => setCustomRows(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs block mb-1" style={{ color: "var(--muted-foreground)" }}>Columns</label>
                <input
                  type="number"
                  min="0"
                  max="26"
                  className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  value={customCols}
                  onChange={(e) => setCustomCols(e.target.value)}
                />
              </div>
              <button
                className="px-3 py-1.5 text-xs rounded hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                onClick={handleCustomFreeze}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
