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
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { colToLetter } from "./formula-engine";

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
}: {
  onExportCSV: () => void;
  onPrint: () => void;
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

  const csvInputRef = useRef<HTMLInputElement>(null);
  const [showCondFormat, setShowCondFormat] = useState(false);

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

  const applyColorScale = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    // Collect all numeric values and find min/max
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
      // Red (low) -> Green (high)
      const r = Math.round(255 * (1 - ratio));
      const g = Math.round(255 * ratio);
      const color = `rgb(${r},${g},100)`;
      setCellStyle(col, row, { bgColor: color });
    }
  }, [getSelectionBounds, getCellDisplay, setCellStyle]);

  return (
    <div
      className="flex items-center gap-1 border-b px-2 py-1 flex-wrap"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      {/* Format */}
      <ToolBtn title="Bold" active={style.bold} onClick={() => setSelectionStyle({ bold: !style.bold })}>
        <Bold size={15} />
      </ToolBtn>
      <ToolBtn title="Italic" active={style.italic} onClick={() => setSelectionStyle({ italic: !style.italic })}>
        <Italic size={15} />
      </ToolBtn>
      <ToolBtn title="Underline" active={style.underline} onClick={() => setSelectionStyle({ underline: !style.underline })}>
        <Underline size={15} />
      </ToolBtn>

      <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border)" }} />

      {/* Alignment */}
      <ToolBtn title="Align Left" active={style.align === "left"} onClick={() => setSelectionStyle({ align: "left" })}>
        <AlignLeft size={15} />
      </ToolBtn>
      <ToolBtn title="Align Center" active={style.align === "center"} onClick={() => setSelectionStyle({ align: "center" })}>
        <AlignCenter size={15} />
      </ToolBtn>
      <ToolBtn title="Align Right" active={style.align === "right"} onClick={() => setSelectionStyle({ align: "right" })}>
        <AlignRight size={15} />
      </ToolBtn>

      <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border)" }} />

      {/* Colors */}
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

      <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border)" }} />

      {/* Number format */}
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

      <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border)" }} />

      {/* Charts */}
      <ToolBtn title="Bar Chart" onClick={() => openChartModal("bar")}>
        <BarChart3 size={15} />
      </ToolBtn>
      <ToolBtn title="Line Chart" onClick={() => openChartModal("line")}>
        <LineChart size={15} />
      </ToolBtn>
      <ToolBtn title="Pie Chart" onClick={() => openChartModal("pie")}>
        <PieChart size={15} />
      </ToolBtn>

      <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border)" }} />

      {/* Templates */}
      <ToolBtn title="Templates" onClick={openTemplatesModal}>
        <FileSpreadsheet size={15} />
      </ToolBtn>

      <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border)" }} />

      {/* Import CSV */}
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

      {/* Conditional Formatting */}
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
              minWidth: 200,
            }}
          >
            <button
              className="w-full text-left text-xs px-3 py-1.5 hover:opacity-80"
              style={{ backgroundColor: "transparent", color: "var(--foreground)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              onClick={() => {
                applyHighlightGreaterThan();
                setShowCondFormat(false);
              }}
            >
              Highlight cells &gt; value
            </button>
            <button
              className="w-full text-left text-xs px-3 py-1.5 hover:opacity-80"
              style={{ backgroundColor: "transparent", color: "var(--foreground)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              onClick={() => {
                applyHighlightLessThan();
                setShowCondFormat(false);
              }}
            >
              Highlight cells &lt; value
            </button>
            <button
              className="w-full text-left text-xs px-3 py-1.5 hover:opacity-80"
              style={{ backgroundColor: "transparent", color: "var(--foreground)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              onClick={() => {
                applyColorScale();
                setShowCondFormat(false);
              }}
            >
              Color scale (red → green)
            </button>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Export */}
      <ToolBtn title="Export CSV" onClick={onExportCSV}>
        <Download size={15} />
      </ToolBtn>
      <ToolBtn title="Print" onClick={onPrint}>
        <Printer size={15} />
      </ToolBtn>

      <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border)" }} />

      <ToolBtn title="AI Assistant" active={showAiPanel} onClick={toggleAiPanel}>
        <MessageSquare size={15} />
      </ToolBtn>
    </div>
  );
}
