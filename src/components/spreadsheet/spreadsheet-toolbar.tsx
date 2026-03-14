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
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

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
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const openChartModal = useSpreadsheetStore((s) => s.openChartModal);
  const openTemplatesModal = useSpreadsheetStore((s) => s.openTemplatesModal);
  const toggleAiPanel = useSpreadsheetStore((s) => s.toggleAiPanel);
  const showAiPanel = useSpreadsheetStore((s) => s.showAiPanel);

  const getCurrentStyle = useCallback(() => {
    if (!activeCell) return {};
    const sheet = getActiveSheet();
    const key = `${String.fromCharCode(65 + activeCell.col)}${activeCell.row + 1}`;
    return sheet.cells[key]?.style || {};
  }, [activeCell, getActiveSheet]);

  const style = getCurrentStyle();

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
            format: e.target.value as "general" | "number" | "currency" | "percent",
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
