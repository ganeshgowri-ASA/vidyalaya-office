"use client";

import { useMemo } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";
import { Minus, Plus } from "lucide-react";

export function StatusBar() {
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const editMode = useSpreadsheetStore((s) => s.editMode);
  const zoom = useSpreadsheetStore((s) => s.zoom);
  const setZoom = useSpreadsheetStore((s) => s.setZoom);

  const stats = useMemo(() => {
    if (!selectionStart || !selectionEnd) return null;
    const minR = Math.min(selectionStart.row, selectionEnd.row);
    const maxR = Math.max(selectionStart.row, selectionEnd.row);
    const minC = Math.min(selectionStart.col, selectionEnd.col);
    const maxC = Math.max(selectionStart.col, selectionEnd.col);

    const cellCount = (maxR - minR + 1) * (maxC - minC + 1);
    if (cellCount <= 1) return null;

    const values: number[] = [];
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const v = getCellDisplay(c, r);
        const n = parseFloat(v.replace(/[$,%]/g, ""));
        if (!isNaN(n)) values.push(n);
      }
    }

    if (values.length === 0) return { count: cellCount, numCount: 0, sum: 0, avg: 0, min: 0, max: 0 };

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count: cellCount,
      numCount: values.length,
      sum,
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [selectionStart, selectionEnd, getCellDisplay]);

  const rangeLabel = useMemo(() => {
    if (!selectionStart || !selectionEnd) return "";
    if (selectionStart.col === selectionEnd.col && selectionStart.row === selectionEnd.row) return "";
    return `${colToLetter(selectionStart.col)}${selectionStart.row + 1}:${colToLetter(selectionEnd.col)}${selectionEnd.row + 1}`;
  }, [selectionStart, selectionEnd]);

  return (
    <div
      className="flex items-center justify-between px-3 py-0.5 text-xs border-t select-none"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--muted)",
        color: "var(--muted-foreground)",
        minHeight: 22,
      }}
    >
      {/* Left: Mode indicator */}
      <div className="flex items-center gap-3">
        <span className="font-medium" style={{
          color: editMode === "Edit" ? "var(--primary)" : "var(--muted-foreground)"
        }}>
          {editMode}
        </span>
        {rangeLabel && <span>Selection: {rangeLabel}</span>}
      </div>

      {/* Center: Stats */}
      <div className="flex items-center gap-4">
        {stats && stats.numCount > 0 && (
          <>
            <span>Average: {stats.avg.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
            <span>Count: {stats.numCount}</span>
            <span>Sum: {stats.sum.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
            <span>Min: {stats.min.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
            <span>Max: {stats.max.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
          </>
        )}
      </div>

      {/* Right: Zoom slider */}
      <div className="flex items-center gap-1">
        <button
          className="p-0.5 rounded hover:opacity-70"
          onClick={() => setZoom(zoom - 10)}
          title="Zoom Out"
        >
          <Minus size={12} />
        </button>
        <input
          type="range"
          min={25}
          max={400}
          step={5}
          value={zoom}
          onChange={(e) => setZoom(parseInt(e.target.value))}
          className="w-20 h-1 accent-blue-500"
          title={`Zoom: ${zoom}%`}
        />
        <button
          className="p-0.5 rounded hover:opacity-70"
          onClick={() => setZoom(zoom + 10)}
          title="Zoom In"
        >
          <Plus size={12} />
        </button>
        <span className="w-8 text-center text-[10px]">{zoom}%</span>
      </div>
    </div>
  );
}
