"use client";

import React, { useState } from "react";
import {
  Highlighter,
  Underline,
  Strikethrough,
  Pencil,
  Eraser,
  Minus,
  ArrowRight,
  Square,
  Circle,
  Triangle,
  Star,
  Type,
  MessageSquare,
  StickyNote,
  Stamp,
  Ruler,
  Paperclip,
  Volume2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  RotateCcw,
  Palette,
  Cloud,
  PenTool,
  Hash,
  Move,
  Upload,
  X,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AnnotationTool =
  | "select"
  | "highlight"
  | "underline"
  | "strikethrough"
  | "squiggly"
  | "freehand"
  | "eraser"
  | "line"
  | "arrow"
  | "rectangle"
  | "oval"
  | "polygon"
  | "cloud"
  | "text-box"
  | "callout"
  | "typewriter"
  | "sticky-note"
  | "stamp"
  | "distance"
  | "perimeter"
  | "area"
  | "attach-file"
  | "attach-sound";

type ToolbarOrientation = "horizontal" | "vertical";

interface AnnotationToolbarProps {
  currentTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  annotationColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
  opacity: number;
  onOpacityChange: (o: number) => void;
  fontSize: number;
  onFontSizeChange: (s: number) => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#facc15" },
  { label: "Green", value: "#4ade80" },
  { label: "Blue", value: "#60a5fa" },
  { label: "Pink", value: "#f472b6" },
  { label: "Orange", value: "#fb923c" },
];

const STICKY_COLORS = [
  { label: "Yellow", value: "#fbbf24" },
  { label: "Blue", value: "#60a5fa" },
  { label: "Green", value: "#4ade80" },
  { label: "Pink", value: "#f472b6" },
  { label: "Purple", value: "#a78bfa" },
];

const STICKY_ICONS: { label: string; value: string }[] = [
  { label: "Comment", value: "comment" },
  { label: "Key", value: "key" },
  { label: "Note", value: "note" },
  { label: "Help", value: "help" },
  { label: "Paragraph", value: "paragraph" },
  { label: "Insert", value: "insert" },
];

const STANDARD_STAMPS = [
  "APPROVED",
  "REJECTED",
  "DRAFT",
  "FINAL",
  "CONFIDENTIAL",
  "FOR REVIEW",
  "NOT FOR PUBLIC RELEASE",
];

const DYNAMIC_STAMPS = [
  "Signed on {date}",
  "Reviewed by {user}",
];

const MEASUREMENT_UNITS = [
  { label: "Inches", value: "in" },
  { label: "Centimeters", value: "cm" },
  { label: "Millimeters", value: "mm" },
  { label: "Points", value: "pt" },
];

const ARROWHEAD_TYPES = ["none", "open", "closed", "diamond", "circle"];

const BORDER_STYLES = ["solid", "dashed", "dotted"];

// ─── Styles ─────────────────────────────────────────────────────────────────

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  padding: "6px 8px 4px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 4,
  userSelect: "none",
};

const toolBtnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "5px 8px",
  fontSize: 11,
  borderRadius: 4,
  border: "1px solid transparent",
  cursor: "pointer",
  transition: "background-color 0.12s",
  whiteSpace: "nowrap",
  color: "var(--foreground)",
  backgroundColor: "transparent",
};

const colorSwatchStyle = (
  color: string,
  isSelected: boolean
): React.CSSProperties => ({
  width: 20,
  height: 20,
  borderRadius: 4,
  backgroundColor: color,
  border: isSelected
    ? "2px solid var(--primary)"
    : "2px solid var(--border)",
  cursor: "pointer",
  flexShrink: 0,
});

const selectStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  padding: "3px 6px",
  fontSize: 11,
  outline: "none",
  width: "100%",
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function AnnotationToolbar({
  currentTool,
  onToolChange,
  annotationColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  opacity,
  onOpacityChange,
  fontSize,
  onFontSizeChange,
}: AnnotationToolbarProps) {
  const [orientation, setOrientation] = useState<ToolbarOrientation>("vertical");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selectedStamp, setSelectedStamp] = useState("APPROVED");
  const [stickyColor, setStickyColor] = useState("#fbbf24");
  const [stickyIcon, setStickyIcon] = useState("comment");
  const [measurementUnit, setMeasurementUnit] = useState("in");
  const [arrowhead, setArrowhead] = useState("closed");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [fontFamily, setFontFamily] = useState("sans-serif");

  const toggleSection = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const isCollapsed = (key: string) => !!collapsed[key];

  const toolBtn = (
    tool: AnnotationTool,
    icon: React.ReactNode,
    label: string
  ): React.ReactNode => {
    const isActive = currentTool === tool;
    return (
      <button
        key={tool}
        onClick={() => onToolChange(tool)}
        title={label}
        style={{
          ...toolBtnBase,
          backgroundColor: isActive ? "var(--primary)" : "transparent",
          color: isActive ? "var(--primary-foreground)" : "var(--foreground)",
          border: isActive ? "1px solid var(--primary)" : "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = "var(--muted)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = isActive ? "var(--primary)" : "transparent";
        }}
      >
        {icon}
        {orientation === "vertical" && <span>{label}</span>}
      </button>
    );
  };

  const isHorizontal = orientation === "horizontal";

  const containerStyle: React.CSSProperties = isHorizontal
    ? {
        display: "flex",
        flexDirection: "row",
        gap: 2,
        padding: 6,
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflowX: "auto",
        alignItems: "center",
        flexWrap: "wrap",
      }
    : {
        display: "flex",
        flexDirection: "column",
        width: 200,
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflowY: "auto",
        maxHeight: "calc(100vh - 160px)",
      };

  const sectionStyle: React.CSSProperties = isHorizontal
    ? { display: "flex", gap: 2, alignItems: "center" }
    : { display: "flex", flexDirection: "column", gap: 1, padding: "0 4px 4px" };

  const dividerStyle: React.CSSProperties = isHorizontal
    ? { width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px", flexShrink: 0 }
    : { height: 1, backgroundColor: "var(--border)", margin: "2px 0" };

  return (
    <div style={containerStyle}>
      {/* ── Orientation Toggle ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: isHorizontal ? "0 4px" : "6px 8px" }}>
        <button
          onClick={() => setOrientation(orientation === "vertical" ? "horizontal" : "vertical")}
          title={`Switch to ${orientation === "vertical" ? "horizontal" : "vertical"} toolbar`}
          style={{ ...toolBtnBase, padding: "3px 6px" }}
        >
          <GripVertical size={14} />
        </button>
        {!isHorizontal && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground)" }}>
            Annotations
          </span>
        )}
      </div>

      <div style={dividerStyle} />

      {/* ── 1. Text Markup Tools ── */}
      {!isHorizontal && (
        <div style={sectionHeaderStyle} onClick={() => toggleSection("markup")}>
          {isCollapsed("markup") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          Text Markup
        </div>
      )}
      {(!isCollapsed("markup") || isHorizontal) && (
        <div style={sectionStyle}>
          {toolBtn("highlight", <Highlighter size={14} />, "Highlight")}
          {toolBtn("underline", <Underline size={14} />, "Underline")}
          {toolBtn("strikethrough", <Strikethrough size={14} />, "Strikethrough")}
          {toolBtn("squiggly", <PenTool size={14} />, "Squiggly")}
        </div>
      )}
      {(currentTool === "highlight" || currentTool === "underline" || currentTool === "strikethrough" || currentTool === "squiggly") && !isHorizontal && (
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 4 }}>Color</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {HIGHLIGHT_COLORS.map((c) => (
              <div
                key={c.value}
                title={c.label}
                style={colorSwatchStyle(c.value, annotationColor === c.value)}
                onClick={() => onColorChange(c.value)}
              />
            ))}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>Opacity</div>
          <input
            type="range"
            min={10}
            max={100}
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{opacity}%</span>
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── 2. Drawing Tools ── */}
      {!isHorizontal && (
        <div style={sectionHeaderStyle} onClick={() => toggleSection("drawing")}>
          {isCollapsed("drawing") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          Drawing Tools
        </div>
      )}
      {(!isCollapsed("drawing") || isHorizontal) && (
        <div style={sectionStyle}>
          {toolBtn("freehand", <Pencil size={14} />, "Freehand")}
          {toolBtn("eraser", <Eraser size={14} />, "Eraser")}
          {toolBtn("line", <Minus size={14} />, "Line")}
          {toolBtn("arrow", <ArrowRight size={14} />, "Arrow")}
          {toolBtn("rectangle", <Square size={14} />, "Rectangle")}
          {toolBtn("oval", <Circle size={14} />, "Oval")}
          {toolBtn("polygon", <Triangle size={14} />, "Polygon")}
          {toolBtn("cloud", <Cloud size={14} />, "Cloud")}
        </div>
      )}
      {(currentTool === "freehand" || currentTool === "line" || currentTool === "arrow" || currentTool === "rectangle" || currentTool === "oval" || currentTool === "polygon" || currentTool === "cloud") && !isHorizontal && (
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 4 }}>Color</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {HIGHLIGHT_COLORS.map((c) => (
              <div
                key={c.value}
                title={c.label}
                style={colorSwatchStyle(c.value, annotationColor === c.value)}
                onClick={() => onColorChange(c.value)}
              />
            ))}
            <input
              type="color"
              value={annotationColor}
              onChange={(e) => onColorChange(e.target.value)}
              style={{ width: 20, height: 20, border: "none", padding: 0, cursor: "pointer" }}
              title="Custom color"
            />
          </div>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>
            Thickness ({strokeWidth}px)
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>
            Opacity ({opacity}%)
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          {(currentTool === "arrow" || currentTool === "line") && (
            <>
              <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>Arrowhead</div>
              <select value={arrowhead} onChange={(e) => setArrowhead(e.target.value)} style={selectStyle}>
                {ARROWHEAD_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </>
          )}
          {(currentTool === "rectangle" || currentTool === "oval" || currentTool === "polygon" || currentTool === "cloud") && (
            <>
              <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>Border Style</div>
              <select value={borderStyle} onChange={(e) => setBorderStyle(e.target.value)} style={selectStyle}>
                {BORDER_STYLES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── 3. Text Tools ── */}
      {!isHorizontal && (
        <div style={sectionHeaderStyle} onClick={() => toggleSection("text")}>
          {isCollapsed("text") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          Text Tools
        </div>
      )}
      {(!isCollapsed("text") || isHorizontal) && (
        <div style={sectionStyle}>
          {toolBtn("text-box", <Type size={14} />, "Text Box")}
          {toolBtn("callout", <MessageSquare size={14} />, "Callout")}
          {toolBtn("typewriter", <Hash size={14} />, "Typewriter")}
        </div>
      )}
      {(currentTool === "text-box" || currentTool === "callout" || currentTool === "typewriter") && !isHorizontal && (
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 2 }}>Font</div>
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={selectStyle}>
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>
            Size ({fontSize}px)
          </div>
          <input
            type="range"
            min={8}
            max={72}
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 4 }}>Color</div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {["#000000", "#ffffff", "#ef4444", "#3b82f6", "#22c55e"].map((c) => (
              <div
                key={c}
                style={colorSwatchStyle(c, annotationColor === c)}
                onClick={() => onColorChange(c)}
              />
            ))}
            <input
              type="color"
              value={annotationColor}
              onChange={(e) => onColorChange(e.target.value)}
              style={{ width: 20, height: 20, border: "none", padding: 0, cursor: "pointer" }}
            />
          </div>
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── 4. Sticky Notes ── */}
      {!isHorizontal && (
        <div style={sectionHeaderStyle} onClick={() => toggleSection("sticky")}>
          {isCollapsed("sticky") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          Sticky Notes
        </div>
      )}
      {(!isCollapsed("sticky") || isHorizontal) && (
        <div style={sectionStyle}>
          {toolBtn("sticky-note", <StickyNote size={14} />, "Sticky Note")}
        </div>
      )}
      {currentTool === "sticky-note" && !isHorizontal && (
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 4 }}>Color</div>
          <div style={{ display: "flex", gap: 4 }}>
            {STICKY_COLORS.map((c) => (
              <div
                key={c.value}
                title={c.label}
                style={colorSwatchStyle(c.value, stickyColor === c.value)}
                onClick={() => {
                  setStickyColor(c.value);
                  onColorChange(c.value);
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>Icon</div>
          <select value={stickyIcon} onChange={(e) => setStickyIcon(e.target.value)} style={selectStyle}>
            {STICKY_ICONS.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── 5. Stamp Tools ── */}
      {!isHorizontal && (
        <div style={sectionHeaderStyle} onClick={() => toggleSection("stamps")}>
          {isCollapsed("stamps") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          Stamps
        </div>
      )}
      {(!isCollapsed("stamps") || isHorizontal) && (
        <div style={sectionStyle}>
          {toolBtn("stamp", <Stamp size={14} />, "Stamp")}
        </div>
      )}
      {currentTool === "stamp" && !isHorizontal && (
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 4 }}>Standard Stamps</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {STANDARD_STAMPS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStamp(s)}
                style={{
                  ...toolBtnBase,
                  width: "100%",
                  justifyContent: "flex-start",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 8px",
                  backgroundColor: selectedStamp === s ? "var(--primary)" : "transparent",
                  color: selectedStamp === s ? "var(--primary-foreground)" : "var(--foreground)",
                  border: selectedStamp === s ? "1px solid var(--primary)" : "1px solid var(--border)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 8, marginBottom: 4 }}>Dynamic Stamps</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {DYNAMIC_STAMPS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStamp(s)}
                style={{
                  ...toolBtnBase,
                  width: "100%",
                  justifyContent: "flex-start",
                  fontSize: 10,
                  padding: "4px 8px",
                  backgroundColor: selectedStamp === s ? "var(--primary)" : "transparent",
                  color: selectedStamp === s ? "var(--primary-foreground)" : "var(--foreground)",
                  border: selectedStamp === s ? "1px solid var(--primary)" : "1px solid var(--border)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 8, marginBottom: 4 }}>Custom Stamp</div>
          <button
            style={{
              ...toolBtnBase,
              width: "100%",
              justifyContent: "center",
              fontSize: 10,
              padding: "4px 8px",
              border: "1px dashed var(--border)",
            }}
          >
            <Upload size={12} /> Upload Image
          </button>
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── 6. Measurement Tools ── */}
      {!isHorizontal && (
        <div style={sectionHeaderStyle} onClick={() => toggleSection("measure")}>
          {isCollapsed("measure") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          Measurement
        </div>
      )}
      {(!isCollapsed("measure") || isHorizontal) && (
        <div style={sectionStyle}>
          {toolBtn("distance", <Ruler size={14} />, "Distance")}
          {toolBtn("perimeter", <Move size={14} />, "Perimeter")}
          {toolBtn("area", <Square size={14} />, "Area")}
        </div>
      )}
      {(currentTool === "distance" || currentTool === "perimeter" || currentTool === "area") && !isHorizontal && (
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 2 }}>Unit</div>
          <select value={measurementUnit} onChange={(e) => setMeasurementUnit(e.target.value)} style={selectStyle}>
            {MEASUREMENT_UNITS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 4 }}>Color</div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {["#ef4444", "#3b82f6", "#22c55e", "#a855f7"].map((c) => (
              <div
                key={c}
                style={colorSwatchStyle(c, annotationColor === c)}
                onClick={() => onColorChange(c)}
              />
            ))}
          </div>
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── 7. Attachment ── */}
      {!isHorizontal && (
        <div style={sectionHeaderStyle} onClick={() => toggleSection("attach")}>
          {isCollapsed("attach") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          Attachment
        </div>
      )}
      {(!isCollapsed("attach") || isHorizontal) && (
        <div style={sectionStyle}>
          {toolBtn("attach-file", <Paperclip size={14} />, "Attach File")}
          {toolBtn("attach-sound", <Volume2 size={14} />, "Attach Sound")}
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── 8. Properties (Quick Panel) ── */}
      {!isHorizontal && (
        <div style={sectionHeaderStyle} onClick={() => toggleSection("props")}>
          {isCollapsed("props") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          Properties
        </div>
      )}
      {!isCollapsed("props") && !isHorizontal && (
        <div style={{ padding: "4px 8px 8px" }}>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 4 }}>Color</div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                backgroundColor: annotationColor,
                border: "2px solid var(--border)",
              }}
            />
            <input
              type="color"
              value={annotationColor}
              onChange={(e) => onColorChange(e.target.value)}
              style={{ width: 24, height: 24, border: "none", padding: 0, cursor: "pointer" }}
            />
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{annotationColor}</span>
          </div>

          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>
            Opacity: {opacity}%
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />

          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>
            Stroke: {strokeWidth}px
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />

          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>
            Font Size: {fontSize}px
          </div>
          <input
            type="range"
            min={8}
            max={72}
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />

          <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 2 }}>
            Border Style
          </div>
          <select value={borderStyle} onChange={(e) => setBorderStyle(e.target.value)} style={selectStyle}>
            {BORDER_STYLES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
