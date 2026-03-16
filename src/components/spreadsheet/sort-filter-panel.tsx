"use client";

import { useState, useMemo, useCallback } from "react";
import { X, ArrowUpAZ, ArrowDownAZ, Filter } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

export function SortFilterPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const setCellValue = useSpreadsheetStore((s) => s.setCellValue);
  const setCellStyle = useSpreadsheetStore((s) => s.setCellStyle);
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);

  const [filterColumn, setFilterColumn] = useState(0);
  const [checkedValues, setCheckedValues] = useState<Set<string>>(new Set());
  const [filterActive, setFilterActive] = useState(false);

  const bounds = useMemo(() => {
    const s = selectionStart || activeCell;
    const e = selectionEnd || activeCell;
    if (!s || !e) return null;
    return {
      minR: Math.min(s.row, e.row),
      maxR: Math.max(s.row, e.row),
      minC: Math.min(s.col, e.col),
      maxC: Math.max(s.col, e.col),
    };
  }, [selectionStart, selectionEnd, activeCell]);

  const columns = useMemo(() => {
    if (!bounds) return [];
    const cols: { index: number; label: string }[] = [];
    for (let c = bounds.minC; c <= bounds.maxC; c++) {
      const headerVal = getCellDisplay(c, bounds.minR);
      cols.push({ index: c, label: headerVal || colToLetter(c) });
    }
    return cols;
  }, [bounds, getCellDisplay]);

  // Get unique values in the filter column
  const uniqueValues = useMemo(() => {
    if (!bounds) return [];
    const vals = new Set<string>();
    for (let r = bounds.minR + 1; r <= bounds.maxR; r++) {
      const v = getCellDisplay(filterColumn, r);
      if (v) vals.add(v);
    }
    return Array.from(vals).sort();
  }, [bounds, filterColumn, getCellDisplay]);

  // Initialize checked values when column changes
  useMemo(() => {
    setCheckedValues(new Set(uniqueValues));
  }, [uniqueValues]);

  const handleSort = useCallback(
    (ascending: boolean) => {
      if (!bounds) return;
      const sheet = getActiveSheet();
      const dataStartRow = bounds.minR + 1;
      const rows: { row: number; values: { col: number; raw: string; style: object }[] }[] = [];

      for (let r = dataStartRow; r <= bounds.maxR; r++) {
        const rowData: { col: number; raw: string; style: object }[] = [];
        for (let c = bounds.minC; c <= bounds.maxC; c++) {
          const key = `${colToLetter(c)}${r + 1}`;
          const cell = sheet.cells[key];
          rowData.push({ col: c, raw: cell?.raw || "", style: cell?.style || {} });
        }
        rows.push({ row: r, values: rowData });
      }

      // Sort by the filter column
      const sortColIdx = filterColumn - bounds.minC;
      rows.sort((a, b) => {
        const aVal = a.values[sortColIdx]?.raw || "";
        const bVal = b.values[sortColIdx]?.raw || "";
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return ascending ? aNum - bNum : bNum - aNum;
        }
        return ascending
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });

      // Write sorted data back
      rows.forEach((rowData, idx) => {
        const targetRow = dataStartRow + idx;
        rowData.values.forEach((cellData) => {
          setCellValue(cellData.col, targetRow, cellData.raw);
          setCellStyle(cellData.col, targetRow, cellData.style);
        });
      });

      onClose();
    },
    [bounds, filterColumn, getActiveSheet, setCellValue, setCellStyle, onClose]
  );

  const handleFilter = useCallback(() => {
    if (!bounds) return;
    const sheet = getActiveSheet();
    const dataStartRow = bounds.minR + 1;

    // Collect all rows
    const allRows: { values: { col: number; raw: string; style: object }[]; filterVal: string }[] = [];
    for (let r = dataStartRow; r <= bounds.maxR; r++) {
      const rowData: { col: number; raw: string; style: object }[] = [];
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const key = `${colToLetter(c)}${r + 1}`;
        const cell = sheet.cells[key];
        rowData.push({ col: c, raw: cell?.raw || "", style: cell?.style || {} });
      }
      allRows.push({
        values: rowData,
        filterVal: getCellDisplay(filterColumn, r),
      });
    }

    // Move matching rows to top, clear non-matching
    const matching = allRows.filter((r) => checkedValues.has(r.filterVal));
    const nonMatching = allRows.filter((r) => !checkedValues.has(r.filterVal));
    const reordered = [...matching, ...nonMatching];

    reordered.forEach((rowData, idx) => {
      const targetRow = dataStartRow + idx;
      rowData.values.forEach((cellData) => {
        if (idx >= matching.length) {
          // Hide non-matching rows by clearing (simple approach)
          setCellValue(cellData.col, targetRow, "");
          setCellStyle(cellData.col, targetRow, {});
        } else {
          setCellValue(cellData.col, targetRow, cellData.raw);
          setCellStyle(cellData.col, targetRow, cellData.style);
        }
      });
    });

    setFilterActive(true);
    onClose();
  }, [bounds, filterColumn, checkedValues, getActiveSheet, getCellDisplay, setCellValue, setCellStyle, onClose]);

  if (!open) return null;

  const noSelection = !bounds;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[420px] max-h-[80vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-semibold">Sort & Filter</h2>
          <button onClick={onClose} className="hover:opacity-70">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {noSelection ? (
            <div
              className="text-center py-8 text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Select a range of cells with headers first.
            </div>
          ) : (
            <>
              {/* Column selector */}
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Column
                </label>
                <select
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  value={filterColumn}
                  onChange={(e) => setFilterColumn(parseInt(e.target.value))}
                >
                  {columns.map((col) => (
                    <option key={col.index} value={col.index}>
                      {col.label} ({colToLetter(col.index)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort buttons */}
              <div>
                <div
                  className="text-xs font-semibold mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Sort
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border hover:opacity-80"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                    }}
                    onClick={() => handleSort(true)}
                  >
                    <ArrowUpAZ size={14} />
                    Sort A to Z
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border hover:opacity-80"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                    }}
                    onClick={() => handleSort(false)}
                  >
                    <ArrowDownAZ size={14} />
                    Sort Z to A
                  </button>
                </div>
              </div>

              {/* Filter by value */}
              <div
                className="border-t pt-3"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="text-xs font-semibold mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Filter by Value
                </div>
                <div
                  className="border rounded max-h-[150px] overflow-auto p-2 space-y-1"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--background)",
                  }}
                >
                  {/* Select all */}
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedValues.size === uniqueValues.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCheckedValues(new Set(uniqueValues));
                        } else {
                          setCheckedValues(new Set());
                        }
                      }}
                    />
                    <span className="font-medium">(Select All)</span>
                  </label>
                  {uniqueValues.map((val) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checkedValues.has(val)}
                        onChange={(e) => {
                          const next = new Set(checkedValues);
                          if (e.target.checked) {
                            next.add(val);
                          } else {
                            next.delete(val);
                          }
                          setCheckedValues(next);
                        }}
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                  {uniqueValues.length === 0 && (
                    <div
                      className="text-xs italic py-2"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      No values found
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-xs rounded hover:opacity-90"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
            onClick={handleFilter}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}
