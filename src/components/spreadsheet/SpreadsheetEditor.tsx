"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
// recharts imports moved to chart-renderer.tsx
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  BarChart2,
  Plus,
  Trash2,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Merge,
  Snowflake,
  FileSpreadsheet,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { Cell, CellStyle, Sheet, ChartConfig, SpreadsheetChartType } from "./types";
import { createDefaultChartConfig, getDefaultChartCustomization } from "./types";
import { evaluateFormula, colLetterToIndex, indexToColLetter } from "./formula-engine";
import { TEMPLATES } from "./templates";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { ExportProgress } from "@/components/shared/export-progress";
import { ImportDialog } from "@/components/shared/import-dialog";
import { PrintPreviewModal } from "@/components/shared/print-preview-modal";
import { ExportManager, type ExportFormat } from "@/lib/export-manager";
import { Upload } from "lucide-react";
import {
  Table, Shield, Tag, CheckSquare, Crosshair,
  Scissors, Globe, SortAsc, SortDesc, Split,
  Lock, Play, Square, Calculator,
  Columns, Rows,
  FileCode, ClipboardPaste, Copy as CopyIcon,
  Circle, Settings,
} from "lucide-react";
import ChartWizard from "./chart-wizard";
import ChartRenderer from "./chart-renderer";
import type { ChartData } from "./chart-renderer";
import { exportChartAsPng, exportChartAsSvg } from "./chart-export-utils";

// ─── Constants ─────────────────────────────────────────────────────────────
const DEFAULT_ROWS = 50;
const DEFAULT_COLS = 26;
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 24;
const HEADER_WIDTH = 48;
const HEADER_HEIGHT = 24;

// ─── Helpers ────────────────────────────────────────────────────────────────
function cellRef(col: number, row: number): string {
  return `${indexToColLetter(col)}${row + 1}`;
}

function parseCellRef(ref: string): { col: number; row: number } | null {
  const m = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  return { col: colLetterToIndex(m[1]), row: parseInt(m[2]) - 1 };
}

function createSheet(id: string, name: string): Sheet {
  return {
    id,
    name,
    cells: {},
    frozenRows: 0,
    frozenCols: 0,
    colWidths: {},
    rowHeights: {},
    conditionalFormats: [],
  };
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function formatValue(raw: string | number | undefined, format?: CellStyle["format"]): string {
  if (raw === undefined || raw === "") return "";
  const n = typeof raw === "number" ? raw : parseFloat(String(raw));
  if (!format || format === "general") return String(raw);
  if (isNaN(n)) return String(raw);
  switch (format) {
    case "number": return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case "currency": return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
    case "percentage": return (n * 100).toFixed(1) + "%";
    case "date": {
      const d = new Date(n * 86400000 - 2209161600000);
      return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString();
    }
    default: return String(raw);
  }
}

// ─── SpreadsheetEditor ──────────────────────────────────────────────────────
export default function SpreadsheetEditor() {
  const [sheets, setSheets] = useState<Sheet[]>([createSheet("s1", "Sheet1")]);
  const [activeSheetId, setActiveSheetId] = useState("s1");
  const [selectedCell, setSelectedCell] = useState("A1");
  const [selStart, setSelStart] = useState<string | null>(null);
  const [selEnd, setSelEnd] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showChartWizard, setShowChartWizard] = useState(false);
  const [editingChartId, setEditingChartId] = useState<string | null>(null);
  const [chartWizardRange, setChartWizardRange] = useState("");
  const [showCondFmt, setShowCondFmt] = useState(false);
  const [condFmtCondition, setCondFmtCondition] = useState<"gt"|"lt"|"eq"|"gte"|"lte">("gt");
  const [condFmtValue, setCondFmtValue] = useState("0");
  const [condFmtColor, setCondFmtColor] = useState("#ffcccc");
  const [renamingSheet, setRenamingSheet] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(DEFAULT_COL_WIDTH);
  const [zoom, setZoom] = useState(100);

  // ─── New Feature State ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"home"|"insert"|"formulas"|"data"|"review"|"view"|"pageLayout">("home");
  // Pivot table
  const [showPivotModal, setShowPivotModal] = useState(false);
  const [pivotRowField, setPivotRowField] = useState("");
  const [pivotColField, setPivotColField] = useState("");
  const [pivotValueField, setPivotValueField] = useState("");
  const [pivotAgg, setPivotAgg] = useState<"SUM"|"COUNT"|"AVERAGE"|"MAX"|"MIN">("SUM");
  // Data validation
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationType, setValidationType] = useState<"list"|"number"|"date"|"custom">("list");
  const [validationList, setValidationList] = useState("");
  const [validationMin, setValidationMin] = useState("");
  const [validationMax, setValidationMax] = useState("");
  const [validationFormula, setValidationFormula] = useState("");
  const [dataValidations, setDataValidations] = useState<Record<string, { type: string; listItems?: string; min?: string; max?: string; formula?: string }>>({});
  // Named ranges
  const [showNamedRangesModal, setShowNamedRangesModal] = useState(false);
  const [namedRanges, setNamedRanges] = useState<Record<string, string>>({});
  const [newRangeName, setNewRangeName] = useState("");
  const [newRangeRef, setNewRangeRef] = useState("");
  // Freeze panes
  const [showFreezePanesModal, setShowFreezePanesModal] = useState(false);
  const [freezeCustomRows, setFreezeCustomRows] = useState("1");
  const [freezeCustomCols, setFreezeCustomCols] = useState("0");
  // Goal seek
  const [showGoalSeekModal, setShowGoalSeekModal] = useState(false);
  const [gsTargetCell, setGsTargetCell] = useState("");
  const [gsTargetValue, setGsTargetValue] = useState("");
  const [gsInputCell, setGsInputCell] = useState("");
  const [gsResult, setGsResult] = useState<string | null>(null);
  // Sheet protection
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [protectionPassword, setProtectionPassword] = useState("");
  const [protectionInput, setProtectionInput] = useState("");
  // Context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; ref: string } | null>(null);
  // Custom number format
  const [showCustomFormatModal, setShowCustomFormatModal] = useState(false);
  const [customFormatInput, setCustomFormatInput] = useState("");
  // Print area
  const [showPrintAreaModal, setShowPrintAreaModal] = useState(false);
  const [printArea, setPrintAreaState] = useState("");
  // VLOOKUP helper
  const [showVlookupHelper, setShowVlookupHelper] = useState(false);
  const [vlLookupValue, setVlLookupValue] = useState("");
  const [vlTableArray, setVlTableArray] = useState("");
  const [vlColIndex, setVlColIndex] = useState("2");
  const [vlExact, setVlExact] = useState(true);
  const [vlUseXlookup, setVlUseXlookup] = useState(false);
  // Split view
  const [splitView, setSplitView] = useState(false);
  const [splitDirection, setSplitDirection] = useState<"horizontal"|"vertical">("horizontal");
  // Data import (Power Query style)
  const [showDataImportModal, setShowDataImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  // Macros
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [isRecordingMacro, setIsRecordingMacro] = useState(false);
  const [macroActions, setMacroActions] = useState<{ cell: string; value: string }[]>([]);
  const [savedMacros, setSavedMacros] = useState<{ name: string; actions: { cell: string; value: string }[] }[]>([]);
  const [macroName, setMacroName] = useState("");
  // Clipboard (for cut/copy/paste)
  const [clipboardCells, setClipboardCells] = useState<Record<string, { value: string; formula?: string; style?: CellStyle }>>({});
  const [clipboardOrigin, setClipboardOrigin] = useState<{ start: string; end: string } | null>(null);
  const [cutMode, setCutMode] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);

  const activeSheet = useMemo(
    () => sheets.find((s) => s.id === activeSheetId) ?? sheets[0],
    [sheets, activeSheetId]
  );

  // ─── Recalculate ───────────────────────────────────────────────────────
  const recalculate = useCallback(
    (cells: Record<string, Cell>): Record<string, Cell> => {
      const next = { ...cells };
      const getter = (ref: string): string | number => {
        const c = next[ref.toUpperCase()];
        if (!c) return "";
        if (c.formula) return c.computed ?? "";
        return c.value ?? "";
      };
      for (let pass = 0; pass < 4; pass++) {
        for (const [ref, cell] of Object.entries(next)) {
          if (cell.formula) {
            const result = evaluateFormula(cell.formula, getter);
            next[ref] = { ...cell, computed: result };
          }
        }
      }
      return next;
    },
    []
  );

  // ─── Update Cell ───────────────────────────────────────────────────────
  const updateCell = useCallback(
    (ref: string, value: string) => {
      setSheets((prev) =>
        prev.map((sheet) => {
          if (sheet.id !== activeSheetId) return sheet;
          const upper = ref.toUpperCase();
          const isFormula = value.startsWith("=");
          const updated: Record<string, Cell> = {
            ...sheet.cells,
            [upper]: {
              ...(sheet.cells[upper] ?? {}),
              value: isFormula ? "" : value,
              formula: isFormula ? value : undefined,
              computed: undefined,
            },
          };
          return { ...sheet, cells: recalculate(updated) };
        })
      );
    },
    [activeSheetId, recalculate]
  );

  // ─── Update Style ──────────────────────────────────────────────────────
  const updateStyle = useCallback(
    (refs: string[], update: Partial<CellStyle>) => {
      setSheets((prev) =>
        prev.map((sheet) => {
          if (sheet.id !== activeSheetId) return sheet;
          const updated = { ...sheet.cells };
          for (const ref of refs) {
            const upper = ref.toUpperCase();
            updated[upper] = {
              ...(updated[upper] ?? { value: "" }),
              style: { ...(updated[upper]?.style ?? {}), ...update },
            };
          }
          return { ...sheet, cells: updated };
        })
      );
    },
    [activeSheetId]
  );

  // ─── Selection ─────────────────────────────────────────────────────────
  const selectedRefs = useMemo((): string[] => {
    if (!selStart || !selEnd) return [selectedCell];
    const s = parseCellRef(selStart);
    const e = parseCellRef(selEnd);
    if (!s || !e) return [selectedCell];
    const minC = Math.min(s.col, e.col);
    const maxC = Math.max(s.col, e.col);
    const minR = Math.min(s.row, e.row);
    const maxR = Math.max(s.row, e.row);
    const refs: string[] = [];
    for (let r = minR; r <= maxR; r++)
      for (let c = minC; c <= maxC; c++) refs.push(cellRef(c, r));
    return refs;
  }, [selectedCell, selStart, selEnd]);

  const isSelected = useCallback(
    (ref: string): boolean => selectedRefs.includes(ref.toUpperCase()),
    [selectedRefs]
  );

  const isPrimarySelected = useCallback(
    (ref: string): boolean => ref.toUpperCase() === selectedCell.toUpperCase(),
    [selectedCell]
  );

  // ─── Status Bar Stats ──────────────────────────────────────────────────
  const statusStats = useMemo(() => {
    const vals = selectedRefs
      .map((r) => {
        const c = activeSheet.cells[r];
        if (!c) return NaN;
        const raw = c.formula ? c.computed : c.value;
        return typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
      })
      .filter((n) => !isNaN(n));
    const count = selectedRefs.filter((r) => {
      const c = activeSheet.cells[r];
      return c && (c.value || c.formula);
    }).length;
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = vals.length ? sum / vals.length : 0;
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 0;
    return { sum, avg, count, numCount: vals.length, min, max };
  }, [selectedRefs, activeSheet.cells]);

  // ─── Cell display value ────────────────────────────────────────────────
  const getCellDisplay = useCallback(
    (ref: string): string => {
      const c = activeSheet.cells[ref.toUpperCase()];
      if (!c) return "";
      const raw = c.formula ? c.computed : c.value;
      return formatValue(raw, c.style?.format);
    },
    [activeSheet.cells]
  );

  const getCellRaw = useCallback(
    (ref: string): string => {
      const c = activeSheet.cells[ref.toUpperCase()];
      if (!c) return "";
      return c.formula ?? c.value ?? "";
    },
    [activeSheet.cells]
  );

  // ─── Editing ───────────────────────────────────────────────────────────
  const startEdit = useCallback(
    (ref: string, initialChar?: string) => {
      const raw = getCellRaw(ref);
      setEditingCell(ref.toUpperCase());
      setEditValue(initialChar !== undefined ? initialChar : raw);
    },
    [getCellRaw]
  );

  const commitEdit = useCallback(() => {
    if (editingCell) {
      updateCell(editingCell, editValue);
      setEditingCell(null);
    }
  }, [editingCell, editValue, updateCell]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue("");
  }, []);

  const navigate = useCallback(
    (dir: "up" | "down" | "left" | "right", commit = true) => {
      if (commit) commitEdit();
      const parsed = parseCellRef(selectedCell);
      if (!parsed) return;
      let { col, row } = parsed;
      const numCols = DEFAULT_COLS + (activeSheet.colWidths ? 0 : 0);
      const numRows = DEFAULT_ROWS;
      if (dir === "up") row = Math.max(0, row - 1);
      if (dir === "down") row = Math.min(numRows - 1, row + 1);
      if (dir === "left") col = Math.max(0, col - 1);
      if (dir === "right") col = Math.min(numCols - 1, col + 1);
      const next = cellRef(col, row);
      setSelectedCell(next);
      setSelStart(null);
      setSelEnd(null);
    },
    [selectedCell, commitEdit, activeSheet.colWidths]
  );

  // ─── Keyboard handlers ─────────────────────────────────────────────────
  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") { e.preventDefault(); commitEdit(); navigate("down", false); }
      else if (e.key === "Tab") { e.preventDefault(); commitEdit(); navigate("right", false); }
      else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
    },
    [commitEdit, cancelEdit, navigate]
  );

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (editingCell) return;
      const nav = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" } as const;
      if (e.key in nav) { e.preventDefault(); navigate(nav[e.key as keyof typeof nav]); return; }
      if (e.key === "F2") { e.preventDefault(); startEdit(selectedCell); return; }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        selectedRefs.forEach((r) => updateCell(r, ""));
        return;
      }
      // Ctrl shortcuts handled by window listeners set in effects below
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "x" || e.key === "v")) {
        e.preventDefault(); return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        startEdit(selectedCell, e.key);
      }
    },
    [editingCell, selectedCell, selectedRefs, navigate, startEdit, updateCell]
  );

  // Ctrl+Shift+Enter in cell editor for array formulas
  const handleCellKeyDownEnhanced = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && e.ctrlKey && e.shiftKey) { e.preventDefault(); commitArrayFormula(); return; }
      if (e.key === "Enter") { e.preventDefault(); commitEdit(); navigate("down", false); }
      else if (e.key === "Tab") { e.preventDefault(); commitEdit(); navigate("right", false); }
      else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commitEdit, cancelEdit, navigate]
  );

  // ─── Mouse handlers ────────────────────────────────────────────────────
  const handleCellMouseDown = useCallback(
    (ref: string, e: React.MouseEvent) => {
      e.preventDefault();
      if (editingCell) commitEdit();
      if (e.shiftKey && selectedCell) {
        setSelStart(selectedCell);
        setSelEnd(ref.toUpperCase());
      } else {
        setSelectedCell(ref.toUpperCase());
        setSelStart(ref.toUpperCase());
        setSelEnd(null);
        setIsDragging(true);
        setDragStart(ref.toUpperCase());
      }
    },
    [editingCell, selectedCell, commitEdit]
  );

  const handleCellMouseEnter = useCallback(
    (ref: string) => {
      if (isDragging && dragStart) {
        setSelStart(dragStart);
        setSelEnd(ref.toUpperCase());
      }
    },
    [isDragging, dragStart]
  );

  const handleCellDoubleClick = useCallback(
    (ref: string) => {
      startEdit(ref.toUpperCase());
    },
    [startEdit]
  );

  useEffect(() => {
    const up = () => setIsDragging(false);
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  // ─── Formula bar ────────────────────────────────────────────────────────
  const formulaBarValue = editingCell === selectedCell
    ? editValue
    : getCellRaw(selectedCell);

  const handleFormulaBarChange = (v: string) => {
    setEditingCell(selectedCell);
    setEditValue(v);
  };

  const handleFormulaBarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { commitEdit(); }
    else if (e.key === "Escape") { cancelEdit(); }
  };

  // ─── Toolbar actions ────────────────────────────────────────────────────
  const toggleStyle = (prop: keyof CellStyle, value: unknown) => {
    const first = activeSheet.cells[selectedRefs[0]]?.style;
    const current = first?.[prop as keyof CellStyle];
    updateStyle(selectedRefs, { [prop]: current === value ? undefined : value });
  };

  const primaryCell = activeSheet.cells[selectedCell];
  const primaryStyle = primaryCell?.style ?? {};

  // ─── Sheet management ──────────────────────────────────────────────────
  const addSheet = () => {
    const id = generateId();
    const n = sheets.length + 1;
    setSheets((prev) => [...prev, createSheet(id, `Sheet${n}`)]);
    setActiveSheetId(id);
  };

  const deleteSheet = (id: string) => {
    if (sheets.length <= 1) return;
    setSheets((prev) => prev.filter((s) => s.id !== id));
    if (activeSheetId === id) setActiveSheetId(sheets.find((s) => s.id !== id)!.id);
  };

  const renameSheet = (id: string, name: string) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  };

  // ─── Load template ─────────────────────────────────────────────────────
  const loadTemplate = (idx: number) => {
    const tmpl = TEMPLATES[idx];
    const newSheets: Sheet[] = tmpl.sheets.map((s, i) => ({
      ...s,
      id: i === 0 ? "s1" : generateId(),
      cells: recalculate(s.cells),
    }));
    setSheets(newSheets);
    setActiveSheetId(newSheets[0].id);
    setSelectedCell("A1");
    setSelStart(null);
    setSelEnd(null);
    setCharts([]);
    setShowTemplates(false);
  };

  // ─── Chart ─────────────────────────────────────────────────────────────
  const getChartData = useCallback(
    (range: string): ChartData[] => {
      const m = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
      if (!m) return [];
      const c1 = colLetterToIndex(m[1]);
      const r1 = parseInt(m[2]);
      const c2 = colLetterToIndex(m[3]);
      const r2 = parseInt(m[4]);
      // Row r1 is treated as headers (for data keys), data rows start at r1+1
      const headerRow = r1;
      const data: ChartData[] = [];
      for (let r = headerRow + 1; r <= r2; r++) {
        const row: ChartData = {
          name: String(getCellDisplay(cellRef(c1, r - 1))),
          value: 0,
        };
        for (let c = c1 + 1; c <= c2; c++) {
          const header = getCellDisplay(cellRef(c, headerRow - 1)) || indexToColLetter(c);
          const val = parseFloat(getCellDisplay(cellRef(c, r - 1))) || 0;
          row[header] = val;
          if (c === c1 + 1) row.value = val;
        }
        data.push(row);
      }
      return data;
    },
    [getCellDisplay]
  );

  const getChartDataKeys = useCallback(
    (range: string): string[] => {
      const m = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
      if (!m) return [];
      const c1 = colLetterToIndex(m[1]);
      const r1 = parseInt(m[2]);
      const c2 = colLetterToIndex(m[3]);
      const keys: string[] = [];
      for (let c = c1 + 1; c <= c2; c++) {
        keys.push(getCellDisplay(cellRef(c, r1 - 1)) || indexToColLetter(c));
      }
      return keys;
    },
    [getCellDisplay]
  );

  const handleChartInsert = useCallback((config: ChartConfig) => {
    if (editingChartId) {
      setCharts(prev => prev.map(c => c.id === editingChartId ? { ...config, id: editingChartId } : c));
      setEditingChartId(null);
    } else {
      const id = generateId();
      setCharts(prev => [...prev, { ...config, id }]);
    }
    setShowChartWizard(false);
  }, [editingChartId]);

  const openChartWizard = useCallback((editId?: string) => {
    if (editId) {
      setEditingChartId(editId);
    } else {
      setEditingChartId(null);
      setChartWizardRange(selStart && selEnd ? `${selStart}:${selEnd}` : selectedCell);
    }
    setShowChartWizard(true);
  }, [selStart, selEnd, selectedCell]);

  const moveChart = useCallback(
    (id: string, dx: number, dy: number) => {
      setCharts((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, position: { ...c.position, x: c.position.x + dx, y: c.position.y + dy } }
            : c
        )
      );
    },
    []
  );

  // ─── Export/Import State ──────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ percent: 0, message: "" });
  const [showImport, setShowImport] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const getSheetRows = useCallback((sheet: Sheet): string[][] => {
    const keys = Object.keys(sheet.cells);
    if (keys.length === 0) return [[""]];
    let maxRow = 0, maxCol = 0;
    keys.forEach((key) => {
      const m = key.match(/^([A-Z]+)(\d+)$/);
      if (m) {
        const c = colLetterToIndex(m[1]);
        const r = parseInt(m[2], 10) - 1;
        if (c > maxCol) maxCol = c;
        if (r > maxRow) maxRow = r;
      }
    });
    const rows: string[][] = [];
    for (let r = 0; r <= maxRow; r++) {
      const row: string[] = [];
      for (let c = 0; c <= maxCol; c++) {
        const ref = cellRef(c, r);
        row.push(getCellDisplay(ref));
      }
      rows.push(row);
    }
    return rows;
  }, [getCellDisplay]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const sheetData = sheets.map((s) => ({ name: s.name, rows: getSheetRows(s) }));
      if (format === "csv" || format === "json") {
        await ExportManager.exportSpreadsheet(format, sheetData, activeSheet.name, setExportProgress);
      } else {
        await ExportManager.batchExportSpreadsheet(sheetData, format, activeSheet.name, setExportProgress);
      }
    } finally {
      setTimeout(() => setIsExporting(false), 1500);
    }
  }, [sheets, activeSheet.name, getSheetRows]);

  const handleSpreadsheetPrint = useCallback(() => {
    const sheetData = { name: activeSheet.name, rows: getSheetRows(activeSheet) };
    ExportManager.exportSpreadsheet("pdf", [sheetData], activeSheet.name);
  }, [activeSheet, getSheetRows]);

  const handleSpreadsheetImport = useCallback(async (file: File) => {
    const result = await ExportManager.importSpreadsheet(file, setExportProgress);
    setSheets((prev) => {
      const updated = prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const newCells: Record<string, Cell> = {};
        result.rows.forEach((row, ri) => {
          row.forEach((val, ci) => {
            if (val) {
              const ref = cellRef(ci, ri);
              newCells[ref] = { value: val };
            }
          });
        });
        return { ...sheet, cells: newCells };
      });
      return updated;
    });
  }, [activeSheetId]);

  const getSpreadsheetPreviewHtml = useCallback(() => {
    const rows = getSheetRows(activeSheet);
    let html = `<table style="border-collapse:collapse;width:100%;font-family:Calibri,sans-serif;font-size:12px">`;
    rows.forEach((row, ri) => {
      html += "<tr>";
      row.forEach((val) => {
        const tag = ri === 0 ? "th" : "td";
        html += `<${tag} style="border:1px solid #ccc;padding:6px 10px;text-align:left;${ri === 0 ? "background:#f0f0f0;font-weight:600" : ""}">${val}</${tag}>`;
      });
      html += "</tr>";
    });
    html += "</table>";
    return html;
  }, [activeSheet, getSheetRows]);

  // Keep old functions for backward compat
  const exportCSV = () => handleExport("csv");
  const printPDF = () => handleSpreadsheetPrint();

  // ─── AI Panel ──────────────────────────────────────────────────────────
  const sendAiMessage = async (msg?: string) => {
    const text = msg ?? aiInput.trim();
    if (!text) return;
    setAiMessages((prev) => [...prev, { role: "user", content: text }]);
    setAiInput("");
    setAiLoading(true);

    // Build context of selected cells
    const context = selectedRefs
      .slice(0, 20)
      .map((r) => `${r}: ${getCellRaw(r)}`)
      .join(", ");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a spreadsheet expert assistant. Current selected cells: ${context}. Active sheet: ${activeSheet.name}. Help with formulas, data analysis, and Excel-like operations. When generating data to insert, format it as a JSON array of objects with column keys matching the spreadsheet columns.`,
          messages: [
            ...aiMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
          max_tokens: 1024,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? data.error ?? "No response";
      setAiMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI service." },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const aiQuickAction = (action: string) => {
    const msgs: Record<string, string> = {
      explain: `Explain the formula in cell ${selectedCell}: "${getCellRaw(selectedCell)}"`,
      chart: `Based on the data in range ${selStart && selEnd ? `${selStart}:${selEnd}` : "A1:B10"}, suggest the best chart type and explain why.`,
      data: `Generate realistic sample data for a ${activeSheet.name} spreadsheet. Provide 10 rows with appropriate headers.`,
      pivot: `Summarize the data in cells ${selectedRefs.slice(0, 5).join(", ")} and suggest a pivot table structure.`,
    };
    sendAiMessage(msgs[action]);
  };

  // ─── Conditional formatting check ──────────────────────────────────────
  const getCondFmtStyle = useCallback(
    (ref: string): React.CSSProperties => {
      const num = parseFloat(getCellDisplay(ref));
      if (isNaN(num)) return {};
      for (const rule of activeSheet.conditionalFormats) {
        let match = false;
        if (rule.condition === "gt" && num > rule.value) match = true;
        if (rule.condition === "lt" && num < rule.value) match = true;
        if (rule.condition === "eq" && num === rule.value) match = true;
        if (rule.condition === "gte" && num >= rule.value) match = true;
        if (rule.condition === "lte" && num <= rule.value) match = true;
        if (match)
          return {
            backgroundColor: rule.bgColor,
            color: rule.textColor ?? undefined,
          };
      }
      return {};
    },
    [getCellDisplay, activeSheet.conditionalFormats]
  );

  // ─── Merge cells ────────────────────────────────────────────────────────
  const mergeCells = () => {
    if (selectedRefs.length < 2) return;
    const first = selectedRefs[0];
    const parsed = parseCellRef(first);
    if (!parsed) return;
    const s = parseCellRef(selStart ?? first);
    const e = parseCellRef(selEnd ?? first);
    if (!s || !e) return;
    const rows = Math.abs(e.row - s.row) + 1;
    const cols = Math.abs(e.col - s.col) + 1;
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const updated = { ...sheet.cells };
        for (const ref of selectedRefs) {
          const u = ref.toUpperCase();
          if (u === first.toUpperCase()) {
            updated[u] = { ...(updated[u] ?? { value: "" }), mergeSpan: { rows, cols } };
          } else {
            updated[u] = { ...(updated[u] ?? { value: "" }), mergeParent: first.toUpperCase() };
          }
        }
        return { ...sheet, cells: updated };
      })
    );
  };

  const freezeTopRow = () => {
    setSheets((prev) =>
      prev.map((s) =>
        s.id === activeSheetId ? { ...s, frozenRows: s.frozenRows > 0 ? 0 : 1 } : s
      )
    );
  };

  // ─── Column resize ─────────────────────────────────────────────────────
  const startColResize = (col: number, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingCol(col);
    setResizeStartX(e.clientX);
    setResizeStartWidth(activeSheet.colWidths[col] ?? DEFAULT_COL_WIDTH);
  };

  useEffect(() => {
    if (resizingCol === null) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStartX;
      const newWidth = Math.max(30, resizeStartWidth + dx);
      setSheets((prev) =>
        prev.map((s) =>
          s.id === activeSheetId
            ? { ...s, colWidths: { ...s.colWidths, [resizingCol]: newWidth } }
            : s
        )
      );
    };
    const onUp = () => setResizingCol(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizingCol, resizeStartX, resizeStartWidth, activeSheetId]);

  // ─── Add conditional format ────────────────────────────────────────────
  const addCondFmt = () => {
    const id = generateId();
    setSheets((prev) =>
      prev.map((s) =>
        s.id !== activeSheetId
          ? s
          : {
              ...s,
              conditionalFormats: [
                ...s.conditionalFormats,
                {
                  id,
                  condition: condFmtCondition,
                  value: parseFloat(condFmtValue) || 0,
                  bgColor: condFmtColor,
                },
              ],
            }
      )
    );
    setShowCondFmt(false);
  };

  // ─── Copy / Cut / Paste ────────────────────────────────────────────────
  const copySelection = useCallback((cut = false) => {
    const cells: Record<string, { value: string; formula?: string; style?: CellStyle }> = {};
    for (const ref of selectedRefs) {
      const c = activeSheet.cells[ref];
      if (c) cells[ref] = { value: c.value ?? "", formula: c.formula, style: c.style };
    }
    setClipboardCells(cells);
    setClipboardOrigin(selStart && selEnd ? { start: selStart, end: selEnd } : null);
    setCutMode(cut);
  }, [selectedRefs, activeSheet.cells, selStart, selEnd]);

  const pasteSelection = useCallback(() => {
    if (!Object.keys(clipboardCells).length) return;
    const refs = Object.keys(clipboardCells);
    const origins = refs.map((r) => parseCellRef(r)).filter(Boolean) as { col: number; row: number }[];
    if (!origins.length) return;
    const minOC = Math.min(...origins.map((o) => o.col));
    const minOR = Math.min(...origins.map((o) => o.row));
    const target = parseCellRef(selectedCell);
    if (!target) return;
    const dc = target.col - minOC;
    const dr = target.row - minOR;
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        let updated = { ...sheet.cells };
        for (const [ref, cell] of Object.entries(clipboardCells)) {
          const parsed = parseCellRef(ref);
          if (!parsed) continue;
          const newRef = cellRef(parsed.col + dc, parsed.row + dr).toUpperCase();
          updated[newRef] = { value: cell.value, formula: cell.formula, style: cell.style };
        }
        if (cutMode) {
          for (const ref of Object.keys(clipboardCells)) {
            updated[ref] = { value: "" };
          }
        }
        return { ...sheet, cells: recalculate(updated) };
      })
    );
    if (cutMode) { setClipboardCells({}); setCutMode(false); }
  }, [clipboardCells, selectedCell, activeSheetId, cutMode, recalculate]);

  // Keyboard shortcuts (copy/paste) using effects, after the functions are defined
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!document.activeElement?.closest("[data-spreadsheet]")) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "c") { e.preventDefault(); copySelection(false); }
        if (e.key === "x") { e.preventDefault(); copySelection(true); }
        if (e.key === "v") { e.preventDefault(); pasteSelection(); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [copySelection, pasteSelection]);

  // ─── Insert / Delete Rows & Cols ───────────────────────────────────────
  const insertRow = useCallback(() => {
    const parsed = parseCellRef(selectedCell);
    if (!parsed) return;
    const row = parsed.row;
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const updated: Record<string, Cell> = {};
        for (const [ref, cell] of Object.entries(sheet.cells)) {
          const p = parseCellRef(ref);
          if (!p) continue;
          if (p.row >= row) {
            updated[cellRef(p.col, p.row + 1).toUpperCase()] = cell;
          } else {
            updated[ref] = cell;
          }
        }
        return { ...sheet, cells: updated };
      })
    );
  }, [selectedCell, activeSheetId]);

  const deleteRow = useCallback(() => {
    const parsed = parseCellRef(selectedCell);
    if (!parsed) return;
    const row = parsed.row;
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const updated: Record<string, Cell> = {};
        for (const [ref, cell] of Object.entries(sheet.cells)) {
          const p = parseCellRef(ref);
          if (!p || p.row === row) continue;
          if (p.row > row) {
            updated[cellRef(p.col, p.row - 1).toUpperCase()] = cell;
          } else {
            updated[ref] = cell;
          }
        }
        return { ...sheet, cells: updated };
      })
    );
  }, [selectedCell, activeSheetId]);

  const insertColumn = useCallback(() => {
    const parsed = parseCellRef(selectedCell);
    if (!parsed) return;
    const col = parsed.col;
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const updated: Record<string, Cell> = {};
        for (const [ref, cell] of Object.entries(sheet.cells)) {
          const p = parseCellRef(ref);
          if (!p) continue;
          if (p.col >= col) {
            updated[cellRef(p.col + 1, p.row).toUpperCase()] = cell;
          } else {
            updated[ref] = cell;
          }
        }
        return { ...sheet, cells: updated };
      })
    );
  }, [selectedCell, activeSheetId]);

  const deleteColumn = useCallback(() => {
    const parsed = parseCellRef(selectedCell);
    if (!parsed) return;
    const col = parsed.col;
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const updated: Record<string, Cell> = {};
        for (const [ref, cell] of Object.entries(sheet.cells)) {
          const p = parseCellRef(ref);
          if (!p || p.col === col) continue;
          if (p.col > col) {
            updated[cellRef(p.col - 1, p.row).toUpperCase()] = cell;
          } else {
            updated[ref] = cell;
          }
        }
        return { ...sheet, cells: updated };
      })
    );
  }, [selectedCell, activeSheetId]);

  // ─── Sort ──────────────────────────────────────────────────────────────
  const sortBySelectedColumn = useCallback((asc: boolean) => {
    if (!selStart || !selEnd) return;
    const s = parseCellRef(selStart);
    const e = parseCellRef(selEnd);
    if (!s || !e) return;
    const minR = Math.min(s.row, e.row);
    const maxR = Math.max(s.row, e.row);
    const col = s.col;
    const rows: { rowIdx: number; cells: Record<number, Cell> }[] = [];
    const minC = Math.min(s.col, e.col);
    const maxC = Math.max(s.col, e.col);
    for (let r = minR; r <= maxR; r++) {
      const rowCells: Record<number, Cell> = {};
      for (let c = minC; c <= maxC; c++) {
        rowCells[c] = activeSheet.cells[cellRef(c, r)] ?? { value: "" };
      }
      rows.push({ rowIdx: r, cells: rowCells });
    }
    rows.sort((a, b) => {
      const va = a.cells[col]?.value ?? "";
      const vb = b.cells[col]?.value ?? "";
      const na = parseFloat(va), nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) return asc ? na - nb : nb - na;
      return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const updated = { ...sheet.cells };
        rows.forEach((row, i) => {
          for (let c = minC; c <= maxC; c++) {
            updated[cellRef(c, minR + i).toUpperCase()] = row.cells[c] ?? { value: "" };
          }
        });
        return { ...sheet, cells: updated };
      })
    );
  }, [selStart, selEnd, activeSheet.cells, activeSheetId]);

  // ─── Data Validation ───────────────────────────────────────────────────
  const applyDataValidation = useCallback(() => {
    const rule = { type: validationType, listItems: validationList, min: validationMin, max: validationMax, formula: validationFormula };
    const newV = { ...dataValidations };
    for (const ref of selectedRefs) newV[ref.toUpperCase()] = rule;
    setDataValidations(newV);
    setShowValidationModal(false);
  }, [validationType, validationList, validationMin, validationMax, validationFormula, selectedRefs, dataValidations]);

  const getValidationForCell = useCallback((ref: string) => {
    return dataValidations[ref.toUpperCase()] ?? null;
  }, [dataValidations]);

  const validateCellInput = useCallback((ref: string, value: string): boolean => {
    const rule = getValidationForCell(ref);
    if (!rule) return true;
    if (rule.type === "list" && rule.listItems) {
      const items = rule.listItems.split(",").map((s) => s.trim());
      return items.includes(value.trim());
    }
    if (rule.type === "number") {
      const n = parseFloat(value);
      if (isNaN(n)) return false;
      if (rule.min && n < parseFloat(rule.min)) return false;
      if (rule.max && n > parseFloat(rule.max)) return false;
    }
    return true;
  }, [getValidationForCell]);

  // ─── Named Ranges ──────────────────────────────────────────────────────
  const addNamedRange = useCallback(() => {
    if (!newRangeName.trim() || !newRangeRef.trim()) return;
    setNamedRanges((prev) => ({ ...prev, [newRangeName.trim().toUpperCase()]: newRangeRef.trim().toUpperCase() }));
    setNewRangeName(""); setNewRangeRef("");
  }, [newRangeName, newRangeRef]);

  const deleteNamedRange = useCallback((name: string) => {
    setNamedRanges((prev) => { const n = { ...prev }; delete n[name]; return n; });
  }, []);

  // ─── Goal Seek ─────────────────────────────────────────────────────────
  const runGoalSeek = useCallback(() => {
    const target = parseCellRef(gsTargetCell);
    const input = parseCellRef(gsInputCell);
    if (!target || !input) { setGsResult("Invalid cell references"); return; }
    const targetVal = parseFloat(gsTargetValue);
    if (isNaN(targetVal)) { setGsResult("Invalid target value"); return; }
    // Newton's method approximation
    let x = parseFloat(activeSheet.cells[gsInputCell.toUpperCase()]?.value ?? "0") || 0;
    for (let i = 0; i < 100; i++) {
      const testCells = {
        ...activeSheet.cells,
        [gsInputCell.toUpperCase()]: { value: String(x) },
      };
      const result = recalculate(testCells);
      const fx = parseFloat(String(result[gsTargetCell.toUpperCase()]?.computed ?? result[gsTargetCell.toUpperCase()]?.value ?? "0")) - targetVal;
      if (Math.abs(fx) < 0.0001) break;
      const dx = 0.001 * (Math.abs(x) + 1);
      const testCells2 = { ...activeSheet.cells, [gsInputCell.toUpperCase()]: { value: String(x + dx) } };
      const result2 = recalculate(testCells2);
      const fx2 = parseFloat(String(result2[gsTargetCell.toUpperCase()]?.computed ?? result2[gsTargetCell.toUpperCase()]?.value ?? "0")) - targetVal;
      const deriv = (fx2 - fx) / dx;
      if (Math.abs(deriv) < 1e-10) break;
      x = x - fx / deriv;
    }
    setGsResult(x.toFixed(6));
  }, [gsTargetCell, gsInputCell, gsTargetValue, activeSheet.cells, recalculate]);

  const applyGoalSeekResult = useCallback(() => {
    if (!gsResult || !gsInputCell) return;
    updateCell(gsInputCell.toUpperCase(), gsResult);
    setShowGoalSeekModal(false);
    setGsResult(null);
  }, [gsResult, gsInputCell, updateCell]);

  // ─── Sheet Protection ──────────────────────────────────────────────────
  const toggleProtection = useCallback(() => {
    if (isProtected) {
      if (protectionInput !== protectionPassword) { alert("Incorrect password"); return; }
      setIsProtected(false); setProtectionInput("");
    } else {
      setIsProtected(true);
      setProtectionPassword(protectionInput || "");
      setProtectionInput("");
    }
    setShowProtectionModal(false);
  }, [isProtected, protectionPassword, protectionInput]);

  // ─── Array Formulas (Ctrl+Shift+Enter) ────────────────────────────────
  const commitArrayFormula = useCallback(() => {
    if (editingCell && editValue.startsWith("=")) {
      updateCell(editingCell, `{${editValue}}`);
      setEditingCell(null);
    }
  }, [editingCell, editValue, updateCell]);

  // ─── VLOOKUP Helper ────────────────────────────────────────────────────
  const buildVlookupFormula = useCallback(() => {
    if (vlUseXlookup) {
      return `=XLOOKUP(${vlLookupValue},${vlTableArray ? vlTableArray.split(":")[0] + ":" + vlTableArray.split(":")[0] : "A:A"},${vlTableArray || "A:B"})`;
    }
    return `=VLOOKUP(${vlLookupValue},${vlTableArray},${vlColIndex},${vlExact ? "FALSE" : "TRUE"})`;
  }, [vlLookupValue, vlTableArray, vlColIndex, vlExact, vlUseXlookup]);

  const insertVlookup = useCallback(() => {
    const formula = buildVlookupFormula();
    updateCell(selectedCell, formula);
    setShowVlookupHelper(false);
  }, [buildVlookupFormula, selectedCell, updateCell]);

  // ─── Macros ────────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    setMacroActions([]);
    setIsRecordingMacro(true);
    setShowMacroModal(false);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecordingMacro(false);
    setShowMacroModal(true);
  }, []);

  const saveMacro = useCallback(() => {
    if (!macroName.trim() || !macroActions.length) return;
    setSavedMacros((prev) => [...prev, { name: macroName.trim(), actions: macroActions }]);
    setMacroName(""); setMacroActions([]); setShowMacroModal(false);
  }, [macroName, macroActions]);

  const playMacro = useCallback((macro: { name: string; actions: { cell: string; value: string }[] }) => {
    macro.actions.forEach(({ cell, value }) => updateCell(cell, value));
    setShowMacroModal(false);
  }, [updateCell]);

  // Intercept updateCell to record macro actions
  const updateCellWithMacro = useCallback((ref: string, value: string) => {
    if (isRecordingMacro) {
      setMacroActions((prev) => [...prev, { cell: ref.toUpperCase(), value }]);
    }
    updateCell(ref, value);
  }, [isRecordingMacro, updateCell]);

  // ─── Power Query Data Import ───────────────────────────────────────────
  const importFromUrl = useCallback(async () => {
    if (!importUrl.trim()) return;
    setImportLoading(true);
    setImportError("");
    try {
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(importUrl)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const text = await res.text();
      let rows: string[][] = [];
      // Try JSON
      try {
        const json = JSON.parse(text);
        const arr = Array.isArray(json) ? json : json.data ?? json.results ?? json.items ?? [];
        if (arr.length > 0) {
          const keys = Object.keys(arr[0]);
          rows = [keys, ...arr.map((item: Record<string, unknown>) => keys.map((k) => String(item[k] ?? "")))];
        }
      } catch {
        // Try CSV
        rows = text.split("\n").map((line) => line.split(",").map((v) => v.trim().replace(/^"|"$/g, "")));
      }
      if (rows.length === 0) { setImportError("No data found in response"); return; }
      setSheets((prev) =>
        prev.map((sheet) => {
          if (sheet.id !== activeSheetId) return sheet;
          const newCells: Record<string, Cell> = { ...sheet.cells };
          rows.forEach((row, ri) => row.forEach((val, ci) => {
            if (val) newCells[cellRef(ci, ri).toUpperCase()] = { value: val };
          }));
          return { ...sheet, cells: newCells };
        })
      );
      setShowDataImportModal(false);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImportLoading(false);
    }
  }, [importUrl, activeSheetId]);

  // ─── Pivot Table ───────────────────────────────────────────────────────
  const buildPivotTable = useCallback(() => {
    if (!selStart || !selEnd) return;
    const s = parseCellRef(selStart);
    const e = parseCellRef(selEnd);
    if (!s || !e) return;
    const minC = Math.min(s.col, e.col);
    const maxC = Math.max(s.col, e.col);
    const minR = Math.min(s.row, e.row);
    const maxR = Math.max(s.row, e.row);
    // Header row
    const headers: Record<number, string> = {};
    for (let c = minC; c <= maxC; c++) {
      headers[c] = getCellDisplay(cellRef(c, minR));
    }
    const rowFieldIdx = Object.keys(headers).find((k) => headers[Number(k)] === pivotRowField);
    const valFieldIdx = Object.keys(headers).find((k) => headers[Number(k)] === pivotValueField);
    if (!rowFieldIdx || !valFieldIdx) { alert("Please select valid row and value fields"); return; }
    const rIdx = parseInt(rowFieldIdx), vIdx = parseInt(valFieldIdx);
    // Aggregate
    const agg: Record<string, number[]> = {};
    for (let r = minR + 1; r <= maxR; r++) {
      const rowKey = getCellDisplay(cellRef(rIdx, r));
      const val = parseFloat(getCellDisplay(cellRef(vIdx, r))) || 0;
      if (!agg[rowKey]) agg[rowKey] = [];
      agg[rowKey].push(val);
    }
    // Create pivot sheet
    const pvId = generateId();
    const pvName = `Pivot_${activeSheet.name}`;
    const pvCells: Record<string, Cell> = {
      A1: { value: pivotRowField, style: { bold: true } },
      B1: { value: `${pivotAgg}(${pivotValueField})`, style: { bold: true } },
    };
    Object.entries(agg).forEach(([key, vals], i) => {
      pvCells[`A${i + 2}`] = { value: key };
      let result = 0;
      if (pivotAgg === "SUM") result = vals.reduce((a, b) => a + b, 0);
      else if (pivotAgg === "COUNT") result = vals.length;
      else if (pivotAgg === "AVERAGE") result = vals.reduce((a, b) => a + b, 0) / vals.length;
      else if (pivotAgg === "MAX") result = Math.max(...vals);
      else if (pivotAgg === "MIN") result = Math.min(...vals);
      pvCells[`B${i + 2}`] = { value: result.toFixed(2) };
    });
    const pvSheet = { ...createSheet(pvId, pvName), cells: pvCells };
    setSheets((prev) => [...prev, pvSheet]);
    setActiveSheetId(pvId);
    setShowPivotModal(false);
  }, [selStart, selEnd, pivotRowField, pivotValueField, pivotAgg, getCellDisplay, activeSheet.name, generateId]);

  // ─── Insert Formatted Table ────────────────────────────────────────────
  const insertFormattedTable = useCallback(() => {
    const startRef = parseCellRef(selectedCell);
    if (!startRef) return;

    // Check if sheet is mostly empty (use demo data if so)
    const currentCells = activeSheet.cells;
    const hasSomeData = Object.keys(currentCells).length > 3;

    if (hasSomeData && selStart && selEnd) {
      // Apply table formatting to selection
      const s = parseCellRef(selStart);
      const e = parseCellRef(selEnd);
      if (!s || !e) return;
      const minR = Math.min(s.row, e.row);
      const maxR = Math.max(s.row, e.row);
      const minC = Math.min(s.col, e.col);
      const maxC = Math.max(s.col, e.col);
      const updates: Record<string, Cell> = { ...currentCells };
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const ref = cellRef(c, r);
          const isHeader = r === minR;
          const isEven = (r - minR) % 2 === 0;
          updates[ref] = {
            ...(currentCells[ref] ?? { value: '' }),
            style: {
              ...(currentCells[ref]?.style ?? {}),
              bold: isHeader ? true : (currentCells[ref]?.style?.bold ?? false),
              bgColor: isHeader ? '#1e40af' : isEven ? '#1e293b' : undefined,
              textColor: isHeader ? '#ffffff' : undefined,
            },
          };
        }
      }
      setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, cells: updates } : s));
    } else {
      // Insert demo table with sample data
      const headers = ['Employee Name', 'Department', 'Salary ($)', 'Start Date', 'Status'];
      const rows = [
        ['Alice Johnson', 'Engineering', '95000', '2022-01-15', 'Active'],
        ['Bob Smith', 'Marketing', '78000', '2021-06-01', 'Active'],
        ['Carol White', 'Design', '82000', '2023-03-10', 'Active'],
        ['David Brown', 'Engineering', '105000', '2020-09-20', 'Active'],
        ['Eva Davis', 'HR', '70000', '2022-11-05', 'On Leave'],
        ['Frank Miller', 'Sales', '88000', '2021-08-15', 'Active'],
        ['Grace Lee', 'Engineering', '99000', '2023-01-08', 'Active'],
      ];
      const newCells: Record<string, Cell> = { ...currentCells };
      headers.forEach((h, c) => {
        const ref = cellRef(startRef.col + c, startRef.row);
        newCells[ref] = { value: h, style: { bold: true, bgColor: '#1e40af', textColor: '#ffffff' }, formula: undefined, computed: undefined };
      });
      rows.forEach((row, ri) => {
        row.forEach((val, ci) => {
          const ref = cellRef(startRef.col + ci, startRef.row + ri + 1);
          const isEven = ri % 2 === 0;
          newCells[ref] = {
            value: val,
            style: { bgColor: isEven ? '#1e293b' : undefined },
            formula: undefined, computed: undefined,
          };
        });
      });
      setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, cells: newCells } : s));
    }
  }, [selectedCell, activeSheetId, activeSheet.cells, selStart, selEnd, setSheets]);

  // Derived headers from selection for pivot modal
  const selectionHeaders = useMemo(() => {
    if (!selStart || !selEnd) return [];
    const s = parseCellRef(selStart);
    const e = parseCellRef(selEnd);
    if (!s || !e) return [];
    const minC = Math.min(s.col, e.col);
    const maxC = Math.max(s.col, e.col);
    const minR = Math.min(s.row, e.row);
    const headers: string[] = [];
    for (let c = minC; c <= maxC; c++) {
      const h = getCellDisplay(cellRef(c, minR));
      if (h) headers.push(h);
    }
    return headers;
  }, [selStart, selEnd, getCellDisplay]);

  // ─── Chart drag ─────────────────────────────────────────────────────────
  const chartDragRef = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null);

  const startChartDrag = (id: string, e: React.MouseEvent) => {
    const ch = charts.find((c) => c.id === id);
    if (!ch) return;
    chartDragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: ch.position.x, oy: ch.position.y };
    const onMove = (ev: MouseEvent) => {
      if (!chartDragRef.current) return;
      const dx = ev.clientX - chartDragRef.current.sx;
      const dy = ev.clientY - chartDragRef.current.sy;
      moveChart(chartDragRef.current.id, dx, dy);
      chartDragRef.current = { ...chartDragRef.current, sx: ev.clientX, sy: ev.clientY };
    };
    const onUp = () => {
      chartDragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  const colCount = DEFAULT_COLS;
  const rowCount = DEFAULT_ROWS;

  const toolbarBtnStyle = (active?: boolean): React.CSSProperties => ({
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid",
    borderColor: active ? "var(--primary)" : "var(--border)",
    background: active ? "var(--primary)" : "transparent",
    color: active ? "var(--primary-foreground)" : "var(--foreground)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    whiteSpace: "nowrap" as const,
  });

  const inputStyle: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    borderRadius: "4px",
    padding: "2px 6px",
    fontSize: "12px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--background)",
        color: "var(--foreground)",
        position: "relative",
        overflow: "hidden",
      }}
      tabIndex={0}
      onKeyDown={handleGridKeyDown}
      data-spreadsheet="true"
    >
      {/* ── Ribbon Tabs ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", background: "var(--card)", borderBottom: "1px solid var(--border)", paddingLeft: 8, gap: 0 }}>
        {(["home","insert","formulas","data","review","view","pageLayout"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: activeTab === tab ? 600 : 400,
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
              color: activeTab === tab ? "var(--primary)" : "var(--muted-foreground)",
              cursor: "pointer",
              textTransform: "capitalize",
              whiteSpace: "nowrap",
            }}
          >
            {tab === "pageLayout" ? "Page Layout" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Toolbar (tab content) ───────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          padding: "5px 8px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
          alignItems: "center",
          minHeight: 38,
        }}
      >
        {/* ── HOME TAB ─────────────────────────────────────────────── */}
        {activeTab === "home" && <>
          <button style={toolbarBtnStyle()} onClick={() => setShowTemplates(true)}>
            <FileSpreadsheet size={14} /> Templates
          </button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle(primaryStyle.bold)} onClick={() => toggleStyle("bold", true)} title="Bold"><Bold size={14} /></button>
          <button style={toolbarBtnStyle(primaryStyle.italic)} onClick={() => toggleStyle("italic", true)} title="Italic"><Italic size={14} /></button>
          <button style={toolbarBtnStyle(primaryStyle.underline)} onClick={() => toggleStyle("underline", true)} title="Underline"><Underline size={14} /></button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle(primaryStyle.align === "left")} onClick={() => updateStyle(selectedRefs, { align: "left" })} title="Align Left"><AlignLeft size={14} /></button>
          <button style={toolbarBtnStyle(primaryStyle.align === "center")} onClick={() => updateStyle(selectedRefs, { align: "center" })} title="Align Center"><AlignCenter size={14} /></button>
          <button style={toolbarBtnStyle(primaryStyle.align === "right")} onClick={() => updateStyle(selectedRefs, { align: "right" })} title="Align Right"><AlignRight size={14} /></button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <select
            style={{ ...inputStyle, height: 26 }}
            value={primaryStyle.format ?? "general"}
            onChange={(e) => updateStyle(selectedRefs, { format: e.target.value as CellStyle["format"] })}
            title="Number Format"
          >
            <option value="general">General</option>
            <option value="number">Number</option>
            <option value="currency">Currency ($)</option>
            <option value="percentage">Percentage (%)</option>
            <option value="date">Date</option>
          </select>
          <button style={toolbarBtnStyle()} onClick={() => setShowCustomFormatModal(true)} title="Custom Format"><span style={{ fontSize: 14, fontWeight: 700 }}>#</span></button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }} title="Background Color">
            <Palette size={14} /><span>BG</span>
            <input type="color" value={primaryStyle.bgColor ?? "#ffffff"} onChange={(e) => updateStyle(selectedRefs, { bgColor: e.target.value })} style={{ width: 24, height: 20, border: "none", padding: 0, cursor: "pointer" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }} title="Text Color">
            <span style={{ fontWeight: "bold", color: primaryStyle.textColor }}>A</span>
            <input type="color" value={primaryStyle.textColor ?? "#000000"} onChange={(e) => updateStyle(selectedRefs, { textColor: e.target.value })} style={{ width: 24, height: 20, border: "none", padding: 0, cursor: "pointer" }} />
          </label>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle()} onClick={() => updateStyle(selectedRefs, { borders: { top: true, right: true, bottom: true, left: true } })} title="All Borders">⊞</button>
          <button style={toolbarBtnStyle()} onClick={() => updateStyle(selectedRefs, { borders: {} })} title="No Borders">□</button>
          <button style={toolbarBtnStyle()} onClick={mergeCells} title="Merge Cells"><Merge size={14} /> Merge</button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle()} onClick={() => copySelection(false)} title="Copy"><CopyIcon size={14} /></button>
          <button style={toolbarBtnStyle()} onClick={() => copySelection(true)} title="Cut"><Scissors size={14} /></button>
          <button style={toolbarBtnStyle()} onClick={pasteSelection} title="Paste"><ClipboardPaste size={14} /></button>
          <div style={{ flex: 1 }} />
          <button style={toolbarBtnStyle(aiOpen)} onClick={() => setAiOpen((v) => !v)} title="AI Assistant">
            <Sparkles size={14} /> AI
          </button>
        </>}

        {/* ── INSERT TAB ───────────────────────────────────────────── */}
        {activeTab === "insert" && <>
          <button style={toolbarBtnStyle()} onClick={() => openChartWizard()} title="Insert Chart">
            <BarChart2 size={14} /> Chart
          </button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle()} onClick={insertRow} title="Insert Row"><Rows size={14} /> Insert Row</button>
          <button style={toolbarBtnStyle()} onClick={deleteRow} title="Delete Row"><Rows size={14} /> Delete Row</button>
          <button style={toolbarBtnStyle()} onClick={insertColumn} title="Insert Column"><Columns size={14} /> Insert Col</button>
          <button style={toolbarBtnStyle()} onClick={deleteColumn} title="Delete Column"><Columns size={14} /> Delete Col</button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle()} onClick={() => setShowTemplates(true)}>
            <FileSpreadsheet size={14} /> Templates
          </button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px', border: '1px solid var(--border)', borderRadius: 4, height: 28 }}>
            <span style={{ fontSize: 10, color: 'var(--muted-foreground)', paddingRight: 4 }}>Tables</span>
            <button style={toolbarBtnStyle()} title="Insert Plain Table" onClick={() => {
              const start = parseCellRef(selectedCell);
              if (!start) return;
              const headers = ['Column A', 'Column B', 'Column C', 'Column D'];
              const updates: Record<string, Cell> = { ...activeSheet.cells };
              headers.forEach((h, c) => {
                const ref = cellRef(start.col + c, start.row);
                updates[ref] = { value: h, style: { bold: true }, formula: undefined, computed: undefined };
              });
              for (let r = 1; r <= 5; r++) {
                for (let c = 0; c < 4; c++) {
                  const ref = cellRef(start.col + c, start.row + r);
                  if (!updates[ref]?.value) updates[ref] = { value: '', style: {}, formula: undefined, computed: undefined };
                }
              }
              setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, cells: updates } : s));
            }}><Table size={14} /></button>
            <button style={toolbarBtnStyle()} title="Insert Formatted Table with Sample Data" onClick={insertFormattedTable}><Table size={14} /> Fmt Table</button>
          </div>
        </>}

        {/* ── FORMULAS TAB ─────────────────────────────────────────── */}
        {activeTab === "formulas" && <>
          {(["SUM", "AVG", "COUNT", "MAX", "MIN"] as const).map((fn) => (
            <button key={fn} style={toolbarBtnStyle()} onClick={() => {
              const range = selStart && selEnd ? `${selStart}:${selEnd}` : `${selectedCell}:${selectedCell}`;
              const fn2 = fn === "AVG" ? "AVERAGE" : fn;
              const next = parseCellRef(selectedCell);
              if (!next) return;
              const target = cellRef(next.col, next.row + 1);
              updateCellWithMacro(target, `=${fn2}(${range})`);
              setSelectedCell(target.toUpperCase());
            }}>{fn}</button>
          ))}
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle()} onClick={() => setShowNamedRangesModal(true)} title="Named Ranges"><Tag size={14} /> Named Ranges</button>
          <button style={toolbarBtnStyle()} onClick={() => { setVlLookupValue(selectedCell); setVlTableArray(selStart && selEnd ? `${selStart}:${selEnd}` : ""); setShowVlookupHelper(true); }} title="VLOOKUP/XLOOKUP Helper">
            <Calculator size={14} /> VLOOKUP
          </button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle()} onClick={() => {
            if (editingCell && editValue.startsWith("=")) commitArrayFormula();
            else alert("Select a cell with a formula and press F2 to enter edit mode, then use Ctrl+Shift+Enter for array formula.");
          }} title="Array Formula (Ctrl+Shift+Enter)">
            <FileCode size={14} /> Array
          </button>
        </>}

        {/* ── DATA TAB ─────────────────────────────────────────────── */}
        {activeTab === "data" && <>
          <button style={toolbarBtnStyle()} onClick={() => sortBySelectedColumn(true)} title="Sort Ascending"><SortAsc size={14} /> Sort A→Z</button>
          <button style={toolbarBtnStyle()} onClick={() => sortBySelectedColumn(false)} title="Sort Descending"><SortDesc size={14} /> Sort Z→A</button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle()} onClick={() => setShowCondFmt(true)} title="Conditional Formatting">Cond. Fmt</button>
          <button style={toolbarBtnStyle()} onClick={() => setShowValidationModal(true)} title="Data Validation"><CheckSquare size={14} /> Validation</button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle()} onClick={() => setShowPivotModal(true)} title="Pivot Table"><Table size={14} /> Pivot Table</button>
          <button style={toolbarBtnStyle()} onClick={() => { setGsTargetCell(selectedCell); setShowGoalSeekModal(true); }} title="Goal Seek"><Crosshair size={14} /> Goal Seek</button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle()} onClick={() => setShowImport(true)}><Upload size={14} /> Import CSV/XLSX</button>
          <ExportDropdown documentType="spreadsheet" onExport={handleExport} onPrint={handleSpreadsheetPrint} onPrintPreview={() => setShowPrintPreview(true)} isExporting={isExporting} exportProgress={exportProgress} />
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle()} onClick={() => setShowDataImportModal(true)} title="Import from URL / JSON"><Globe size={14} /> Web Import</button>
        </>}

        {/* ── REVIEW TAB ───────────────────────────────────────────── */}
        {activeTab === "review" && <>
          <button style={toolbarBtnStyle(isProtected)} onClick={() => setShowProtectionModal(true)} title="Sheet Protection">
            {isProtected ? <Lock size={14} /> : <Shield size={14} />}
            {isProtected ? " Protected" : " Protect Sheet"}
          </button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle(isRecordingMacro)} onClick={isRecordingMacro ? stopRecording : () => setShowMacroModal(true)} title="Macros">
            {isRecordingMacro ? <Square size={14} color="red" /> : <Play size={14} />}
            {isRecordingMacro ? " Stop Recording" : " Macros"}
          </button>
        </>}

        {/* ── VIEW TAB ─────────────────────────────────────────────── */}
        {activeTab === "view" && <>
          <button style={toolbarBtnStyle()} onClick={() => setZoom((z) => Math.max(50, z - 10))}><ZoomOut size={14} /></button>
          <span style={{ fontSize: 12, minWidth: 36, textAlign: "center" }}>{zoom}%</span>
          <button style={toolbarBtnStyle()} onClick={() => setZoom((z) => Math.min(200, z + 10))}><ZoomIn size={14} /></button>
          <button style={toolbarBtnStyle()} onClick={() => setZoom(100)} title="Reset Zoom">100%</button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle(activeSheet.frozenRows > 0)} onClick={freezeTopRow} title="Freeze Top Row"><Snowflake size={14} /> Freeze Row</button>
          <button style={toolbarBtnStyle()} onClick={() => setShowFreezePanesModal(true)} title="Freeze Panes"><Snowflake size={14} /> Freeze Panes…</button>
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <button style={toolbarBtnStyle(splitView)} onClick={() => setSplitView((v) => !v)} title="Split View"><Split size={14} /> Split</button>
          {splitView && (
            <select style={{ ...inputStyle, height: 26 }} value={splitDirection} onChange={(e) => setSplitDirection(e.target.value as "horizontal"|"vertical")}>
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          )}
        </>}

        {/* ── PAGE LAYOUT TAB ──────────────────────────────────────── */}
        {activeTab === "pageLayout" && <>
          <button style={toolbarBtnStyle()} onClick={() => { setPrintAreaState(selStart && selEnd ? `${selStart}:${selEnd}` : selectedCell); setShowPrintAreaModal(true); }} title="Set Print Area">
            <Printer size={14} /> Print Area
          </button>
          <button style={toolbarBtnStyle()} onClick={() => setShowPrintPreview(true)} title="Print Preview"><Printer size={14} /> Preview</button>
          <button style={toolbarBtnStyle()} onClick={handleSpreadsheetPrint} title="Print"><Download size={14} /> Print</button>
          {printArea && (
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: 8 }}>
              Print area: {printArea}
              <button onClick={() => setPrintAreaState("")} style={{ marginLeft: 4, background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>×</button>
            </span>
          )}
        </>}
      </div>

      {/* ── Formula Bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "3px 8px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <div
          style={{
            minWidth: 60,
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
            padding: "2px 6px",
            border: "1px solid var(--border)",
            borderRadius: 4,
            background: "var(--background)",
          }}
        >
          {selectedCell}
        </div>
        <div style={{ fontSize: 16, color: "var(--muted-foreground)" }}>fx</div>
        <input
          ref={formulaInputRef}
          value={formulaBarValue}
          onChange={(e) => handleFormulaBarChange(e.target.value)}
          onKeyDown={handleFormulaBarKeyDown}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "monospace",
            fontSize: 13,
            color: "var(--foreground)",
          }}
          placeholder="Enter value or formula..."
        />
      </div>

      {/* ── Main Content ────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Grid */}
        <div
          ref={gridRef}
          style={{ flex: 1, overflow: "auto", position: "relative" }}
        >
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
            <table
              style={{
                borderCollapse: "collapse",
                tableLayout: "fixed",
                userSelect: "none",
              }}
            >
              <colgroup>
                <col style={{ width: HEADER_WIDTH }} />
                {Array.from({ length: colCount }, (_, c) => (
                  <col key={c} style={{ width: activeSheet.colWidths[c] ?? DEFAULT_COL_WIDTH }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {/* Corner */}
                  <th
                    style={{
                      width: HEADER_WIDTH,
                      height: HEADER_HEIGHT,
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      position: "sticky",
                      top: 0,
                      left: 0,
                      zIndex: 30,
                    }}
                  />
                  {Array.from({ length: colCount }, (_, c) => (
                    <th
                      key={c}
                      style={{
                        height: HEADER_HEIGHT,
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: "center",
                        position: "sticky",
                        top: 0,
                        zIndex: 20,
                        cursor: "default",
                        userSelect: "none",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
                        {indexToColLetter(c)}
                        {/* Resize handle */}
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            width: 4,
                            height: "100%",
                            cursor: "col-resize",
                            zIndex: 1,
                          }}
                          onMouseDown={(e) => startColResize(c, e)}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rowCount }, (_, r) => (
                  <tr key={r} style={{ height: activeSheet.rowHeights[r] ?? DEFAULT_ROW_HEIGHT }}>
                    {/* Row header */}
                    <td
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        fontSize: 11,
                        textAlign: "center",
                        fontWeight: 600,
                        color: "var(--muted-foreground)",
                        position: "sticky",
                        left: 0,
                        zIndex: 10,
                        userSelect: "none",
                      }}
                    >
                      {r + 1}
                    </td>
                    {/* Cells */}
                    {Array.from({ length: colCount }, (_, c) => {
                      const ref = cellRef(c, r);
                      const cellData = activeSheet.cells[ref];
                      if (cellData?.mergeParent) return null;
                      const isEdit = editingCell === ref;
                      const isPrimary = isPrimarySelected(ref);
                      const isSel = isSelected(ref);
                      const s = cellData?.style ?? {};
                      const condStyle = getCondFmtStyle(ref);
                      const mergeSpan = cellData?.mergeSpan;

                      return (
                        <td
                          key={c}
                          colSpan={mergeSpan?.cols ?? 1}
                          rowSpan={mergeSpan?.rows ?? 1}
                          onMouseDown={(e) => handleCellMouseDown(ref, e)}
                          onMouseEnter={() => handleCellMouseEnter(ref)}
                          onDoubleClick={() => handleCellDoubleClick(ref)}
                          onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, ref: ref.toUpperCase() }); }}
                          style={{
                            border: `1px solid ${isPrimary ? "#2563eb" : isSel ? "#93c5fd" : "var(--border)"}`,
                            outline: isPrimary ? "2px solid #2563eb" : "none",
                            outlineOffset: -2,
                            padding: "0 4px",
                            maxWidth: activeSheet.colWidths[c] ?? DEFAULT_COL_WIDTH,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: 13,
                            fontWeight: s.bold ? "bold" : "normal",
                            fontStyle: s.italic ? "italic" : "normal",
                            textDecoration: s.underline ? "underline" : "none",
                            textAlign: s.align ?? "left",
                            backgroundColor: condStyle.backgroundColor ?? s.bgColor ?? "var(--background)",
                            color: condStyle.color ?? s.textColor ?? "var(--foreground)",
                            borderTop: s.borders?.top ? "2px solid var(--foreground)" : undefined,
                            borderRight: s.borders?.right ? "2px solid var(--foreground)" : undefined,
                            borderBottom: s.borders?.bottom ? "2px solid var(--foreground)" : undefined,
                            borderLeft: s.borders?.left ? "2px solid var(--foreground)" : undefined,
                            cursor: "cell",
                            position: activeSheet.frozenRows > 0 && r < activeSheet.frozenRows
                              ? "sticky"
                              : undefined,
                            top: activeSheet.frozenRows > 0 && r < activeSheet.frozenRows
                              ? HEADER_HEIGHT
                              : undefined,
                            zIndex: activeSheet.frozenRows > 0 && r < activeSheet.frozenRows ? 5 : undefined,
                          }}
                        >
                          {isEdit ? (
                            <input
                              ref={cellInputRef}
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleCellKeyDownEnhanced}
                              onBlur={commitEdit}
                              style={{
                                width: "100%",
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                fontSize: 13,
                                fontFamily: "inherit",
                                color: "var(--foreground)",
                              }}
                            />
                          ) : (
                            getCellDisplay(ref)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart overlays */}
          {charts.map((ch) => (
            <EnhancedChartOverlay
              key={ch.id}
              chart={ch}
              data={getChartData(ch.dataRange)}
              onDragStart={startChartDrag}
              onDelete={() => setCharts((prev) => prev.filter((c) => c.id !== ch.id))}
              onEdit={() => openChartWizard(ch.id)}
            />
          ))}
        </div>

        {/* AI Panel */}
        {aiOpen && (
          <div
            style={{
              width: 320,
              borderLeft: "1px solid var(--border)",
              background: "var(--card)",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontWeight: 600,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={16} style={{ color: "var(--primary)" }} />
                AI Assistant
              </span>
              <button
                onClick={() => setAiOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick actions */}
            <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 4 }}>
              {[
                { key: "explain", label: "Explain Formula" },
                { key: "chart", label: "Suggest Chart" },
                { key: "data", label: "Sample Data" },
                { key: "pivot", label: "Pivot Summary" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => aiQuickAction(key)}
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {aiMessages.length === 0 && (
                <div style={{ color: "var(--muted-foreground)", fontSize: 13, textAlign: "center", marginTop: 20 }}>
                  Ask me anything about your spreadsheet data, formulas, or how to analyze your data.
                </div>
              )}
              {aiMessages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                    padding: "8px 12px",
                    borderRadius: 12,
                    background: m.role === "user" ? "var(--primary)" : "var(--background)",
                    color: m.role === "user" ? "var(--primary-foreground)" : "var(--foreground)",
                    fontSize: 13,
                    border: "1px solid var(--border)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {m.content}
                </div>
              ))}
              {aiLoading && (
                <div style={{ alignSelf: "flex-start", fontSize: 13, color: "var(--muted-foreground)" }}>
                  Thinking…
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 6 }}>
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAiMessage(); } }}
                placeholder="Ask AI..."
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={() => sendAiMessage()}
                disabled={aiLoading}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Sheet Tabs ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid var(--border)",
          background: "var(--card)",
          padding: "4px 8px",
          gap: 4,
          overflowX: "auto",
        }}
      >
        {sheets.map((sheet) => (
          <div key={sheet.id} style={{ display: "flex", alignItems: "center" }}>
            {renamingSheet === sheet.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => { renameSheet(sheet.id, renameValue || sheet.name); setRenamingSheet(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") { renameSheet(sheet.id, renameValue || sheet.name); setRenamingSheet(null); } }}
                style={{ ...inputStyle, width: 80 }}
              />
            ) : (
              <button
                onDoubleClick={() => { setRenamingSheet(sheet.id); setRenameValue(sheet.name); }}
                onClick={() => setActiveSheetId(sheet.id)}
                style={{
                  padding: "3px 12px",
                  borderRadius: "4px 4px 0 0",
                  border: "1px solid var(--border)",
                  borderBottom: sheet.id === activeSheetId ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: sheet.id === activeSheetId ? "var(--background)" : "transparent",
                  color: sheet.id === activeSheetId ? "var(--primary)" : "var(--muted-foreground)",
                  fontWeight: sheet.id === activeSheetId ? 600 : 400,
                  cursor: "pointer",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {sheet.name}
                {sheets.length > 1 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); deleteSheet(sheet.id); }}
                    style={{ fontSize: 10, opacity: 0.5, marginLeft: 2 }}
                  >
                    ×
                  </span>
                )}
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addSheet}
          style={{
            padding: "3px 8px",
            border: "1px solid var(--border)",
            borderRadius: 4,
            background: "transparent",
            color: "var(--muted-foreground)",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
          }}
          title="Add Sheet"
        >
          +
        </button>
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "2px 12px",
          background: "var(--card)",
          borderTop: "1px solid var(--border)",
          fontSize: 11,
          color: "var(--muted-foreground)",
        }}
      >
        <span>Cells: {statusStats.count}</span>
        {statusStats.numCount > 0 && (
          <>
            <span>Sum: {statusStats.sum.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span>
            <span>Avg: {statusStats.avg.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span>
            <span>Min: {statusStats.min.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span>
            <span>Max: {statusStats.max.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span>
            <span>Count: {statusStats.numCount}</span>
          </>
        )}
        {isRecordingMacro && <span style={{ color: "#ef4444", fontWeight: 600 }}>● Recording</span>}
        {isProtected && <span style={{ color: "#f59e0b" }}>🔒 Protected</span>}
        {printArea && <span>Print Area: {printArea}</span>}
        <span style={{ marginLeft: "auto" }}>
          {activeSheet.name} · {DEFAULT_ROWS} rows × {DEFAULT_COLS} cols · {zoom}%
        </span>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}

      {/* Templates Modal */}
      {showTemplates && (
        <Modal title="Choose a Template" onClose={() => setShowTemplates(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {TEMPLATES.map((tmpl, i) => (
              <button
                key={i}
                onClick={() => loadTemplate(i)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)")}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{tmpl.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{tmpl.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{tmpl.description}</div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Chart Wizard */}
      {showChartWizard && (
        <ChartWizard
          initialRange={editingChartId ? (charts.find(c => c.id === editingChartId)?.dataRange || chartWizardRange) : chartWizardRange}
          getData={getChartData}
          getDataKeys={getChartDataKeys}
          onInsert={handleChartInsert}
          onClose={() => { setShowChartWizard(false); setEditingChartId(null); }}
          editChart={editingChartId ? charts.find(c => c.id === editingChartId) || null : null}
        />
      )}

      {/* Conditional Formatting Modal */}
      {showCondFmt && (
        <Modal title="Conditional Formatting" onClose={() => setShowCondFmt(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              Applying to: {selectedRefs.length} cell(s)
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 12 }}>Condition:</label>
              <select
                value={condFmtCondition}
                onChange={(e) => setCondFmtCondition(e.target.value as typeof condFmtCondition)}
                style={{ ...inputStyle, padding: "4px 8px" }}
              >
                <option value="gt">Greater than</option>
                <option value="gte">Greater than or equal</option>
                <option value="lt">Less than</option>
                <option value="lte">Less than or equal</option>
                <option value="eq">Equal to</option>
              </select>
              <input
                type="number"
                value={condFmtValue}
                onChange={(e) => setCondFmtValue(e.target.value)}
                style={{ ...inputStyle, width: 80, padding: "4px 8px" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 12 }}>Highlight Color:</label>
              <input
                type="color"
                value={condFmtColor}
                onChange={(e) => setCondFmtColor(e.target.value)}
                style={{ width: 40, height: 28, border: "1px solid var(--border)", borderRadius: 4 }}
              />
            </div>
            <button
              onClick={addCondFmt}
              style={{
                padding: "8px 20px",
                borderRadius: 6,
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Apply Rule
            </button>
            {activeSheet.conditionalFormats.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Existing Rules:</div>
                {activeSheet.conditionalFormats.map((rule) => (
                  <div key={rule.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "4px 0" }}>
                    <div style={{ width: 16, height: 16, background: rule.bgColor, borderRadius: 2, border: "1px solid var(--border)" }} />
                    <span>Value {rule.condition} {rule.value}</span>
                    <button
                      onClick={() =>
                        setSheets((prev) =>
                          prev.map((s) =>
                            s.id !== activeSheetId
                              ? s
                              : { ...s, conditionalFormats: s.conditionalFormats.filter((r) => r.id !== rule.id) }
                          )
                        )
                      }
                      style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Export/Import modals */}
      <ImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleSpreadsheetImport}
        defaultType="spreadsheet"
      />
      <PrintPreviewModal
        open={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        htmlContent={getSpreadsheetPreviewHtml()}
        title={activeSheet.name}
      />
      <ExportProgress
        visible={isExporting}
        percent={exportProgress.percent}
        message={exportProgress.message}
        onClose={() => setIsExporting(false)}
      />

      {/* ── Context Menu ─────────────────────────────────────────────── */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 2000,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            minWidth: 200,
            padding: "4px 0",
          }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {[
            { label: "Copy", icon: <CopyIcon size={13}/>, action: () => { copySelection(false); setContextMenu(null); } },
            { label: "Cut", icon: <Scissors size={13}/>, action: () => { copySelection(true); setContextMenu(null); } },
            { label: "Paste", icon: <ClipboardPaste size={13}/>, action: () => { pasteSelection(); setContextMenu(null); } },
            null,
            { label: "Insert Row Above", icon: <Rows size={13}/>, action: () => { insertRow(); setContextMenu(null); } },
            { label: "Delete Row", icon: <Rows size={13}/>, action: () => { deleteRow(); setContextMenu(null); } },
            { label: "Insert Column Left", icon: <Columns size={13}/>, action: () => { insertColumn(); setContextMenu(null); } },
            { label: "Delete Column", icon: <Columns size={13}/>, action: () => { deleteColumn(); setContextMenu(null); } },
            null,
            { label: "Sort A → Z", icon: <SortAsc size={13}/>, action: () => { sortBySelectedColumn(true); setContextMenu(null); } },
            { label: "Sort Z → A", icon: <SortDesc size={13}/>, action: () => { sortBySelectedColumn(false); setContextMenu(null); } },
            null,
            { label: "Format Cells…", icon: <Palette size={13}/>, action: () => { setShowCustomFormatModal(true); setContextMenu(null); } },
            { label: "Data Validation…", icon: <CheckSquare size={13}/>, action: () => { setShowValidationModal(true); setContextMenu(null); } },
            null,
            { label: "Clear Cell", icon: <X size={13}/>, action: () => { selectedRefs.forEach((r) => updateCell(r, "")); setContextMenu(null); } },
          ].map((item, idx) =>
            item === null ? (
              <div key={idx} style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            ) : (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "7px 14px",
                  background: "none",
                  border: "none",
                  color: "var(--foreground)",
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-accent)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
              >
                {item.icon}{item.label}
              </button>
            )
          )}
        </div>
      )}

      {/* ── Pivot Table Modal ─────────────────────────────────────────── */}
      {showPivotModal && (
        <Modal title="Pivot Table Builder" onClose={() => setShowPivotModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", padding: "8px 12px", background: "var(--background)", borderRadius: 6 }}>
              First select the data range (including headers) in the spreadsheet, then configure the pivot table below.
              {selStart && selEnd ? ` Selected: ${selStart}:${selEnd}` : " No range selected."}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <button
                onClick={() => {
                  const demoData = [
                    ['Region', 'Product', 'Sales', 'Quarter'],
                    ['North', 'Widget A', '15000', 'Q1'],
                    ['South', 'Widget B', '22000', 'Q1'],
                    ['North', 'Widget B', '18000', 'Q2'],
                    ['East', 'Widget A', '31000', 'Q2'],
                    ['South', 'Widget A', '27000', 'Q1'],
                    ['West', 'Widget B', '19000', 'Q3'],
                    ['North', 'Widget A', '24000', 'Q3'],
                    ['East', 'Widget B', '33000', 'Q4'],
                    ['South', 'Widget A', '28000', 'Q4'],
                  ];
                  const updates: Record<string, Cell> = { ...activeSheet.cells };
                  demoData.forEach((row, ri) => {
                    row.forEach((val, ci) => {
                      const ref = cellRef(ci, ri);
                      updates[ref] = { value: val, style: ri === 0 ? { bold: true } : {}, formula: undefined, computed: undefined };
                    });
                  });
                  setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, cells: updates } : s));
                  setSelStart('A1');
                  setSelEnd('D10');
                  setSelectedCell('A1');
                }}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', cursor: 'pointer', fontSize: 11 }}
              >
                📊 Load Demo Sales Data
              </button>
            </div>
            {selectionHeaders.length > 0 ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Row Field</label>
                    <select style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13 }} value={pivotRowField} onChange={(e) => setPivotRowField(e.target.value)}>
                      <option value="">-- Select --</option>
                      {selectionHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Value Field</label>
                    <select style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13 }} value={pivotValueField} onChange={(e) => setPivotValueField(e.target.value)}>
                      <option value="">-- Select --</option>
                      {selectionHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                {selectionHeaders.length > 0 && (
                  <div>
                    <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Quick Add Fields</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {selectionHeaders.map(h => (
                        <div key={h} style={{ display: 'flex', gap: 2 }}>
                          <button
                            onClick={() => setPivotRowField(h)}
                            style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid', borderColor: pivotRowField === h ? 'var(--primary)' : 'var(--border)', background: pivotRowField === h ? 'var(--primary)' : 'var(--muted)', color: pivotRowField === h ? 'var(--primary-foreground)' : 'var(--foreground)', cursor: 'pointer', fontSize: 11 }}
                          >
                            {h} →Row
                          </button>
                          <button
                            onClick={() => setPivotValueField(h)}
                            style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid', borderColor: pivotValueField === h ? '#8b5cf6' : 'var(--border)', background: pivotValueField === h ? '#8b5cf6' : 'var(--muted)', color: pivotValueField === h ? 'white' : 'var(--foreground)', cursor: 'pointer', fontSize: 11 }}
                          >
                            {h} →Val
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Aggregation</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(["SUM","COUNT","AVERAGE","MAX","MIN"] as const).map((a) => (
                      <button key={a} onClick={() => setPivotAgg(a)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid", borderColor: pivotAgg === a ? "var(--primary)" : "var(--border)", background: pivotAgg === a ? "var(--primary)" : "transparent", color: pivotAgg === a ? "var(--primary-foreground)" : "var(--foreground)", cursor: "pointer", fontSize: 12 }}>{a}</button>
                    ))}
                  </div>
                </div>
                <button onClick={buildPivotTable} disabled={!pivotRowField || !pivotValueField} style={{ padding: "8px 20px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontWeight: 600, opacity: (!pivotRowField || !pivotValueField) ? 0.5 : 1 }}>
                  <Table size={14} style={{ display: "inline", marginRight: 6 }} />
                  Build Pivot Table (new sheet)
                </button>
              </>
            ) : (
              <div style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Select a range with headers to enable pivot table builder.</div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Data Validation Modal ─────────────────────────────────────── */}
      {showValidationModal && (
        <Modal title="Data Validation" onClose={() => setShowValidationModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Applying to: {selectedRefs.length} cell(s) — {selectedCell}</div>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Validation Type</label>
              <select style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13 }} value={validationType} onChange={(e) => setValidationType(e.target.value as typeof validationType)}>
                <option value="list">List (Dropdown)</option>
                <option value="number">Number Range</option>
                <option value="date">Date Range</option>
                <option value="custom">Custom Formula</option>
              </select>
            </div>
            {validationType === "list" && (
              <div>
                <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Allowed values (comma-separated)</label>
                <input value={validationList} onChange={(e) => setValidationList(e.target.value)} placeholder="Yes,No,Maybe" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, boxSizing: "border-box" }} />
              </div>
            )}
            {validationType === "number" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Minimum</label>
                  <input value={validationMin} onChange={(e) => setValidationMin(e.target.value)} type="number" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Maximum</label>
                  <input value={validationMax} onChange={(e) => setValidationMax(e.target.value)} type="number" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, boxSizing: "border-box" }} />
                </div>
              </div>
            )}
            {validationType === "date" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Start Date</label>
                  <input value={validationMin} onChange={(e) => setValidationMin(e.target.value)} type="date" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>End Date</label>
                  <input value={validationMax} onChange={(e) => setValidationMax(e.target.value)} type="date" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, boxSizing: "border-box" }} />
                </div>
              </div>
            )}
            {validationType === "custom" && (
              <div>
                <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Custom Formula</label>
                <input value={validationFormula} onChange={(e) => setValidationFormula(e.target.value)} placeholder="=A1>0" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={applyDataValidation} style={{ flex: 1, padding: "8px 20px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>Apply Validation</button>
              <button onClick={() => { const nv = { ...dataValidations }; selectedRefs.forEach((r) => delete nv[r.toUpperCase()]); setDataValidations(nv); setShowValidationModal(false); }} style={{ padding: "8px 20px", borderRadius: 6, background: "transparent", color: "var(--muted-foreground)", border: "1px solid var(--border)", cursor: "pointer" }}>Clear Validation</button>
            </div>
            {Object.keys(dataValidations).length > 0 && (
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                {Object.keys(dataValidations).length} cell(s) have validation rules
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Named Ranges Modal ────────────────────────────────────────── */}
      {showNamedRangesModal && (
        <Modal title="Named Ranges Manager" onClose={() => setShowNamedRangesModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={newRangeName} onChange={(e) => setNewRangeName(e.target.value.replace(/\s+/g,"_").toUpperCase())} placeholder="RANGE_NAME" style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, fontFamily: "monospace" }} />
              <input value={newRangeRef} onChange={(e) => setNewRangeRef(e.target.value.toUpperCase())} placeholder="A1:B10" style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, fontFamily: "monospace" }} />
              <button onClick={addNamedRange} style={{ padding: "6px 16px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>Add</button>
            </div>
            <button onClick={() => { if (selStart && selEnd) { setNewRangeRef(`${selStart}:${selEnd}`); } else { setNewRangeRef(selectedCell); } }} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", fontSize: 12, cursor: "pointer" }}>
              Use current selection ({selStart && selEnd ? `${selStart}:${selEnd}` : selectedCell})
            </button>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {Object.keys(namedRanges).length === 0 ? (
                <div style={{ color: "var(--muted-foreground)", fontSize: 13, textAlign: "center", padding: 20 }}>No named ranges defined yet.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--background)" }}>
                      <th style={{ padding: "6px 10px", textAlign: "left", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)", fontWeight: 600 }}>Name</th>
                      <th style={{ padding: "6px 10px", textAlign: "left", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)", fontWeight: 600 }}>Reference</th>
                      <th style={{ width: 60, borderBottom: "1px solid var(--border)" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(namedRanges).map(([name, ref]) => (
                      <tr key={name}>
                        <td style={{ padding: "6px 10px", fontFamily: "monospace", fontWeight: 600 }}>{name}</td>
                        <td style={{ padding: "6px 10px", fontFamily: "monospace", color: "var(--primary)" }}>{ref}</td>
                        <td style={{ padding: "6px 10px", textAlign: "right" }}>
                          <button onClick={() => deleteNamedRange(name)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}><X size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Freeze Panes Modal ────────────────────────────────────────── */}
      {showFreezePanesModal && (
        <Modal title="Freeze Panes" onClose={() => setShowFreezePanesModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Freeze First Row", action: () => { setSheets((p) => p.map((s) => s.id === activeSheetId ? { ...s, frozenRows: 1, frozenCols: 0 } : s)); setShowFreezePanesModal(false); } },
                { label: "Freeze First Column", action: () => { setSheets((p) => p.map((s) => s.id === activeSheetId ? { ...s, frozenRows: 0, frozenCols: 1 } : s)); setShowFreezePanesModal(false); } },
                { label: "Unfreeze All", action: () => { setSheets((p) => p.map((s) => s.id === activeSheetId ? { ...s, frozenRows: 0, frozenCols: 0 } : s)); setShowFreezePanesModal(false); } },
              ].map((btn) => (
                <button key={btn.label} onClick={btn.action} style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", cursor: "pointer", fontSize: 13 }}>{btn.label}</button>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <div style={{ fontSize: 12, marginBottom: 8, color: "var(--muted-foreground)", fontWeight: 600 }}>Custom Freeze Point</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Freeze Rows</label>
                  <input type="number" min={0} max={20} value={freezeCustomRows} onChange={(e) => setFreezeCustomRows(e.target.value)} style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Freeze Columns</label>
                  <input type="number" min={0} max={26} value={freezeCustomCols} onChange={(e) => setFreezeCustomCols(e.target.value)} style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, boxSizing: "border-box" }} />
                </div>
              </div>
              <button onClick={() => { setSheets((p) => p.map((s) => s.id === activeSheetId ? { ...s, frozenRows: parseInt(freezeCustomRows)||0, frozenCols: parseInt(freezeCustomCols)||0 } : s)); setShowFreezePanesModal(false); }} style={{ marginTop: 10, width: "100%", padding: "8px 20px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>
                Apply Custom Freeze
              </button>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", textAlign: "center" }}>
              Current: {activeSheet.frozenRows} row(s), {activeSheet.frozenCols} col(s) frozen
            </div>
          </div>
        </Modal>
      )}

      {/* ── Goal Seek Modal ───────────────────────────────────────────── */}
      {showGoalSeekModal && (
        <Modal title="Goal Seek / What-If Analysis" onClose={() => { setShowGoalSeekModal(false); setGsResult(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", padding: "8px 12px", background: "var(--background)", borderRadius: 6 }}>
              Find the input value needed in a cell to achieve a target result in a formula cell.
            </div>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Set Cell (formula cell, e.g. B10)</label>
              <input value={gsTargetCell} onChange={(e) => setGsTargetCell(e.target.value.toUpperCase())} placeholder="B10" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>To Value (target)</label>
              <input value={gsTargetValue} onChange={(e) => setGsTargetValue(e.target.value)} type="number" placeholder="100" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>By Changing Cell (input cell, e.g. A1)</label>
              <input value={gsInputCell} onChange={(e) => setGsInputCell(e.target.value.toUpperCase())} placeholder="A1" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
            </div>
            <button onClick={runGoalSeek} style={{ padding: "8px 20px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>
              <Crosshair size={14} style={{ display: "inline", marginRight: 6 }} />Solve
            </button>
            {gsResult !== null && (
              <div style={{ padding: "12px 16px", borderRadius: 8, background: "var(--background)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 13, marginBottom: 8 }}>
                  Result: Set <strong>{gsInputCell}</strong> to <strong>{gsResult}</strong>
                </div>
                <button onClick={applyGoalSeekResult} style={{ padding: "6px 16px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontSize: 12 }}>Apply to Cell</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Sheet Protection Modal ────────────────────────────────────── */}
      {showProtectionModal && (
        <Modal title={isProtected ? "Unprotect Sheet" : "Protect Sheet"} onClose={() => setShowProtectionModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {isProtected ? (
              <>
                <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Enter the password to unprotect this sheet.</div>
                <input type="password" value={protectionInput} onChange={(e) => setProtectionInput(e.target.value)} placeholder="Enter password" onKeyDown={(e) => e.key === "Enter" && toggleProtection()} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13 }} />
                <button onClick={toggleProtection} style={{ padding: "8px 20px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>Unprotect Sheet</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Protect this sheet to prevent unauthorized editing. Set an optional password.</div>
                <input type="password" value={protectionInput} onChange={(e) => setProtectionInput(e.target.value)} placeholder="Password (optional)" style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13 }} />
                <button onClick={toggleProtection} style={{ padding: "8px 20px", borderRadius: 6, background: "#ef4444", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  <Lock size={14} style={{ display: "inline", marginRight: 6 }} />Protect Sheet
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ── Custom Number Format Modal ────────────────────────────────── */}
      {showCustomFormatModal && (
        <Modal title="Custom Number Format" onClose={() => setShowCustomFormatModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Select a preset or enter a custom format for selected cells.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "General", format: "general" },
                { label: "Number (1,234.56)", format: "number" },
                { label: "Currency ($1,234.56)", format: "currency" },
                { label: "Percentage (12.3%)", format: "percentage" },
                { label: "Date (MM/DD/YYYY)", format: "date" },
                { label: "Scientific (1.23E+3)", format: "scientific" },
                { label: "Accounting", format: "accounting" },
                { label: "Fraction (1/2)", format: "fraction" },
              ].map(({ label, format }) => (
                <button key={format} onClick={() => { updateStyle(selectedRefs, { format: format as CellStyle["format"] }); setShowCustomFormatModal(false); }} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", cursor: "pointer", fontSize: 12, textAlign: "left" }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <label style={{ fontSize: 12, display: "block", marginBottom: 6, color: "var(--muted-foreground)" }}>Custom format string</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={customFormatInput} onChange={(e) => setCustomFormatInput(e.target.value)} placeholder="#,##0.00 or 0.00% or YYYY-MM-DD" style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, fontFamily: "monospace" }} />
                <button onClick={() => { /* Custom format string stored, use general for now */ setShowCustomFormatModal(false); }} style={{ padding: "6px 16px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer" }}>Apply</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Print Area Modal ──────────────────────────────────────────── */}
      {showPrintAreaModal && (
        <Modal title="Set Print Area" onClose={() => setShowPrintAreaModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Define the range to include when printing this sheet.</div>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Print Area Range (e.g. A1:H30)</label>
              <input value={printArea} onChange={(e) => setPrintAreaState(e.target.value.toUpperCase())} placeholder="A1:Z50" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { if (selStart && selEnd) setPrintAreaState(`${selStart}:${selEnd}`); }} style={{ flex: 1, padding: "7px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", cursor: "pointer", fontSize: 12 }}>Use Selection</button>
              <button onClick={() => setShowPrintAreaModal(false)} style={{ flex: 2, padding: "7px 12px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>Set Print Area</button>
            </div>
            {printArea && <div style={{ fontSize: 12, color: "var(--primary)" }}>Current print area: {printArea}</div>}
          </div>
        </Modal>
      )}

      {/* ── VLOOKUP/XLOOKUP Helper Modal ──────────────────────────────── */}
      {showVlookupHelper && (
        <Modal title="VLOOKUP / XLOOKUP Formula Builder" onClose={() => setShowVlookupHelper(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Function:</label>
              <button onClick={() => setVlUseXlookup(false)} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid", borderColor: !vlUseXlookup ? "var(--primary)" : "var(--border)", background: !vlUseXlookup ? "var(--primary)" : "transparent", color: !vlUseXlookup ? "var(--primary-foreground)" : "var(--foreground)", cursor: "pointer", fontSize: 12 }}>VLOOKUP</button>
              <button onClick={() => setVlUseXlookup(true)} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid", borderColor: vlUseXlookup ? "var(--primary)" : "var(--border)", background: vlUseXlookup ? "var(--primary)" : "transparent", color: vlUseXlookup ? "var(--primary-foreground)" : "var(--foreground)", cursor: "pointer", fontSize: 12 }}>XLOOKUP</button>
            </div>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Lookup Value (cell or value)</label>
              <input value={vlLookupValue} onChange={(e) => setVlLookupValue(e.target.value.toUpperCase())} placeholder="A2" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Table Array (range, e.g. A1:D100)</label>
              <input value={vlTableArray} onChange={(e) => setVlTableArray(e.target.value.toUpperCase())} placeholder="A1:D100" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
            </div>
            {!vlUseXlookup && (
              <>
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Column Index (return column number)</label>
                  <input value={vlColIndex} onChange={(e) => setVlColIndex(e.target.value)} type="number" min={1} style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={vlExact} onChange={(e) => setVlExact(e.target.checked)} />
                  Exact match (FALSE) — recommended
                </label>
              </>
            )}
            <div style={{ padding: "10px 12px", background: "var(--background)", borderRadius: 6, fontFamily: "monospace", fontSize: 13, border: "1px solid var(--border)", wordBreak: "break-all" }}>
              {buildVlookupFormula()}
            </div>
            <button onClick={insertVlookup} style={{ padding: "8px 20px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Insert into {selectedCell}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Data Import Modal (Power Query style) ───────────────────── */}
      {showDataImportModal && (
        <Modal title="Import Data from URL / JSON / CSV" onClose={() => setShowDataImportModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", padding: "8px 12px", background: "var(--background)", borderRadius: 6 }}>
              Enter a URL returning JSON (array of objects) or CSV. Data will be imported into the current sheet starting at A1.
            </div>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4, color: "var(--muted-foreground)" }}>Data URL</label>
              <input value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://api.example.com/data.json" style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            {importError && <div style={{ padding: "8px 12px", borderRadius: 6, background: "#ef444420", border: "1px solid #ef4444", color: "#ef4444", fontSize: 12 }}>{importError}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={importFromUrl} disabled={importLoading || !importUrl.trim()} style={{ flex: 1, padding: "8px 20px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontWeight: 600, opacity: importLoading ? 0.7 : 1 }}>
                <Globe size={14} style={{ display: "inline", marginRight: 6 }} />
                {importLoading ? "Importing…" : "Import Data"}
              </button>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--muted-foreground)" }}>Or paste CSV / JSON directly:</div>
              <textarea
                placeholder={"Paste CSV or JSON here...\n\nCSV example:\nName,Value\nApple,10\nBanana,20\n\nJSON example:\n[{\"Name\":\"Apple\",\"Value\":10}]"}
                style={{ width: "100%", height: 120, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 12, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    const text = (e.target as HTMLTextAreaElement).value;
                    if (!text.trim()) return;
                    let rows: string[][] = [];
                    try {
                      const json = JSON.parse(text);
                      const arr = Array.isArray(json) ? json : [];
                      if (arr.length > 0) {
                        const keys = Object.keys(arr[0]);
                        rows = [keys, ...arr.map((item: Record<string, unknown>) => keys.map((k) => String(item[k] ?? "")))];
                      }
                    } catch {
                      rows = text.split("\n").map((line) => line.split(",").map((v) => v.trim().replace(/^"|"$/g, "")));
                    }
                    setSheets((prev) => prev.map((sheet) => {
                      if (sheet.id !== activeSheetId) return sheet;
                      const newCells: Record<string, Cell> = { ...sheet.cells };
                      rows.forEach((row, ri) => row.forEach((val, ci) => { if (val) newCells[cellRef(ci, ri).toUpperCase()] = { value: val }; }));
                      return { ...sheet, cells: newCells };
                    }));
                    setShowDataImportModal(false);
                  }
                }}
              />
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>Press Ctrl+Enter to import pasted data</div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Macro Recorder Modal ──────────────────────────────────────── */}
      {showMacroModal && (
        <Modal title="Macro Recorder" onClose={() => setShowMacroModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {!isRecordingMacro ? (
                <button onClick={startRecording} style={{ flex: 1, padding: "8px 16px", borderRadius: 6, background: "#ef4444", color: "white", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Circle size={16} style={{ color: "#ef4444" }} /> Start Recording
                </button>
              ) : (
                <button onClick={stopRecording} style={{ flex: 1, padding: "8px 16px", borderRadius: 6, background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Square size={16} /> Stop Recording
                </button>
              )}
            </div>
            {macroActions.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted-foreground)" }}>Recorded Actions ({macroActions.length})</div>
                <div style={{ maxHeight: 120, overflowY: "auto", background: "var(--background)", borderRadius: 6, padding: 8, fontFamily: "monospace", fontSize: 11 }}>
                  {macroActions.map((a, i) => <div key={i}>{a.cell} = {a.value}</div>)}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input value={macroName} onChange={(e) => setMacroName(e.target.value)} placeholder="Macro name" style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: 13 }} />
                  <button onClick={saveMacro} style={{ padding: "6px 16px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer" }}>Save</button>
                </div>
              </div>
            )}
            {savedMacros.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--muted-foreground)" }}>Saved Macros</div>
                {savedMacros.map((macro, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ flex: 1, fontSize: 13 }}>{macro.name} <span style={{ color: "var(--muted-foreground)", fontSize: 11 }}>({macro.actions.length} actions)</span></span>
                    <button onClick={() => playMacro(macro)} style={{ padding: "4px 12px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                      <Play size={12} /> Run
                    </button>
                    <button onClick={() => setSavedMacros((p) => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {savedMacros.length === 0 && macroActions.length === 0 && (
              <div style={{ color: "var(--muted-foreground)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                Click &quot;Start Recording&quot; then make changes to the spreadsheet. Each cell edit will be recorded as a macro action.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          maxWidth: 640,
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          color: "var(--foreground)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground)" }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── EnhancedChartOverlay ─────────────────────────────────────────────────────
function EnhancedChartOverlay({
  chart,
  data,
  onDragStart,
  onDelete,
  onEdit,
}: {
  chart: ChartConfig;
  data: ChartData[];
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const { position, title } = chart;
  const chartRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
        background: "var(--card)",
        border: "2px solid var(--border)",
        borderRadius: chart.customization?.borderRadius ?? 8,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Chart header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          borderBottom: "1px solid var(--border)",
          cursor: "move",
          background: "var(--background)",
          borderRadius: `${(chart.customization?.borderRadius ?? 8) - 2}px ${(chart.customization?.borderRadius ?? 8) - 2}px 0 0`,
        }}
        onMouseDown={(e) => onDragStart(chart.id, e)}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{title}</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button
            onClick={() => { if (chartRef.current) exportChartAsPng(chartRef.current, `${title}.png`); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2 }}
            title="Export PNG"
          >
            <Download size={12} />
          </button>
          <button
            onClick={onEdit}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2 }}
            title="Edit Chart"
          >
            <Settings size={12} />
          </button>
          <button
            onClick={onDelete}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2 }}
            title="Delete Chart"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Chart body */}
      <div ref={chartRef} style={{ flex: 1, padding: "4px" }}>
        <ChartRenderer config={chart} data={data} />
      </div>
    </div>
  );
}
