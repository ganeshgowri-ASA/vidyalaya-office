"use client";

import React, { useState } from "react";
import { X, Grid3X3, Printer, Trash2 } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { usePrintLayoutStore } from "@/store/print-layout-store";
import { colToLetter } from "./formula-engine";

interface PrintAreaDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PrintAreaDialog({ open, onClose }: PrintAreaDialogProps) {
  const {
    selectionStart, selectionEnd, getActiveSheet, activeCell,
  } = useSpreadsheetStore();
  const { settings, setPrintArea, updateSettings } = usePrintLayoutStore();

  const sheet = getActiveSheet();
  const [localPrintArea, setLocalPrintArea] = useState(settings.printArea || "");
  const [localRepeatRows, setLocalRepeatRows] = useState(settings.repeatRows || "");
  const [localRepeatCols, setLocalRepeatCols] = useState(settings.repeatColumns || "");
  const [localPrintGridlines, setLocalPrintGridlines] = useState(settings.printGridlines);
  const [localPrintHeadings, setLocalPrintHeadings] = useState(settings.printHeadings);

  if (!open) return null;

  // Get selection as range string
  const getSelectionRange = (): string => {
    if (selectionStart && selectionEnd) {
      const startCol = Math.min(selectionStart.col, selectionEnd.col);
      const startRow = Math.min(selectionStart.row, selectionEnd.row);
      const endCol = Math.max(selectionStart.col, selectionEnd.col);
      const endRow = Math.max(selectionStart.row, selectionEnd.row);
      return `${colToLetter(startCol)}${startRow + 1}:${colToLetter(endCol)}${endRow + 1}`;
    }
    if (activeCell) {
      return `${colToLetter(activeCell.col)}${activeCell.row + 1}`;
    }
    return "";
  };

  const handleSetFromSelection = () => {
    const range = getSelectionRange();
    if (range) setLocalPrintArea(range);
  };

  const handleClear = () => {
    setLocalPrintArea("");
  };

  const handleApply = () => {
    setPrintArea(localPrintArea || null);
    updateSettings({
      repeatRows: localRepeatRows || null,
      repeatColumns: localRepeatCols || null,
      printGridlines: localPrintGridlines,
      printHeadings: localPrintHeadings,
    });
    onClose();
  };

  // Determine the data range in the sheet for suggestion
  const getDataRange = (): string => {
    const cells = sheet.cells;
    const keys = Object.keys(cells);
    if (keys.length === 0) return "";
    let minCol = Infinity, maxCol = 0, minRow = Infinity, maxRow = 0;
    for (const key of keys) {
      const match = key.match(/^([A-Z]+)(\d+)$/);
      if (match) {
        let col = 0;
        for (let i = 0; i < match[1].length; i++) {
          col = col * 26 + match[1].charCodeAt(i) - 64;
        }
        const row = parseInt(match[2]);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
      }
    }
    if (minCol === Infinity) return "";
    return `${colToLetter(minCol - 1)}${minRow}:${colToLetter(maxCol - 1)}${maxRow}`;
  };

  const dataRange = getDataRange();
  const currentSelection = getSelectionRange();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[440px] rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Printer size={16} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Print Area & Sheet Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Print Area */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: "var(--foreground)" }}>Print Area</label>
            <div className="flex gap-2">
              <input type="text" value={localPrintArea} onChange={(e) => setLocalPrintArea(e.target.value)} placeholder="e.g. A1:F20" className="flex-1 rounded border px-2 py-1.5 text-xs outline-none font-mono" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              <button onClick={handleSetFromSelection} className="flex items-center gap-1 px-2 py-1.5 rounded border text-xs hover:bg-[var(--muted)]" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} title="Set from current selection">
                <Grid3X3 size={12} /> Selection
              </button>
              <button onClick={handleClear} className="flex items-center gap-1 px-2 py-1.5 rounded border text-xs hover:bg-[var(--muted)]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }} title="Clear print area">
                <Trash2 size={12} />
              </button>
            </div>
            {currentSelection && (
              <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                Current selection: {currentSelection}
              </p>
            )}
            {dataRange && (
              <button onClick={() => setLocalPrintArea(dataRange)} className="text-[10px] mt-1 underline" style={{ color: "var(--primary)" }}>
                Auto-detect data range: {dataRange}
              </button>
            )}
          </div>

          {/* Repeat rows/columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Repeat Rows at Top</label>
              <input type="text" value={localRepeatRows} onChange={(e) => setLocalRepeatRows(e.target.value)} placeholder="e.g. 1:2" className="w-full rounded border px-2 py-1.5 text-xs outline-none font-mono" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              <p className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Header rows on each page</p>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Repeat Columns at Left</label>
              <input type="text" value={localRepeatCols} onChange={(e) => setLocalRepeatCols(e.target.value)} placeholder="e.g. A:B" className="w-full rounded border px-2 py-1.5 text-xs outline-none font-mono" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              <p className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Label columns on each page</p>
            </div>
          </div>

          {/* Print options */}
          <div className="space-y-2">
            <label className="text-xs font-medium block" style={{ color: "var(--foreground)" }}>Sheet Print Options</label>
            <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
              <input type="checkbox" checked={localPrintGridlines} onChange={(e) => setLocalPrintGridlines(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
              Print gridlines
            </label>
            <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
              <input type="checkbox" checked={localPrintHeadings} onChange={(e) => setLocalPrintHeadings(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
              Print row and column headings
            </label>
          </div>

          {/* Info */}
          {localPrintArea && (
            <div className="rounded-md border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Print Area Summary</p>
              <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                Range: <span className="font-mono">{localPrintArea}</span>
                {localRepeatRows && <> | Repeat rows: <span className="font-mono">{localRepeatRows}</span></>}
                {localRepeatCols && <> | Repeat cols: <span className="font-mono">{localRepeatCols}</span></>}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="px-4 py-1.5 rounded-md border text-xs" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Cancel
          </button>
          <button onClick={handleApply} className="px-4 py-1.5 rounded-md text-xs font-medium" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
