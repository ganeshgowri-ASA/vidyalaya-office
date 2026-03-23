"use client";

import { useState, useMemo, useCallback } from "react";
import { X, GripVertical } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

interface PivotField {
  name: string;
  colIndex: number;
}

type DropZone = "rows" | "columns" | "values" | "filters";

export function PivotTableModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const addSheet = useSpreadsheetStore((s) => s.addSheet);
  const setCellValue = useSpreadsheetStore((s) => s.setCellValue);
  const setCellStyle = useSpreadsheetStore((s) => s.setCellStyle);
  const setActiveSheet = useSpreadsheetStore((s) => s.setActiveSheet);
  const sheets = useSpreadsheetStore((s) => s.sheets);

  const [rowFields, setRowFields] = useState<PivotField[]>([]);
  const [colFields, setColFields] = useState<PivotField[]>([]);
  const [valueFields, setValueFields] = useState<PivotField[]>([]);
  const [filterFields, setFilterFields] = useState<PivotField[]>([]);
  const [aggregation, setAggregation] = useState<"SUM" | "COUNT" | "AVERAGE" | "MAX" | "MIN" | "MEDIAN" | "STDEV" | "PRODUCT">("SUM");
  const [draggedField, setDraggedField] = useState<PivotField | null>(null);

  // Auto-detect the data range: use explicit multi-cell selection, else scan from row 0
  const dataRange = useMemo(() => {
    if (selectionStart && selectionEnd) {
      const minC = Math.min(selectionStart.col, selectionEnd.col);
      const maxC = Math.max(selectionStart.col, selectionEnd.col);
      const minR = Math.min(selectionStart.row, selectionEnd.row);
      const maxR = Math.max(selectionStart.row, selectionEnd.row);
      // Only use explicit selection if it spans multiple cells
      if (minC !== maxC || minR !== maxR) {
        return { minC, maxC, minR, maxR };
      }
    }
    // Auto-detect: scan row 0 for header columns
    let maxC = -1;
    for (let c = 0; c < 52; c++) {
      if (getCellDisplay(c, 0)) maxC = c;
      else break;
    }
    if (maxC < 0) return null;
    // Find the last row with data
    let maxR = 0;
    for (let r = 1; r < 100; r++) {
      let hasData = false;
      for (let c = 0; c <= maxC; c++) {
        if (getCellDisplay(c, r)) { hasData = true; break; }
      }
      if (!hasData) break;
      maxR = r;
    }
    return maxR > 0 ? { minC: 0, maxC, minR: 0, maxR } : null;
  }, [selectionStart, selectionEnd, getCellDisplay]);

  // Extract field names from the header row (always row 0 or first row of selection)
  const availableFields = useMemo(() => {
    if (!dataRange) return [];
    const { minC, maxC, minR } = dataRange;
    const fields: PivotField[] = [];
    for (let c = minC; c <= maxC; c++) {
      const name = getCellDisplay(c, minR) || colToLetter(c);
      fields.push({ name, colIndex: c });
    }
    return fields;
  }, [dataRange, getCellDisplay]);

  // Compute pivot preview
  const pivotPreview = useMemo(() => {
    if (!dataRange || rowFields.length === 0 || valueFields.length === 0) {
      return null;
    }

    const { minR, maxR } = dataRange;
    const dataStartRow = minR + 1; // skip header

    // Build groups by row field values
    const groups: Record<string, number[]> = {};
    for (let r = dataStartRow; r <= maxR; r++) {
      const keyParts = rowFields.map((f) => getCellDisplay(f.colIndex, r));
      const key = keyParts.join(" | ");
      if (!groups[key]) groups[key] = [];
      for (const vf of valueFields) {
        const val = parseFloat(getCellDisplay(vf.colIndex, r).replace(/[$,%]/g, ""));
        if (!isNaN(val)) groups[key].push(val);
      }
    }

    const aggregate = (nums: number[]) => {
      if (nums.length === 0) return 0;
      switch (aggregation) {
        case "SUM": return nums.reduce((a, b) => a + b, 0);
        case "COUNT": return nums.length;
        case "AVERAGE": return nums.reduce((a, b) => a + b, 0) / nums.length;
        case "MAX": return Math.max(...nums);
        case "MIN": return Math.min(...nums);
        case "MEDIAN": {
          const sorted = [...nums].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        }
        case "STDEV": {
          const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
          return Math.sqrt(nums.reduce((s, v) => s + (v - mean) ** 2, 0) / (nums.length - 1));
        }
        case "PRODUCT": return nums.reduce((a, b) => a * b, 1);
      }
    };

    return Object.entries(groups).map(([key, vals]) => ({
      label: key,
      value: aggregate(vals),
    }));
  }, [dataRange, rowFields, valueFields, aggregation, getCellDisplay]);

  const handleDragStart = useCallback((field: PivotField) => {
    setDraggedField(field);
  }, []);

  const handleDrop = useCallback((zone: DropZone) => {
    if (!draggedField) return;
    // Remove from all zones first
    setRowFields((prev) => prev.filter((f) => f.colIndex !== draggedField.colIndex));
    setColFields((prev) => prev.filter((f) => f.colIndex !== draggedField.colIndex));
    setValueFields((prev) => prev.filter((f) => f.colIndex !== draggedField.colIndex));
    setFilterFields((prev) => prev.filter((f) => f.colIndex !== draggedField.colIndex));

    switch (zone) {
      case "rows": setRowFields((prev) => [...prev, draggedField]); break;
      case "columns": setColFields((prev) => [...prev, draggedField]); break;
      case "values": setValueFields((prev) => [...prev, draggedField]); break;
      case "filters": setFilterFields((prev) => [...prev, draggedField]); break;
    }
    setDraggedField(null);
  }, [draggedField]);

  const removeFromZone = useCallback((zone: DropZone, colIndex: number) => {
    switch (zone) {
      case "rows": setRowFields((prev) => prev.filter((f) => f.colIndex !== colIndex)); break;
      case "columns": setColFields((prev) => prev.filter((f) => f.colIndex !== colIndex)); break;
      case "values": setValueFields((prev) => prev.filter((f) => f.colIndex !== colIndex)); break;
      case "filters": setFilterFields((prev) => prev.filter((f) => f.colIndex !== colIndex)); break;
    }
  }, []);

  if (!open) return null;

  // Show empty state only when we can't detect any data at all
  const noSelection = availableFields.length === 0;

  const DropZoneBox = ({ title, zone, fields }: { title: string; zone: DropZone; fields: PivotField[] }) => (
    <div
      className="border rounded p-2 min-h-[60px]"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleDrop(zone)}
    >
      <div className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{title}</div>
      {fields.map((f) => (
        <div
          key={f.colIndex}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded mb-1"
          style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
        >
          <span className="flex-1">{f.name}</span>
          <button
            className="hover:opacity-70"
            onClick={() => removeFromZone(zone, f.colIndex)}
          >
            <X size={12} />
          </button>
        </div>
      ))}
      {fields.length === 0 && (
        <div className="text-xs italic" style={{ color: "var(--muted-foreground)" }}>
          Drag fields here
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[800px] max-h-[85vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
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
          <h2 className="text-sm font-semibold">Pivot Table</h2>
          <button onClick={onClose} className="hover:opacity-70">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4">
          {noSelection ? (
            <div className="text-center py-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
              No data detected. Add column headers in row 1 and data below, then open the pivot table wizard.
            </div>
          ) : (
            <div className="flex gap-4">
              {/* Left: Fields list */}
              <div className="w-48 shrink-0">
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Available Fields
                </div>
                <div
                  className="border rounded p-2 space-y-1"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
                >
                  {availableFields.map((f) => (
                    <div
                      key={f.colIndex}
                      draggable
                      onDragStart={() => handleDragStart(f)}
                      className="flex items-center gap-1 text-xs px-2 py-1.5 rounded cursor-grab hover:opacity-80"
                      style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
                    >
                      <GripVertical size={12} style={{ color: "var(--muted-foreground)" }} />
                      <span>{f.name}</span>
                    </div>
                  ))}
                </div>

                {/* Aggregation */}
                <div className="mt-3">
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>
                    Aggregation
                  </div>
                  <select
                    className="w-full text-xs rounded px-2 py-1 border outline-none"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                    value={aggregation}
                    onChange={(e) => setAggregation(e.target.value as typeof aggregation)}
                  >
                    <option value="SUM">SUM</option>
                    <option value="COUNT">COUNT</option>
                    <option value="AVERAGE">AVERAGE</option>
                    <option value="MAX">MAX</option>
                    <option value="MIN">MIN</option>
                    <option value="MEDIAN">MEDIAN</option>
                    <option value="STDEV">STDEV</option>
                    <option value="PRODUCT">PRODUCT</option>
                  </select>
                </div>
              </div>

              {/* Right: Drop zones and preview */}
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <DropZoneBox title="Filters" zone="filters" fields={filterFields} />
                  <DropZoneBox title="Columns" zone="columns" fields={colFields} />
                  <DropZoneBox title="Rows" zone="rows" fields={rowFields} />
                  <DropZoneBox title="Values" zone="values" fields={valueFields} />
                </div>

                {/* Preview */}
                {pivotPreview && pivotPreview.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>
                      Preview
                    </div>
                    <div
                      className="border rounded overflow-auto max-h-[200px]"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th
                              className="text-left px-2 py-1 border-b"
                              style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
                            >
                              {rowFields.map((f) => f.name).join(" / ")}
                            </th>
                            <th
                              className="text-right px-2 py-1 border-b"
                              style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
                            >
                              {aggregation}({valueFields.map((f) => f.name).join(", ")})
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pivotPreview.map((row, i) => (
                            <tr key={i}>
                              <td
                                className="px-2 py-1 border-b"
                                style={{ borderColor: "var(--border)" }}
                              >
                                {row.label}
                              </td>
                              <td
                                className="px-2 py-1 border-b text-right font-mono"
                                style={{ borderColor: "var(--border)" }}
                              >
                                {row.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
              opacity: pivotPreview && pivotPreview.length > 0 ? 1 : 0.5,
            }}
            disabled={!pivotPreview || pivotPreview.length === 0}
            onClick={() => {
              if (!pivotPreview || pivotPreview.length === 0) return;
              // Create a new sheet for pivot results
              addSheet();
              // The new sheet is the last one added and is now active
              const newSheetId = useSpreadsheetStore.getState().activeSheetId;

              // Write header row
              const rowLabel = rowFields.map((f) => f.name).join(" / ");
              const valLabel = `${aggregation}(${valueFields.map((f) => f.name).join(", ")})`;
              setCellValue(0, 0, rowLabel);
              setCellValue(1, 0, valLabel);
              setCellStyle(0, 0, { bold: true, bgColor: "#374151" });
              setCellStyle(1, 0, { bold: true, bgColor: "#374151" });

              // Write data rows
              pivotPreview.forEach((row, i) => {
                setCellValue(0, i + 1, row.label);
                setCellValue(1, i + 1, String(parseFloat(row.value.toFixed(2))));
              });

              // Grand total
              const total = pivotPreview.reduce((sum, r) => sum + r.value, 0);
              setCellValue(0, pivotPreview.length + 1, "Grand Total");
              setCellValue(1, pivotPreview.length + 1, String(parseFloat(total.toFixed(2))));
              setCellStyle(0, pivotPreview.length + 1, { bold: true, bgColor: "#374151" });
              setCellStyle(1, pivotPreview.length + 1, { bold: true, bgColor: "#374151" });

              // Rename the new sheet
              useSpreadsheetStore.getState().renameSheet(newSheetId, "PivotTable");
              onClose();
            }}
          >
            Generate Pivot Table
          </button>
        </div>
      </div>
    </div>
  );
}
