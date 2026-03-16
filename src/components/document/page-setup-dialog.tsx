"use client";

import React, { useState } from "react";
import { X, Monitor, Smartphone } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import type { PageSize, MarginPreset } from "@/store/document-store";

const PAPER_SIZES = [
  { key: "a4", label: "A4", width: 210, height: 297 },
  { key: "letter", label: "Letter", width: 216, height: 279 },
  { key: "legal", label: "Legal", width: 216, height: 356 },
  { key: "a5", label: "A5", width: 148, height: 210 },
  { key: "b5", label: "B5", width: 176, height: 250 },
];

const MARGIN_OPTIONS = [
  { key: "normal", label: "Normal", top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 },
  { key: "narrow", label: "Narrow", top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 },
  { key: "wide", label: "Wide", top: 25.4, bottom: 25.4, left: 50.8, right: 50.8 },
  { key: "moderate", label: "Moderate", top: 25.4, bottom: 25.4, left: 19.05, right: 19.05 },
  { key: "mirrored", label: "Mirrored", top: 25.4, bottom: 25.4, left: 31.75, right: 25.4 },
];

const PAGE_BORDER_STYLES = [
  { label: "None", value: "none" },
  { label: "Box", value: "2px solid #333" },
  { label: "Shadow", value: "2px solid #333" },
  { label: "3-D", value: "3px ridge #666" },
  { label: "Double", value: "4px double #333" },
  { label: "Dashed", value: "2px dashed #666" },
  { label: "Dotted", value: "3px dotted #666" },
  { label: "Thick", value: "4px solid #000" },
];

interface PageSetupDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PageSetupDialog({ open, onClose }: PageSetupDialogProps) {
  const { pageSize, setPageSize, margins, setMargins, columns, setColumns, orientation, setOrientation } = useDocumentStore();

  const [localOrientation, setLocalOrientation] = useState(orientation);
  const [customWidth, setCustomWidth] = useState(210);
  const [customHeight, setCustomHeight] = useState(297);
  const [selectedPaper, setSelectedPaper] = useState<string>(pageSize);
  const [selectedMargin, setSelectedMargin] = useState<string>(margins);
  const [marginTop, setMarginTop] = useState(25.4);
  const [marginBottom, setMarginBottom] = useState(25.4);
  const [marginLeft, setMarginLeft] = useState(25.4);
  const [marginRight, setMarginRight] = useState(25.4);
  const [gutterPos, setGutterPos] = useState<"left" | "top">("left");
  const [gutterSize, setGutterSize] = useState(0);
  const [localColumns, setLocalColumns] = useState(columns);
  const [columnSpacing, setColumnSpacing] = useState(1.27);
  const [equalColumns, setEqualColumns] = useState(true);
  const [selectedBorder, setSelectedBorder] = useState("none");
  const [borderColor, setBorderColor] = useState("#333333");
  const [borderWidth, setBorderWidth] = useState(1);
  const [applyTo, setApplyTo] = useState<"whole" | "forward">("whole");
  const [activeTab, setActiveTab] = useState<"paper" | "margins" | "columns" | "borders">("paper");

  if (!open) return null;

  const handleApply = () => {
    if (selectedPaper !== "custom") {
      setPageSize(selectedPaper as PageSize);
    }
    setMargins(selectedMargin as MarginPreset);
    setOrientation(localOrientation);
    setColumns(localColumns);

    // Apply page border
    if (selectedBorder !== "none") {
      const page = document.querySelector(".doc-page-container") as HTMLElement;
      if (page) {
        const borderStyle = PAGE_BORDER_STYLES.find((b) => b.label === selectedBorder);
        page.style.border = borderStyle?.value || "";
        if (selectedBorder === "Shadow") {
          page.style.boxShadow = "4px 4px 0 #999";
        }
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[560px] max-h-[90vh] rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Page Setup</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5" style={{ borderColor: "var(--border)" }}>
          {(["paper", "margins", "columns", "borders"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-xs font-medium border-b-2 capitalize ${
                activeTab === t ? "border-[var(--primary)]" : "border-transparent"
              }`}
              style={{ color: activeTab === t ? "var(--primary)" : "var(--muted-foreground)" }}>
              {t === "borders" ? "Page Borders" : t}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          {activeTab === "paper" && (
            <>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Paper Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAPER_SIZES.map((p) => (
                    <button key={p.key} onClick={() => setSelectedPaper(p.key)}
                      className={`p-2.5 rounded-lg border text-left text-xs ${
                        selectedPaper === p.key ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                      }`} style={{ color: "var(--foreground)" }}>
                      <div className="font-medium">{p.label}</div>
                      <div style={{ color: "var(--muted-foreground)" }}>{p.width} x {p.height} mm</div>
                    </button>
                  ))}
                  <button onClick={() => setSelectedPaper("custom")}
                    className={`p-2.5 rounded-lg border text-left text-xs ${
                      selectedPaper === "custom" ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                    }`} style={{ color: "var(--foreground)" }}>
                    <div className="font-medium">Custom</div>
                    <div style={{ color: "var(--muted-foreground)" }}>Set dimensions</div>
                  </button>
                </div>
              </div>

              {selectedPaper === "custom" && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Width (mm)</label>
                    <input type="number" value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Height (mm)</label>
                    <input type="number" value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Orientation</label>
                <div className="flex gap-2">
                  <button onClick={() => setLocalOrientation("portrait")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs ${
                      localOrientation === "portrait" ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                    }`} style={{ color: "var(--foreground)" }}>
                    <Smartphone size={16} /> Portrait
                  </button>
                  <button onClick={() => setLocalOrientation("landscape")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs ${
                      localOrientation === "landscape" ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                    }`} style={{ color: "var(--foreground)" }}>
                    <Monitor size={16} /> Landscape
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Apply to</label>
                <select value={applyTo} onChange={(e) => setApplyTo(e.target.value as "whole" | "forward")}
                  className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <option value="whole">Whole document</option>
                  <option value="forward">This section forward</option>
                </select>
              </div>
            </>
          )}

          {activeTab === "margins" && (
            <>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Margin Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  {MARGIN_OPTIONS.map((m) => (
                    <button key={m.key}
                      onClick={() => {
                        setSelectedMargin(m.key);
                        setMarginTop(m.top); setMarginBottom(m.bottom);
                        setMarginLeft(m.left); setMarginRight(m.right);
                      }}
                      className={`p-2.5 rounded-lg border text-left text-xs ${
                        selectedMargin === m.key ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                      }`} style={{ color: "var(--foreground)" }}>
                      <div className="font-medium">{m.label}</div>
                      <div style={{ color: "var(--muted-foreground)" }}>T:{m.top} B:{m.bottom} L:{m.left} R:{m.right}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Top (mm)", value: marginTop, set: setMarginTop },
                  { label: "Bottom (mm)", value: marginBottom, set: setMarginBottom },
                  { label: "Left (mm)", value: marginLeft, set: setMarginLeft },
                  { label: "Right (mm)", value: marginRight, set: setMarginRight },
                ].map((m) => (
                  <div key={m.label}>
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>{m.label}</label>
                    <input type="number" value={m.value} onChange={(e) => m.set(Number(e.target.value))}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Gutter</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Position</label>
                    <select value={gutterPos} onChange={(e) => setGutterPos(e.target.value as "left" | "top")}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                      <option value="left">Left</option>
                      <option value="top">Top</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Size (mm)</label>
                    <input type="number" value={gutterSize} onChange={(e) => setGutterSize(Number(e.target.value))}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "columns" && (
            <>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Number of Columns</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button key={n} onClick={() => setLocalColumns(n)}
                      className={`flex-1 p-3 rounded-lg border text-center ${
                        localColumns === n ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                      }`} style={{ color: "var(--foreground)" }}>
                      <div className="flex gap-1 justify-center mb-1">
                        {Array.from({ length: n }, (_, i) => (
                          <div key={i} className="h-8 rounded" style={{
                            width: `${Math.floor(60 / n)}px`,
                            backgroundColor: "var(--muted-foreground)",
                            opacity: 0.3,
                          }} />
                        ))}
                      </div>
                      <span className="text-xs">{n === 1 ? "One" : n === 2 ? "Two" : "Three"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {localColumns > 1 && (
                <>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                      Column Spacing (cm)
                    </label>
                    <input type="number" min={0.5} max={5} step={0.1} value={columnSpacing}
                      onChange={(e) => setColumnSpacing(Number(e.target.value))}
                      className="w-32 rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  </div>
                  <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                    <input type="checkbox" checked={equalColumns} onChange={(e) => setEqualColumns(e.target.checked)} />
                    Equal column width
                  </label>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                      Presets
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => setLocalColumns(2)}
                        className="px-3 py-1.5 rounded border text-xs hover:bg-[var(--muted)]"
                        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                        Left (narrow left)
                      </button>
                      <button onClick={() => setLocalColumns(2)}
                        className="px-3 py-1.5 rounded border text-xs hover:bg-[var(--muted)]"
                        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                        Right (narrow right)
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                  Line between columns
                </label>
                <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                  <input type="checkbox" />
                  Show line between columns
                </label>
              </div>
            </>
          )}

          {activeTab === "borders" && (
            <>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Border Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAGE_BORDER_STYLES.map((b) => (
                    <button key={b.label} onClick={() => setSelectedBorder(b.label)}
                      className={`p-2.5 rounded-lg border text-left text-xs ${
                        selectedBorder === b.label ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                      }`} style={{ color: "var(--foreground)" }}>
                      <div className="font-medium">{b.label}</div>
                      {b.value !== "none" && (
                        <div className="mt-1 h-3" style={{ borderBottom: b.value }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {selectedBorder !== "None" && selectedBorder !== "none" && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Color</label>
                    <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)}
                      className="w-full h-8 rounded border cursor-pointer" style={{ borderColor: "var(--border)" }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Width (pt)</label>
                    <select value={borderWidth} onChange={(e) => setBorderWidth(Number(e.target.value))}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                      {[0.5, 1, 1.5, 2, 3, 4, 6].map((w) => (
                        <option key={w} value={w}>{w} pt</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Preview</label>
                <div className="w-32 h-40 mx-auto bg-white rounded"
                  style={{
                    border: selectedBorder === "none" || selectedBorder === "None" ? "1px dashed #ccc" :
                      PAGE_BORDER_STYLES.find((b) => b.label === selectedBorder)?.value || "none",
                    boxShadow: selectedBorder === "Shadow" ? "4px 4px 0 #999" : undefined,
                  }} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose}
            className="px-4 py-1.5 rounded-lg border text-xs"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Cancel
          </button>
          <button onClick={handleApply}
            className="px-4 py-1.5 rounded-lg text-xs text-white"
            style={{ backgroundColor: "var(--primary)" }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
