"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useSpreadsheetStore, type CellStyle, type CellComment, type DataValidationRule, type ValidationError } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";
import { ChevronDown, AlertTriangle, ShieldX, X } from "lucide-react";

const ROWS = 100;
const COLS = 52; // A-AZ
const DEFAULT_COL_WIDTH = 80;
const DEFAULT_ROW_HEIGHT = 24;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function interpolateColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

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
  const getCellData = useSpreadsheetStore((s) => s.getCellData);
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const setColWidth = useSpreadsheetStore((s) => s.setColWidth);
  const setRowHeight = useSpreadsheetStore((s) => s.setRowHeight);
  const setCellValue = useSpreadsheetStore((s) => s.setCellValue);
  const setCellStyle = useSpreadsheetStore((s) => s.setCellStyle);
  const clipboardCopy = useSpreadsheetStore((s) => s.clipboardCopy);
  const clipboardCut = useSpreadsheetStore((s) => s.clipboardCut);
  const clipboardPaste = useSpreadsheetStore((s) => s.clipboardPaste);
  const clipboardPasteSpecial = useSpreadsheetStore((s) => s.clipboardPasteSpecial);
  const pushUndo = useSpreadsheetStore((s) => s.pushUndo);
  const undo = useSpreadsheetStore((s) => s.undo);
  const redo = useSpreadsheetStore((s) => s.redo);
  const insertRows = useSpreadsheetStore((s) => s.insertRows);
  const deleteRows = useSpreadsheetStore((s) => s.deleteRows);
  const insertCols = useSpreadsheetStore((s) => s.insertCols);
  const deleteCols = useSpreadsheetStore((s) => s.deleteCols);
  const clearRange = useSpreadsheetStore((s) => s.clearRange);
  const setCellComment = useSpreadsheetStore((s) => s.setCellComment);
  const setNamedRange = useSpreadsheetStore((s) => s.setNamedRange);
  const zoom = useSpreadsheetStore((s) => s.zoom);
  const showGridlines = useSpreadsheetStore((s) => s.showGridlines);
  const showHeadings = useSpreadsheetStore((s) => s.showHeadings);
  const getDataValidation = useSpreadsheetStore((s) => s.getDataValidation);
  const validationErrors = useSpreadsheetStore((s) => s.validationErrors);
  const clearValidationError = useSpreadsheetStore((s) => s.clearValidationError);

  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartY = useRef(0);
  const resizeStartW = useRef(0);
  const resizeStartH = useRef(0);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, col: 0, row: 0,
  });

  // Auto-fill drag state
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillTarget, setAutoFillTarget] = useState<{ col: number; row: number } | null>(null);
  const autoFillStart = useRef<{ col: number; row: number } | null>(null);

  // Tooltip for comments
  const [hoveredComment, setHoveredComment] = useState<{ x: number; y: number; comment: CellComment } | null>(null);

  // Dropdown state for list validations
  const [dropdownCell, setDropdownCell] = useState<{ col: number; row: number; x: number; y: number; width: number } | null>(null);
  const [dropdownFilter, setDropdownFilter] = useState("");

  // Validation error toast
  const [visibleError, setVisibleError] = useState<ValidationError | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sheet = getActiveSheet();
  const scale = zoom / 100;
  const conditionalFormats = sheet.conditionalFormats || [];

  // Compute conditional formatting for a cell
  const getConditionalStyle = useCallback(
    (col: number, row: number): Partial<CellStyle> | null => {
      if (conditionalFormats.length === 0) return null;
      const ck = `${colToLetter(col)}${row + 1}`;
      const display = getCellDisplay(col, row);
      const numVal = parseFloat(display);

      for (const rule of conditionalFormats) {
        // Check if cell is in range
        const rangeMatch = rule.range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
        if (!rangeMatch) continue;
        const rStartCol = rangeMatch[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 65, 0);
        const rStartRow = parseInt(rangeMatch[2]) - 1;
        const rEndCol = rangeMatch[3].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 65, 0);
        const rEndRow = parseInt(rangeMatch[4]) - 1;
        if (col < rStartCol || col > rEndCol || row < rStartRow || row > rEndRow) continue;

        switch (rule.type) {
          case "greaterThan":
            if (!isNaN(numVal) && rule.value1 && numVal > parseFloat(rule.value1))
              return rule.format;
            break;
          case "lessThan":
            if (!isNaN(numVal) && rule.value1 && numVal < parseFloat(rule.value1))
              return rule.format;
            break;
          case "between":
            if (!isNaN(numVal) && rule.value1 && rule.value2 && numVal >= parseFloat(rule.value1) && numVal <= parseFloat(rule.value2))
              return rule.format;
            break;
          case "equalTo":
            if (display === rule.value1) return rule.format;
            break;
          case "textContains":
            if (rule.value1 && display.toLowerCase().includes(rule.value1.toLowerCase()))
              return rule.format;
            break;
          case "duplicates": {
            // Check if value appears more than once in range
            let count = 0;
            for (let r2 = rStartRow; r2 <= rEndRow && count < 2; r2++) {
              for (let c2 = rStartCol; c2 <= rEndCol && count < 2; c2++) {
                if (getCellDisplay(c2, r2) === display && display) count++;
              }
            }
            if (count >= 2) return rule.format;
            break;
          }
          case "colorScale2":
          case "colorScale3": {
            if (isNaN(numVal) || !display) break;
            // Collect all numeric values in range
            const vals: number[] = [];
            for (let r2 = rStartRow; r2 <= rEndRow; r2++) {
              for (let c2 = rStartCol; c2 <= rEndCol; c2++) {
                const v = parseFloat(getCellDisplay(c2, r2));
                if (!isNaN(v)) vals.push(v);
              }
            }
            if (vals.length < 2) break;
            const minV = Math.min(...vals);
            const maxV = Math.max(...vals);
            if (maxV === minV) break;
            const ratio = (numVal - minV) / (maxV - minV);
            const minColor = rule.colorScaleMin || "#f87171";
            const maxColor = rule.colorScaleMax || "#22c55e";
            const midColor = rule.colorScaleMid || "#fbbf24";
            let bgColor: string;
            if (rule.type === "colorScale3") {
              if (ratio <= 0.5) {
                const t = ratio * 2;
                bgColor = interpolateColor(minColor, midColor, t);
              } else {
                const t = (ratio - 0.5) * 2;
                bgColor = interpolateColor(midColor, maxColor, t);
              }
            } else {
              bgColor = interpolateColor(minColor, maxColor, ratio);
            }
            return { bgColor };
          }
          case "dataBar": {
            // Data bars are handled separately in rendering
            break;
          }
          default:
            break;
        }
      }
      return null;
    },
    [conditionalFormats, getCellDisplay]
  );

  // Get data bar percentage for a cell
  const getDataBarInfo = useCallback(
    (col: number, row: number): { percentage: number; color: string } | null => {
      const display = getCellDisplay(col, row);
      const numVal = parseFloat(display);
      if (isNaN(numVal) || !display) return null;
      for (const rule of conditionalFormats) {
        if (rule.type !== "dataBar") continue;
        const rangeMatch = rule.range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
        if (!rangeMatch) continue;
        const rStartCol = rangeMatch[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 65, 0);
        const rStartRow = parseInt(rangeMatch[2]) - 1;
        const rEndCol = rangeMatch[3].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 65, 0);
        const rEndRow = parseInt(rangeMatch[4]) - 1;
        if (col < rStartCol || col > rEndCol || row < rStartRow || row > rEndRow) continue;
        const vals: number[] = [];
        for (let r2 = rStartRow; r2 <= rEndRow; r2++) {
          for (let c2 = rStartCol; c2 <= rEndCol; c2++) {
            const v = parseFloat(getCellDisplay(c2, r2));
            if (!isNaN(v)) vals.push(v);
          }
        }
        if (vals.length === 0) return null;
        const maxV = Math.max(...vals);
        if (maxV === 0) return null;
        return { percentage: Math.max(0, Math.min(100, (numVal / maxV) * 100)), color: rule.dataBarColor || "#3b82f6" };
      }
      return null;
    },
    [conditionalFormats, getCellDisplay]
  );

  const getColWidth = useCallback(
    (col: number) => sheet.colWidths[col] || DEFAULT_COL_WIDTH,
    [sheet.colWidths]
  );

  const getRowHeight = useCallback(
    (row: number) => sheet.rowHeights?.[row] || DEFAULT_ROW_HEIGHT,
    [sheet.rowHeights]
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
    (col: number, row: number) => activeCell?.col === col && activeCell?.row === row,
    [activeCell]
  );

  const isEditing = useCallback(
    (col: number, row: number) => editingCell?.col === col && editingCell?.row === row,
    [editingCell]
  );

  useEffect(() => {
    if (editingCell && inputRef.current) inputRef.current.focus();
  }, [editingCell]);

  // Show validation errors as toast
  useEffect(() => {
    const keys = Object.keys(validationErrors);
    if (keys.length > 0) {
      const latestKey = keys[keys.length - 1];
      const err = validationErrors[latestKey];
      setVisibleError(err);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => {
        setVisibleError(null);
        clearValidationError(latestKey);
      }, 4000);
    }
  }, [validationErrors, clearValidationError]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownCell) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown-list]")) {
        setDropdownCell(null);
        setDropdownFilter("");
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [dropdownCell]);

  // Column resize
  const handleResizeColStart = useCallback(
    (col: number, e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
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
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [resizingCol, setColWidth]);

  // Row resize
  const handleResizeRowStart = useCallback(
    (row: number, e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      setResizingRow(row);
      resizeStartY.current = e.clientY;
      resizeStartH.current = getRowHeight(row);
    },
    [getRowHeight]
  );

  useEffect(() => {
    if (resizingRow === null) return;
    const handleMove = (e: MouseEvent) => {
      const delta = e.clientY - resizeStartY.current;
      setRowHeight(resizingRow, resizeStartH.current + delta);
    };
    const handleUp = () => setResizingRow(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [resizingRow, setRowHeight]);

  // Double-click column header to auto-fit
  const handleAutoFitCol = useCallback(
    (col: number) => {
      let maxWidth = 40;
      for (let r = 0; r < ROWS; r++) {
        const display = getCellDisplay(col, r);
        if (display) maxWidth = Math.max(maxWidth, display.length * 8 + 16);
      }
      setColWidth(col, Math.min(maxWidth, 300));
    },
    [getCellDisplay, setColWidth]
  );

  // Selection drag
  useEffect(() => {
    if (!isDragging) return;
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, [isDragging]);

  const handleCellMouseDown = useCallback(
    (col: number, row: number, e: React.MouseEvent) => {
      if (e.button === 2) return; // right click handled by context menu
      // Ensure the grid div gets keyboard focus so typing triggers onKeyDown
      gridRef.current?.focus();
      if (e.shiftKey && activeCell) {
        setSelection(activeCell, { col, row });
      } else if (e.ctrlKey || e.metaKey) {
        // For ctrl-click, extend selection
        setSelection(activeCell || { col, row }, { col, row });
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
      // Check for comment
      const cellData = getCellData(col, row);
      if (cellData?.comment) {
        setHoveredComment(null); // Will be set by mouse position
      }
    },
    [isDragging, activeCell, setSelection, getCellData]
  );

  const handleCellDoubleClick = useCallback(
    (col: number, row: number) => startEditing(col, row),
    [startEditing]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Global keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "c") { e.preventDefault(); clipboardCopy(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "x") { e.preventDefault(); clipboardCut(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") { e.preventDefault(); clipboardPaste(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); useSpreadsheetStore.getState().setSelectionStyle({ bold: !useSpreadsheetStore.getState().getCellData(activeCell?.col || 0, activeCell?.row || 0)?.style?.bold }); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "i") { e.preventDefault(); useSpreadsheetStore.getState().setSelectionStyle({ italic: !useSpreadsheetStore.getState().getCellData(activeCell?.col || 0, activeCell?.row || 0)?.style?.italic }); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "u") { e.preventDefault(); useSpreadsheetStore.getState().setSelectionStyle({ underline: !useSpreadsheetStore.getState().getCellData(activeCell?.col || 0, activeCell?.row || 0)?.style?.underline }); return; }

      if (!activeCell) return;

      if (editingCell) {
        if (e.key === "Enter") {
          e.preventDefault();
          commitEdit();
          if (activeCell.row < ROWS - 1) setActiveCell(activeCell.col, activeCell.row + 1);
        } else if (e.key === "Tab") {
          e.preventDefault();
          commitEdit();
          if (e.shiftKey) {
            if (activeCell.col > 0) setActiveCell(activeCell.col - 1, activeCell.row);
          } else {
            if (activeCell.col < COLS - 1) setActiveCell(activeCell.col + 1, activeCell.row);
          }
        } else if (e.key === "Escape") {
          cancelEdit();
        }
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (e.shiftKey) { setSelection(selectionStart || activeCell, { col: activeCell.col, row: Math.max(0, activeCell.row - 1) }); setActiveCell(activeCell.col, Math.max(0, activeCell.row - 1)); }
          else if (activeCell.row > 0) setActiveCell(activeCell.col, activeCell.row - 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (e.shiftKey) { setSelection(selectionStart || activeCell, { col: activeCell.col, row: Math.min(ROWS - 1, activeCell.row + 1) }); setActiveCell(activeCell.col, Math.min(ROWS - 1, activeCell.row + 1)); }
          else if (activeCell.row < ROWS - 1) setActiveCell(activeCell.col, activeCell.row + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (e.shiftKey) { setSelection(selectionStart || activeCell, { col: Math.max(0, activeCell.col - 1), row: activeCell.row }); setActiveCell(Math.max(0, activeCell.col - 1), activeCell.row); }
          else if (activeCell.col > 0) setActiveCell(activeCell.col - 1, activeCell.row);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (e.shiftKey) { setSelection(selectionStart || activeCell, { col: Math.min(COLS - 1, activeCell.col + 1), row: activeCell.row }); setActiveCell(Math.min(COLS - 1, activeCell.col + 1), activeCell.row); }
          else if (activeCell.col < COLS - 1) setActiveCell(activeCell.col + 1, activeCell.row);
          break;
        case "Tab":
          e.preventDefault();
          if (e.shiftKey) { if (activeCell.col > 0) setActiveCell(activeCell.col - 1, activeCell.row); }
          else { if (activeCell.col < COLS - 1) setActiveCell(activeCell.col + 1, activeCell.row); }
          break;
        case "Enter":
          e.preventDefault();
          startEditing(activeCell.col, activeCell.row);
          break;
        case "F2":
          e.preventDefault();
          startEditing(activeCell.col, activeCell.row);
          break;
        case "Delete":
          e.preventDefault();
          if (selectionStart && selectionEnd) {
            const minR = Math.min(selectionStart.row, selectionEnd.row);
            const maxR = Math.max(selectionStart.row, selectionEnd.row);
            const minC = Math.min(selectionStart.col, selectionEnd.col);
            const maxC = Math.max(selectionStart.col, selectionEnd.col);
            pushUndo();
            clearRange(minC, minR, maxC, maxR, "contents");
          } else {
            pushUndo();
            setCellValue(activeCell.col, activeCell.row, "");
          }
          break;
        case "Backspace":
          e.preventDefault();
          pushUndo();
          setCellValue(activeCell.col, activeCell.row, "");
          break;
        case "Home":
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) setActiveCell(0, 0);
          else setActiveCell(0, activeCell.row);
          break;
        case "End":
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) setActiveCell(COLS - 1, ROWS - 1);
          else setActiveCell(COLS - 1, activeCell.row);
          break;
        case "PageDown":
          e.preventDefault();
          setActiveCell(activeCell.col, Math.min(ROWS - 1, activeCell.row + 20));
          break;
        case "PageUp":
          e.preventDefault();
          setActiveCell(activeCell.col, Math.max(0, activeCell.row - 20));
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            startEditing(activeCell.col, activeCell.row);
            setEditValue(e.key);
          }
          break;
      }
    },
    [activeCell, editingCell, commitEdit, cancelEdit, setActiveCell, startEditing, setEditValue, selectionStart, selectionEnd, undo, redo, clipboardCopy, clipboardCut, clipboardPaste, pushUndo, setCellValue, clearRange, setSelection]
  );

  const getCellStyle = useCallback(
    (col: number, row: number): CellStyle => {
      const key = `${colToLetter(col)}${row + 1}`;
      return sheet.cells[key]?.style || {};
    },
    [sheet.cells]
  );

  // Context menu
  const handleContextMenu = useCallback(
    (col: number, row: number, e: React.MouseEvent) => {
      e.preventDefault();
      setActiveCell(col, row);
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY, col, row });
    },
    [setActiveCell]
  );

  useEffect(() => {
    if (!contextMenu.visible) return;
    const close = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu.visible]);

  // Auto-fill handlers
  const handleAutoFillStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (!activeCell) return;
      setIsAutoFilling(true);
      autoFillStart.current = { col: activeCell.col, row: activeCell.row };
    },
    [activeCell]
  );

  useEffect(() => {
    if (!isAutoFilling) return;
    const handleMove = (e: MouseEvent) => {
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      for (const el of elements) {
        const td = el.closest("td[data-col][data-row]");
        if (td) {
          setAutoFillTarget({
            col: parseInt(td.getAttribute("data-col")!, 10),
            row: parseInt(td.getAttribute("data-row")!, 10),
          });
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
        const isNumber = !isNaN(num) && raw !== "" && !raw.startsWith("=");

        pushUndo();
        if (autoFillTarget.col === startCol) {
          const dir = autoFillTarget.row > startRow ? 1 : -1;
          for (let r = startRow + dir; dir > 0 ? r <= autoFillTarget.row : r >= autoFillTarget.row; r += dir) {
            setCellValue(startCol, r, isNumber ? String(num + (r - startRow)) : raw);
          }
        } else if (autoFillTarget.row === startRow) {
          const dir = autoFillTarget.col > startCol ? 1 : -1;
          for (let c = startCol + dir; dir > 0 ? c <= autoFillTarget.col : c >= autoFillTarget.col; c += dir) {
            setCellValue(c, startRow, isNumber ? String(num + (c - startCol)) : raw);
          }
        }
      }
      setIsAutoFilling(false);
      setAutoFillTarget(null);
      autoFillStart.current = null;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [isAutoFilling, autoFillTarget, getCellRaw, setCellValue, pushUndo]);

  // Frozen panes
  const frozenRows = sheet.frozenRows || 0;
  const frozenCols = sheet.frozenCols || 0;

  const contextMenuItems = [
    { label: "Cut", action: () => clipboardCut(), shortcut: "Ctrl+X" },
    { label: "Copy", action: () => clipboardCopy(), shortcut: "Ctrl+C" },
    { label: "Paste", action: () => clipboardPaste(), shortcut: "Ctrl+V" },
    { label: "---" },
    { label: "Paste Special", submenu: true, action: () => {} },
    { label: "---" },
    { label: "Insert Row Above", action: () => insertRows(contextMenu.row, 1) },
    { label: "Insert Row Below", action: () => insertRows(contextMenu.row + 1, 1) },
    { label: "Insert Column Left", action: () => insertCols(contextMenu.col, 1) },
    { label: "Insert Column Right", action: () => insertCols(contextMenu.col + 1, 1) },
    { label: "---" },
    { label: "Delete Row", action: () => deleteRows(contextMenu.row, 1) },
    { label: "Delete Column", action: () => deleteCols(contextMenu.col, 1) },
    { label: "Clear Contents", action: () => {
      const s = selectionStart || activeCell;
      const e = selectionEnd || activeCell;
      if (s && e) clearRange(Math.min(s.col, e.col), Math.min(s.row, e.row), Math.max(s.col, e.col), Math.max(s.row, e.row), "contents");
    }},
    { label: "---" },
    { label: "Sort A\u2192Z", action: () => {
      const col = contextMenu.col;
      const data: { row: number; values: string[] }[] = [];
      for (let r = 0; r < ROWS; r++) {
        const raw = getCellRaw(col, r);
        if (raw !== "") {
          const rowValues: string[] = [];
          for (let c = 0; c < COLS; c++) rowValues.push(getCellRaw(c, r));
          data.push({ row: r, values: rowValues });
        }
      }
      if (data.length === 0) return;
      const startRow = data[0].row;
      data.sort((a, b) => a.values[col].localeCompare(b.values[col]));
      pushUndo();
      data.forEach((d, i) => d.values.forEach((v, c) => setCellValue(c, startRow + i, v)));
    }},
    { label: "Sort Z\u2192A", action: () => {
      const col = contextMenu.col;
      const data: { row: number; values: string[] }[] = [];
      for (let r = 0; r < ROWS; r++) {
        const raw = getCellRaw(col, r);
        if (raw !== "") {
          const rowValues: string[] = [];
          for (let c = 0; c < COLS; c++) rowValues.push(getCellRaw(c, r));
          data.push({ row: r, values: rowValues });
        }
      }
      if (data.length === 0) return;
      const startRow = data[0].row;
      data.sort((a, b) => b.values[col].localeCompare(a.values[col]));
      pushUndo();
      data.forEach((d, i) => d.values.forEach((v, c) => setCellValue(c, startRow + i, v)));
    }},
    { label: "---" },
    { label: "Add Comment", action: () => {
      const text = prompt("Enter comment:");
      if (text) setCellComment(contextMenu.col, contextMenu.row, { text, author: "User", date: new Date().toISOString() });
    }},
    { label: "Column Width...", action: () => {
      const w = prompt("Column width:", String(getColWidth(contextMenu.col)));
      if (w) setColWidth(contextMenu.col, parseInt(w));
    }},
    { label: "Row Height...", action: () => {
      const h = prompt("Row height:", String(getRowHeight(contextMenu.row)));
      if (h) setRowHeight(contextMenu.row, parseInt(h));
    }},
    { label: "Define Name...", action: () => {
      const bounds = selectionStart && selectionEnd ? {
        minC: Math.min(selectionStart.col, selectionEnd.col),
        maxC: Math.max(selectionStart.col, selectionEnd.col),
        minR: Math.min(selectionStart.row, selectionEnd.row),
        maxR: Math.max(selectionStart.row, selectionEnd.row),
      } : { minC: contextMenu.col, maxC: contextMenu.col, minR: contextMenu.row, maxR: contextMenu.row };
      const name = prompt("Name:");
      if (name) setNamedRange(name, `${colToLetter(bounds.minC)}${bounds.minR + 1}:${colToLetter(bounds.maxC)}${bounds.maxR + 1}`);
    }},
    { label: "---" },
    { label: "Format Cells...", action: () => {
      // Dispatch custom event to open format cells dialog from workspace
      window.dispatchEvent(new CustomEvent("spreadsheet:openFormatCells"));
    }},
    { label: "Filter", action: () => {
      window.dispatchEvent(new CustomEvent("spreadsheet:openSortFilter"));
    }},
  ];

  return (
    <div
      ref={gridRef}
      className="flex-1 overflow-auto outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ backgroundColor: "var(--background)" }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <table
          className="border-collapse"
          style={{ borderColor: showGridlines ? "var(--border)" : "transparent" }}
        >
          <thead>
            <tr>
              {showHeadings && (
                <th
                  className="sticky top-0 left-0 z-20 text-xs font-medium select-none"
                  style={{
                    width: 40, minWidth: 40, height: DEFAULT_ROW_HEIGHT,
                    backgroundColor: "var(--muted)", color: "var(--muted-foreground)",
                    border: showGridlines ? "1px solid var(--border)" : "none",
                  }}
                />
              )}
              {Array.from({ length: COLS }, (_, c) => (
                <th
                  key={c}
                  className="sticky top-0 z-10 text-xs font-medium select-none relative"
                  style={{
                    width: getColWidth(c), minWidth: getColWidth(c), maxWidth: getColWidth(c),
                    height: DEFAULT_ROW_HEIGHT,
                    backgroundColor: activeCell?.col === c ? "rgba(59,130,246,0.15)" : "var(--muted)",
                    color: "var(--muted-foreground)",
                    border: showGridlines ? "1px solid var(--border)" : "none",
                  }}
                  onClick={() => {
                    // Select entire column
                    setActiveCell(c, 0);
                    setSelection({ col: c, row: 0 }, { col: c, row: ROWS - 1 });
                  }}
                >
                  {colToLetter(c)}
                  <div
                    className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400"
                    onMouseDown={(e) => handleResizeColStart(c, e)}
                    onDoubleClick={(e) => { e.stopPropagation(); handleAutoFitCol(c); }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, r) => (
              <tr key={r}>
                {showHeadings && (
                  <td
                    className="sticky left-0 z-10 text-xs text-center font-medium select-none relative"
                    style={{
                      width: 40, minWidth: 40, height: getRowHeight(r),
                      backgroundColor: activeCell?.row === r ? "rgba(59,130,246,0.15)" : "var(--muted)",
                      color: "var(--muted-foreground)",
                      border: showGridlines ? "1px solid var(--border)" : "none",
                    }}
                    onClick={() => {
                      setActiveCell(0, r);
                      setSelection({ col: 0, row: r }, { col: COLS - 1, row: r });
                    }}
                  >
                    {r + 1}
                    <div
                      className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-400"
                      onMouseDown={(e) => handleResizeRowStart(r, e)}
                    />
                  </td>
                )}
                {Array.from({ length: COLS }, (_, c) => {
                  const active = isActive(c, r);
                  const editing = isEditing(c, r);
                  const selected = isInSelection(c, r);
                  const cellStyle = getCellStyle(c, r);
                  const cellData = getCellData(c, r);
                  const hasComment = !!cellData?.comment;
                  const ck = `${colToLetter(c)}${r + 1}`;
                  const validation = getDataValidation(ck);
                  const hasValidation = !!validation;
                  const isListValidation = validation?.type === "list";
                  const cellHasError = !!validationErrors[ck];
                  const isFrozenBorderRight = frozenCols > 0 && c === frozenCols - 1;
                  const isFrozenBorderBottom = frozenRows > 0 && r === frozenRows - 1;
                  const condStyle = getConditionalStyle(c, r);
                  const dataBar = getDataBarInfo(c, r);
                  const effectiveBg = selected && !active
                    ? "rgba(59,130,246,0.25)"
                    : condStyle?.bgColor || cellStyle.bgColor || "var(--background)";
                  const effectiveTextColor = condStyle?.textColor || cellStyle.textColor || "var(--foreground)";

                  return (
                    <td
                      key={c}
                      data-col={c}
                      data-row={r}
                      className="text-sm relative"
                      style={{
                        width: getColWidth(c), minWidth: getColWidth(c), maxWidth: getColWidth(c),
                        height: getRowHeight(r), padding: 0,
                        border: showGridlines ? "1px solid var(--border)" : "1px solid transparent",
                        backgroundColor: effectiveBg,
                        outline: active ? "2px solid #3b82f6" : "none",
                        outlineOffset: "-1px",
                        zIndex: active ? 5 : undefined,
                        borderRight: isFrozenBorderRight ? "2px solid #94a3b8" : undefined,
                        borderBottom: isFrozenBorderBottom ? "2px solid #94a3b8" : undefined,
                        position: (c < frozenCols || r < frozenRows) ? "sticky" : undefined,
                        left: c < frozenCols && showHeadings ? 40 : c < frozenCols ? 0 : undefined,
                        top: r < frozenRows ? DEFAULT_ROW_HEIGHT : undefined,
                      }}
                      onMouseDown={(e) => handleCellMouseDown(c, r, e)}
                      onMouseEnter={() => handleCellMouseEnter(c, r)}
                      onDoubleClick={() => handleCellDoubleClick(c, r)}
                      onContextMenu={(e) => handleContextMenu(c, r, e)}
                    >
                      {/* Comment indicator */}
                      {hasComment && (
                        <div
                          className="absolute top-0 right-0 w-0 h-0"
                          style={{
                            borderLeft: "6px solid transparent",
                            borderTop: "6px solid #ef4444",
                          }}
                          onMouseEnter={(e) => {
                            if (cellData?.comment) {
                              setHoveredComment({
                                x: e.clientX, y: e.clientY,
                                comment: cellData.comment,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredComment(null)}
                        />
                      )}

                      {/* Validation indicator (green triangle bottom-left) */}
                      {hasValidation && (
                        <div
                          className="absolute bottom-0 left-0 w-0 h-0"
                          style={{
                            borderRight: "5px solid transparent",
                            borderBottom: cellHasError ? "5px solid #ef4444" : "5px solid #22c55e",
                          }}
                        />
                      )}

                      {/* Dropdown button for list validation */}
                      {isListValidation && active && !editing && (
                        <button
                          className="absolute right-0 top-0 h-full flex items-center justify-center hover:opacity-80"
                          style={{
                            width: 18,
                            backgroundColor: "var(--muted)",
                            borderLeft: "1px solid var(--border)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                            setDropdownCell({
                              col: c,
                              row: r,
                              x: rect.left,
                              y: rect.bottom,
                              width: rect.width,
                            });
                            setDropdownFilter("");
                          }}
                        >
                          <ChevronDown size={12} />
                        </button>
                      )}

                      {editing ? (
                        <input
                          ref={inputRef}
                          className="w-full h-full px-1 text-sm outline-none border-none"
                          style={{
                            backgroundColor: "var(--background)", color: "var(--foreground)",
                            fontFamily: cellStyle.fontFamily || "inherit",
                            fontSize: cellStyle.fontSize ? `${cellStyle.fontSize}px` : "inherit",
                          }}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault(); e.stopPropagation();
                              commitEdit();
                              const nextRow = r < ROWS - 1 ? r + 1 : r;
                              setActiveCell(c, nextRow);
                              if (nextRow !== r) startEditing(c, nextRow);
                            } else if (e.key === "Tab") {
                              e.preventDefault(); e.stopPropagation();
                              commitEdit();
                              if (e.shiftKey) {
                                const nextCol = c > 0 ? c - 1 : c;
                                setActiveCell(nextCol, r);
                                if (nextCol !== c) startEditing(nextCol, r);
                              } else {
                                const nextCol = c < COLS - 1 ? c + 1 : c;
                                setActiveCell(nextCol, r);
                                if (nextCol !== c) startEditing(nextCol, r);
                              }
                            } else if (e.key === "Escape") cancelEdit();
                          }}
                          onBlur={() => commitEdit()}
                        />
                      ) : (
                        <div
                          className="w-full h-full px-1 flex items-center overflow-hidden relative"
                          style={{
                            fontWeight: cellStyle.bold ? 700 : 400,
                            fontStyle: cellStyle.italic ? "italic" : "normal",
                            textDecoration: [
                              cellStyle.underline ? "underline" : "",
                              cellStyle.strikethrough ? "line-through" : "",
                            ].filter(Boolean).join(" ") || "none",
                            textAlign: cellStyle.align || "left",
                            justifyContent: cellStyle.align === "center" ? "center" : cellStyle.align === "right" ? "flex-end" : "flex-start",
                            alignItems: cellStyle.verticalAlign === "top" ? "flex-start" : cellStyle.verticalAlign === "bottom" ? "flex-end" : "center",
                            color: effectiveTextColor,
                            fontFamily: cellStyle.fontFamily || "inherit",
                            fontSize: cellStyle.fontSize ? `${cellStyle.fontSize}px` : "inherit",
                            whiteSpace: cellStyle.wrapText ? "pre-wrap" : "nowrap",
                            textOverflow: cellStyle.wrapText ? "clip" : "ellipsis",
                          }}
                        >
                          {/* Data bar */}
                          {dataBar && (
                            <div
                              className="absolute left-0 top-0 h-full"
                              style={{
                                width: `${dataBar.percentage}%`,
                                backgroundColor: dataBar.color,
                                opacity: 0.2,
                                zIndex: 0,
                              }}
                            />
                          )}
                          <span className="relative z-[1]">{getCellDisplay(c, r)}</span>
                        </div>
                      )}

                      {/* Auto-fill drag handle */}
                      {active && !editing && (
                        <div
                          className="absolute w-2 h-2 cursor-crosshair"
                          style={{
                            bottom: -3, right: -3,
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
      </div>

      {/* Comment tooltip */}
      {hoveredComment && (
        <div
          className="fixed z-50 p-2 rounded shadow-lg border text-xs max-w-xs"
          style={{
            left: hoveredComment.x + 10, top: hoveredComment.y + 10,
            backgroundColor: "#fef9c3", borderColor: "#d97706", color: "#000",
          }}
        >
          <div className="font-semibold">{hoveredComment.comment.author}</div>
          <div className="text-[10px] mb-1" style={{ color: "#666" }}>{new Date(hoveredComment.comment.date).toLocaleDateString()}</div>
          <div>{hoveredComment.comment.text}</div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed rounded shadow-lg border py-1 z-50 text-xs"
          style={{
            left: contextMenu.x, top: contextMenu.y,
            backgroundColor: "var(--card)", borderColor: "var(--border)",
            color: "var(--foreground)", minWidth: 200, maxHeight: 400, overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenuItems.map((item, i) =>
            item.label === "---" ? (
              <div key={i} className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
            ) : (
              <button
                key={i}
                className="w-full text-left px-3 py-1.5 hover:opacity-80 transition-colors flex items-center justify-between"
                style={{ backgroundColor: "transparent", color: "var(--foreground)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => {
                  item.action?.();
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
              >
                <span>{item.label}</span>
                {item.shortcut && <span className="text-[10px] ml-4" style={{ color: "var(--muted-foreground)" }}>{item.shortcut}</span>}
              </button>
            )
          )}
        </div>
      )}

      {/* Dropdown list for list validation */}
      {dropdownCell && (() => {
        const dcKey = `${colToLetter(dropdownCell.col)}${dropdownCell.row + 1}`;
        const dcRule = getDataValidation(dcKey);
        if (!dcRule || dcRule.type !== "list") return null;
        const items = (dcRule.listItems || "").split(",").map((s) => s.trim()).filter(Boolean);
        const filtered = dropdownFilter
          ? items.filter((item) => item.toLowerCase().includes(dropdownFilter.toLowerCase()))
          : items;
        return (
          <div
            data-dropdown-list
            className="fixed z-50 rounded border shadow-xl"
            style={{
              left: dropdownCell.x,
              top: dropdownCell.y,
              minWidth: Math.max(dropdownCell.width, 120),
              maxHeight: 200,
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <input
              autoFocus
              className="w-full px-2 py-1.5 text-xs border-b outline-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
              placeholder="Search..."
              value={dropdownFilter}
              onChange={(e) => setDropdownFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDropdownCell(null);
                  setDropdownFilter("");
                } else if (e.key === "Enter" && filtered.length > 0) {
                  pushUndo();
                  setCellValue(dropdownCell.col, dropdownCell.row, filtered[0]);
                  setDropdownCell(null);
                  setDropdownFilter("");
                }
              }}
            />
            <div className="overflow-auto" style={{ maxHeight: 160 }}>
              {filtered.length === 0 ? (
                <div className="px-2 py-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  No matches
                </div>
              ) : (
                filtered.map((item, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-2 py-1.5 text-xs hover:opacity-80 transition-colors"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--foreground)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    onClick={() => {
                      pushUndo();
                      setCellValue(dropdownCell.col, dropdownCell.row, item);
                      setDropdownCell(null);
                      setDropdownFilter("");
                    }}
                  >
                    {item}
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* Validation error toast */}
      {visibleError && (
        <div
          className="fixed bottom-16 right-4 z-50 flex items-start gap-2 p-3 rounded-lg border shadow-xl max-w-sm"
          style={{
            backgroundColor: visibleError.style === "reject" ? "#1c1917" : "#1c1917",
            borderColor: visibleError.style === "reject" ? "#ef4444" : "#f59e0b",
            color: "var(--foreground)",
          }}
        >
          {visibleError.style === "reject" ? (
            <ShieldX size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#ef4444" }} />
          ) : (
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
          )}
          <div className="flex-1">
            <div className="text-xs font-semibold" style={{ color: visibleError.style === "reject" ? "#ef4444" : "#f59e0b" }}>
              {visibleError.title}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {visibleError.message}
            </div>
          </div>
          <button
            className="flex-shrink-0 hover:opacity-70"
            onClick={() => {
              setVisibleError(null);
              clearValidationError(visibleError.cellKey);
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
