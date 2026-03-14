"use client";

import { useMemo } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

export function StatusBar() {
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);

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

    if (values.length === 0) return { count: cellCount, numCount: 0, sum: 0, avg: 0 };

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count: cellCount,
      numCount: values.length,
      sum,
      avg: sum / values.length,
    };
  }, [selectionStart, selectionEnd, getCellDisplay]);

  const rangeLabel = useMemo(() => {
    if (!selectionStart || !selectionEnd) return "";
    if (
      selectionStart.col === selectionEnd.col &&
      selectionStart.row === selectionEnd.row
    )
      return "";
    return `${colToLetter(selectionStart.col)}${selectionStart.row + 1}:${colToLetter(selectionEnd.col)}${selectionEnd.row + 1}`;
  }, [selectionStart, selectionEnd]);

  return (
    <div
      className="flex items-center justify-between px-3 py-1 text-xs border-t"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--muted)",
        color: "var(--muted-foreground)",
      }}
    >
      <span>{rangeLabel && `Selection: ${rangeLabel}`}</span>
      <div className="flex items-center gap-4">
        {stats && stats.numCount > 0 && (
          <>
            <span>Sum: {stats.sum.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
            <span>Average: {stats.avg.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
            <span>Count: {stats.numCount}</span>
          </>
        )}
        {stats && <span>Cells: {stats.count}</span>}
      </div>
    </div>
  );
}
