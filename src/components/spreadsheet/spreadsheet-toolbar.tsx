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
  Globe, Database, RefreshCw, PlugZap,
  GitBranch, AlertTriangle, Play,
  Layers, Sun, TrendingUp, TrendingDown,
  Triangle, Circle, Activity, Box,
  BarChart2, Workflow, Combine, SplitSquareVertical,
  FolderOpen, ClipboardList, CheckSquare, Shuffle,
  Diff, FlipVertical2,
  List, ChevronUp, ChevronsDown,
  MousePointer, Zap, BarChartHorizontal,
  Clock, Square,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { colToLetter } from "./formula-engine";
import { CellBordersPicker } from "./cell-borders-picker";

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
      {/* Tables */}
      <RibbonGroup label="Tables">
        <ToolBtn title="PivotTable — Summarize data with a PivotTable" onClick={() => onOpenPivot?.()}>
          <Table2 size={14} />
        </ToolBtn>
        <ToolBtn title="Table — Format selection as a structured table" onClick={() => {}}>
          <Grid3X3 size={14} />
        </ToolBtn>
      </RibbonGroup>

      {/* Charts */}
      <RibbonGroup label="Charts">
        {/* Column / Bar */}
        <DropdownBtn icon={<BarChart3 size={14} />} title="Insert Column or Bar Chart" label="Column">
          {(close) => (
            <>
              <DropdownHeader>2-D Column</DropdownHeader>
              <DropdownItem icon={<BarChart3 size={12} />} onClick={() => { openChartModal("column"); close(); }}>Clustered Column</DropdownItem>
              <DropdownItem icon={<BarChart3 size={12} />} onClick={() => { openChartModal("column-stacked"); close(); }}>Stacked Column</DropdownItem>
              <DropdownItem icon={<BarChart3 size={12} />} onClick={() => { openChartModal("column-stacked-100"); close(); }}>100% Stacked Column</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>2-D Bar</DropdownHeader>
              <DropdownItem icon={<BarChartHorizontal size={12} />} onClick={() => { openChartModal("bar"); close(); }}>Clustered Bar</DropdownItem>
              <DropdownItem icon={<BarChartHorizontal size={12} />} onClick={() => { openChartModal("bar-stacked"); close(); }}>Stacked Bar</DropdownItem>
              <DropdownItem icon={<BarChartHorizontal size={12} />} onClick={() => { openChartModal("bar-stacked-100"); close(); }}>100% Stacked Bar</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>3-D Column</DropdownHeader>
              <DropdownItem icon={<Box size={12} />} onClick={() => { openChartModal("column-3d"); close(); }}>3-D Clustered Column</DropdownItem>
              <DropdownItem icon={<Box size={12} />} onClick={() => { openChartModal("column-3d-stacked"); close(); }}>3-D Stacked Column</DropdownItem>
            </>
          )}
        </DropdownBtn>

        {/* Line / Area */}
        <DropdownBtn icon={<LineChart size={14} />} title="Insert Line or Area Chart" label="Line">
          {(close) => (
            <>
              <DropdownHeader>2-D Line</DropdownHeader>
              <DropdownItem icon={<LineChart size={12} />} onClick={() => { openChartModal("line"); close(); }}>Line</DropdownItem>
              <DropdownItem icon={<LineChart size={12} />} onClick={() => { openChartModal("line-stacked"); close(); }}>Stacked Line</DropdownItem>
              <DropdownItem icon={<LineChart size={12} />} onClick={() => { openChartModal("line-100"); close(); }}>100% Stacked Line</DropdownItem>
              <DropdownItem icon={<LineChart size={12} />} onClick={() => { openChartModal("line-markers"); close(); }}>Line with Markers</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>2-D Area</DropdownHeader>
              <DropdownItem icon={<AreaChart size={12} />} onClick={() => { openChartModal("area"); close(); }}>Area</DropdownItem>
              <DropdownItem icon={<AreaChart size={12} />} onClick={() => { openChartModal("area-stacked"); close(); }}>Stacked Area</DropdownItem>
              <DropdownItem icon={<AreaChart size={12} />} onClick={() => { openChartModal("area-100"); close(); }}>100% Stacked Area</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>3-D Line</DropdownHeader>
              <DropdownItem icon={<LineChart size={12} />} onClick={() => { openChartModal("line-3d"); close(); }}>3-D Line</DropdownItem>
            </>
          )}
        </DropdownBtn>

        {/* Pie / Doughnut */}
        <DropdownBtn icon={<PieChart size={14} />} title="Insert Pie or Doughnut Chart" label="Pie">
          {(close) => (
            <>
              <DropdownHeader>2-D Pie</DropdownHeader>
              <DropdownItem icon={<PieChart size={12} />} onClick={() => { openChartModal("pie"); close(); }}>Pie</DropdownItem>
              <DropdownItem icon={<PieChart size={12} />} onClick={() => { openChartModal("pie-of-pie"); close(); }}>Pie of Pie</DropdownItem>
              <DropdownItem icon={<PieChart size={12} />} onClick={() => { openChartModal("bar-of-pie"); close(); }}>Bar of Pie</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>3-D Pie</DropdownHeader>
              <DropdownItem icon={<Circle size={12} />} onClick={() => { openChartModal("pie-3d"); close(); }}>3-D Pie</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Doughnut</DropdownHeader>
              <DropdownItem icon={<Circle size={12} />} onClick={() => { openChartModal("doughnut"); close(); }}>Doughnut</DropdownItem>
              <DropdownItem icon={<Circle size={12} />} onClick={() => { openChartModal("doughnut-exploded"); close(); }}>Exploded Doughnut</DropdownItem>
            </>
          )}
        </DropdownBtn>

        {/* Scatter / Bubble */}
        <DropdownBtn icon={<ScatterChart size={14} />} title="Insert Scatter (X, Y) or Bubble Chart" label="XY">
          {(close) => (
            <>
              <DropdownHeader>Scatter</DropdownHeader>
              <DropdownItem icon={<ScatterChart size={12} />} onClick={() => { openChartModal("scatter"); close(); }}>Scatter</DropdownItem>
              <DropdownItem icon={<ScatterChart size={12} />} onClick={() => { openChartModal("scatter-smooth"); close(); }}>Scatter with Smooth Lines</DropdownItem>
              <DropdownItem icon={<ScatterChart size={12} />} onClick={() => { openChartModal("scatter-straight"); close(); }}>Scatter with Straight Lines</DropdownItem>
              <DropdownItem icon={<ScatterChart size={12} />} onClick={() => { openChartModal("scatter-markers"); close(); }}>Scatter with Markers</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Bubble</DropdownHeader>
              <DropdownItem icon={<Circle size={12} />} onClick={() => { openChartModal("bubble"); close(); }}>Bubble</DropdownItem>
              <DropdownItem icon={<Circle size={12} />} onClick={() => { openChartModal("bubble-3d"); close(); }}>3-D Bubble</DropdownItem>
            </>
          )}
        </DropdownBtn>

        {/* Other Charts */}
        <DropdownBtn icon={<BarChart2 size={14} />} title="Insert Other Charts" label="Other">
          {(close) => (
            <>
              <DropdownHeader>Radar</DropdownHeader>
              <DropdownItem icon={<Activity size={12} />} onClick={() => { openChartModal("radar"); close(); }}>Radar</DropdownItem>
              <DropdownItem icon={<Activity size={12} />} onClick={() => { openChartModal("radar-markers"); close(); }}>Radar with Markers</DropdownItem>
              <DropdownItem icon={<Activity size={12} />} onClick={() => { openChartModal("radar-filled"); close(); }}>Filled Radar</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Hierarchy</DropdownHeader>
              <DropdownItem icon={<Layers size={12} />} onClick={() => { openChartModal("treemap"); close(); }}>Treemap</DropdownItem>
              <DropdownItem icon={<Sun size={12} />} onClick={() => { openChartModal("sunburst"); close(); }}>Sunburst</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Waterfall / Funnel</DropdownHeader>
              <DropdownItem icon={<TrendingDown size={12} />} onClick={() => { openChartModal("waterfall"); close(); }}>Waterfall</DropdownItem>
              <DropdownItem icon={<Triangle size={12} />} onClick={() => { openChartModal("funnel"); close(); }}>Funnel</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Stock</DropdownHeader>
              <DropdownItem icon={<TrendingUp size={12} />} onClick={() => { openChartModal("stock"); close(); }}>High-Low-Close</DropdownItem>
              <DropdownItem icon={<TrendingUp size={12} />} onClick={() => { openChartModal("candlestick"); close(); }}>Open-High-Low-Close</DropdownItem>
              <DropdownItem icon={<TrendingUp size={12} />} onClick={() => { openChartModal("ohlc"); close(); }}>Volume-High-Low-Close</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Surface</DropdownHeader>
              <DropdownItem icon={<Box size={12} />} onClick={() => { openChartModal("surface3d"); close(); }}>3-D Surface</DropdownItem>
              <DropdownItem icon={<Box size={12} />} onClick={() => { openChartModal("contour"); close(); }}>Contour</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Combo</DropdownHeader>
              <DropdownItem icon={<Combine size={12} />} onClick={() => { openChartModal("combo-clustered-line"); close(); }}>Clustered Column — Line</DropdownItem>
              <DropdownItem icon={<Combine size={12} />} onClick={() => { openChartModal("combo-area-line"); close(); }}>Area — Line</DropdownItem>
              <DropdownItem icon={<Combine size={12} />} onClick={() => { openChartModal("combo"); close(); }}>Custom Combination</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      {/* Sparklines */}
      <RibbonGroup label="Sparklines">
        <ToolBtn title="Line Sparkline — Insert a tiny line chart in a cell" onClick={() => {}}>
          <LineChart size={14} />
        </ToolBtn>
        <ToolBtn title="Column Sparkline — Insert a tiny column chart in a cell" onClick={() => {}}>
          <BarChart3 size={14} />
        </ToolBtn>
        <ToolBtn title="Win/Loss Sparkline — Insert a Win/Loss chart in a cell" onClick={() => {}}>
          <Activity size={14} />
        </ToolBtn>
      </RibbonGroup>

      {/* Illustrations */}
      <RibbonGroup label="Illustrations">
        <ToolBtn title="Pictures — Insert a picture from file" onClick={() => {}}>
          <Image size={14} />
        </ToolBtn>
        <DropdownBtn icon={<SplitSquareVertical size={14} />} title="Shapes — Insert ready-made shapes">
          {(close) => (
            <>
              <DropdownHeader>Lines</DropdownHeader>
              <DropdownItem onClick={() => { close(); }}>Line</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Arrow</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Double Arrow</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Basic Shapes</DropdownHeader>
              <DropdownItem onClick={() => { close(); }}>Rectangle</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Oval / Circle</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Triangle</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Parallelogram</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Block Arrows</DropdownHeader>
              <DropdownItem onClick={() => { close(); }}>Right Arrow</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Left Arrow</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Up Arrow</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Down Arrow</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <ToolBtn title="Icons — Insert icons from the icon library" onClick={() => {}}>
          <Sparkles size={14} />
        </ToolBtn>
        <ToolBtn title="SmartArt — Insert a SmartArt graphic" onClick={() => {}}>
          <Workflow size={14} />
        </ToolBtn>
      </RibbonGroup>

      {/* Links */}
      <RibbonGroup label="Links">
        <ToolBtn title="Hyperlink — Create a link to a webpage, file, or cell range" onClick={() => {
          if (!activeCell) return;
          const url = prompt("Enter URL:");
          if (url) setCellValue(activeCell.col, activeCell.row, url);
        }}>
          <Link size={14} />
        </ToolBtn>
      </RibbonGroup>

      {/* Text */}
      <RibbonGroup label="Text">
        <ToolBtn title="Text Box — Insert a moveable, resizable text box" onClick={() => {}}>
          <TextCursorInput size={14} />
        </ToolBtn>
        <ToolBtn title="Header & Footer — Edit the header and footer of printed pages" onClick={() => {}}>
          <PanelTop size={14} />
        </ToolBtn>
        <ToolBtn title="WordArt — Insert decorative text" onClick={() => {}}>
          <Type size={14} />
        </ToolBtn>
      </RibbonGroup>

      {/* Symbols */}
      <RibbonGroup label="Symbols">
        <ToolBtn title="Equation — Insert mathematical equations" onClick={() => {}}>
          <Braces size={14} />
        </ToolBtn>
        <ToolBtn title="Symbol — Insert symbols not on your keyboard" onClick={() => {
          if (!activeCell) return;
          const sym = prompt("Enter symbol character (e.g. ©, ™, ±, ∑):");
          if (sym) setCellValue(activeCell.col, activeCell.row, sym);
        }}>
          <Hash size={14} />
        </ToolBtn>
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
          {(close) => (
            <>
              <DropdownItem onClick={() => {
                const bounds = getSelectionBounds();
                if (bounds) alert(`Print area set: ${colToLetter(bounds.minC)}${bounds.minR + 1}:${colToLetter(bounds.maxC)}${bounds.maxR + 1}`);
                close();
              }}>Set Print Area</DropdownItem>
              <DropdownItem onClick={() => { alert("Print area cleared"); close(); }}>Clear Print Area</DropdownItem>
            </>
          )}
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
      {/* Function Library */}
      <RibbonGroup label="Function Library">
        <ToolBtn title="Insert Function — Search for and insert a function" onClick={() => {
          if (!activeCell) return;
          const fn = prompt("Enter function name (e.g. SUM, AVERAGE, IF):");
          if (fn) setCellValue(activeCell.col, activeCell.row, `=${fn.toUpperCase()}()`);
        }}>
          <Calculator size={14} />
        </ToolBtn>
        <DropdownBtn icon={<Sigma size={14} />} title="AutoSum — Sum the selected cells automatically" label="AutoSum">
          {(close) => (
            <>
              <DropdownItem icon={<Sigma size={12} />} onClick={() => { handleAutoSum("SUM"); close(); }}>Sum</DropdownItem>
              <DropdownItem icon={<Sigma size={12} />} onClick={() => { handleAutoSum("AVERAGE"); close(); }}>Average</DropdownItem>
              <DropdownItem icon={<Sigma size={12} />} onClick={() => { handleAutoSum("COUNT"); close(); }}>Count Numbers</DropdownItem>
              <DropdownItem icon={<Sigma size={12} />} onClick={() => { handleAutoSum("MAX"); close(); }}>Max</DropdownItem>
              <DropdownItem icon={<Sigma size={12} />} onClick={() => { handleAutoSum("MIN"); close(); }}>Min</DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={<Sigma size={12} />} onClick={() => { handleAutoSum("COUNTA"); close(); }}>Count Non-Empty</DropdownItem>
              <DropdownItem icon={<Sigma size={12} />} onClick={() => { handleAutoSum("PRODUCT"); close(); }}>Product</DropdownItem>
              <DropdownItem icon={<Sigma size={12} />} onClick={() => { handleAutoSum("STDEV"); close(); }}>Std. Deviation</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Clock size={12} />} title="Recently Used — Access recently used functions" label="Recent">
          {(close) => (
            <>
              <DropdownHeader>Recently Used</DropdownHeader>
              {["SUM", "IF", "VLOOKUP", "AVERAGE", "COUNT", "IFERROR", "TODAY"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<DollarSign size={14} />} title="Financial — Insert a financial function" label="Financial">
          {(close) => (
            <>
              <DropdownHeader>Loan & Investment</DropdownHeader>
              {["PMT", "FV", "PV", "NPV", "IRR", "XIRR", "RATE", "NPER"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Depreciation</DropdownHeader>
              {["SLN", "DDB", "VDB", "SYD"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Interest Rate Conversion</DropdownHeader>
              {["EFFECT", "NOMINAL"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Braces size={14} />} title="Logical — Insert a logical function" label="Logical">
          {(close) => (
            <>
              {["IF", "IFS", "AND", "OR", "NOT", "SWITCH", "IFERROR", "IFNA", "TRUE", "FALSE"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Type size={14} />} title="Text — Insert a text function" label="Text">
          {(close) => (
            <>
              <DropdownHeader>Extract & Combine</DropdownHeader>
              {["CONCATENATE", "CONCAT", "TEXTJOIN", "LEFT", "RIGHT", "MID"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Transform</DropdownHeader>
              {["LEN", "TRIM", "UPPER", "LOWER", "PROPER", "SUBSTITUTE", "REPLACE", "REPT"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Search & Convert</DropdownHeader>
              {["FIND", "SEARCH", "TEXT", "VALUE", "NUMBERVALUE", "EXACT"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Calendar size={14} />} title="Date & Time — Insert a date or time function" label="Date">
          {(close) => (
            <>
              <DropdownHeader>Current Date/Time</DropdownHeader>
              {["TODAY", "NOW"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Date Parts</DropdownHeader>
              {["DATE", "YEAR", "MONTH", "DAY", "WEEKDAY", "WEEKNUM", "EOMONTH"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Time Parts</DropdownHeader>
              {["TIME", "HOUR", "MINUTE", "SECOND", "TIMEVALUE", "DATEVALUE"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Date Arithmetic</DropdownHeader>
              {["DATEDIF", "DAYS", "NETWORKDAYS", "WORKDAY", "EDATE"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Search size={14} />} title="Lookup & Reference — Insert a lookup or reference function" label="Lookup">
          {(close) => (
            <>
              <DropdownHeader>Lookup</DropdownHeader>
              {["VLOOKUP", "HLOOKUP", "XLOOKUP", "LOOKUP"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Index & Match</DropdownHeader>
              {["INDEX", "MATCH", "XMATCH"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Reference</DropdownHeader>
              {["OFFSET", "INDIRECT", "ADDRESS", "ROW", "COLUMN", "ROWS", "COLUMNS", "CHOOSE", "TRANSPOSE"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Hash size={14} />} title="Math & Trig — Insert a math or trig function" label="Math">
          {(close) => (
            <>
              <DropdownHeader>Sum & Count</DropdownHeader>
              {["SUM", "SUMIF", "SUMIFS", "SUMPRODUCT", "COUNT", "COUNTIF", "COUNTIFS", "COUNTA"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Rounding</DropdownHeader>
              {["ROUND", "ROUNDUP", "ROUNDDOWN", "CEILING", "FLOOR", "INT", "TRUNC"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Math</DropdownHeader>
              {["ABS", "MOD", "POWER", "SQRT", "EXP", "LN", "LOG", "LOG10", "RAND", "RANDBETWEEN", "SIGN"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Trigonometry</DropdownHeader>
              {["SIN", "COS", "TAN", "ASIN", "ACOS", "ATAN", "ATAN2", "DEGREES", "RADIANS", "PI"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<BarChart2 size={14} />} title="More Functions — Statistical, Engineering, Information, Compatibility" label="More">
          {(close) => (
            <>
              <DropdownHeader>Statistical</DropdownHeader>
              {["AVERAGE", "AVERAGEIF", "AVERAGEIFS", "MEDIAN", "MODE", "STDEV", "STDEVP", "VAR", "VARP", "CORREL", "COVAR", "NORMDIST", "NORM.INV", "PERCENTILE", "QUARTILE", "RANK"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Information</DropdownHeader>
              {["ISBLANK", "ISERROR", "ISNUMBER", "ISTEXT", "ISNA", "ISREF", "CELL", "TYPE", "N", "NA"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownHeader>Engineering</DropdownHeader>
              {["CONVERT", "BIN2DEC", "DEC2BIN", "HEX2DEC", "DEC2HEX"].map((fn) => (
                <DropdownItem key={fn} onClick={() => { if (activeCell) setCellValue(activeCell.col, activeCell.row, `=${fn}()`); close(); }}>{fn}</DropdownItem>
              ))}
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      {/* Defined Names */}
      <RibbonGroup label="Defined Names">
        <ToolBtn title="Name Manager — Create, edit, delete, and find all names used in the workbook" onClick={() => onOpenNamedRanges?.()}>
          <Bookmark size={14} />
        </ToolBtn>
        <ToolBtn title="Define Name — Define a name for a cell, range, or constant" onClick={() => {
          const bounds = getSelectionBounds();
          if (!bounds) { alert("Select a range first."); return; }
          const name = prompt("Enter a name for this range:");
          if (name) setNamedRange(name, `${colToLetter(bounds.minC)}${bounds.minR + 1}:${colToLetter(bounds.maxC)}${bounds.maxR + 1}`);
        }}>
          <Plus size={14} />
        </ToolBtn>
        <DropdownBtn icon={<Link size={14} />} title="Use in Formula — Choose a name used in this workbook and insert it into the formula" label="Use">
          {(close) => (
            <>
              <DropdownHeader>Named Ranges</DropdownHeader>
              <DropdownItem onClick={close}>Paste Names...</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <ToolBtn title="Create from Selection — Automatically generate names from selected cells" onClick={() => {
          const bounds = getSelectionBounds();
          if (!bounds) { alert("Select a range first."); return; }
          const name = prompt("Create name from row/column header:");
          if (name) setNamedRange(name.trim().replace(/\s+/g, "_"), `${colToLetter(bounds.minC)}${bounds.minR + 1}:${colToLetter(bounds.maxC)}${bounds.maxR + 1}`);
        }}>
          <Grid3X3 size={14} />
        </ToolBtn>
      </RibbonGroup>

      {/* Formula Auditing */}
      <RibbonGroup label="Formula Auditing">
        <ToolBtn title="Trace Precedents — Show arrows indicating which cells affect the value of the currently selected cell" onClick={() => alert("Trace Precedents: Shows arrows to cells that provide data to the formula in the active cell.")}>
          <ArrowUp size={14} />
        </ToolBtn>
        <ToolBtn title="Trace Dependents — Show arrows indicating which cells are affected by the value of the currently selected cell" onClick={() => alert("Trace Dependents: Shows arrows to cells that depend on the active cell.")}>
          <ArrowDown size={14} />
        </ToolBtn>
        <DropdownBtn icon={<Minus size={14} />} title="Remove Arrows — Remove all tracer arrows" label="Remove">
          {(close) => (
            <>
              <DropdownItem onClick={() => { alert("All trace arrows removed."); close(); }}>Remove Arrows</DropdownItem>
              <DropdownItem onClick={() => { alert("Precedent arrows removed."); close(); }}>Remove Precedent Arrows</DropdownItem>
              <DropdownItem onClick={() => { alert("Dependent arrows removed."); close(); }}>Remove Dependent Arrows</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <Separator />
        <ToolBtn title="Show Formulas (Ctrl+`) — Show formula in each cell instead of the resulting value" active={showFormulas} onClick={toggleShowFormulas}>
          <Eye size={14} />
        </ToolBtn>
        <DropdownBtn icon={<AlertTriangle size={14} />} title="Error Checking — Check for errors in formulas" label="Errors">
          {(close) => (
            <>
              <DropdownItem onClick={() => { alert("Error Checking: Scanning for formula errors..."); close(); }}>Error Checking...</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Trace Error</DropdownItem>
              <DropdownItem onClick={() => { close(); }}>Circular References</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <ToolBtn title="Evaluate Formula — Debug a formula by evaluating each part individually" onClick={() => {
          if (!activeCell) return;
          const raw = getCellRaw(activeCell.col, activeCell.row);
          const display = getCellDisplay(activeCell.col, activeCell.row);
          alert(`Evaluate Formula\n\nFormula: ${raw || "(empty)"}\nResult:  ${display || "(empty)"}`);
        }}>
          <Play size={14} />
        </ToolBtn>
      </RibbonGroup>

      {/* Calculation */}
      <RibbonGroup label="Calculation">
        <ToolBtn title="Calculate Now (F9) — Recalculate all open workbooks" onClick={() => alert("Workbook recalculated (F9)")}>
          <Redo2 size={14} />
        </ToolBtn>
        <ToolBtn title="Calculate Sheet — Recalculate the active sheet" onClick={() => alert("Active sheet recalculated")}>
          <FileSpreadsheet size={14} />
        </ToolBtn>
        <DropdownBtn icon={<Settings2 size={14} />} title="Calculation Options — Specify when formulas are calculated" label="Options">
          {(close) => (
            <>
              <DropdownHeader>Calculation Mode</DropdownHeader>
              <DropdownItem icon={<Play size={12} />} onClick={() => { alert("Automatic calculation enabled."); close(); }}>Automatic</DropdownItem>
              <DropdownItem icon={<Activity size={12} />} onClick={() => { alert("Automatic (except data tables) enabled."); close(); }}>Automatic Except for Data Tables</DropdownItem>
              <DropdownItem icon={<Square size={12} />} onClick={() => { alert("Manual calculation enabled. Press F9 to recalculate."); close(); }}>Manual</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>
    </div>
  );

  const renderDataTab = () => (
    <div className="flex items-start gap-0.5 flex-wrap">
      {/* Get & Transform */}
      <RibbonGroup label="Get &amp; Transform">
        <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
        <ToolBtn title="From Text/CSV — Import data from a text or CSV file" onClick={() => csvInputRef.current?.click()}>
          <Upload size={14} />
        </ToolBtn>
        <ToolBtn title="From Web — Import data from a web page" onClick={() => alert("From Web: Enter a URL to import data from a webpage.")}>
          <Globe size={14} />
        </ToolBtn>
        <DropdownBtn icon={<Database size={14} />} title="From Other Sources — Import data from databases, XML, JSON, and more" label="Other">
          {(close) => (
            <>
              <DropdownHeader>Database</DropdownHeader>
              <DropdownItem icon={<Database size={12} />} onClick={() => { alert("Import from SQL Server database."); close(); }}>From SQL Server</DropdownItem>
              <DropdownItem icon={<Database size={12} />} onClick={() => { alert("Import from Analysis Services."); close(); }}>From Analysis Services</DropdownItem>
              <DropdownItem icon={<Database size={12} />} onClick={() => { alert("Import from a generic ODBC connection."); close(); }}>From ODBC</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>File</DropdownHeader>
              <DropdownItem icon={<FileText size={12} />} onClick={() => { alert("Import from XML data file."); close(); }}>From XML</DropdownItem>
              <DropdownItem icon={<FileText size={12} />} onClick={() => { alert("Import from JSON file."); close(); }}>From JSON</DropdownItem>
              <DropdownItem icon={<FileText size={12} />} onClick={() => { alert("Import from folder."); close(); }}>From Folder</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Online Services</DropdownHeader>
              <DropdownItem icon={<Globe size={12} />} onClick={() => { alert("Import from OData feed."); close(); }}>From OData Feed</DropdownItem>
              <DropdownItem icon={<Globe size={12} />} onClick={() => { alert("Import from SharePoint list."); close(); }}>From SharePoint List</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <ToolBtn title="Recent Sources — View recently used data sources" onClick={() => alert("Recent Sources: No recent data connections found.")}>
          <FolderOpen size={14} />
        </ToolBtn>
        <ToolBtn title="Existing Connections — Connect to data sources that are already associated with this workbook" onClick={() => alert("Existing Connections: No existing data connections in this workbook.")}>
          <PlugZap size={14} />
        </ToolBtn>
      </RibbonGroup>

      {/* Queries & Connections */}
      <RibbonGroup label="Queries &amp; Connections">
        <DropdownBtn icon={<RefreshCw size={14} />} title="Refresh All — Refresh all data connections in this workbook" label="Refresh">
          {(close) => (
            <>
              <DropdownItem icon={<RefreshCw size={12} />} onClick={() => { alert("All data connections refreshed."); close(); }}>Refresh All</DropdownItem>
              <DropdownItem icon={<RefreshCw size={12} />} onClick={() => { alert("Current connection refreshed."); close(); }}>Refresh</DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => { close(); }}>Refresh Status</DropdownItem>
              <DropdownItem onClick={() => { alert("Cancel all pending refresh operations."); close(); }}>Cancel Refresh</DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => { close(); }}>Connection Properties...</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <ToolBtn title="Connections — Manage workbook connections" onClick={() => alert("Connections: Displays a list of all data connections for the workbook.")}>
          <PlugZap size={14} />
        </ToolBtn>
        <ToolBtn title="Properties — Specify how cells connected to a data source should update, and what to display if data is missing" onClick={() => alert("Properties: Connection properties for the selected data connection.")}>
          <Settings2 size={14} />
        </ToolBtn>
      </RibbonGroup>

      {/* Sort & Filter */}
      <RibbonGroup label="Sort &amp; Filter">
        <ToolBtn title="Sort A to Z — Sort smallest to largest, A to Z, or earliest to latest date" onClick={() => {
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
        }}>
          <ArrowUpAZ size={14} />
        </ToolBtn>
        <ToolBtn title="Sort Z to A — Sort largest to smallest, Z to A, or latest to earliest date" onClick={() => {
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
        }}>
          <ArrowDownAZ size={14} />
        </ToolBtn>
        <ToolBtn title="Custom Sort — Sort data using a custom sort order with multiple columns" onClick={() => onOpenSortFilter?.()}>
          <Settings2 size={14} />
        </ToolBtn>
        <Separator />
        <ToolBtn title="Filter — Filter the rows of a selection using AutoFilter" onClick={() => onOpenSortFilter?.()}>
          <Filter size={14} />
        </ToolBtn>
        <ToolBtn title="Clear — Clear the filter and sort state from the current data range" onClick={() => alert("Filter cleared from selection.")}>
          <Trash2 size={14} />
        </ToolBtn>
        <ToolBtn title="Reapply — Reapply the current filter and sort" onClick={() => alert("Filter and sort reapplied.")}>
          <RefreshCw size={14} />
        </ToolBtn>
        <ToolBtn title="Advanced — Filter with complex criteria" onClick={() => onOpenSortFilter?.()}>
          <Search size={14} />
        </ToolBtn>
      </RibbonGroup>

      {/* Data Tools */}
      <RibbonGroup label="Data Tools">
        <ToolBtn title="Text to Columns — Convert text in a column to separate columns by splitting on a delimiter" onClick={() => alert("Text to Columns: Splits the text in the selected cell(s) into separate columns using a delimiter.")}>
          <Columns3 size={14} />
        </ToolBtn>
        <ToolBtn title="Flash Fill — Automatically fill data when a pattern is detected (Ctrl+E)" onClick={() => alert("Flash Fill: Automatically fills values based on a detected pattern in neighboring cells.")}>
          <Zap size={14} />
        </ToolBtn>
        <Separator />
        <ToolBtn title="Remove Duplicates — Remove duplicate rows from a range" onClick={() => {
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
          alert(`${removed} duplicate row(s) removed.`);
        }}>
          <Diff size={14} />
        </ToolBtn>
        <ToolBtn title="Data Validation — Control the type of data or values that users enter into a cell" onClick={() => onOpenValidation?.()}>
          <ShieldCheck size={14} />
        </ToolBtn>
        <ToolBtn title="Consolidate — Combine values from multiple ranges into one output range" onClick={() => alert("Consolidate: Combines data from multiple ranges into a single summary range.")}>
          <LayoutGrid size={14} />
        </ToolBtn>
        <DropdownBtn icon={<Calculator size={14} />} title="What-If Analysis — Try out different values to see how they affect formula outcomes" label="What-If">
          {(close) => (
            <>
              <DropdownHeader>What-If Analysis</DropdownHeader>
              <DropdownItem icon={<Activity size={12} />} onClick={() => { onOpenGoalSeek?.(); close(); }}>Goal Seek...</DropdownItem>
              <DropdownItem icon={<List size={12} />} onClick={() => { alert("Scenario Manager: Create, name, save, and switch between different sets of values."); close(); }}>Scenario Manager...</DropdownItem>
              <DropdownItem icon={<Grid3X3 size={12} />} onClick={() => { alert("Data Table: Create a table of values by substituting one or two cells."); close(); }}>Data Table...</DropdownItem>
              <DropdownDivider />
              <DropdownHeader>Analysis</DropdownHeader>
              <DropdownItem icon={<BarChart2 size={12} />} onClick={() => { onOpenStatistics?.(); close(); }}>Statistical Analysis...</DropdownItem>
              <DropdownItem icon={<TrendingUp size={12} />} onClick={() => { alert("Solver: Find an optimal value for a formula by changing variable cells."); close(); }}>Solver...</DropdownItem>
            </>
          )}
        </DropdownBtn>
      </RibbonGroup>

      {/* Outline */}
      <RibbonGroup label="Outline">
        <DropdownBtn icon={<Plus size={14} />} title="Group — Group rows or columns to create an outline" label="Group">
          {(close) => (
            <>
              <DropdownItem icon={<Rows3 size={12} />} onClick={() => { alert("Rows grouped. Use the outline buttons on the left to expand/collapse."); close(); }}>Group Rows</DropdownItem>
              <DropdownItem icon={<Columns3 size={12} />} onClick={() => { alert("Columns grouped. Use the outline buttons at the top to expand/collapse."); close(); }}>Group Columns</DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => { alert("Auto Outline: Automatically creates an outline based on formulas."); close(); }}>Auto Outline</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <DropdownBtn icon={<Minus size={14} />} title="Ungroup — Ungroup rows or columns that were previously grouped" label="Ungroup">
          {(close) => (
            <>
              <DropdownItem icon={<Rows3 size={12} />} onClick={() => { alert("Selected rows ungrouped."); close(); }}>Ungroup Rows</DropdownItem>
              <DropdownItem icon={<Columns3 size={12} />} onClick={() => { alert("Selected columns ungrouped."); close(); }}>Ungroup Columns</DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => { alert("All outline groupings removed."); close(); }}>Clear Outline</DropdownItem>
            </>
          )}
        </DropdownBtn>
        <ToolBtn title="Subtotal — Calculate values for groups using aggregate functions like SUM, COUNT, or AVERAGE" onClick={() => alert("Subtotal: Inserts subtotal rows for each group in the selected list.")}>
          <Sigma size={14} />
        </ToolBtn>
        <Separator />
        <ToolBtn title="Show Detail — Expand a grouped range of rows or columns" onClick={() => alert("Detail rows/columns revealed.")}>
          <ChevronDown size={14} />
        </ToolBtn>
        <ToolBtn title="Hide Detail — Collapse a grouped range of rows or columns" onClick={() => alert("Detail rows/columns hidden.")}>
          <ChevronUp size={14} />
        </ToolBtn>
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
        <ToolBtn title="Protect Sheet" active={protectedSheet} onClick={() => {
          useSpreadsheetStore.setState({ protectedSheet: !protectedSheet });
        }}><Lock size={14} /></ToolBtn>
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
        <Separator />
        <ToolBtn title="Export CSV" onClick={onExportCSV} small><Download size={13} /></ToolBtn>
        <ToolBtn title="Export Excel" onClick={() => onExportExcel?.()} small><FileSpreadsheet size={13} /></ToolBtn>
        <ToolBtn title="Print" onClick={onPrint} small><Printer size={13} /></ToolBtn>
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
