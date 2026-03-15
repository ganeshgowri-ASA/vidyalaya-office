"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

const ROWS = 50;
const COLS = 26;
const DEFAULT_COL_WIDTH = 100;
const ROW_HEIGHT = 28;

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  col: number;
  row: number;
}

export function SpreadsheetGrid() {
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const editingCell = useSpreadsheetStore((s) => s.editingCell);
  const editValue = useSpreadsheetStore((s) => s.editValue);
  const setActiveCell = useSpreadsheetStore((s) => s.setActiveCell);
  const setSelection = useSpreadsheetStore((s) => s.setSelection);
  const startEditing = useSpreadsheetStore((s) => s.startEditing);
  const setEditValue = useSpreadsheetStore((s) => s.setEditValue);
  const commitEdit = useSpreadsheetStore((s) => s.commitEdit);
  const cancelEdit = useSpreadsheetStore((s) => s.cancelEdit);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const getCellRaw = useSpreadsheetStore((s) => s.getCellRaw);
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const setColWidth = useSpreadsheetStore((s) => s.setColWidth);
  const setCellValue = useSpreadsheetStore((s) => s.setCellValue);

  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, col: 0, row: 0,
  });
  const [clipboard, setClipboard] = useState<{ value: string; style: Record<string, unknown> } | null>(null);

  // Auto-fill drag state
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillTarget, setAutoFillTarget] = useState<{ col: number; row: number } | null>(null);
  const autoFillStart = useRef<{ col: number; row: number } | null>(null);

  const sheet = getActiveSheet();

  const getColWidth = useCallback(
    (col: number) => sheet.colWidths[col] || DEFAULT_COL_WIDTH,
    [sheet.colWidths]
  );

  const isInSelection = useCallback(
    (col: number, row: number) => {
      if (!selectionStart || !selectionEnd) return false;
      const minR = Math.min(selectionStart.row, selectionEnd.row);
      const maxR = Math.max(selectionStart.row, selectionEnd.row);
      const minC = Math.min(selectionStart.col, selectionEnd.col);
      const maxC = Math.max(selectionStart.col, selectionEnd.col);
      return row >= minR && row <= maxR && col >= minC && col <= maxC;
    },
    [selectionStart, selectionEnd]
  );

  const isActive = useCallback(
    (col: number, row: number) =>
      activeCell?.col === col && activeCell?.row === row,
    [activeCell]
  );

  const isEditing = useCallback(
    (col: number, row: number) =>
      editingCell?.col === col && editingCell?.row === row,
    [editingCell]
  );

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  // Column resize handlers
  const handleResizeStart = useCallback(
    (col: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingCol(col);
      resizeStartX.current = e.clientX;
      resizeStartW.current = getColWidth(col);
    },
    [getColWidth]
  );

  useEffect(() => {
    if (resizingCol === null) return;
    const handleMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX.current;
      setColWidth(resizingCol, resizeStartW.current + delta);
    };
    const handleUp = () => setResizingCol(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [resizingCol, setColWidth]);

  // Selection drag
  useEffect(() => {
    if (!isDragging) return;
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, [isDragging]);

  const handleCellMouseDown = useCallback(
    (col: number, row: number, e: React.MouseEvent) => {
      if (e.shiftKey && activeCell) {
        setSelection(activeCell, { col, row });
      } else {
        setActiveCell(col, row);
        setIsDragging(true);
      }
    },
    [activeCell, setActiveCell, setSelection]
  );

  const handleCellMouseEnter = useCallback(
    (col: number, row: number) => {
      if (isDragging && activeCell) {
        setSelection(activeCell, { col, row });
      }
    },
    [isDragging, activeCell, setSelection]
  );

  const handleCellDoubleClick = useCallback(
    (col: number, row: number) => {
      startEditing(col, row);
    },
    [startEditing]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!activeCell) return;

      if (editingCell) {
        if (e.key === "Enter") {
          e.preventDefault();
          commitEdit();
          if (activeCell.row < ROWS - 1) {
            setActiveCell(activeCell.col, activeCell.row + 1);
          }
        } else if (e.key === "Tab") {
          e.preventDefault();
          commitEdit();
          if (activeCell.col < COLS - 1) {
            setActiveCell(activeCell.col + 1, activeCell.row);
          }
        } else if (e.key === "Escape") {
          cancelEdit();
        }
        return;
      }

      // Navigation
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (activeCell.row > 0) setActiveCell(activeCell.col, activeCell.row - 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (activeCell.row < ROWS - 1) setActiveCell(activeCell.col, activeCell.row + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (activeCell.col > 0) setActiveCell(activeCell.col - 1, activeCell.row);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (activeCell.col < COLS - 1) setActiveCell(activeCell.col + 1, activeCell.row);
          break;
        case "Tab":
          e.preventDefault();
          if (activeCell.col < COLS - 1) setActiveCell(activeCell.col + 1, activeCell.row);
          break;
        case "Enter":
          e.preventDefault();
          startEditing(activeCell.col, activeCell.row);
          break;
        case "Delete":
        case "Backspace":
          e.preventDefault();
          useSpreadsheetStore
            .getState()
            .setCellValue(activeCell.col, activeCell.row, "");
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            startEditing(activeCell.col, activeCell.row);
            setEditValue(e.key);
          }
          break;
      }
    },
    [activeCell, editingCell, commitEdit, cancelEdit, setActiveCell, startEditing, setEditValue]
  );

  const getCellStyle = useCallback(
    (col: number, row: number) => {
      const key = `${colToLetter(col)}${row + 1}`;
      return sheet.cells[key]?.style || {};
    },
    [sheet.cells]
  );

  // Context menu handler
  const handleContextMenu = useCallback(
    (col: number, row: number, e: React.MouseEvent) => {
      e.preventDefault();
      setActiveCell(col, row);
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY, col, row });
    },
    [setActiveCell]
  );

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu.visible) return;
    const close = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu.visible]);

  const insertRowAbove = useCallback(
    (row: number) => {
      // Shift all rows at and below `row` down by 1
      for (let r = ROWS - 1; r > row; r--) {
        for (let c = 0; c < COLS; c++) {
          const srcRaw = getCellRaw(c, r - 1);
          setCellValue(c, r, srcRaw);
        }
      }
      // Clear the inserted row
      for (let c = 0; c < COLS; c++) {
        setCellValue(c, row, "");
      }
    },
    [getCellRaw, setCellValue]
  );

  const insertRowBelow = useCallback(
    (row: number) => {
      for (let r = ROWS - 1; r > row + 1; r--) {
        for (let c = 0; c < COLS; c++) {
          const srcRaw = getCellRaw(c, r - 1);
          setCellValue(c, r, srcRaw);
        }
      }
      for (let c = 0; c < COLS; c++) {
        setCellValue(c, row + 1, "");
      }
    },
    [getCellRaw, setCellValue]
  );

  const insertColLeft = useCallback(
    (col: number) => {
      for (let c = COLS - 1; c > col; c--) {
        for (let r = 0; r < ROWS; r++) {
          const srcRaw = getCellRaw(c - 1, r);
          setCellValue(c, r, srcRaw);
        }
      }
      for (let r = 0; r < ROWS; r++) {
        setCellValue(col, r, "");
      }
    },
    [getCellRaw, setCellValue]
  );

  const insertColRight = useCallback(
    (col: number) => {
      for (let c = COLS - 1; c > col + 1; c--) {
        for (let r = 0; r < ROWS; r++) {
          const srcRaw = getCellRaw(c - 1, r);
          setCellValue(c, r, srcRaw);
        }
      }
      for (let r = 0; r < ROWS; r++) {
        setCellValue(col + 1, r, "");
      }
    },
    [getCellRaw, setCellValue]
  );

  const deleteRow = useCallback(
    (row: number) => {
      for (let r = row; r < ROWS - 1; r++) {
        for (let c = 0; c < COLS; c++) {
          const srcRaw = getCellRaw(c, r + 1);
          setCellValue(c, r, srcRaw);
        }
      }
      for (let c = 0; c < COLS; c++) {
        setCellValue(c, ROWS - 1, "");
      }
    },
    [getCellRaw, setCellValue]
  );

  const deleteCol = useCallback(
    (col: number) => {
      for (let c = col; c < COLS - 1; c++) {
        for (let r = 0; r < ROWS; r++) {
          const srcRaw = getCellRaw(c + 1, r);
          setCellValue(c, r, srcRaw);
        }
      }
      for (let r = 0; r < ROWS; r++) {
        setCellValue(COLS - 1, r, "");
      }
    },
    [getCellRaw, setCellValue]
  );

  const copyCell = useCallback(
    (col: number, row: number) => {
      const raw = getCellRaw(col, row);
      const style = getCellStyle(col, row);
      setClipboard({ value: raw, style: style as Record<string, unknown> });
    },
    [getCellRaw, getCellStyle]
  );

  const pasteCell = useCallback(
    (col: number, row: number) => {
      if (!clipboard) return;
      setCellValue(col, row, clipboard.value);
    },
    [clipboard, setCellValue]
  );

  const sortColumn = useCallback(
    (col: number, ascending: boolean) => {
      // Collect all non-empty rows for this column
      const data: { row: number; values: string[] }[] = [];
      for (let r = 0; r < ROWS; r++) {
        const raw = getCellRaw(col, r);
        if (raw !== "") {
          const rowValues: string[] = [];
          for (let c = 0; c < COLS; c++) {
            rowValues.push(getCellRaw(c, r));
          }
          data.push({ row: r, values: rowValues });
        }
      }
      if (data.length === 0) return;
      const startRow = data[0].row;
      data.sort((a, b) => {
        const va = a.values[col];
        const vb = b.values[col];
        const na = parseFloat(va);
        const nb = parseFloat(vb);
        if (!isNaN(na) && !isNaN(nb)) {
          return ascending ? na - nb : nb - na;
        }
        return ascending ? va.localeCompare(vb) : vb.localeCompare(va);
      });
      // Write sorted data back
      for (let i = 0; i < data.length; i++) {
        for (let c = 0; c < COLS; c++) {
          setCellValue(c, startRow + i, data[i].values[c]);
        }
      }
    },
    [getCellRaw, setCellValue]
  );

  // Auto-fill handlers
  const handleAutoFillStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!activeCell) return;
      setIsAutoFilling(true);
      autoFillStart.current = { col: activeCell.col, row: activeCell.row };
    },
    [activeCell]
  );

  useEffect(() => {
    if (!isAutoFilling) return;
    const handleMove = (e: MouseEvent) => {
      const grid = gridRef.current;
      if (!grid || !autoFillStart.current) return;
      // Find which cell the mouse is over
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      for (const el of elements) {
        const td = el.closest("td[data-col][data-row]");
        if (td) {
          const col = parseInt(td.getAttribute("data-col")!, 10);
          const row = parseInt(td.getAttribute("data-row")!, 10);
          setAutoFillTarget({ col, row });
          break;
        }
      }
    };
    const handleUp = () => {
      if (autoFillStart.current && autoFillTarget) {
        const startCol = autoFillStart.current.col;
        const startRow = autoFillStart.current.row;
        const raw = getCellRaw(startCol, startRow);
        const num = parseFloat(raw);
        const isNumber = !isNaN(num) && raw !== "";

        if (autoFillTarget.col === startCol) {
          // Vertical fill
          const dir = autoFillTarget.row > startRow ? 1 : -1;
          for (let r = startRow + dir; dir > 0 ? r <= autoFillTarget.row : r >= autoFillTarget.row; r += dir) {
            if (isNumber && !raw.startsWith("=")) {
              setCellValue(startCol, r, String(num + (r - startRow)));
            } else {
              setCellValue(startCol, r, raw);
            }
          }
        } else if (autoFillTarget.row === startRow) {
          // Horizontal fill
          const dir = autoFillTarget.col > startCol ? 1 : -1;
          for (let c = startCol + dir; dir > 0 ? c <= autoFillTarget.col : c >= autoFillTarget.col; c += dir) {
            if (isNumber && !raw.startsWith("=")) {
              setCellValue(c, startRow, String(num + (c - startCol)));
            } else {
              setCellValue(c, startRow, raw);
            }
          }
        }
      }
      setIsAutoFilling(false);
      setAutoFillTarget(null);
      autoFillStart.current = null;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isAutoFilling, autoFillTarget, getCellRaw, setCellValue]);

  return (
    <div
      ref={gridRef}
      className="flex-1 overflow-auto outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ backgroundColor: "var(--background)" }}
    >
      <table
        className="border-collapse"
        style={{ borderColor: "var(--border)" }}
      >
        <thead>
          <tr>
            {/* Row number header corner */}
            <th
              className="sticky top-0 left-0 z-20 border text-xs font-medium"
              style={{
                width: 40,
                minWidth: 40,
                backgroundColor: "var(--muted)",
                borderColor: "var(--border)",
                color: "var(--muted-foreground)",
              }}
            />
            {Array.from({ length: COLS }, (_, c) => (
              <th
                key={c}
                className="sticky top-0 z-10 border text-xs font-medium select-none relative"
                style={{
                  width: getColWidth(c),
                  minWidth: getColWidth(c),
                  maxWidth: getColWidth(c),
                  height: ROW_HEIGHT,
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                  color: "var(--muted-foreground)",
                }}
              >
                {colToLetter(c)}
                {/* Resize handle */}
                <div
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
                  onMouseDown={(e) => handleResizeStart(c, e)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROWS }, (_, r) => (
            <tr key={r}>
              <td
                className="sticky left-0 z-10 border text-xs text-center font-medium select-none"
                style={{
                  width: 40,
                  minWidth: 40,
                  height: ROW_HEIGHT,
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                  color: "var(--muted-foreground)",
                }}
              >
                {r + 1}
              </td>
              {Array.from({ length: COLS }, (_, c) => {
                const active = isActive(c, r);
                const editing = isEditing(c, r);
                const selected = isInSelection(c, r);
                const cellStyle = getCellStyle(c, r);

                return (
                  <td
                    key={c}
                    data-col={c}
                    data-row={r}
                    className="border text-sm font-mono relative"
                    style={{
                      width: getColWidth(c),
                      minWidth: getColWidth(c),
                      maxWidth: getColWidth(c),
                      height: ROW_HEIGHT,
                      padding: 0,
                      borderColor: "var(--border)",
                      backgroundColor: selected && !active
                        ? "rgba(59,130,246,0.1)"
                        : cellStyle.bgColor || "var(--background)",
                      outline: active ? "2px solid #3b82f6" : "none",
                      outlineOffset: "-1px",
                      zIndex: active ? 5 : undefined,
                    }}
                    onMouseDown={(e) => handleCellMouseDown(c, r, e)}
                    onMouseEnter={() => handleCellMouseEnter(c, r)}
                    onDoubleClick={() => handleCellDoubleClick(c, r)}
                    onContextMenu={(e) => handleContextMenu(c, r, e)}
                  >
                    {editing ? (
                      <input
                        ref={inputRef}
                        className="w-full h-full px-1 text-sm font-mono outline-none border-none"
                        style={{
                          backgroundColor: "var(--background)",
                          color: "var(--foreground)",
                        }}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitEdit();
                            if (r < ROWS - 1) setActiveCell(c, r + 1);
                          } else if (e.key === "Tab") {
                            e.preventDefault();
                            commitEdit();
                            if (c < COLS - 1) setActiveCell(c + 1, r);
                          } else if (e.key === "Escape") {
                            cancelEdit();
                          }
                        }}
                        onBlur={() => commitEdit()}
                      />
                    ) : (
                      <div
                        className="w-full h-full px-1 flex items-center overflow-hidden whitespace-nowrap text-ellipsis"
                        style={{
                          fontWeight: cellStyle.bold ? 700 : 400,
                          fontStyle: cellStyle.italic ? "italic" : "normal",
                          textDecoration: cellStyle.underline
                            ? "underline"
                            : "none",
                          textAlign: cellStyle.align || "left",
                          justifyContent:
                            cellStyle.align === "center"
                              ? "center"
                              : cellStyle.align === "right"
                                ? "flex-end"
                                : "flex-start",
                          color: cellStyle.textColor || "var(--foreground)",
                        }}
                      >
                        {getCellDisplay(c, r)}
                      </div>
                    )}
                    {/* Auto-fill drag handle */}
                    {active && !editing && (
                      <div
                        className="absolute w-2 h-2 cursor-crosshair"
                        style={{
                          bottom: -3,
                          right: -3,
                          backgroundColor: "#3b82f6",
                          border: "1px solid white",
                          zIndex: 10,
                        }}
                        onMouseDown={handleAutoFillStart}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed rounded shadow-lg border py-1 z-50 text-sm"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            minWidth: 180,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: "Insert Row Above", action: () => insertRowAbove(contextMenu.row) },
            { label: "Insert Row Below", action: () => insertRowBelow(contextMenu.row) },
            { label: "Insert Column Left", action: () => insertColLeft(contextMenu.col) },
            { label: "Insert Column Right", action: () => insertColRight(contextMenu.col) },
            { label: "---" },
            { label: "Delete Row", action: () => deleteRow(contextMenu.row) },
            { label: "Delete Column", action: () => deleteCol(contextMenu.col) },
            { label: "---" },
            { label: "Copy", action: () => copyCell(contextMenu.col, contextMenu.row) },
            { label: "Paste", action: () => pasteCell(contextMenu.col, contextMenu.row) },
            { label: "---" },
            { label: "Sort A\u2192Z", action: () => sortColumn(contextMenu.col, true) },
            { label: "Sort Z\u2192A", action: () => sortColumn(contextMenu.col, false) },
          ].map((item, i) =>
            item.label === "---" ? (
              <div
                key={i}
                className="my-1 border-t"
                style={{ borderColor: "var(--border)" }}
              />
            ) : (
              <button
                key={i}
                className="w-full text-left px-3 py-1.5 hover:opacity-80 transition-colors"
                style={{ backgroundColor: "transparent", color: "var(--foreground)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => {
                  item.action?.();
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
