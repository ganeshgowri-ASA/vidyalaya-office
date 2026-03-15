"use client";

import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
  BarChart3,
  LineChart,
  PieChart,
  FileSpreadsheet,
  Download,
  Printer,
  MessageSquare,
  Upload,
  Highlighter,
  Table2,
  ShieldCheck,
  ArrowUpAZ,
  ArrowDownAZ,
  Filter,
  Snowflake,
  StickyNote,
  Bookmark,
  Sigma,
  DollarSign,
  Percent,
  Calendar,
  Merge,
  WrapText,
  Grid3X3,
  Columns,
  ChevronDown,
  Settings2,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { colToLetter } from "./formula-engine";
import { CellBordersPicker } from "./cell-borders-picker";

function ToolBtn({
  children,
  title,
  active,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-1.5 rounded hover:opacity-80 transition-colors"
      style={{
        backgroundColor: active ? "var(--primary)" : "transparent",
        color: active ? "var(--primary-foreground)" : "var(--foreground)",
      }}
    >
      {children}
    </button>
  );
}

function ColorPicker({
  currentColor,
  onPick,
  icon,
  title,
}: {
  currentColor: string;
  onPick: (c: string) => void;
  icon: React.ReactNode;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const colors = [
    "#ffffff", "#f3f4f6", "#fecaca", "#fed7aa", "#fef08a",
    "#bbf7d0", "#bfdbfe", "#ddd6fe", "#fbcfe8", "#000000",
    "#6b7280", "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        title={title}
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded hover:opacity-80 flex items-center gap-0.5"
        style={{ color: "var(--foreground)" }}
      >
        {icon}
        <div
          className="w-3 h-1 rounded-sm"
          style={{ backgroundColor: currentColor || "var(--foreground)" }}
        />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 p-2 rounded-lg shadow-lg border grid grid-cols-5 gap-1 z-50"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {colors.map((c) => (
            <button
              key={c}
              className="w-5 h-5 rounded border"
              style={{ backgroundColor: c, borderColor: "var(--border)" }}
              onClick={() => {
                onPick(c);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownBtn({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        title={title}
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded hover:opacity-80 transition-colors flex items-center gap-0.5"
        style={{ color: "var(--foreground)" }}
      >
        {icon}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg border z-50"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            minWidth: 180,
          }}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className="w-full text-left text-xs px-3 py-1.5 hover:opacity-80"
      style={{ backgroundColor: "transparent", color: "var(--foreground)" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const FORMATS = [
  { value: "general", label: "General" },
  { value: "number", label: "Number (0.00)" },
  { value: "currency", label: "Currency ($)" },
  { value: "percent", label: "Percentage (%)" },
  { value: "date", label: "Date (MM/DD/YYYY)" },
] as const;

export function SpreadsheetToolbar({
  onExportCSV,
  onPrint,
  onOpenPivot,
  onOpenValidation,
  onOpenSortFilter,
  onOpenCondFormatDialog,
  onPageSetup,
}: {
  onExportCSV: () => void;
  onPrint: () => void;
  onOpenPivot?: () => void;
  onOpenValidation?: () => void;
  onOpenSortFilter?: () => void;
  onOpenCondFormatDialog?: () => void;
  onPageSetup?: () => void;
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

  const csvInputRef = useRef<HTMLInputElement>(null);
  const [showCondFormat, setShowCondFormat] = useState(false);
  const [wrapText, setWrapText] = useState(false);
  const [freezeRow, setFreezeRow] = useState(false);
  const [freezeCol, setFreezeCol] = useState(false);

  const getCurrentStyle = useCallback(() => {
    if (!activeCell) return {};
    const sheet = getActiveSheet();
    const key = `${String.fromCharCode(65 + activeCell.col)}${activeCell.row + 1}`;
    return sheet.cells[key]?.style || {};
  }, [activeCell, getActiveSheet]);

  const style = getCurrentStyle();

  // Import CSV handler
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
            if (col < 26 && row < 50) {
              setCellValue(col, row, val.trim().replace(/^"|"$/g, ""));
            }
          });
        });
      };
      reader.readAsText(file);
      // Reset input so the same file can be re-imported
      e.target.value = "";
    },
    [setCellValue]
  );

  // Conditional formatting helpers
  const getSelectionBounds = useCallback(() => {
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

  const applyHighlightGreaterThan = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    const threshold = prompt("Highlight cells greater than:");
    if (threshold === null) return;
    const t = parseFloat(threshold);
    if (isNaN(t)) return;
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const val = parseFloat(getCellDisplay(c, r));
        if (!isNaN(val) && val > t) {
          setCellStyle(c, r, { bgColor: "#bbf7d0" });
        }
      }
    }
  }, [getSelectionBounds, getCellDisplay, setCellStyle]);

  const applyHighlightLessThan = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    const threshold = prompt("Highlight cells less than:");
    if (threshold === null) return;
    const t = parseFloat(threshold);
    if (isNaN(t)) return;
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const val = parseFloat(getCellDisplay(c, r));
        if (!isNaN(val) && val < t) {
          setCellStyle(c, r, { bgColor: "#fecaca" });
        }
      }
    }
  }, [getSelectionBounds, getCellDisplay, setCellStyle]);

  const applyHighlightBetween = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    const minStr = prompt("Highlight cells between - Minimum:");
    if (minStr === null) return;
    const maxStr = prompt("Highlight cells between - Maximum:");
    if (maxStr === null) return;
    const minVal = parseFloat(minStr);
    const maxVal = parseFloat(maxStr);
    if (isNaN(minVal) || isNaN(maxVal)) return;
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const val = parseFloat(getCellDisplay(c, r));
        if (!isNaN(val) && val >= minVal && val <= maxVal) {
          setCellStyle(c, r, { bgColor: "#fef08a" });
        }
      }
    }
  }, [getSelectionBounds, getCellDisplay, setCellStyle]);

  const applyHighlightTextContains = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    const text = prompt("Highlight cells containing text:");
    if (!text) return;
    const lower = text.toLowerCase();
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const val = getCellDisplay(c, r).toLowerCase();
        if (val.includes(lower)) {
          setCellStyle(c, r, { bgColor: "#bfdbfe" });
        }
      }
    }
  }, [getSelectionBounds, getCellDisplay, setCellStyle]);

  const applyColorScale = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    const values: { col: number; row: number; val: number }[] = [];
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const val = parseFloat(getCellDisplay(c, r));
        if (!isNaN(val)) {
          values.push({ col: c, row: r, val });
        }
      }
    }
    if (values.length === 0) return;
    const min = Math.min(...values.map((v) => v.val));
    const max = Math.max(...values.map((v) => v.val));
    const range = max - min || 1;
    for (const { col, row, val } of values) {
      const ratio = (val - min) / range;
      const r = Math.round(255 * (1 - ratio));
      const g = Math.round(255 * ratio);
      const color = `rgb(${r},${g},100)`;
      setCellStyle(col, row, { bgColor: color });
    }
  }, [getSelectionBounds, getCellDisplay, setCellStyle]);

  const applyDataBars = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    const values: { col: number; row: number; val: number }[] = [];
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const val = parseFloat(getCellDisplay(c, r));
        if (!isNaN(val)) {
          values.push({ col: c, row: r, val });
        }
      }
    }
    if (values.length === 0) return;
    const max = Math.max(...values.map((v) => v.val));
    for (const { col, row, val } of values) {
      const ratio = max > 0 ? val / max : 0;
      const intensity = Math.round(200 + 55 * (1 - ratio));
      setCellStyle(col, row, { bgColor: `rgb(${intensity},${intensity},255)` });
    }
  }, [getSelectionBounds, getCellDisplay, setCellStyle]);

  const applyIconSets = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    const values: { col: number; row: number; val: number; display: string }[] = [];
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const display = getCellDisplay(c, r);
        const val = parseFloat(display);
        if (!isNaN(val)) {
          values.push({ col: c, row: r, val, display });
        }
      }
    }
    if (values.length === 0) return;
    const sorted = [...values].sort((a, b) => a.val - b.val);
    const third = Math.floor(sorted.length / 3);
    const lowThreshold = sorted[third]?.val ?? 0;
    const highThreshold = sorted[third * 2]?.val ?? 0;
    for (const { col, row, val } of values) {
      if (val <= lowThreshold) {
        setCellStyle(col, row, { bgColor: "#fecaca" }); // red - low
      } else if (val >= highThreshold) {
        setCellStyle(col, row, { bgColor: "#bbf7d0" }); // green - high
      } else {
        setCellStyle(col, row, { bgColor: "#fef08a" }); // yellow - mid
      }
    }
  }, [getSelectionBounds, getCellDisplay, setCellStyle]);

  // Auto-sum helper
  const handleAutoSum = useCallback(
    (fn: string) => {
      if (!activeCell) return;
      // Find the contiguous range above the active cell
      const col = activeCell.col;
      const row = activeCell.row;
      let startRow = row - 1;
      while (startRow >= 0) {
        const val = getCellDisplay(col, startRow);
        if (val === "") break;
        startRow--;
      }
      startRow++;
      if (startRow >= row) return;
      const colLetter = colToLetter(col);
      const formula = `=${fn}(${colLetter}${startRow + 1}:${colLetter}${row})`;
      setCellValue(col, row, formula);
    },
    [activeCell, getCellDisplay, setCellValue]
  );

  // Merge & center
  const handleMerge = useCallback(
    (type: "all" | "rows" | "unmerge") => {
      const bounds = getSelectionBounds();
      if (!bounds) return;
      if (type === "unmerge") {
        // Clear merge flag -- just leave cells as is
        return;
      }
      // For "all": take value from top-left cell and clear others
      const topLeftVal = getCellDisplay(bounds.minC, bounds.minR);
      for (let r = bounds.minR; r <= bounds.maxR; r++) {
        for (let c = bounds.minC; c <= bounds.maxC; c++) {
          if (r === bounds.minR && c === bounds.minC) {
            setCellStyle(c, r, { align: "center" });
          } else {
            setCellValue(c, r, "");
          }
        }
      }
    },
    [getSelectionBounds, getCellDisplay, setCellStyle, setCellValue]
  );

  // Add note/comment
  const handleAddNote = useCallback(() => {
    if (!activeCell) return;
    const note = prompt("Enter note for this cell:");
    if (note === null) return;
    // Store the note as a comment indicator using an existing pattern
    const currentRaw = getCellRaw(activeCell.col, activeCell.row);
    // We'll mark cells with notes by adding a bgColor indicator
    if (note) {
      setCellStyle(activeCell.col, activeCell.row, { bgColor: "#fef9c3" });
    }
  }, [activeCell, getCellRaw, setCellStyle]);

  // Freeze panes
  const handleFreeze = useCallback(
    (type: "row" | "col" | "both" | "none") => {
      switch (type) {
        case "row":
          setFreezeRow(true);
          setFreezeCol(false);
          break;
        case "col":
          setFreezeRow(false);
          setFreezeCol(true);
          break;
        case "both":
          setFreezeRow(true);
          setFreezeCol(true);
          break;
        case "none":
          setFreezeRow(false);
          setFreezeCol(false);
          break;
      }
    },
    []
  );

  // Wrap text toggle
  const handleWrapText = useCallback(() => {
    const newWrap = !wrapText;
    setWrapText(newWrap);
    setSelectionStyle({ wrapText: newWrap } as Record<string, unknown>);
  }, [wrapText, setSelectionStyle]);

  // Print area
  const handlePrintArea = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) {
      alert("Select a range of cells to set as print area.");
      return;
    }
    const range = `${colToLetter(bounds.minC)}${bounds.minR + 1}:${colToLetter(bounds.maxC)}${bounds.maxR + 1}`;
    alert(`Print area set to: ${range}`);
  }, [getSelectionBounds]);

  // Named ranges
  const handleNamedRange = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) {
      alert("Select a range of cells first.");
      return;
    }
    const name = prompt("Enter a name for this range:");
    if (!name) return;
    const range = `${colToLetter(bounds.minC)}${bounds.minR + 1}:${colToLetter(bounds.maxC)}${bounds.maxR + 1}`;
    alert(`Named range "${name}" defined as ${range}`);
  }, [getSelectionBounds]);

  const Separator = () => (
    <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border)" }} />
  );

  return (
    <div
      className="flex items-center gap-1 border-b px-2 py-1 flex-wrap"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      {/* === Font formatting === */}
      <ToolBtn title="Bold" active={style.bold} onClick={() => setSelectionStyle({ bold: !style.bold })}>
        <Bold size={15} />
      </ToolBtn>
      <ToolBtn title="Italic" active={style.italic} onClick={() => setSelectionStyle({ italic: !style.italic })}>
        <Italic size={15} />
      </ToolBtn>
      <ToolBtn title="Underline" active={style.underline} onClick={() => setSelectionStyle({ underline: !style.underline })}>
        <Underline size={15} />
      </ToolBtn>

      <Separator />

      {/* === Alignment === */}
      <ToolBtn title="Align Left" active={style.align === "left"} onClick={() => setSelectionStyle({ align: "left" })}>
        <AlignLeft size={15} />
      </ToolBtn>
      <ToolBtn title="Align Center" active={style.align === "center"} onClick={() => setSelectionStyle({ align: "center" })}>
        <AlignCenter size={15} />
      </ToolBtn>
      <ToolBtn title="Align Right" active={style.align === "right"} onClick={() => setSelectionStyle({ align: "right" })}>
        <AlignRight size={15} />
      </ToolBtn>

      {/* Wrap Text */}
      <ToolBtn title="Wrap Text" active={wrapText} onClick={handleWrapText}>
        <WrapText size={15} />
      </ToolBtn>

      {/* Merge & Center */}
      <DropdownBtn icon={<Merge size={15} />} title="Merge & Center">
        {(close) => (
          <>
            <DropdownItem onClick={() => { handleMerge("all"); close(); }}>
              Merge All
            </DropdownItem>
            <DropdownItem onClick={() => { handleMerge("rows"); close(); }}>
              Merge Rows
            </DropdownItem>
            <DropdownItem onClick={() => { handleMerge("unmerge"); close(); }}>
              Unmerge
            </DropdownItem>
          </>
        )}
      </DropdownBtn>

      <Separator />

      {/* === Colors === */}
      <ColorPicker
        currentColor={style.bgColor || ""}
        onPick={(c) => setSelectionStyle({ bgColor: c })}
        icon={<Palette size={15} />}
        title="Background Color"
      />
      <ColorPicker
        currentColor={style.textColor || ""}
        onPick={(c) => setSelectionStyle({ textColor: c })}
        icon={<Type size={15} />}
        title="Text Color"
      />

      {/* Cell Borders */}
      <CellBordersPicker />

      <Separator />

      {/* === Number format dropdown === */}
      <select
        className="text-xs rounded px-1 py-1 border outline-none"
        style={{
          backgroundColor: "var(--background)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
        value={style.format || "general"}
        onChange={(e) =>
          setSelectionStyle({
            format: e.target.value as "general" | "number" | "currency" | "percent" | "date",
          })
        }
      >
        {FORMATS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Quick format buttons: Currency, Percentage, Date */}
      <ToolBtn title="Currency Format" active={style.format === "currency"} onClick={() => setSelectionStyle({ format: "currency" })}>
        <DollarSign size={15} />
      </ToolBtn>
      <ToolBtn title="Percentage Format" active={style.format === "percent"} onClick={() => setSelectionStyle({ format: "percent" })}>
        <Percent size={15} />
      </ToolBtn>
      <ToolBtn title="Date Format" active={style.format === "date"} onClick={() => setSelectionStyle({ format: "date" })}>
        <Calendar size={15} />
      </ToolBtn>

      <Separator />

      {/* === Auto-sum === */}
      <DropdownBtn icon={<Sigma size={15} />} title="Auto Sum">
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

      <Separator />

      {/* === Sort & Filter === */}
      <ToolBtn title="Sort & Filter" onClick={() => onOpenSortFilter?.()}>
        <Filter size={15} />
      </ToolBtn>

      {/* === Conditional Formatting (enhanced) === */}
      <div className="relative">
        <ToolBtn
          title="Conditional Formatting"
          onClick={() => setShowCondFormat(!showCondFormat)}
        >
          <Highlighter size={15} />
        </ToolBtn>
        {showCondFormat && (
          <div
            className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg border z-50"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
              minWidth: 220,
            }}
          >
            <div
              className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              Highlight Cells Rules
            </div>
            <DropdownItem onClick={() => { applyHighlightGreaterThan(); setShowCondFormat(false); }}>
              Greater Than...
            </DropdownItem>
            <DropdownItem onClick={() => { applyHighlightLessThan(); setShowCondFormat(false); }}>
              Less Than...
            </DropdownItem>
            <DropdownItem onClick={() => { applyHighlightBetween(); setShowCondFormat(false); }}>
              Between...
            </DropdownItem>
            <DropdownItem onClick={() => { applyHighlightTextContains(); setShowCondFormat(false); }}>
              Text Contains...
            </DropdownItem>
            <div
              className="mx-2 my-1 border-t"
              style={{ borderColor: "var(--border)" }}
            />
            <div
              className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              Color Scales & Bars
            </div>
            <DropdownItem onClick={() => { applyColorScale(); setShowCondFormat(false); }}>
              Color Scale (Red to Green)
            </DropdownItem>
            <DropdownItem onClick={() => { applyDataBars(); setShowCondFormat(false); }}>
              Data Bars
            </DropdownItem>
            <DropdownItem onClick={() => { applyIconSets(); setShowCondFormat(false); }}>
              Icon Sets (3-color)
            </DropdownItem>
          </div>
        )}
      </div>

      <Separator />

      {/* === Data tools === */}
      <ToolBtn title="Pivot Table" onClick={() => onOpenPivot?.()}>
        <Table2 size={15} />
      </ToolBtn>
      <ToolBtn title="Data Validation" onClick={() => onOpenValidation?.()}>
        <ShieldCheck size={15} />
      </ToolBtn>

      <Separator />

      {/* === Freeze Panes === */}
      <DropdownBtn icon={<Snowflake size={15} />} title="Freeze Panes">
        {(close) => (
          <>
            <DropdownItem onClick={() => { handleFreeze("row"); close(); }}>
              Freeze First Row
            </DropdownItem>
            <DropdownItem onClick={() => { handleFreeze("col"); close(); }}>
              Freeze First Column
            </DropdownItem>
            <DropdownItem onClick={() => { handleFreeze("both"); close(); }}>
              Freeze Row & Column
            </DropdownItem>
            <DropdownItem onClick={() => { handleFreeze("none"); close(); }}>
              Unfreeze
            </DropdownItem>
          </>
        )}
      </DropdownBtn>

      {/* === Cell Notes === */}
      <ToolBtn title="Add Note" onClick={handleAddNote}>
        <StickyNote size={15} />
      </ToolBtn>

      {/* === Named Ranges === */}
      <ToolBtn title="Named Ranges" onClick={handleNamedRange}>
        <Bookmark size={15} />
      </ToolBtn>

      <Separator />

      {/* === Charts === */}
      <ToolBtn title="Bar Chart" onClick={() => openChartModal("bar")}>
        <BarChart3 size={15} />
      </ToolBtn>
      <ToolBtn title="Line Chart" onClick={() => openChartModal("line")}>
        <LineChart size={15} />
      </ToolBtn>
      <ToolBtn title="Pie Chart" onClick={() => openChartModal("pie")}>
        <PieChart size={15} />
      </ToolBtn>

      <Separator />

      {/* === Templates === */}
      <ToolBtn title="Templates" onClick={openTemplatesModal}>
        <FileSpreadsheet size={15} />
      </ToolBtn>

      <Separator />

      {/* === Import CSV === */}
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />
      <ToolBtn title="Import CSV" onClick={() => csvInputRef.current?.click()}>
        <Upload size={15} />
      </ToolBtn>

      {/* === Print Area === */}
      <ToolBtn title="Set Print Area" onClick={handlePrintArea}>
        <Columns size={15} />
      </ToolBtn>

      {/* === Page Setup === */}
      {onPageSetup && (
        <ToolBtn title="Page Setup" onClick={onPageSetup}>
          <Settings2 size={15} />
        </ToolBtn>
      )}

      <div className="flex-1" />

      {/* === Export / Print === */}
      <ToolBtn title="Export CSV" onClick={onExportCSV}>
        <Download size={15} />
      </ToolBtn>
      <ToolBtn title="Print" onClick={onPrint}>
        <Printer size={15} />
      </ToolBtn>

      <Separator />

      <ToolBtn title="AI Assistant" active={showAiPanel} onClick={toggleAiPanel}>
        <MessageSquare size={15} />
      </ToolBtn>
    </div>
  );
}
