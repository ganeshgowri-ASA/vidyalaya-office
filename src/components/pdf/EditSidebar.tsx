"use client";

import React, { useRef, useState } from "react";
import {
  Type,
  Image,
  Pencil,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Hexagon,
  Star,
  Stamp,
  Highlighter,
  Underline,
  Strikethrough,
  StickyNote,
  ShieldOff,
  Ruler,
  Layers,
  Undo2,
  Bold,
  Italic,
  Upload,
  Trash2,
} from "lucide-react";
import { btnStyle, btnPrimaryStyle, inputStyle } from "./types";

/* ── helpers ──────────────────────────────────────────────────────────────── */

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  marginBottom: 6,
  marginTop: 4,
};

const dividerStyle: React.CSSProperties = {
  borderTop: "1px solid var(--border)",
  margin: "10px 0",
};

const colorSwatchStyle = (
  color: string,
  selected: boolean
): React.CSSProperties => ({
  width: 22,
  height: 22,
  borderRadius: 4,
  backgroundColor: color,
  border: selected ? "2px solid var(--primary)" : "2px solid var(--border)",
  cursor: "pointer",
  flexShrink: 0,
});

const toolBtnStyle = (active: boolean): React.CSSProperties => ({
  ...btnStyle,
  width: "100%",
  justifyContent: "flex-start",
  backgroundColor: active ? "var(--accent)" : "var(--card)",
  fontSize: 12,
  padding: "5px 8px",
});

/* ── props ────────────────────────────────────────────────────────────────── */

interface EditSidebarProps {
  editMode: string;
  onEditModeChange: (mode: string) => void;
  fontSize: number;
  onFontSizeChange: (s: number) => void;
  fontFamily: string;
  onFontFamilyChange: (f: string) => void;
  drawColor: string;
  onDrawColorChange: (c: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
  selectedStamp: string;
  onStampSelect: (s: string) => void;
  activeShape: string;
  onShapeSelect: (s: string) => void;
  stickyNoteColor: string;
  onStickyNoteColorChange: (c: string) => void;
  fillColor: string;
  onFillColorChange: (c: string) => void;
  fillOpacity: number;
  onFillOpacityChange: (o: number) => void;
  measureUnit: string;
  onMeasureUnitChange: (u: string) => void;
  onImageUpload: (dataUrl: string) => void;
  onUndo: () => void;
  onFlatten: () => void;
  flattenApplied: boolean;
  annotationCount: number;
}

/* ── component ────────────────────────────────────────────────────────────── */

export default function EditSidebar(props: EditSidebarProps) {
  const {
    editMode,
    onEditModeChange,
    fontSize,
    onFontSizeChange,
    fontFamily,
    onFontFamilyChange,
    drawColor,
    onDrawColorChange,
    strokeWidth,
    onStrokeWidthChange,
    selectedStamp,
    onStampSelect,
    activeShape,
    onShapeSelect,
    stickyNoteColor,
    onStickyNoteColorChange,
    fillColor,
    onFillColorChange,
    fillOpacity,
    onFillOpacityChange,
    measureUnit,
    onMeasureUnitChange,
    onImageUpload,
    onUndo,
    onFlatten,
    flattenApplied,
    annotationCount,
  } = props;

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textColor, setTextColor] = useState("#000000");
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [drawOpacity, setDrawOpacity] = useState(1);
  const [highlightColor, setHighlightColor] = useState("#ffff00");
  const [underlineColor, setUnderlineColor] = useState("#ff0000");
  const [strikethroughColor, setStrikethroughColor] = useState("#ff0000");

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      onImageUpload(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const stamps: { label: string; color: string }[] = [
    { label: "Approved", color: "#22c55e" },
    { label: "Rejected", color: "#ef4444" },
    { label: "Draft", color: "#eab308" },
    { label: "Confidential", color: "#a855f7" },
    { label: "Final", color: "#3b82f6" },
  ];

  const highlightColors = ["#ffff00", "#22c55e", "#3b82f6", "#ec4899", "#f97316"];
  const stickyColors = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fed7aa"];

  const shapes: { id: string; label: string; Icon: React.ElementType }[] = [
    { id: "rectangle", label: "Rectangle", Icon: Square },
    { id: "circle", label: "Circle", Icon: Circle },
    { id: "line", label: "Line", Icon: Minus },
    { id: "arrow", label: "Arrow", Icon: ArrowRight },
    { id: "polygon", label: "Polygon", Icon: Hexagon },
    { id: "star", label: "Star", Icon: Star },
  ];

  return (
    <div
      style={{
        width: 240,
        height: "100%",
        backgroundColor: "var(--card)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {/* ── TEXT & CONTENT ─────────────────────────────────────────────── */}
      <div style={sectionHeaderStyle}>Text &amp; Content</div>

      {/* Add Text */}
      <button
        style={toolBtnStyle(editMode === "text")}
        onClick={() => onEditModeChange(editMode === "text" ? "" : "text")}
      >
        <Type size={14} /> Add Text
      </button>

      {editMode === "text" && (
        <div
          style={{
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
          }}
        >
          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Font Size
          </label>
          <input
            type="number"
            min={8}
            max={72}
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            style={{ ...inputStyle, width: "100%" }}
          />

          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => onFontFamilyChange(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          >
            <option value="sans-serif">Sans-serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
            <option value="cursive">Cursive</option>
          </select>

          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Text Color
          </label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            style={{ width: 40, height: 28, border: "none", cursor: "pointer" }}
          />

          <div style={{ display: "flex", gap: 4 }}>
            <button
              style={{
                ...btnStyle,
                backgroundColor: textBold ? "var(--accent)" : "var(--card)",
                padding: "4px 8px",
              }}
              onClick={() => setTextBold(!textBold)}
            >
              <Bold size={14} />
            </button>
            <button
              style={{
                ...btnStyle,
                backgroundColor: textItalic ? "var(--accent)" : "var(--card)",
                padding: "4px 8px",
              }}
              onClick={() => setTextItalic(!textItalic)}
            >
              <Italic size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Add Image */}
      <button
        style={toolBtnStyle(editMode === "image")}
        onClick={() => onEditModeChange(editMode === "image" ? "" : "image")}
      >
        <Image size={14} /> Add Image
      </button>

      {editMode === "image" && (
        <div
          style={{
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
          }}
        >
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFile}
            style={{ display: "none" }}
          />
          <button
            style={{ ...btnStyle, width: "100%", justifyContent: "center" }}
            onClick={() => imageInputRef.current?.click()}
          >
            <Upload size={14} /> Upload Image
          </button>
          {imagePreview && (
            <>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: 120,
                  objectFit: "contain",
                  borderRadius: 4,
                  border: "1px solid var(--border)",
                }}
              />
              <button
                style={{ ...btnStyle, width: "100%", justifyContent: "center" }}
                onClick={() => {
                  setImagePreview(null);
                }}
              >
                <Trash2 size={12} /> Remove
              </button>
            </>
          )}
          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Click on PDF to place image
          </label>
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── MARKUP ─────────────────────────────────────────────────────── */}
      <div style={sectionHeaderStyle}>Markup</div>

      {/* Highlight */}
      <button
        style={toolBtnStyle(editMode === "highlight")}
        onClick={() =>
          onEditModeChange(editMode === "highlight" ? "" : "highlight")
        }
      >
        <Highlighter size={14} /> Highlight
      </button>

      {editMode === "highlight" && (
        <div
          style={{
            padding: 8,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
          }}
        >
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {highlightColors.map((c) => (
              <div
                key={c}
                style={colorSwatchStyle(c, highlightColor === c)}
                onClick={() => {
                  setHighlightColor(c);
                  onDrawColorChange(c);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Underline */}
      <button
        style={toolBtnStyle(editMode === "underline")}
        onClick={() =>
          onEditModeChange(editMode === "underline" ? "" : "underline")
        }
      >
        <Underline size={14} /> Underline
      </button>

      {editMode === "underline" && (
        <div
          style={{
            padding: 8,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
          }}
        >
          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Color
          </label>
          <input
            type="color"
            value={underlineColor}
            onChange={(e) => {
              setUnderlineColor(e.target.value);
              onDrawColorChange(e.target.value);
            }}
            style={{ width: 40, height: 28, border: "none", cursor: "pointer" }}
          />
        </div>
      )}

      {/* Strikethrough */}
      <button
        style={toolBtnStyle(editMode === "strikethrough")}
        onClick={() =>
          onEditModeChange(editMode === "strikethrough" ? "" : "strikethrough")
        }
      >
        <Strikethrough size={14} /> Strikethrough
      </button>

      {editMode === "strikethrough" && (
        <div
          style={{
            padding: 8,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
          }}
        >
          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Color
          </label>
          <input
            type="color"
            value={strikethroughColor}
            onChange={(e) => {
              setStrikethroughColor(e.target.value);
              onDrawColorChange(e.target.value);
            }}
            style={{ width: 40, height: 28, border: "none", cursor: "pointer" }}
          />
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── ANNOTATIONS ────────────────────────────────────────────────── */}
      <div style={sectionHeaderStyle}>Annotations</div>

      {/* Sticky Notes */}
      <button
        style={toolBtnStyle(editMode === "sticky-note")}
        onClick={() =>
          onEditModeChange(editMode === "sticky-note" ? "" : "sticky-note")
        }
      >
        <StickyNote size={14} /> Sticky Notes
      </button>

      {editMode === "sticky-note" && (
        <div
          style={{
            padding: 8,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
          }}
        >
          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Note Color
          </label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
            {stickyColors.map((c) => (
              <div
                key={c}
                style={colorSwatchStyle(c, stickyNoteColor === c)}
                onClick={() => onStickyNoteColorChange(c)}
              />
            ))}
          </div>
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── SHAPES & DRAWING ───────────────────────────────────────────── */}
      <div style={sectionHeaderStyle}>Shapes &amp; Drawing</div>

      {/* Freehand Draw */}
      <button
        style={toolBtnStyle(editMode === "draw")}
        onClick={() => onEditModeChange(editMode === "draw" ? "" : "draw")}
      >
        <Pencil size={14} /> Freehand Draw
      </button>

      {editMode === "draw" && (
        <div
          style={{
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
          }}
        >
          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Color
          </label>
          <input
            type="color"
            value={drawColor}
            onChange={(e) => onDrawColorChange(e.target.value)}
            style={{ width: 40, height: 28, border: "none", cursor: "pointer" }}
          />

          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Stroke Width: {strokeWidth}px
          </label>
          <input
            type="range"
            min={1}
            max={20}
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />

          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Opacity: {Math.round(drawOpacity * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(drawOpacity * 100)}
            onChange={(e) => setDrawOpacity(Number(e.target.value) / 100)}
            style={{ width: "100%" }}
          />
        </div>
      )}

      {/* Shapes */}
      <button
        style={toolBtnStyle(editMode === "shape")}
        onClick={() => onEditModeChange(editMode === "shape" ? "" : "shape")}
      >
        <Square size={14} /> Shapes
      </button>

      {editMode === "shape" && (
        <div
          style={{
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 4,
            }}
          >
            {shapes.map((s) => (
              <button
                key={s.id}
                style={{
                  ...btnStyle,
                  flexDirection: "column",
                  padding: "6px 4px",
                  fontSize: 10,
                  backgroundColor:
                    activeShape === s.id ? "var(--primary)" : "var(--card)",
                  color:
                    activeShape === s.id
                      ? "var(--primary-foreground)"
                      : "var(--card-foreground)",
                }}
                onClick={() => onShapeSelect(s.id)}
              >
                <s.Icon size={16} />
                {s.label}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Stroke Color
          </label>
          <input
            type="color"
            value={drawColor}
            onChange={(e) => onDrawColorChange(e.target.value)}
            style={{ width: 40, height: 28, border: "none", cursor: "pointer" }}
          />

          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Fill Color
          </label>
          <input
            type="color"
            value={fillColor}
            onChange={(e) => onFillColorChange(e.target.value)}
            style={{ width: 40, height: 28, border: "none", cursor: "pointer" }}
          />

          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Fill Opacity: {Math.round(fillOpacity * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(fillOpacity * 100)}
            onChange={(e) => onFillOpacityChange(Number(e.target.value) / 100)}
            style={{ width: "100%" }}
          />

          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Stroke Width: {strokeWidth}px
          </label>
          <input
            type="range"
            min={1}
            max={20}
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── STAMPS ─────────────────────────────────────────────────────── */}
      <div style={sectionHeaderStyle}>Stamps</div>

      <button
        style={toolBtnStyle(editMode === "stamp")}
        onClick={() => onEditModeChange(editMode === "stamp" ? "" : "stamp")}
      >
        <Stamp size={14} /> Stamps
      </button>

      {editMode === "stamp" && (
        <div
          style={{
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
          }}
        >
          {stamps.map((s) => (
            <button
              key={s.label}
              style={{
                ...btnStyle,
                width: "100%",
                justifyContent: "center",
                fontWeight: 700,
                color: "#fff",
                backgroundColor:
                  selectedStamp === s.label ? s.color : `${s.color}99`,
                border:
                  selectedStamp === s.label
                    ? `2px solid ${s.color}`
                    : "1px solid var(--border)",
              }}
              onClick={() => onStampSelect(s.label)}
            >
              {s.label.toUpperCase()}
            </button>
          ))}
          <label
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              marginTop: 4,
            }}
          >
            Click on PDF to place stamp
          </label>
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── REDACTION ──────────────────────────────────────────────────── */}
      <div style={sectionHeaderStyle}>Redaction</div>

      <button
        style={toolBtnStyle(editMode === "redact")}
        onClick={() => onEditModeChange(editMode === "redact" ? "" : "redact")}
      >
        <ShieldOff size={14} /> Redact Area
      </button>

      {editMode === "redact" && (
        <div
          style={{
            padding: 8,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
            fontSize: 11,
            color: "var(--muted-foreground)",
          }}
        >
          Click and drag to redact an area on the PDF. Redacted areas will be
          permanently removed when flattened.
        </div>
      )}

      <div style={dividerStyle} />

      {/* ── MEASUREMENT ────────────────────────────────────────────────── */}
      <div style={sectionHeaderStyle}>Measurement</div>

      <button
        style={toolBtnStyle(editMode === "measure-distance")}
        onClick={() =>
          onEditModeChange(
            editMode === "measure-distance" ? "" : "measure-distance"
          )
        }
      >
        <Ruler size={14} /> Distance
      </button>
      <button
        style={toolBtnStyle(editMode === "measure-area")}
        onClick={() =>
          onEditModeChange(editMode === "measure-area" ? "" : "measure-area")
        }
      >
        <Ruler size={14} /> Area
      </button>
      <button
        style={toolBtnStyle(editMode === "measure-perimeter")}
        onClick={() =>
          onEditModeChange(
            editMode === "measure-perimeter" ? "" : "measure-perimeter"
          )
        }
      >
        <Ruler size={14} /> Perimeter
      </button>

      <div
        style={{
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Unit
        </label>
        <select
          value={measureUnit}
          onChange={(e) => onMeasureUnitChange(e.target.value)}
          style={{ ...inputStyle, width: "100%" }}
        >
          <option value="px">Pixels (px)</option>
          <option value="in">Inches (in)</option>
          <option value="cm">Centimeters (cm)</option>
          <option value="mm">Millimeters (mm)</option>
        </select>
      </div>

      <div style={dividerStyle} />

      {/* ── ACTIONS ────────────────────────────────────────────────────── */}
      <div style={sectionHeaderStyle}>Actions</div>

      <button
        style={{
          ...btnPrimaryStyle,
          width: "100%",
          justifyContent: "center",
          opacity: flattenApplied || annotationCount === 0 ? 0.5 : 1,
        }}
        disabled={flattenApplied || annotationCount === 0}
        onClick={onFlatten}
      >
        <Layers size={14} /> Flatten Annotations
        {annotationCount > 0 && (
          <span
            style={{
              backgroundColor: "var(--primary-foreground)",
              color: "var(--primary)",
              borderRadius: 10,
              padding: "0 6px",
              fontSize: 10,
              fontWeight: 700,
              marginLeft: 2,
            }}
          >
            {annotationCount}
          </span>
        )}
      </button>

      <button
        style={{ ...btnStyle, width: "100%", justifyContent: "center" }}
        onClick={onUndo}
      >
        <Undo2 size={14} /> Undo
      </button>
    </div>
  );
}
