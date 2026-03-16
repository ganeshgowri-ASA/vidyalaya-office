"use client";

import { useState, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { useSpreadsheetStore, type CellStyle } from "@/store/spreadsheet-store";

type Tab = "number" | "alignment" | "borders" | "fill";

const NUMBER_FORMATS: { label: string; value: CellStyle["format"]; example: string }[] = [
  { label: "General", value: "general", example: "1234.5" },
  { label: "Number", value: "number", example: "1,234.50" },
  { label: "Currency", value: "currency", example: "$1,234.50" },
  { label: "Accounting", value: "accounting", example: "$ 1,234.50" },
  { label: "Percentage", value: "percent", example: "12.5%" },
  { label: "Short Date", value: "shortDate", example: "03/16/2026" },
  { label: "Long Date", value: "longDate", example: "Monday, March 16, 2026" },
  { label: "Time", value: "time", example: "2:30 PM" },
  { label: "Fraction", value: "fraction", example: "1 1/4" },
  { label: "Scientific", value: "scientific", example: "1.23E+03" },
  { label: "Text", value: "text", example: "1234.5" },
];

const BORDER_PRESETS = [
  { label: "None", value: "none" },
  { label: "Outline", value: "outline" },
  { label: "All Borders", value: "all" },
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
  { label: "Thick Bottom", value: "thickBottom" },
];

const BORDER_STYLES = [
  { label: "Thin", value: "1px solid" },
  { label: "Medium", value: "2px solid" },
  { label: "Thick", value: "3px solid" },
  { label: "Dashed", value: "1px dashed" },
  { label: "Dotted", value: "1px dotted" },
  { label: "Double", value: "3px double" },
];

export function CellFormattingDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const getCellData = useSpreadsheetStore((s) => s.getCellData);
  const setSelectionStyle = useSpreadsheetStore((s) => s.setSelectionStyle);
  const mergeCells = useSpreadsheetStore((s) => s.mergeCells);
  const unmergeCells = useSpreadsheetStore((s) => s.unmergeCells);
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);

  const [activeTab, setActiveTab] = useState<Tab>("number");

  const currentStyle = useMemo(() => {
    if (!activeCell) return {} as CellStyle;
    return getCellData(activeCell.col, activeCell.row)?.style || {};
  }, [activeCell, getCellData]);

  const [format, setFormat] = useState<CellStyle["format"]>(currentStyle.format || "general");
  const [align, setAlign] = useState<CellStyle["align"]>(currentStyle.align || "left");
  const [verticalAlign, setVerticalAlign] = useState<CellStyle["verticalAlign"]>(currentStyle.verticalAlign || "middle");
  const [wrapText, setWrapText] = useState(currentStyle.wrapText || false);
  const [textRotation, setTextRotation] = useState(currentStyle.textRotation || 0);
  const [indent, setIndent] = useState(currentStyle.indent || 0);
  const [bgColor, setBgColor] = useState(currentStyle.bgColor || "#ffffff");
  const [borderStyle, setBorderStyle] = useState("1px solid");
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderPreset, setBorderPreset] = useState("none");

  const handleApply = useCallback(() => {
    const style: Partial<CellStyle> = {
      format,
      align,
      verticalAlign,
      wrapText,
      textRotation,
      indent,
      bgColor: bgColor === "#ffffff" ? undefined : bgColor,
    };

    // Apply border preset
    if (borderPreset !== "none") {
      const border = `${borderStyle} ${borderColor}`;
      switch (borderPreset) {
        case "outline":
        case "all":
          style.borderTop = border;
          style.borderBottom = border;
          style.borderLeft = border;
          style.borderRight = border;
          break;
        case "top":
          style.borderTop = border;
          break;
        case "bottom":
          style.borderBottom = border;
          break;
        case "left":
          style.borderLeft = border;
          break;
        case "right":
          style.borderRight = border;
          break;
        case "thickBottom":
          style.borderBottom = `3px solid ${borderColor}`;
          break;
      }
    } else {
      style.borderTop = undefined;
      style.borderBottom = undefined;
      style.borderLeft = undefined;
      style.borderRight = undefined;
    }

    setSelectionStyle(style);
    onClose();
  }, [format, align, verticalAlign, wrapText, textRotation, indent, bgColor, borderPreset, borderStyle, borderColor, setSelectionStyle, onClose]);

  const handleMerge = useCallback(() => {
    if (!selectionStart || !selectionEnd) return;
    const minC = Math.min(selectionStart.col, selectionEnd.col);
    const maxC = Math.max(selectionStart.col, selectionEnd.col);
    const minR = Math.min(selectionStart.row, selectionEnd.row);
    const maxR = Math.max(selectionStart.row, selectionEnd.row);
    mergeCells(minC, minR, maxC, maxR);
  }, [selectionStart, selectionEnd, mergeCells]);

  const handleUnmerge = useCallback(() => {
    if (!activeCell) return;
    unmergeCells(activeCell.col, activeCell.row);
  }, [activeCell, unmergeCells]);

  if (!open) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "number", label: "Number" },
    { id: "alignment", label: "Alignment" },
    { id: "borders", label: "Borders" },
    { id: "fill", label: "Fill" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[500px] max-h-[80vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">Format Cells</h2>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="px-4 py-2 text-xs font-medium border-b-2 transition-colors"
              style={{
                borderColor: activeTab === tab.id ? "var(--primary)" : "transparent",
                color: activeTab === tab.id ? "var(--primary)" : "var(--muted-foreground)",
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-4">
          {/* Number format */}
          {activeTab === "number" && (
            <div className="space-y-2">
              <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Category</div>
              <div className="space-y-1">
                {NUMBER_FORMATS.map((fmt) => (
                  <button
                    key={fmt.value}
                    className="w-full flex items-center justify-between px-3 py-2 rounded text-xs hover:opacity-80"
                    style={{
                      backgroundColor: format === fmt.value ? "rgba(59,130,246,0.15)" : "var(--muted)",
                      border: format === fmt.value ? "1px solid var(--primary)" : "1px solid transparent",
                    }}
                    onClick={() => setFormat(fmt.value)}
                  >
                    <span className="font-medium">{fmt.label}</span>
                    <span className="font-mono" style={{ color: "var(--muted-foreground)" }}>{fmt.example}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alignment */}
          {activeTab === "alignment" && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Horizontal</div>
                <div className="flex gap-2">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      className="flex-1 px-3 py-2 rounded text-xs font-medium capitalize hover:opacity-80"
                      style={{
                        backgroundColor: align === a ? "rgba(59,130,246,0.15)" : "var(--muted)",
                        border: align === a ? "1px solid var(--primary)" : "1px solid transparent",
                      }}
                      onClick={() => setAlign(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Vertical</div>
                <div className="flex gap-2">
                  {(["top", "middle", "bottom"] as const).map((a) => (
                    <button
                      key={a}
                      className="flex-1 px-3 py-2 rounded text-xs font-medium capitalize hover:opacity-80"
                      style={{
                        backgroundColor: verticalAlign === a ? "rgba(59,130,246,0.15)" : "var(--muted)",
                        border: verticalAlign === a ? "1px solid var(--primary)" : "1px solid transparent",
                      }}
                      onClick={() => setVerticalAlign(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={wrapText} onChange={(e) => setWrapText(e.target.checked)} />
                  Wrap Text
                </label>
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Text Rotation ({textRotation}&deg;)
                </label>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={textRotation}
                  onChange={(e) => setTextRotation(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: "var(--muted-foreground)" }}>Indent</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  className="w-24 text-xs rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  value={indent}
                  onChange={(e) => setIndent(parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Merge cells */}
              <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Merge Cells</div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    onClick={handleMerge}
                  >
                    Merge Selection
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    onClick={handleUnmerge}
                  >
                    Unmerge
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Borders */}
          {activeTab === "borders" && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Presets</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {BORDER_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      className="px-2 py-2 rounded text-xs hover:opacity-80"
                      style={{
                        backgroundColor: borderPreset === preset.value ? "rgba(59,130,246,0.15)" : "var(--muted)",
                        border: borderPreset === preset.value ? "1px solid var(--primary)" : "1px solid transparent",
                      }}
                      onClick={() => setBorderPreset(preset.value)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Style</div>
                  <select
                    className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    value={borderStyle}
                    onChange={(e) => setBorderStyle(e.target.value)}
                  >
                    {BORDER_STYLES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Color</div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <span className="text-xs font-mono">{borderColor}</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Preview</div>
                <div
                  className="w-24 h-16 mx-auto"
                  style={{
                    borderTop: ["outline", "all", "top"].includes(borderPreset) ? `${borderStyle} ${borderColor}` : "1px dashed var(--border)",
                    borderBottom: ["outline", "all", "bottom", "thickBottom"].includes(borderPreset) ? (borderPreset === "thickBottom" ? `3px solid ${borderColor}` : `${borderStyle} ${borderColor}`) : "1px dashed var(--border)",
                    borderLeft: ["outline", "all", "left"].includes(borderPreset) ? `${borderStyle} ${borderColor}` : "1px dashed var(--border)",
                    borderRight: ["outline", "all", "right"].includes(borderPreset) ? `${borderStyle} ${borderColor}` : "1px dashed var(--border)",
                    backgroundColor: "var(--background)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Fill */}
          {activeTab === "fill" && (
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Background Color</div>
                <div className="flex items-center gap-3">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <span className="text-xs font-mono">{bgColor}</span>
                  <button
                    className="text-xs px-2 py-1 rounded border hover:opacity-80"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    onClick={() => setBgColor("#ffffff")}
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Quick Colors</div>
                <div className="flex flex-wrap gap-1.5">
                  {["#ffffff", "#f8f9fa", "#fef9c3", "#dcfce7", "#dbeafe", "#fce7f3", "#fecaca", "#fed7aa", "#e9d5ff", "#f3f4f6"].map((color) => (
                    <button
                      key={color}
                      className="w-7 h-7 rounded border hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: color,
                        borderColor: bgColor === color ? "var(--primary)" : "var(--border)",
                        borderWidth: bgColor === color ? 2 : 1,
                      }}
                      onClick={() => setBgColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-xs rounded hover:opacity-90"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
