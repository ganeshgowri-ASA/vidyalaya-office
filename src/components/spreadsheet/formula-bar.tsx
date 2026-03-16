"use client";

import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";
import { Check, X } from "lucide-react";

export function FormulaBar() {
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const editingCell = useSpreadsheetStore((s) => s.editingCell);
  const editValue = useSpreadsheetStore((s) => s.editValue);
  const setEditValue = useSpreadsheetStore((s) => s.setEditValue);
  const startEditing = useSpreadsheetStore((s) => s.startEditing);
  const commitEdit = useSpreadsheetStore((s) => s.commitEdit);
  const cancelEdit = useSpreadsheetStore((s) => s.cancelEdit);
  const getCellRaw = useSpreadsheetStore((s) => s.getCellRaw);
  const namedRanges = useSpreadsheetStore((s) => s.namedRanges);

  const cellRef = activeCell
    ? `${colToLetter(activeCell.col)}${activeCell.row + 1}`
    : "";

  const displayValue = editingCell
    ? editValue
    : activeCell
      ? getCellRaw(activeCell.col, activeCell.row)
      : "";

  const isFormula = displayValue.startsWith("=");

  return (
    <div
      className="flex items-center border-b px-1 py-0.5 gap-1"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      {/* Name Box */}
      <div
        className="w-20 text-center text-xs font-mono font-semibold rounded px-1 py-0.5 cursor-pointer border"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          borderColor: "var(--border)",
        }}
        title={`Cell: ${cellRef}`}
        onClick={() => {
          const input = prompt("Go to cell (e.g. A1) or named range:", cellRef);
          if (!input) return;
          // Check named ranges
          const namedRange = namedRanges[input];
          if (namedRange) {
            const match = namedRange.match(/^([A-Z]+)(\d+)/i);
            if (match) {
              const col = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
              const row = parseInt(match[2]) - 1;
              useSpreadsheetStore.getState().setActiveCell(col, row);
            }
            return;
          }
          const match = input.match(/^([A-Z]+)(\d+)$/i);
          if (match) {
            const col = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
            const row = parseInt(match[2]) - 1;
            if (col >= 0 && row >= 0) {
              useSpreadsheetStore.getState().setActiveCell(col, row);
            }
          }
        }}
      >
        {cellRef}
      </div>

      {/* Cancel / Confirm buttons */}
      {editingCell && (
        <>
          <button
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: "var(--destructive, #ef4444)" }}
            onClick={cancelEdit}
            title="Cancel (Esc)"
          >
            <X size={14} />
          </button>
          <button
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: "var(--primary, #22c55e)" }}
            onClick={commitEdit}
            title="Confirm (Enter)"
          >
            <Check size={14} />
          </button>
        </>
      )}

      {/* fx label */}
      <div
        className="text-xs px-1 font-semibold"
        style={{ color: isFormula ? "var(--primary)" : "var(--muted-foreground)" }}
      >
        <em>f</em>x
      </div>

      {/* Formula input */}
      <input
        className="flex-1 text-xs font-mono px-2 py-0.5 rounded border outline-none"
        style={{
          borderColor: editingCell ? "var(--primary)" : "var(--border)",
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
        value={displayValue}
        onChange={(e) => {
          if (!editingCell && activeCell) {
            startEditing(activeCell.col, activeCell.row);
          }
          setEditValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitEdit();
          else if (e.key === "Escape") cancelEdit();
        }}
        onFocus={() => {
          if (!editingCell && activeCell) {
            startEditing(activeCell.col, activeCell.row);
          }
        }}
        placeholder="Enter value or formula (e.g. =SUM(A1:A10))"
      />
    </div>
  );
}
