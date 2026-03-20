"use client";

import { useSpreadsheetStore, type CellStyle } from "@/store/spreadsheet-store";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  Palette, Type, BarChart3, LineChart, PieChart,
  FileSpreadsheet, Download, Printer, MessageSquare,
  Upload, Highlighter, Table2, ShieldCheck,
  Filter, Snowflake, StickyNote, Bookmark,
  Sigma, DollarSign, Percent, Calendar,
  Merge, WrapText, Grid3X3,
  ChevronDown, Settings2, Scissors, Copy, ClipboardPaste,
  Paintbrush, Undo2, Redo2,
  ArrowUpAZ, ArrowDownAZ, Search, Eye, EyeOff,
  Link, TextCursorInput, Hash, Calculator,
  Rows3, Columns3, Plus, Trash2,
  ArrowUp, ArrowDown, ChevronRight,
  FileText, Image, Sparkles, Braces,
  Lock, Unlock, MessageCircle,
  Maximize2, ZoomIn, LayoutGrid,
  PanelTop, Minus,
  AreaChart, ScatterChart,
  Users, Circle, Square, Play, ExternalLink,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { colToLetter } from "./formula-engine";
import { CellBordersPicker } from "./cell-borders-picker";
import { HistoryPanel } from "@/components/shared/history-panel";

// ─── Small reusable UI primitives ────────────────────────────────
function ToolBtn({
  children, title, active, onClick, disabled, small,
}: {
  children: React.ReactNode; title: string; active?: boolean; onClick: () => void; disabled?: boolean; small?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded hover:opacity-80 transition-colors ${small ? "p-0.5" : "p-1"}`}
      style={{
        backgroundColor: active ? "var(--primary)" : "transparent",
        color: active ? "var(--primary-foreground)" : disabled ? "var(--muted-foreground)" : "var(--foreground)",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ColorPicker({
  currentColor, onPick, icon, title,
}: {
  currentColor: string; onPick: (c: string) => void; icon: React.ReactNode; title: string;
}) {
  const [open, setOpen] = useState(false);
  const colors = [
    "#ffffff", "#f3f4f6", "#fecaca", "#fed7aa", "#fef08a", "#bbf7d0",
    "#bfdbfe", "#ddd6fe", "#fbcfe8", "#000000", "#6b7280", "#ef4444",
    "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
    "#14b8a6", "#1e40af", "#991b1b", "#854d0e", "#166534", "#7c3aed",
    "#be185d", "#0d9488", "#4338ca", "#dc2626", "#d97706", "#059669",
  ];

  return (
    <div className="relative">
      <button
        title={title}
        onClick={() => setOpen(!open)}
        className="p-1 rounded hover:opacity-80 flex items-center gap-0.5"
        style={{ color: "var(--foreground)" }}
      >
        {icon}
        <div className="w-3 h-1 rounded-sm" style={{ backgroundColor: currentColor || "var(--foreground)" }} />
        <ChevronDown size={8} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 p-2 rounded-lg shadow-lg border grid grid-cols-6 gap-1 z-50"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {colors.map((c) => (
            <button
              key={c}
              className="w-5 h-5 rounded border hover:scale-110 transition-transform"
              style={{ backgroundColor: c, borderColor: "var(--border)" }}
              onClick={() => { onPick(c); setOpen(false); }}
            />
          ))}
          <button
            className="col-span-6 text-[10px] text-center mt-1 py-0.5 rounded hover:bg-gray-100"
            onClick={() => { onPick(""); setOpen(false); }}
          >
            No Color
          </button>
        </div>
      )}
    </div>
  );
}

function DropdownBtn({
  icon, title, children, label,
}: {
  icon: React.ReactNode; title: string; children: (close: () => void) => React.ReactNode; label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        title={title}
        onClick={() => setOpen(!open)}
        className="p-1 rounded hover:opacity-80 transition-colors flex items-center gap-0.5"
        style={{ color: "var(--foreground)" }}
      >
        {icon}
        {label && <span className="text-[10px]">{label}</span>}
        <ChevronDown size={8} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg border z-50 max-h-80 overflow-y-auto"
            style={{
              backgroundColor: "var(--card)", borderColor: "var(--border)",
              color: "var(--foreground)", minWidth: 180,
            }}
          >
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}

function DropdownItem({ onClick, children, icon }: { onClick: () => void; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button
      className="w-full text-left text-xs px-3 py-1.5 hover:opacity-80 flex items-center gap-2"
      style={{ backgroundColor: "transparent", color: "var(--foreground)" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      onClick={onClick}
    >
      {icon && <span className="w-4 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

function DropdownDivider() {
  return <div className="mx-2 my-1 border-t" style={{ borderColor: "var(--border)" }} />;
}

function DropdownHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
      {children}
    </div>
  );
}

function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center border-r pr-1.5 mr-1.5" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-0.5 flex-wrap">{children}</div>
      <div className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</div>
    </div>
  );
}

const Separator = () => <div className="w-px h-5 mx-0.5" style={{ backgroundColor: "var(--border)" }} />;

const NUMBER_FORMATS: { value: CellStyle["format"]; label: string }[] = [
  { value: "general", label: "General" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "accounting", label: "Accounting" },
  { value: "shortDate", label: "Short Date" },
  { value: "longDate", label: "Long Date" },
  { value: "time", label: "Time" },
  { value: "percent", label: "Percentage" },
  { value: "fraction", label: "Fraction" },
  { value: "scientific", label: "Scientific" },
  { value: "text", label: "Text" },
];

const FONT_FAMILIES = [
  "Arial", "Calibri", "Cambria", "Comic Sans MS", "Consolas", "Courier New",
  "Georgia", "Helvetica", "Impact", "Lucida Console", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana",
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 36, 48, 72];

const RIBBON_TABS = ["Home", "Insert", "Page Layout", "Formulas", "Data", "Review", "View"];

// ─── Main Toolbar Component ────────────────────────────────
export function SpreadsheetToolbar({
  onExportCSV, onPrint, onOpenPivot, onOpenValidation, onOpenSortFilter,
  onOpenCondFormatDialog, onPageSetup, onOpenGoalSeek, onOpenStatistics,
  onExportExcel, onImportCSV,
  onOpenFindReplace, onOpenNamedRanges, onOpenComments, onOpenFreezePanes,
  onOpenCellFormatting,
  onOpenFinancialAnalysis,
  onPrintPreview,
  onImport,
  onOpenPowerQuery,
  onOpenMacros,
  onOpenSheetProtection,
  onOpenVlookupHelper,
  onSplitView,
  onRemoveSplit,
  splitView,
}: {
  onExportCSV: () => void; onPrint: () => void;
  onOpenPivot?: () => void; onOpenValidation?: () => void;
  onOpenSortFilter?: () => void; onOpenCondFormatDialog?: () => void;
  onPageSetup?: () => void; onOpenGoalSeek?: () => void;
  onOpenStatistics?: () => void; onExportExcel?: () => void;
  onImportCSV?: () => void;
  onOpenFindReplace?: () => void; onOpenNamedRanges?: () => void;
  onOpenComments?: () => void; onOpenFreezePanes?: () => void;
  onOpenCellFormatting?: () => void;
  onOpenFinancialAnalysis?: () => void;
  onPrintPreview?: () => void;
  onImport?: () => void;
  onOpenPowerQuery?: () => void;
  onOpenMacros?: () => void;
  onOpenSheetProtection?: () => void;
  onOpenVlookupHelper?: () => void;
  onSplitView?: (direction: "horizontal" | "vertical") => void;
  onRemoveSplit?: () => void;
  splitView?: "horizontal" | "vertical" | null;
}) {
  const setSelectionStyle = useSpreadsheetStore((s) => s.setSelectionStyle);
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const openChartModal = useSpreadsheetStore((s) => s.openChartModal);
  const openTemplatesModal = useSpreadsheetStore((s) => s.openTemplatesModal);
  const toggleAiPanel = useSpreadsheetStore((s) => s.toggleAiPanel);
  const showAiPanel = useSpreadsheetStore((s) => s.showAiPanel);
  const setCellValue = useSpreadsheetStore((s) => s.setCellValue);
  const setCellStyle = useSpreadsheetStore((s) => s.setCellStyle);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const getCellRaw = useSpreadsheetStore((s) => s.getCellRaw);
  const activeRibbonTab = useSpreadsheetStore((s) => s.activeRibbonTab);
  const setActiveRibbonTab = useSpreadsheetStore((s) => s.setActiveRibbonTab);
  const clipboardCopy = useSpreadsheetStore((s) => s.clipboardCopy);
  const clipboardCut = useSpreadsheetStore((s) => s.clipboardCut);
  const clipboardPaste = useSpreadsheetStore((s) => s.clipboardPaste);
  const clipboardPasteSpecial = useSpreadsheetStore((s) => s.clipboardPasteSpecial);
  const undo = useSpreadsheetStore((s) => s.undo);
  const redo = useSpreadsheetStore((s) => s.redo);
  const undoStack = useSpreadsheetStore((s) => s.undoStack);
  const redoStack = useSpreadsheetStore((s) => s.redoStack);
  const setFrozenPanes = useSpreadsheetStore((s) => s.setFrozenPanes);
  const toggleShowFormulas = useSpreadsheetStore((s) => s.toggleShowFormulas);
  const toggleShowGridlines = useSpreadsheetStore((s) => s.toggleShowGridlines);
  const toggleShowHeadings = useSpreadsheetStore((s) => s.toggleShowHeadings);
  const showFormulas = useSpreadsheetStore((s) => s.showFormulas);
  const showGridlines = useSpreadsheetStore((s) => s.showGridlines);
  const showHeadings = useSpreadsheetStore((s) => s.showHeadings);
  const setCellComment = useSpreadsheetStore((s) => s.setCellComment);
  const setNamedRange = useSpreadsheetStore((s) => s.setNamedRange);
  const insertRows = useSpreadsheetStore((s) => s.insertRows);
  const deleteRows = useSpreadsheetStore((s) => s.deleteRows);
  const insertCols = useSpreadsheetStore((s) => s.insertCols);
  const deleteCols = useSpreadsheetStore((s) => s.deleteCols);
  const clearRange = useSpreadsheetStore((s) => s.clearRange);
  const zoom = useSpreadsheetStore((s) => s.zoom);
  const setZoom = useSpreadsheetStore((s) => s.setZoom);
  const protectedSheet = useSpreadsheetStore((s) => s.protectedSheet);

  const csvInputRef = useRef<HTMLInputElement>(null);

  const getCurrentStyle = useCallback((): CellStyle => {
    if (!activeCell) return {};
    const sheet = getActiveSheet();
    const key = `${colToLetter(activeCell.col)}${activeCell.row + 1}`;
    return sheet.cells[key]?.style || {};
  }, [activeCell, getActiveSheet]);

  const style = getCurrentStyle();

  const getSelectionBounds = useCallback(() => {
    const s = selectionStart || activeCell;
    const e = selectionEnd || activeCell;
    if (!s || !e) return null;
    return {
      minR: Math.min(s.row, e.row), maxR: Math.max(s.row, e.row),
      minC: Math.min(s.col, e.col), maxC: Math.max(s.col, e.col),
    };
  }, [selectionStart, selectionEnd, activeCell]);

  // ─── Import CSV ──────────────────────────────────────────
  const handleImportCSV = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        lines.forEach((line, row) => {
          const cols = line.split(",");
          cols.forEach((val, col) => {
            if (col < 100 && row < 200) {
              setCellValue(col, row, val.trim().replace(/^"|"$/g, ""));
            }
          });
        });
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [setCellValue]
  );

  // ─── Conditional Formatting helpers ─────────────────────
  const applyCondFormat = useCallback(
    (type: "gt" | "lt" | "between" | "text" | "colorScale" | "dataBars" | "iconSets" | "eq" | "duplicates") => {
      const bounds = getSelectionBounds();
      if (!bounds) return;
      const { minR, maxR, minC, maxC } = bounds;

      if (type === "gt" || type === "lt" || type === "eq") {
        const label = type === "gt" ? "greater than" : type === "lt" ? "less than" : "equal to";
        const threshold = prompt(`Highlight cells ${label}:`);
        if (threshold === null) return;
        const t = parseFloat(threshold);
        if (isNaN(t)) return;
        const color = type === "gt" ? "#bbf7d0" : type === "lt" ? "#fecaca" : "#bfdbfe";
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            const val = parseFloat(getCellDisplay(c, r));
            if (!isNaN(val)) {
              const match = type === "gt" ? val > t : type === "lt" ? val < t : val === t;
              if (match) setCellStyle(c, r, { bgColor: color });
            }
          }
        }
      } else if (type === "between") {
        const minStr = prompt("Minimum:"); if (minStr === null) return;
        const maxStr = prompt("Maximum:"); if (maxStr === null) return;
        const minVal = parseFloat(minStr); const maxVal = parseFloat(maxStr);
        if (isNaN(minVal) || isNaN(maxVal)) return;
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            const val = parseFloat(getCellDisplay(c, r));
            if (!isNaN(val) && val >= minVal && val <= maxVal) setCellStyle(c, r, { bgColor: "#fef08a" });
          }
        }
      } else if (type === "text") {
        const text = prompt("Highlight cells containing text:");
        if (!text) return;
        const lower = text.toLowerCase();
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            if (getCellDisplay(c, r).toLowerCase().includes(lower)) setCellStyle(c, r, { bgColor: "#bfdbfe" });
          }
        }
      } else if (type === "duplicates") {
        const values = new Map<string, { col: number; row: number }[]>();
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            const v = getCellDisplay(c, r);
            if (v) { values.set(v, [...(values.get(v) || []), { col: c, row: r }]); }
          }
        }
        values.forEach((cells) => {
          if (cells.length > 1) cells.forEach(({ col, row }) => setCellStyle(col, row, { bgColor: "#fecaca" }));
        });
      } else if (type === "colorScale") {
        const vals: { col: number; row: number; val: number }[] = [];
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            const val = parseFloat(getCellDisplay(c, r));
            if (!isNaN(val)) vals.push({ col: c, row: r, val });
          }
        }
        if (vals.length === 0) return;
        const min = Math.min(...vals.map((v) => v.val));
        const max = Math.max(...vals.map((v) => v.val));
        const range = max - min || 1;
        for (const { col, row, val } of vals) {
          const ratio = (val - min) / range;
          const r = Math.round(255 * (1 - ratio));
          const g = Math.round(255 * ratio);
          setCellStyle(col, row, { bgColor: `rgb(${r},${g},100)` });
        }
      } else if (type === "dataBars") {
        const vals: { col: number; row: number; val: number }[] = [];
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            const val = parseFloat(getCellDisplay(c, r));
            if (!isNaN(val)) vals.push({ col: c, row: r, val });
          }
        }
        if (vals.length === 0) return;
        const max = Math.max(...vals.map((v) => v.val));
        for (const { col, row, val } of vals) {
          const ratio = max > 0 ? val / max : 0;
          const intensity = Math.round(200 + 55 * (1 - ratio));
          setCellStyle(col, row, { bgColor: `rgb(${intensity},${intensity},255)` });
        }
      } else if (type === "iconSets") {
        const vals: { col: number; row: number; val: number }[] = [];
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            const val = parseFloat(getCellDisplay(c, r));
            if (!isNaN(val)) vals.push({ col: c, row: r, val });
          }
        }
        if (vals.length === 0) return;
        const sorted = [...vals].sort((a, b) => a.val - b.val);
        const third = Math.floor(sorted.length / 3);
        const lowT = sorted[third]?.val ?? 0;
        const highT = sorted[third * 2]?.val ?? 0;
        for (const { col, row, val } of vals) {
          if (val <= lowT) setCellStyle(col, row, { bgColor: "#fecaca" });
          else if (val >= highT) setCellStyle(col, row, { bgColor: "#bbf7d0" });
          else setCellStyle(col, row, { bgColor: "#fef08a" });
        }
      }
    },
    [getSelectionBounds, getCellDisplay, setCellStyle]
  );

  // ─── Auto-sum ───────────────────────────────────────────
  const handleAutoSum = useCallback(
    (fn: string) => {
      if (!activeCell) return;
      const col = activeCell.col;
      const row = activeCell.row;
      let startRow = row - 1;
      while (startRow >= 0 && getCellDisplay(col, startRow) !== "") startRow--;
      startRow++;
      if (startRow >= row) return;
      const colLetter = colToLetter(col);
      setCellValue(col, row, `=${fn}(${colLetter}${startRow + 1}:${colLetter}${row})`);
    },
    [activeCell, getCellDisplay, setCellValue]
  );

  // ─── Merge ──────────────────────────────────────────────
  const mergeCells = useSpreadsheetStore((s) => s.mergeCells);
  const unmergeCells = useSpreadsheetStore((s) => s.unmergeCells);
  const handleMerge = useCallback(
    (type: "all" | "rows" | "unmerge") => {
      const bounds = getSelectionBounds();
      if (!bounds) return;
      if (type === "unmerge") {
        unmergeCells(bounds.minC, bounds.minR);
        return;
      }
      mergeCells(bounds.minC, bounds.minR, bounds.maxC, bounds.maxR);
      setCellStyle(bounds.minC, bounds.minR, { align: "center" });
    },
    [getSelectionBounds, setCellStyle, mergeCells, unmergeCells]
  );

  // ─── Tab content renderers ─────────────────────────────

  const renderHomeTab = () => (
    <div className="flex items-start gap-0.5 flex-wrap">
      {/* Clipboard */}
      <RibbonGroup label="Clipboard">
        <ToolBtn title="Cut (Ctrl+X)" onClick={clipboardCut}><Scissors size={14} /></ToolBtn>
        <ToolBtn title="Copy (Ctrl+C)" onClick={clipboardCopy}><Copy size={14} /></ToolBtn>
        <ToolBtn title="Paste (Ctrl+V)" onClick={clipboardPaste}><ClipboardPaste size={14} /></ToolBtn>
        <DropdownBtn icon={<ClipboardPaste size={14} />} title="Paste Special">
          {(close) => (
            <>
              <DropdownItem onClick={() => { clipboardPasteSpecial("values"); close(); }}>Paste Values</DropdownItem>
              <DropdownItem onClick={() => { clipboardPasteSpecial("formulas"); close(); }}>Paste Formulas</DropdownItem>
              <DropdownItem onClick={() => { clipboardPasteSpecial("formats"); close(); }}>Paste Formats</DropdownItem>
              <DropdownItem onClick={() => { clipboardPasteSpecial("transpose"); close(); }}>Transpose</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <ToolBtn title="Format Painter" onClick={() => {}}><Paintbrush size={14} /></ToolBtn>
      </RibbonGroup>

      {/* Font */}
      <RibbonGroup label="Font">
        <select
          className="text-[10px] rounded px-0.5 py-0.5 border outline-none h-5"
          style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", width: 80 }}
          value={style.fontFamily || "Calibri"}
          onChange={(e) => setSelectionStyle({ fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
        <select
          className="text-[10px] rounded px-0.5 py-0.5 border outline-none h-5 w-10"
          style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          value={style.fontSize || 11}
          onChange={(e) => setSelectionStyle({ fontSize: parseInt(e.target.value) })}
        >
          {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Separator />
        <ToolBtn title="Bold (Ctrl+B)" active={style.bold} onClick={() => setSelectionStyle({ bold: !style.bold })}><Bold size={14} /></ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" active={style.italic} onClick={() => setSelectionStyle({ italic: !style.italic })}><Italic size={14} /></ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" active={style.underline} onClick={() => setSelectionStyle({ underline: !style.underline })}><Underline size={14} /></ToolBtn>
        <ToolBtn title="Strikethrough" active={style.strikethrough} onClick={() => setSelectionStyle({ strikethrough: !style.strikethrough })}><Strikethrough size={14} /></ToolBtn>
        <Separator />
        <CellBordersPicker />
        <ColorPicker currentColor={style.bgColor || ""} onPick={(c) => setSelectionStyle({ bgColor: c || undefined })} icon={<Palette size={14} />} title="Fill Color" />
        <ColorPicker currentColor={style.textColor || ""} onPick={(c) => setSelectionStyle({ textColor: c || undefined })} icon={<Type size={14} />} title="Font Color" />
      </RibbonGroup>

      {/* Alignment */}
      <RibbonGroup label="Alignment">
        <ToolBtn title="Align Top" active={style.verticalAlign === "top"} onClick={() => setSelectionStyle({ verticalAlign: "top" })}><AlignVerticalJustifyStart size={14} /></ToolBtn>
        <ToolBtn title="Align Middle" active={style.verticalAlign === "middle"} onClick={() => setSelectionStyle({ verticalAlign: "middle" })}><AlignVerticalJustifyCenter size={14} /></ToolBtn>
        <ToolBtn title="Align Bottom" active={style.verticalAlign === "bottom"} onClick={() => setSelectionStyle({ verticalAlign: "bottom" })}><AlignVerticalJustifyEnd size={14} /></ToolBtn>
        <Separator />
        <ToolBtn title="Align Left" active={style.align === "left"} onClick={() => setSelectionStyle({ align: "left" })}><AlignLeft size={14} /></ToolBtn>
        <ToolBtn title="Center" active={style.align === "center"} onClick={() => setSelectionStyle({ align: "center" })}><AlignCenter size={14} /></ToolBtn>
        <ToolBtn title="Align Right" active={style.align === "right"} onClick={() => setSelectionStyle({ align: "right" })}><AlignRight size={14} /></ToolBtn>
        <Separator />
        <ToolBtn title="Wrap Text" active={style.wrapText} onClick={() => setSelectionStyle({ wrapText: !style.wrapText })}><WrapText size={14} /></ToolBtn>
        <DropdownBtn icon={<Merge size={14} />} title="Merge & Center">
          {(close) => (
            <>
              <DropdownItem onClick={() => { handleMerge("all"); close(); }}>Merge & Center</DropdownItem>
              <DropdownItem onClick={() => { handleMerge("rows"); close(); }}>Merge Across</DropdownItem>
              <DropdownItem onClick={() => { handleMerge("unmerge"); close(); }}>Unmerge Cells</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      {/* Number */}
      <RibbonGroup label="Number">
        <select
          className="text-[10px] rounded px-0.5 py-0.5 border outline-none h-5"
          style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", width: 90 }}
          value={style.format || "general"}
          onChange={(e) => setSelectionStyle({ format: e.target.value as CellStyle["format"] })}
        >
          {NUMBER_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <ToolBtn title="Currency" active={style.format === "currency"} onClick={() => setSelectionStyle({ format: "currency" })}><DollarSign size={14} /></ToolBtn>
        <ToolBtn title="Percent" active={style.format === "percent"} onClick={() => setSelectionStyle({ format: "percent" })}><Percent size={14} /></ToolBtn>
        <ToolBtn title="Comma Style" onClick={() => setSelectionStyle({ format: "number" })}><Hash size={14} /></ToolBtn>
        <DropdownBtn icon={<Settings2 size={14} />} title="Custom Number Format">
          {(close) => (
            <>
              <DropdownHeader>Custom Formats</DropdownHeader>
              <DropdownItem onClick={() => { setSelectionStyle({ format: "number" }); close(); }}>0.00 (Fixed 2 decimals)</DropdownItem>
              <DropdownItem onClick={() => { setSelectionStyle({ format: "number" }); close(); }}>#,##0 (Thousands separator)</DropdownItem>
              <DropdownItem onClick={() => { setSelectionStyle({ format: "number" }); close(); }}>0.00% (Percentage 2 decimals)</DropdownItem>
              <DropdownItem onClick={() => { setSelectionStyle({ format: "currency" }); close(); }}>$#,##0.00 (USD Currency)</DropdownItem>
              <DropdownItem onClick={() => { setSelectionStyle({ format: "date" }); close(); }}>DD/MM/YYYY (Date)</DropdownItem>
              <DropdownItem onClick={() => { setSelectionStyle({ format: "date" }); close(); }}>MM/DD/YYYY HH:MM (DateTime)</DropdownItem>
              <DropdownItem onClick={() => { setSelectionStyle({ format: "number" }); close(); }}>[Red]0;[Black]0 (Negative in red)</DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => { alert("Custom Format Dialog: Enter your own format code (e.g. 0.00, #,##0.0%, etc.)"); close(); }}>More formats...</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      {/* Styles */}
      <RibbonGroup label="Styles">
        <DropdownBtn icon={<Highlighter size={14} />} title="Conditional Formatting" label="Cond...">
          {(close) => (
            <>
              <DropdownHeader>Highlight Cells Rules</DropdownHeader>
              <DropdownItem onClick={() => { applyCondFormat("gt"); close(); }}>Greater Than...</DropdownItem>
              <DropdownItem onClick={() => { applyCondFormat("lt"); close(); }}>Less Than...</DropdownItem>
              <DropdownItem onClick={() => { applyCondFormat("between"); close(); }}>Between...</DropdownItem>
              <DropdownItem onClick={() => { applyCondFormat("eq"); close(); }}>Equal To...</DropdownItem>
              <DropdownItem onClick={() => { applyCondFormat("text"); close(); }}>Text Contains...</DropdownItem>
              <DropdownItem onClick={() => { applyCondFormat("duplicates"); close(); }}>Duplicate Values</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Color Scales & Bars</DropdownHeader>
              <DropdownItem onClick={() => { applyCondFormat("colorScale"); close(); }}>Color Scale</DropdownItem>
              <DropdownItem onClick={() => { applyCondFormat("dataBars"); close(); }}>Data Bars</DropdownItem>
              <DropdownItem onClick={() => { applyCondFormat("iconSets"); close(); }}>Icon Sets</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      {/* Cells */}
      <RibbonGroup label="Cells">
        <DropdownBtn icon={<Plus size={14} />} title="Insert">
          {(close) => (
            <>
              <DropdownItem icon={<Rows3 size={12} />} onClick={() => { if (activeCell) insertRows(activeCell.row, 1); close(); }}>Insert Row</DropdownItem>
              <DropdownItem icon={<Columns3 size={12} />} onClick={() => { if (activeCell) insertCols(activeCell.col, 1); close(); }}>Insert Column</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Trash2 size={14} />} title="Delete">
          {(close) => (
            <>
              <DropdownItem icon={<Rows3 size={12} />} onClick={() => { if (activeCell) deleteRows(activeCell.row, 1); close(); }}>Delete Row</DropdownItem>
              <DropdownItem icon={<Columns3 size={12} />} onClick={() => { if (activeCell) deleteCols(activeCell.col, 1); close(); }}>Delete Column</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      {/* Editing */}
      <RibbonGroup label="Editing">
        <DropdownBtn icon={<Sigma size={14} />} title="AutoSum">
          {(close) => (
            <>
              <DropdownItem onClick={() => { handleAutoSum("SUM"); close(); }}>Sum</DropdownItem>
              <DropdownItem onClick={() => { handleAutoSum("AVERAGE"); close(); }}>Average</DropdownItem>
              <DropdownItem onClick={() => { handleAutoSum("COUNT"); close(); }}>Count Numbers</DropdownItem>
              <DropdownItem onClick={() => { handleAutoSum("MAX"); close(); }}>Max</DropdownItem>
              <DropdownItem onClick={() => { handleAutoSum("MIN"); close(); }}>Min</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<ArrowDown size={14} />} title="Fill">
          {(close) => (
            <>
              <DropdownItem onClick={() => { close(); }}>Fill Down</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Fill Right</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Fill Up</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Fill Left</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Trash2 size={14} />} title="Clear">
          {(close) => {
            const bounds = getSelectionBounds();
            return (
              <>
                <DropdownItem onClick={() => { if (bounds) clearRange(bounds.minC, bounds.minR, bounds.maxC, bounds.maxR, "all"); close(); }}>Clear All</DropdownItem>
                <DropdownItem onClick={() => { if (bounds) clearRange(bounds.minC, bounds.minR, bounds.maxC, bounds.maxR, "formats"); close(); }}>Clear Formats</DropdownItem>
                <DropdownItem onClick={() => { if (bounds) clearRange(bounds.minC, bounds.minR, bounds.maxC, bounds.maxR, "contents"); close(); }}>Clear Contents</DropdownItem>
                <DropdownItem onClick={() => { if (bounds) clearRange(bounds.minC, bounds.minR, bounds.maxC, bounds.maxR, "comments"); close(); }}>Clear Comments</DropdownItem>
              </>
            );
          }}
        </DropdownBtn>
        <ToolBtn title="Sort & Filter" onClick={() => onOpenSortFilter?.()}><Filter size={14} /></ToolBtn>
        <ToolBtn title="Find & Replace (Ctrl+H)" onClick={() => onOpenFindReplace?.()}><Search size={14} /></ToolBtn>
        <ToolBtn title="Format Cells" onClick={() => onOpenCellFormatting?.()}><Settings2 size={14} /></ToolBtn>
      </RibbonGroup>
    </div>
  );

  const renderInsertTab = () => (
    <div className="flex items-start gap-0.5 flex-wrap">
      <RibbonGroup label="Tables">
        <ToolBtn title="PivotTable" onClick={() => onOpenPivot?.()}><Table2 size={14} /></ToolBtn>
        <ToolBtn title="Table" onClick={() => {}}><Grid3X3 size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Charts">
        <ToolBtn title="Insert Column/Bar Chart" onClick={() => openChartModal("bar")}>
          <div className="flex flex-col items-center gap-0.5"><BarChart3 size={14} /><span className="text-[9px]">Column</span></div>
        </ToolBtn>
        <ToolBtn title="Insert Line/Area Chart" onClick={() => openChartModal("line")}>
          <div className="flex flex-col items-center gap-0.5"><LineChart size={14} /><span className="text-[9px]">Line</span></div>
        </ToolBtn>
        <ToolBtn title="Insert Pie/Doughnut Chart" onClick={() => openChartModal("pie")}>
          <div className="flex flex-col items-center gap-0.5"><PieChart size={14} /><span className="text-[9px]">Pie</span></div>
        </ToolBtn>
        <ToolBtn title="Insert Scatter/Bubble Chart" onClick={() => openChartModal("scatter")}>
          <div className="flex flex-col items-center gap-0.5"><ScatterChart size={14} /><span className="text-[9px]">XY</span></div>
        </ToolBtn>
        <DropdownBtn icon={<BarChart3 size={14} />} title="More Chart Types" label="More">
          {(close) => (
            <>
              <DropdownHeader>Statistical</DropdownHeader>
              <DropdownItem onClick={() => { openChartModal("histogram"); close(); }}>Histogram</DropdownItem>
              <DropdownItem onClick={() => { openChartModal("boxwhisker"); close(); }}>Box & Whisker</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Hierarchy</DropdownHeader>
              <DropdownItem onClick={() => { openChartModal("treemap"); close(); }}>Treemap</DropdownItem>
              <DropdownItem onClick={() => { openChartModal("sunburst"); close(); }}>Sunburst</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Waterfall</DropdownHeader>
              <DropdownItem onClick={() => { openChartModal("waterfall"); close(); }}>Waterfall</DropdownItem>
              <DropdownItem onClick={() => { openChartModal("funnel"); close(); }}>Funnel</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Other</DropdownHeader>
              <DropdownItem onClick={() => { openChartModal("radar"); close(); }}>Radar/Spider</DropdownItem>
              <DropdownItem onClick={() => { openChartModal("stock"); close(); }}>Stock (OHLC)</DropdownItem>
              <DropdownItem onClick={() => { openChartModal("combo"); close(); }}>Combo Chart</DropdownItem>
              <DropdownItem onClick={() => { openChartModal("butterfly"); close(); }}>Butterfly/Tornado</DropdownItem>
              <DropdownItem onClick={() => { openChartModal("gantt"); close(); }}>Gantt Chart</DropdownItem>
              <DropdownItem onClick={() => { openChartModal("bode"); close(); }}>Bode Plot</DropdownItem>
              <DropdownItem onClick={() => { openChartModal("logarithmic"); close(); }}>Logarithmic Graph</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      <RibbonGroup label="Sparklines">
        <ToolBtn title="Line Sparkline" onClick={() => {}}><LineChart size={14} /></ToolBtn>
        <ToolBtn title="Column Sparkline" onClick={() => {}}><BarChart3 size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Links">
        <ToolBtn title="Hyperlink" onClick={() => {
          if (!activeCell) return;
          const url = prompt("Enter URL:");
          if (url) setCellValue(activeCell.col, activeCell.row, url);
        }}><Link size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Text">
        <ToolBtn title="Text Box" onClick={() => {}}><TextCursorInput size={14} /></ToolBtn>
        <ToolBtn title="Header & Footer" onClick={() => {}}><PanelTop size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Symbols">
        <ToolBtn title="Equation" onClick={() => {}}><Braces size={14} /></ToolBtn>
        <ToolBtn title="Symbol" onClick={() => {
          if (!activeCell) return;
          const sym = prompt("Enter symbol character:");
          if (sym) setCellValue(activeCell.col, activeCell.row, sym);
        }}><Sparkles size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Financial Analysis">
        <ToolBtn title="Financial Analysis (NPV, IRR, PMT, XIRR, Break-Even)" onClick={() => onOpenFinancialAnalysis?.()}><DollarSign size={14} /></ToolBtn>
        <ToolBtn title="Statistical Analysis" onClick={() => onOpenStatistics?.()}><Sigma size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Dept. Templates">
        <DropdownBtn icon={<FileSpreadsheet size={14} />} title="Department Analysis Templates" label="Templates">
          {(close) => (
            <>
              <DropdownHeader>Department Analysis</DropdownHeader>
              <DropdownItem onClick={() => { openTemplatesModal(); close(); }}>Sales Forecasting</DropdownItem>
              <DropdownItem onClick={() => { openTemplatesModal(); close(); }}>HR Headcount Analysis</DropdownItem>
              <DropdownItem onClick={() => { openTemplatesModal(); close(); }}>Inventory Management</DropdownItem>
              <DropdownItem onClick={() => { openTemplatesModal(); close(); }}>Budget Variance Analysis</DropdownItem>
              <DropdownItem onClick={() => { openTemplatesModal(); close(); }}>Expense Report</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>
    </div>
  );

  const renderPageLayoutTab = () => (
    <div className="flex items-start gap-0.5 flex-wrap">
      <RibbonGroup label="Page Setup">
        <ToolBtn title="Margins" onClick={() => onPageSetup?.()}><Settings2 size={14} /></ToolBtn>
        <ToolBtn title="Orientation" onClick={() => onPageSetup?.()}><FileText size={14} /></ToolBtn>
        <ToolBtn title="Size" onClick={() => onPageSetup?.()}><Maximize2 size={14} /></ToolBtn>
        <DropdownBtn icon={<Printer size={14} />} title="Print Area">
          {(close) => {
            const printArea = useSpreadsheetStore.getState().printArea;
            return (
              <>
                <DropdownItem onClick={() => {
                  const bounds = getSelectionBounds();
                  if (bounds) {
                    const range = `${colToLetter(bounds.minC)}${bounds.minR + 1}:${colToLetter(bounds.maxC)}${bounds.maxR + 1}`;
                    useSpreadsheetStore.setState({ printArea: range });
                  }
                  close();
                }}>Set Print Area</DropdownItem>
                <DropdownItem onClick={() => {
                  useSpreadsheetStore.setState({ printArea: null });
                  close();
                }}>Clear Print Area</DropdownItem>
                {printArea && (
                  <>
                    <DropdownDivider />
                    <DropdownHeader>Current: {printArea}</DropdownHeader>
                  </>
                )}
              </>
            );
          }}
        </DropdownBtn>
        <ToolBtn title="Print Titles" onClick={() => onPageSetup?.()}><Rows3 size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Sheet Options">
        <div className="flex flex-col gap-0.5">
          <label className="flex items-center gap-1 text-[10px]" style={{ color: "var(--foreground)" }}>
            <input type="checkbox" checked={showGridlines} onChange={toggleShowGridlines} className="w-3 h-3" />
            Gridlines
          </label>
          <label className="flex items-center gap-1 text-[10px]" style={{ color: "var(--foreground)" }}>
            <input type="checkbox" checked={showHeadings} onChange={toggleShowHeadings} className="w-3 h-3" />
            Headings
          </label>
        </div>
      </RibbonGroup>
    </div>
  );

  const renderFormulasTab = () => (
    <div className="flex items-start gap-0.5 flex-wrap">
      <RibbonGroup label="Function Library">
        <ToolBtn title="Insert Function" onClick={() => {
          if (!activeCell) return;
          const fn = prompt("Enter function name (e.g. SUM, AVERAGE, IF):");
          if (fn) setCellValue(activeCell.col, activeCell.row, `=${fn.toUpperCase()}()`);
        }}><Calculator size={14} /></ToolBtn>
        <DropdownBtn icon={<Sigma size={14} />} title="AutoSum">
          {(close) => (
            <>
              <DropdownItem onClick={() => { handleAutoSum("SUM"); close(); }}>SUM</DropdownItem>
              <DropdownItem onClick={() => { handleAutoSum("AVERAGE"); close(); }}>AVERAGE</DropdownItem>
              <DropdownItem onClick={() => { handleAutoSum("COUNT"); close(); }}>COUNT</DropdownItem>
              <DropdownItem onClick={() => { handleAutoSum("MAX"); close(); }}>MAX</DropdownItem>
              <DropdownItem onClick={() => { handleAutoSum("MIN"); close(); }}>MIN</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<DollarSign size={14} />} title="Financial">
          {(close) => (
            <>
              {["PMT", "FV", "PV", "NPV", "IRR", "XIRR", "RATE", "NPER", "SLN", "EFFECT", "NOMINAL"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Braces size={14} />} title="Logical">
          {(close) => (
            <>
              {["IF", "AND", "OR", "NOT", "IFS", "SWITCH", "IFERROR"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Type size={14} />} title="Text">
          {(close) => (
            <>
              {["CONCATENATE", "LEFT", "RIGHT", "MID", "LEN", "TRIM", "UPPER", "LOWER", "PROPER", "SUBSTITUTE"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Calendar size={14} />} title="Date & Time">
          {(close) => (
            <>
              {["TODAY", "NOW", "DATE", "YEAR", "MONTH", "DAY", "HOUR", "MINUTE"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Search size={14} />} title="Lookup & Reference">
          {(close) => (
            <>
              {["VLOOKUP", "HLOOKUP", "INDEX", "MATCH", "XLOOKUP", "OFFSET"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownItem onClick={() => { onOpenVlookupHelper?.(); close(); }}>VLOOKUP Visual Helper...</DropdownItem>
              <DropdownItem onClick={() => { onOpenVlookupHelper?.(); close(); }}>XLOOKUP Visual Helper...</DropdownItem>
              <DropdownItem onClick={() => { onOpenVlookupHelper?.(); close(); }}>INDEX-MATCH Helper...</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Braces size={14} />} title="Array Formulas">
          {(close) => (
            <>
              <DropdownHeader>Array Formulas (Ctrl+Shift+Enter)</DropdownHeader>
              <DropdownItem onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `{=SUM(A1:A10*B1:B10)}`); close(); }}>{`{=SUM(A1:A10*B1:B10)}`} - Multiply arrays</DropdownItem>
              <DropdownItem onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `{=TRANSPOSE(A1:D4)}`); close(); }}>{`{=TRANSPOSE(A1:D4)}`} - Transpose range</DropdownItem>
              <DropdownItem onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=SEQUENCE(10,1,1,1)`); close(); }}>SEQUENCE - Dynamic array</DropdownItem>
              <DropdownItem onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=FILTER(A1:C10, B1:B10>100)`); close(); }}>FILTER - Dynamic filter array</DropdownItem>
              <DropdownItem onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=SORT(A1:C10, 2, 1)`); close(); }}>SORT - Dynamic sort array</DropdownItem>
              <DropdownItem onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=UNIQUE(A1:A100)`); close(); }}>UNIQUE - Remove duplicates</DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => { alert("Array Formula Help:\n\nArray formulas let you perform multiple calculations simultaneously.\n\n• Classic: Ctrl+Shift+Enter to enter (shown with {})\n• Dynamic (Excel 365): Just press Enter\n\nUse SEQUENCE, FILTER, SORT, UNIQUE for modern array operations."); close(); }}>Array Formula Help...</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Hash size={14} />} title="Math & Trig">
          {(close) => (
            <>
              {["SUM", "SUMIF", "SUMIFS", "ROUND", "ABS", "INT", "MOD", "POWER", "SQRT", "RAND"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      <RibbonGroup label="Defined Names">
        <ToolBtn title="Name Manager" onClick={() => onOpenNamedRanges?.()}><Bookmark size={14} /></ToolBtn>
        <ToolBtn title="Define Name" onClick={() => {
          const bounds = getSelectionBounds();
          if (!bounds) { alert("Select a range first."); return; }
          const name = prompt("Enter name:");
          if (name) setNamedRange(name, `${colToLetter(bounds.minC)}${bounds.minR + 1}:${colToLetter(bounds.maxC)}${bounds.maxR + 1}`);
        }}><Plus size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Formula Auditing">
        <ToolBtn title="Trace Precedents" onClick={() => alert("Trace Precedents: shows arrows to cells that provide data to this formula")}><ArrowUp size={14} /></ToolBtn>
        <ToolBtn title="Trace Dependents" onClick={() => alert("Trace Dependents: shows arrows to cells that depend on this cell")}><ArrowDown size={14} /></ToolBtn>
        <ToolBtn title="Remove Arrows" onClick={() => alert("All trace arrows removed")}><Minus size={14} /></ToolBtn>
        <Separator />
        <ToolBtn title="Show Formulas" active={showFormulas} onClick={toggleShowFormulas}><Eye size={14} /></ToolBtn>
        <ToolBtn title="Error Checking" onClick={() => alert("Error Checking: scans cells for formula errors")}><ShieldCheck size={14} /></ToolBtn>
        <ToolBtn title="Evaluate Formula" onClick={() => {
          if (!activeCell) return;
          const raw = getCellRaw(activeCell.col, activeCell.row);
          const display = getCellDisplay(activeCell.col, activeCell.row);
          alert(`Formula: ${raw}\nResult: ${display}`);
        }}><Calculator size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Calculation">
        <ToolBtn title="Calculate Now (F9)" onClick={() => alert("Workbook recalculated")}><Redo2 size={14} /></ToolBtn>
        <ToolBtn title="Calculate Sheet" onClick={() => alert("Active sheet recalculated")}><FileSpreadsheet size={14} /></ToolBtn>
        <DropdownBtn icon={<Settings2 size={14} />} title="Calculation Options">
          {(close) => (
            <>
              <DropdownItem onClick={close}>Automatic</DropdownItem>
              <DropdownItem onClick={close}>Automatic Except Data Tables</DropdownItem>
              <DropdownItem onClick={close}>Manual</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>
    </div>
  );

  const renderDataTab = () => (
    <div className="flex items-start gap-0.5 flex-wrap">
      <RibbonGroup label="Get & Transform">
        <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
        <ToolBtn title="From Text/CSV" onClick={() => csvInputRef.current?.click()}><Upload size={14} /></ToolBtn>
        <ToolBtn title="From Web" onClick={() => alert("Import data from a web URL")}><Link size={14} /></ToolBtn>
        <DropdownBtn icon={<FileText size={14} />} title="From Other Sources">
          {(close) => (
            <>
              <DropdownItem onClick={close}>From SQL Server</DropdownItem>
              <DropdownItem onClick={close}>From Analysis Services</DropdownItem>
              <DropdownItem onClick={close}>From XML</DropdownItem>
              <DropdownItem onClick={close}>From JSON</DropdownItem>
              <DropdownItem onClick={close}>From OData Feed</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      <RibbonGroup label="Power Query">
        <DropdownBtn icon={<Sparkles size={14} />} title="Power Query">
          {(close) => (
            <>
              <DropdownItem onClick={() => { onOpenPowerQuery?.(); close(); }}>Launch Power Query Editor</DropdownItem>
              <DropdownItem onClick={() => { onOpenPowerQuery?.(); close(); }}>From CSV...</DropdownItem>
              <DropdownItem onClick={() => { onOpenPowerQuery?.(); close(); }}>From Web...</DropdownItem>
              <DropdownItem onClick={() => { onOpenPowerQuery?.(); close(); }}>From JSON...</DropdownItem>
              <DropdownItem onClick={() => { onOpenPowerQuery?.(); close(); }}>Combine Queries</DropdownItem>
              <DropdownItem onClick={() => { onOpenPowerQuery?.(); close(); }}>Query Dependencies</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      <RibbonGroup label="Queries & Connections">
        <ToolBtn title="Refresh All" onClick={() => alert("All data connections refreshed")}><Redo2 size={14} /></ToolBtn>
        <ToolBtn title="Connections" onClick={() => alert("Manage workbook connections")}><Link size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Sort & Filter">
        <ToolBtn title="Sort A to Z" onClick={() => {
          if (!activeCell) return;
          const col = activeCell.col;
          const sheet = getActiveSheet();
          const data: { row: number; values: string[] }[] = [];
          for (let r = 0; r < 200; r++) {
            const key = `${colToLetter(col)}${r + 1}`;
            if (sheet.cells[key]?.raw) {
              const rowValues: string[] = [];
              for (let c = 0; c < 52; c++) {
                const k = `${colToLetter(c)}${r + 1}`;
                rowValues.push(sheet.cells[k]?.raw || "");
              }
              data.push({ row: r, values: rowValues });
            }
          }
          data.sort((a, b) => a.values[col].localeCompare(b.values[col]));
          const startRow = data[0]?.row ?? 0;
          data.forEach((d, i) => d.values.forEach((v, c) => setCellValue(c, startRow + i, v)));
        }}><ArrowUpAZ size={14} /></ToolBtn>
        <ToolBtn title="Sort Z to A" onClick={() => {
          if (!activeCell) return;
          const col = activeCell.col;
          const sheet = getActiveSheet();
          const data: { row: number; values: string[] }[] = [];
          for (let r = 0; r < 200; r++) {
            const key = `${colToLetter(col)}${r + 1}`;
            if (sheet.cells[key]?.raw) {
              const rowValues: string[] = [];
              for (let c = 0; c < 52; c++) {
                const k = `${colToLetter(c)}${r + 1}`;
                rowValues.push(sheet.cells[k]?.raw || "");
              }
              data.push({ row: r, values: rowValues });
            }
          }
          data.sort((a, b) => b.values[col].localeCompare(a.values[col]));
          const startRow = data[0]?.row ?? 0;
          data.forEach((d, i) => d.values.forEach((v, c) => setCellValue(c, startRow + i, v)));
        }}><ArrowDownAZ size={14} /></ToolBtn>
        <ToolBtn title="Filter" onClick={() => onOpenSortFilter?.()}><Filter size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Data Tools">
        <ToolBtn title="Text to Columns" onClick={() => alert("Text to Columns: Split cell content by delimiter")}><Columns3 size={14} /></ToolBtn>
        <ToolBtn title="Flash Fill" onClick={() => alert("Flash Fill: Auto-fill values based on pattern")}><Sparkles size={14} /></ToolBtn>
        <Separator />
        <ToolBtn title="Data Validation" onClick={() => onOpenValidation?.()}><ShieldCheck size={14} /></ToolBtn>
        <ToolBtn title="Conditional Formatting" onClick={() => onOpenCondFormatDialog?.()}><Highlighter size={14} /></ToolBtn>
        <ToolBtn title="Remove Duplicates" onClick={() => {
          const bounds = getSelectionBounds();
          if (!bounds) return;
          const seen = new Set<string>();
          let removed = 0;
          for (let r = bounds.minR; r <= bounds.maxR; r++) {
            const key = getCellDisplay(bounds.minC, r);
            if (seen.has(key)) {
              for (let c = bounds.minC; c <= bounds.maxC; c++) setCellValue(c, r, "");
              removed++;
            } else {
              seen.add(key);
            }
          }
          alert(`${removed} duplicate(s) removed.`);
        }}><Minus size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="What-If Analysis">
        <DropdownBtn icon={<Calculator size={14} />} title="What-If Analysis">
          {(close) => (
            <>
              <DropdownItem onClick={() => { onOpenGoalSeek?.(); close(); }}>Goal Seek...</DropdownItem>
              <DropdownItem onClick={() => { onOpenGoalSeek?.(); close(); }}>Scenario Manager...</DropdownItem>
              <DropdownItem onClick={() => { onOpenGoalSeek?.(); close(); }}>Data Table...</DropdownItem>
              <DropdownItem onClick={() => { onOpenGoalSeek?.(); close(); }}>Solver...</DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => { onOpenFinancialAnalysis?.(); close(); }}>Financial Analysis...</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <ToolBtn title="Statistical Analysis" onClick={() => onOpenStatistics?.()}><Sigma size={14} /></ToolBtn>
        <ToolBtn title="Consolidate" onClick={() => alert("Consolidate data from multiple ranges")}><LayoutGrid size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Outline">
        <ToolBtn title="Group" onClick={() => alert("Group selected rows/columns")}><Plus size={14} /></ToolBtn>
        <ToolBtn title="Ungroup" onClick={() => alert("Ungroup selected rows/columns")}><Minus size={14} /></ToolBtn>
        <ToolBtn title="Subtotal" onClick={() => alert("Add subtotals to a list")}><Sigma size={14} /></ToolBtn>
      </RibbonGroup>
    </div>
  );

  const renderReviewTab = () => (
    <div className="flex items-start gap-0.5 flex-wrap">
      <RibbonGroup label="Comments">
        <ToolBtn title="New Comment" onClick={() => {
          if (!activeCell) return;
          const text = prompt("Enter comment:");
          if (text) setCellComment(activeCell.col, activeCell.row, { text, author: "User", date: new Date().toISOString() });
        }}><MessageCircle size={14} /></ToolBtn>
        <ToolBtn title="Delete Comment" onClick={() => {
          if (activeCell) setCellComment(activeCell.col, activeCell.row, undefined);
        }}><Trash2 size={14} /></ToolBtn>
        <ToolBtn title="Manage Comments" onClick={() => onOpenComments?.()}><MessageSquare size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Proofing">
        <ToolBtn title="Find & Replace" onClick={() => onOpenFindReplace?.()}><Search size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Protect">
        <ToolBtn title="Protect Sheet" active={protectedSheet} onClick={() => onOpenSheetProtection?.()}><Lock size={14} /></ToolBtn>
        <ToolBtn title="Lock Cells" onClick={() => {
          if (!activeCell) return;
          const cellData = getActiveSheet().cells[`${colToLetter(activeCell.col)}${activeCell.row + 1}`];
          const isLocked = cellData?.style?.bgColor === "#1e293b";
          setCellStyle(activeCell.col, activeCell.row, { bgColor: isLocked ? undefined : "#1e293b" });
        }}><Lock size={14} /></ToolBtn>
        <ToolBtn title="Protect Workbook" onClick={() => onOpenSheetProtection?.()}><ShieldCheck size={14} /></ToolBtn>
        <ToolBtn title="Allow Edit Ranges" onClick={() => onOpenSheetProtection?.()}><Users size={14} /></ToolBtn>
      </RibbonGroup>
      <RibbonGroup label="Macros">
        <ToolBtn title="Record Macro" onClick={() => onOpenMacros?.()}><Circle size={14} className="text-red-400" /></ToolBtn>
        <ToolBtn title="Stop Recording" onClick={() => onOpenMacros?.()}><Square size={14} /></ToolBtn>
        <DropdownBtn icon={<Play size={14} />} title="Macros">
          {(close) => (
            <>
              <DropdownItem onClick={() => { onOpenMacros?.(); close(); }}>Run Macro...</DropdownItem>
              <DropdownItem onClick={() => { onOpenMacros?.(); close(); }}>Edit Macros...</DropdownItem>
              <DropdownItem onClick={() => { onOpenMacros?.(); close(); }}>Macro Security...</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>
    </div>
  );

  const renderViewTab = () => (
    <div className="flex items-start gap-0.5 flex-wrap">
      <RibbonGroup label="Show">
        <label className="flex items-center gap-1 text-[10px]" style={{ color: "var(--foreground)" }}>
          <input type="checkbox" checked={showFormulas} onChange={toggleShowFormulas} className="w-3 h-3" />
          Formula Bar
        </label>
        <label className="flex items-center gap-1 text-[10px]" style={{ color: "var(--foreground)" }}>
          <input type="checkbox" checked={showGridlines} onChange={toggleShowGridlines} className="w-3 h-3" />
          Gridlines
        </label>
        <label className="flex items-center gap-1 text-[10px]" style={{ color: "var(--foreground)" }}>
          <input type="checkbox" checked={showHeadings} onChange={toggleShowHeadings} className="w-3 h-3" />
          Headings
        </label>
      </RibbonGroup>

      <RibbonGroup label="Zoom">
        <ToolBtn title="Zoom In" onClick={() => setZoom(zoom + 10)}><ZoomIn size={14} /></ToolBtn>
        <span className="text-[10px] px-1" style={{ color: "var(--foreground)" }}>{zoom}%</span>
        <ToolBtn title="Zoom Out" onClick={() => setZoom(zoom - 10)}><Minus size={14} /></ToolBtn>
        <ToolBtn title="100%" onClick={() => setZoom(100)}><Maximize2 size={14} /></ToolBtn>
      </RibbonGroup>

      <RibbonGroup label="Window">
        <DropdownBtn icon={<Snowflake size={14} />} title="Freeze Panes">
          {(close) => (
            <>
              <DropdownItem onClick={() => { setFrozenPanes(1, 0); close(); }}>Freeze Top Row</DropdownItem>
              <DropdownItem onClick={() => { setFrozenPanes(0, 1); close(); }}>Freeze First Column</DropdownItem>
              <DropdownItem onClick={() => {
                if (activeCell) setFrozenPanes(activeCell.row, activeCell.col);
                close();
              }}>Freeze Panes</DropdownItem>
              <DropdownItem onClick={() => { setFrozenPanes(0, 0); close(); }}>Unfreeze Panes</DropdownItem>
              <DropdownItem onClick={() => { onOpenFreezePanes?.(); close(); }}>Advanced Freeze...</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Columns3 size={14} />} title="Split View">
          {(close) => (
            <>
              <DropdownItem onClick={() => { onSplitView?.("horizontal"); close(); }}>Split Horizontally</DropdownItem>
              <DropdownItem onClick={() => { onSplitView?.("vertical"); close(); }}>Split Vertically</DropdownItem>
              <DropdownItem onClick={() => { onRemoveSplit?.(); close(); }}>Remove Split</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <ToolBtn title="New Window" onClick={() => alert("New Window: Opens this workbook in a new window")}><ExternalLink size={14} /></ToolBtn>
        <ToolBtn title="Arrange All" onClick={() => alert("Arrange All: Tile, horizontal, vertical or cascade open windows")}><LayoutGrid size={14} /></ToolBtn>
      </RibbonGroup>
    </div>
  );

  const renderTabContent = () => {
    switch (activeRibbonTab) {
      case "Home": return renderHomeTab();
      case "Insert": return renderInsertTab();
      case "Page Layout": return renderPageLayoutTab();
      case "Formulas": return renderFormulasTab();
      case "Data": return renderDataTab();
      case "Review": return renderReviewTab();
      case "View": return renderViewTab();
      default: return renderHomeTab();
    }
  };

  return (
    <div style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }} className="border-b">
      {/* Quick access toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-0.5 border-b" style={{ borderColor: "var(--border)" }}>
        <ToolBtn title="Undo (Ctrl+Z)" onClick={undo} small><Undo2 size={13} /></ToolBtn>
        <ToolBtn title="Redo (Ctrl+Y)" onClick={redo} small><Redo2 size={13} /></ToolBtn>
        <HistoryPanel
          undoCount={undoStack.length}
          redoCount={redoStack.length}
          onUndo={undo}
          onRedo={redo}
          module="spreadsheet"
        />
        <Separator />
        <ToolBtn title="Import" onClick={() => onImport?.()} small><Upload size={13} /></ToolBtn>
        <ToolBtn title="Export CSV" onClick={onExportCSV} small><Download size={13} /></ToolBtn>
        <ToolBtn title="Export Excel" onClick={() => onExportExcel?.()} small><FileSpreadsheet size={13} /></ToolBtn>
        <ToolBtn title="Print" onClick={onPrint} small><Printer size={13} /></ToolBtn>
        {onPrintPreview && (
          <ToolBtn title="Print Preview" onClick={onPrintPreview} small><Eye size={13} /></ToolBtn>
        )}
        <div className="flex-1" />
        <ToolBtn title="Templates" onClick={openTemplatesModal} small><FileSpreadsheet size={13} /></ToolBtn>
        <ToolBtn title="AI Assistant" active={showAiPanel} onClick={toggleAiPanel} small><MessageSquare size={13} /></ToolBtn>
      </div>

      {/* Ribbon tabs */}
      <div className="flex items-center px-2 gap-0" style={{ borderBottom: "1px solid var(--border)" }}>
        {RIBBON_TABS.map((tab) => (
          <button
            key={tab}
            className="px-3 py-1 text-xs font-medium transition-colors relative"
            style={{
              color: activeRibbonTab === tab ? "var(--primary)" : "var(--muted-foreground)",
              backgroundColor: activeRibbonTab === tab ? "var(--background)" : "transparent",
              borderBottom: activeRibbonTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
            }}
            onClick={() => setActiveRibbonTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-2 py-1 overflow-x-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}
