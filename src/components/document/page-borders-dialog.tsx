"use client";

import React, { useState, useEffect } from "react";
import { X, Frame } from "lucide-react";

interface PageBordersDialogProps {
  open: boolean;
  onClose: () => void;
}

type BorderStyle = "none" | "solid" | "double" | "dashed" | "dotted" | "ridge" | "groove" | "inset" | "outset";

const PRESET_BORDERS = [
  { label: "None", style: "none" as BorderStyle, width: 0, color: "#000000" },
  { label: "Simple Box", style: "solid" as BorderStyle, width: 2, color: "#333333" },
  { label: "Double Line", style: "double" as BorderStyle, width: 4, color: "#333333" },
  { label: "Thick", style: "solid" as BorderStyle, width: 4, color: "#000000" },
  { label: "Dashed", style: "dashed" as BorderStyle, width: 2, color: "#555555" },
  { label: "Dotted", style: "dotted" as BorderStyle, width: 3, color: "#555555" },
  { label: "Decorative Ridge", style: "ridge" as BorderStyle, width: 4, color: "#8B4513" },
  { label: "Groove", style: "groove" as BorderStyle, width: 4, color: "#4444cc" },
  { label: "Inset Shadow", style: "inset" as BorderStyle, width: 4, color: "#888888" },
  { label: "Art — Wave", style: "dotted" as BorderStyle, width: 3, color: "#1a6640" },
  { label: "Art — Stars", style: "double" as BorderStyle, width: 5, color: "#aa3300" },
  { label: "Art — Classic", style: "ridge" as BorderStyle, width: 6, color: "#2244aa" },
];

const COLOR_PRESETS = [
  "#000000", "#333333", "#555555", "#888888",
  "#dc2626", "#16a34a", "#2563eb", "#9333ea",
  "#d97706", "#0891b2", "#8B4513", "#1a6640",
];

export function PageBordersDialog({ open, onClose }: PageBordersDialogProps) {
  const [borderStyle, setBorderStyle] = useState<BorderStyle>("solid");
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState("#333333");
  const [borderPadding, setBorderPadding] = useState(16);
  const [applyTo, setApplyTo] = useState<"all" | "first" | "except-first">("all");
  const [shadow, setShadow] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1);

  const applyBorder = () => {
    const page = document.querySelector(".doc-page-container") as HTMLElement;
    if (!page) return;
    if (borderStyle === "none") {
      page.style.border = "none";
      page.style.boxShadow = shadow ? "4px 4px 8px rgba(0,0,0,0.2)" : "";
      page.style.padding = "";
    } else {
      page.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
      page.style.boxShadow = shadow ? `4px 4px 8px rgba(0,0,0,0.2)` : "";
      page.style.padding = `${borderPadding}px`;
    }
    onClose();
  };

  const applyPreset = (idx: number) => {
    const p = PRESET_BORDERS[idx];
    setSelectedPreset(idx);
    setBorderStyle(p.style);
    setBorderWidth(p.width);
    setBorderColor(p.color);
  };

  if (!open) return null;

  const previewBorder = borderStyle === "none" ? "none" : `${borderWidth}px ${borderStyle} ${borderColor}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-[560px] max-h-[85vh] rounded-xl border shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Frame size={15} style={{ color: "var(--primary)" }} />
            Page Borders
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: settings */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ borderRight: "1px solid var(--border)" }}>
            {/* Presets */}
            <div>
              <label className="text-[10px] uppercase font-semibold tracking-wider block mb-2" style={{ color: "var(--muted-foreground)" }}>
                Style Presets
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {PRESET_BORDERS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => applyPreset(i)}
                    className={`px-2 py-1.5 rounded text-[11px] text-left transition-colors ${selectedPreset === i ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]"}`}
                    style={{
                      borderColor: selectedPreset === i ? "var(--primary)" : "var(--border)",
                      border: `1px solid ${selectedPreset === i ? "var(--primary)" : "var(--border)"}`,
                      color: "var(--foreground)",
                    }}
                  >
                    <span
                      className="inline-block w-6 h-3 mr-2 rounded-sm align-middle"
                      style={{
                        border: p.style === "none" ? "none" : `${Math.min(p.width, 2)}px ${p.style} ${p.color}`,
                        backgroundColor: "transparent",
                      }}
                    />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom settings */}
            <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Style</label>
                  <select
                    value={borderStyle}
                    onChange={(e) => { setBorderStyle(e.target.value as BorderStyle); setSelectedPreset(null); }}
                    className="w-full rounded border px-2 py-1.5 text-xs"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="double">Double</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="ridge">Ridge (3D)</option>
                    <option value="groove">Groove (3D)</option>
                    <option value="inset">Inset</option>
                    <option value="outset">Outset</option>
                  </select>
                </div>
                <div className="w-20">
                  <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Width (px)</label>
                  <input
                    type="number" min={1} max={20} value={borderWidth}
                    onChange={(e) => { setBorderWidth(parseInt(e.target.value) || 1); setSelectedPreset(null); }}
                    className="w-full rounded border px-2 py-1.5 text-xs"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color" value={borderColor}
                    onChange={(e) => { setBorderColor(e.target.value); setSelectedPreset(null); }}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <div className="flex flex-wrap gap-1">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setBorderColor(c); setSelectedPreset(null); }}
                        className="w-4 h-4 rounded-sm border hover:scale-110 transition-transform"
                        style={{ backgroundColor: c, borderColor: borderColor === c ? "var(--primary)" : "transparent" }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Padding */}
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Inner Padding: {borderPadding}px
                </label>
                <input
                  type="range" min={4} max={48} value={borderPadding}
                  onChange={(e) => setBorderPadding(parseInt(e.target.value))}
                  className="w-full" style={{ accentColor: "var(--primary)" }}
                />
              </div>

              {/* Shadow */}
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--foreground)" }}>
                <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} className="w-3.5 h-3.5" />
                Add drop shadow
              </label>

              {/* Apply to */}
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Apply to</label>
                <select
                  value={applyTo}
                  onChange={(e) => setApplyTo(e.target.value as typeof applyTo)}
                  className="w-full rounded border px-2 py-1.5 text-xs"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  <option value="all">Whole document</option>
                  <option value="first">First page only</option>
                  <option value="except-first">All except first page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right: preview */}
          <div className="w-48 p-4 flex flex-col gap-2 flex-shrink-0">
            <label className="text-[10px] uppercase font-semibold tracking-wider block" style={{ color: "var(--muted-foreground)" }}>
              Preview
            </label>
            <div
              className="flex-1 rounded flex items-center justify-center"
              style={{ backgroundColor: "#f5f5f5", minHeight: 180 }}
            >
              <div
                style={{
                  width: 90,
                  height: 120,
                  backgroundColor: "#ffffff",
                  border: previewBorder,
                  padding: Math.min(borderPadding / 2, 8),
                  boxShadow: shadow ? "3px 3px 6px rgba(0,0,0,0.2)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {/* Fake content lines */}
                <div className="space-y-1 mt-1">
                  {[100, 80, 90, 70, 60, 85, 75].map((w, i) => (
                    <div key={i} className="h-1 rounded" style={{ backgroundColor: "#ddd", width: `${w}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[9px] text-center" style={{ color: "var(--muted-foreground)" }}>
              {borderStyle === "none" ? "No border" : `${borderWidth}px ${borderStyle}`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-5 py-3 border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => {
              setBorderStyle("none");
              setBorderWidth(0);
              setSelectedPreset(0);
              const page = document.querySelector(".doc-page-container") as HTMLElement;
              if (page) { page.style.border = "none"; page.style.boxShadow = ""; page.style.padding = ""; }
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg border text-xs hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Remove Border
          </button>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-1.5 rounded-lg border text-xs"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              Cancel
            </button>
            <button onClick={applyBorder}
              className="px-4 py-1.5 rounded-lg text-xs text-white"
              style={{ backgroundColor: "var(--primary)" }}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
