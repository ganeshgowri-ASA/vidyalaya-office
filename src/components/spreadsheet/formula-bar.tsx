"use client";

import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

export function FormulaBar() {
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const editingCell = useSpreadsheetStore((s) => s.editingCell);
  const editValue = useSpreadsheetStore((s) => s.editValue);
  const setEditValue = useSpreadsheetStore((s) => s.setEditValue);
  const startEditing = useSpreadsheetStore((s) => s.startEditing);
  const commitEdit = useSpreadsheetStore((s) => s.commitEdit);
  const cancelEdit = useSpreadsheetStore((s) => s.cancelEdit);
  const getCellRaw = useSpreadsheetStore((s) => s.getCellRaw);

  const cellRef = activeCell
    ? `${colToLetter(activeCell.col)}${activeCell.row + 1}`
    : "";

  const displayValue = editingCell
    ? editValue
    : activeCell
      ? getCellRaw(activeCell.col, activeCell.row)
      : "";

  return (
    <div
      className="flex items-center border-b px-2 py-1 gap-2"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      <div
        className="w-16 text-center text-sm font-mono font-semibold rounded px-2 py-1"
        style={{
          backgroundColor: "var(--muted)",
          color: "var(--foreground)",
        }}
      >
        {cellRef}
      </div>
      <div className="text-sm px-1" style={{ color: "var(--muted-foreground)" }}>
        <em>f</em>x
      </div>
      <input
        className="flex-1 text-sm font-mono px-2 py-1 rounded border outline-none"
        style={{
          borderColor: "var(--border)",
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
          if (e.key === "Enter") {
            commitEdit();
          } else if (e.key === "Escape") {
            cancelEdit();
          }
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
