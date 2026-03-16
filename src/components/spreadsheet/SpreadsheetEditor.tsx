"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell as RechartsCell,
} from "recharts";
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
import type { Cell, CellStyle, Sheet, ChartConfig } from "./types";
import { evaluateFormula, colLetterToIndex, indexToColLetter } from "./formula-engine";
import { TEMPLATES } from "./templates";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { ExportProgress } from "@/components/shared/export-progress";
import { ImportDialog } from "@/components/shared/import-dialog";
import { PrintPreviewModal } from "@/components/shared/print-preview-modal";
import { ExportManager, type ExportFormat } from "@/lib/export-manager";
import { Upload } from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────
const DEFAULT_ROWS = 50;
const DEFAULT_COLS = 26;
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 24;
const HEADER_WIDTH = 48;
const HEADER_HEIGHT = 24;

const PIE_COLORS = ["#3b82f6","#ef4444","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

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
  const [showChartModal, setShowChartModal] = useState(false);
  const [newChartType, setNewChartType] = useState<ChartConfig["type"]>("bar");
  const [newChartTitle, setNewChartTitle] = useState("");
  const [newChartRange, setNewChartRange] = useState("");
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
    return { sum, avg, count, numCount: vals.length };
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
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        startEdit(selectedCell, e.key);
      }
    },
    [editingCell, selectedCell, selectedRefs, navigate, startEdit, updateCell]
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
  const insertChart = () => {
    if (!newChartRange.trim()) return;
    const id = generateId();
    setCharts((prev) => [
      ...prev,
      {
        id,
        type: newChartType,
        title: newChartTitle || "Chart",
        dataRange: newChartRange.toUpperCase(),
        position: { x: 100, y: 100, width: 480, height: 300 },
      },
    ]);
    setShowChartModal(false);
    setNewChartTitle("");
    setNewChartRange("");
  };

  const getChartData = useCallback(
    (range: string) => {
      const m = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
      if (!m) return [];
      const c1 = colLetterToIndex(m[1]);
      const r1 = parseInt(m[2]);
      const c2 = colLetterToIndex(m[3]);
      const r2 = parseInt(m[4]);
      const data: { name: string; value: number; [k: string]: string | number }[] = [];
      const cols = c2 - c1 + 1;
      for (let r = r1; r <= r2; r++) {
        const row: { name: string; value: number; [k: string]: string | number } = {
          name: String(getCellDisplay(cellRef(c1, r - 1))),
          value: 0,
        };
        for (let c = c1 + 1; c <= c2; c++) {
          const label = indexToColLetter(c);
          const val = parseFloat(getCellDisplay(cellRef(c, r - 1))) || 0;
          row[label] = val;
          if (c === c1 + 1) row.value = val;
        }
        if (cols === 1) row.value = parseFloat(String(row.name)) || 0;
        data.push(row);
      }
      return data;
    },
    [getCellDisplay]
  );

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
    >
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          padding: "6px 8px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
          alignItems: "center",
        }}
      >
        {/* File actions */}
        <button style={toolbarBtnStyle()} onClick={() => setShowTemplates(true)}>
          <FileSpreadsheet size={14} /> Templates
        </button>
        <button style={toolbarBtnStyle()} onClick={() => setShowImport(true)}>
          <Upload size={14} /> Import
        </button>
        <ExportDropdown
          documentType="spreadsheet"
          onExport={handleExport}
          onPrint={handleSpreadsheetPrint}
          onPrintPreview={() => setShowPrintPreview(true)}
          isExporting={isExporting}
          exportProgress={exportProgress}
        />

        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

        {/* Text formatting */}
        <button style={toolbarBtnStyle(primaryStyle.bold)} onClick={() => toggleStyle("bold", true)} title="Bold">
          <Bold size={14} />
        </button>
        <button style={toolbarBtnStyle(primaryStyle.italic)} onClick={() => toggleStyle("italic", true)} title="Italic">
          <Italic size={14} />
        </button>
        <button style={toolbarBtnStyle(primaryStyle.underline)} onClick={() => toggleStyle("underline", true)} title="Underline">
          <Underline size={14} />
        </button>

        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

        {/* Alignment */}
        <button style={toolbarBtnStyle(primaryStyle.align === "left")} onClick={() => updateStyle(selectedRefs, { align: "left" })} title="Align Left">
          <AlignLeft size={14} />
        </button>
        <button style={toolbarBtnStyle(primaryStyle.align === "center")} onClick={() => updateStyle(selectedRefs, { align: "center" })} title="Align Center">
          <AlignCenter size={14} />
        </button>
        <button style={toolbarBtnStyle(primaryStyle.align === "right")} onClick={() => updateStyle(selectedRefs, { align: "right" })} title="Align Right">
          <AlignRight size={14} />
        </button>

        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

        {/* Number format */}
        <select
          style={{ ...inputStyle, height: 26 }}
          value={primaryStyle.format ?? "general"}
          onChange={(e) => updateStyle(selectedRefs, { format: e.target.value as CellStyle["format"] })}
        >
          <option value="general">General</option>
          <option value="number">Number</option>
          <option value="currency">Currency</option>
          <option value="percentage">Percentage</option>
          <option value="date">Date</option>
        </select>

        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

        {/* Colors */}
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }} title="Background Color">
          <Palette size={14} />
          <span>BG</span>
          <input
            type="color"
            value={primaryStyle.bgColor ?? "#ffffff"}
            onChange={(e) => updateStyle(selectedRefs, { bgColor: e.target.value })}
            style={{ width: 24, height: 20, border: "none", padding: 0, cursor: "pointer" }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }} title="Text Color">
          <span style={{ fontWeight: "bold", color: primaryStyle.textColor }}>A</span>
          <input
            type="color"
            value={primaryStyle.textColor ?? "#000000"}
            onChange={(e) => updateStyle(selectedRefs, { textColor: e.target.value })}
            style={{ width: 24, height: 20, border: "none", padding: 0, cursor: "pointer" }}
          />
        </label>

        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

        {/* Borders */}
        <button style={toolbarBtnStyle()} onClick={() => updateStyle(selectedRefs, { borders: { top: true, right: true, bottom: true, left: true } })} title="All Borders">
          ⊞
        </button>
        <button style={toolbarBtnStyle()} onClick={() => updateStyle(selectedRefs, { borders: {} })} title="No Borders">
          □
        </button>

        {/* Merge */}
        <button style={toolbarBtnStyle()} onClick={mergeCells} title="Merge Cells">
          <Merge size={14} /> Merge
        </button>

        {/* Freeze */}
        <button style={toolbarBtnStyle(activeSheet.frozenRows > 0)} onClick={freezeTopRow} title="Freeze Top Row">
          <Snowflake size={14} /> Freeze
        </button>

        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

        {/* Conditional Formatting */}
        <button style={toolbarBtnStyle()} onClick={() => setShowCondFmt(true)} title="Conditional Formatting">
          Cond. Fmt
        </button>

        {/* Chart */}
        <button style={toolbarBtnStyle()} onClick={() => { setNewChartRange(selStart && selEnd ? `${selStart}:${selEnd}` : selectedCell); setShowChartModal(true); }} title="Insert Chart">
          <BarChart2 size={14} /> Chart
        </button>

        <div style={{ flex: 1 }} />

        {/* Zoom */}
        <button style={toolbarBtnStyle()} onClick={() => setZoom((z) => Math.max(50, z - 10))}>
          <ZoomOut size={14} />
        </button>
        <span style={{ fontSize: 12, minWidth: 36, textAlign: "center" }}>{zoom}%</span>
        <button style={toolbarBtnStyle()} onClick={() => setZoom((z) => Math.min(200, z + 10))}>
          <ZoomIn size={14} />
        </button>

        {/* Quick formulas */}
        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
        {(["SUM", "AVG", "COUNT", "MAX", "MIN"] as const).map((fn) => (
          <button
            key={fn}
            style={toolbarBtnStyle()}
            onClick={() => {
              const range = selStart && selEnd ? `${selStart}:${selEnd}` : `${selectedCell}:${selectedCell}`;
              const fn2 = fn === "AVG" ? "AVERAGE" : fn;
              const next = parseCellRef(selectedCell);
              if (!next) return;
              const target = cellRef(next.col, next.row + 1);
              updateCell(target, `=${fn2}(${range})`);
              setSelectedCell(target.toUpperCase());
            }}
          >
            {fn}
          </button>
        ))}

        {/* AI */}
        <button style={toolbarBtnStyle(aiOpen)} onClick={() => setAiOpen((v) => !v)} title="AI Assistant">
          <Sparkles size={14} /> AI
        </button>
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
                              onKeyDown={handleCellKeyDown}
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
            <ChartOverlay
              key={ch.id}
              chart={ch}
              data={getChartData(ch.dataRange)}
              onDragStart={startChartDrag}
              onDelete={() => setCharts((prev) => prev.filter((c) => c.id !== ch.id))}
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
            <span>Sum: {statusStats.sum.toFixed(2)}</span>
            <span>Avg: {statusStats.avg.toFixed(2)}</span>
            <span>Count: {statusStats.numCount}</span>
          </>
        )}
        <span style={{ marginLeft: "auto" }}>
          {activeSheet.name} · {DEFAULT_ROWS} rows × {DEFAULT_COLS} cols
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

      {/* Chart Modal */}
      {showChartModal && (
        <Modal title="Insert Chart" onClose={() => setShowChartModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Chart Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["bar", "line", "pie", "area"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewChartType(t)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: newChartType === t ? "var(--primary)" : "var(--border)",
                      background: newChartType === t ? "var(--primary)" : "transparent",
                      color: newChartType === t ? "var(--primary-foreground)" : "var(--foreground)",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Chart Title</label>
              <input value={newChartTitle} onChange={(e) => setNewChartTitle(e.target.value)} placeholder="My Chart" style={{ ...inputStyle, width: "100%", padding: "6px 10px" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Data Range (e.g. A1:B10)</label>
              <input value={newChartRange} onChange={(e) => setNewChartRange(e.target.value.toUpperCase())} placeholder="A1:B10" style={{ ...inputStyle, width: "100%", padding: "6px 10px" }} />
            </div>
            <button
              onClick={insertChart}
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
              Insert Chart
            </button>
          </div>
        </Modal>
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

// ─── ChartOverlay ────────────────────────────────────────────────────────────
interface ChartData {
  name: string;
  value: number;
  [k: string]: string | number;
}

function ChartOverlay({
  chart,
  data,
  onDragStart,
  onDelete,
}: {
  chart: ChartConfig;
  data: ChartData[];
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onDelete: () => void;
}) {
  const { position, type, title } = chart;
  const dataKeys = data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== "name" && typeof data[0][k] === "number")
    : ["value"];

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
        borderRadius: 8,
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
          borderRadius: "6px 6px 0 0",
        }}
        onMouseDown={(e) => onDragStart(chart.id, e)}
      >
        <span style={{ fontSize: 12, fontWeight: 600 }}>{title}</span>
        <button
          onClick={onDelete}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Chart body */}
      <div style={{ flex: 1, padding: "8px 4px" }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              {dataKeys.map((k, i) => (
                <Bar key={k} dataKey={k} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              {dataKeys.map((k, i) => (
                <Line key={k} type="monotone" dataKey={k} stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={2} />
              ))}
            </LineChart>
          ) : type === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              {dataKeys.map((k, i) => (
                <Area key={k} type="monotone" dataKey={k} stroke={PIE_COLORS[i % PIE_COLORS.length]} fill={PIE_COLORS[i % PIE_COLORS.length]} fillOpacity={0.3} />
              ))}
            </AreaChart>
          ) : (
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((_, i) => (
                  <RechartsCell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
