"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

const ROWS = 50;
const COLS = 26;
const DEFAULT_COL_WIDTH = 100;
const ROW_HEIGHT = 28;

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
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const setColWidth = useSpreadsheetStore((s) => s.setColWidth);

  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

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
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
