"use client";

import React, { useState } from "react";
import { X, Monitor, Smartphone } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import type { PageSize, MarginPreset } from "@/store/document-store";

const PAPER_SIZES = [
  { key: "a4", label: "A4", width: 210, height: 297 },
  { key: "letter", label: "Letter", width: 216, height: 279 },
  { key: "legal", label: "Legal", width: 216, height: 356 },
  { key: "a3", label: "A3", width: 297, height: 420 },
];

const MARGIN_OPTIONS = [
  { key: "normal", label: "Normal", top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 },
  { key: "narrow", label: "Narrow", top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 },
  { key: "wide", label: "Wide", top: 25.4, bottom: 25.4, left: 50.8, right: 50.8 },
  { key: "mirrored", label: "Mirrored", top: 25.4, bottom: 25.4, left: 31.75, right: 25.4 },
];

interface PageSetupDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PageSetupDialog({ open, onClose }: PageSetupDialogProps) {
  const { pageSize, setPageSize, margins, setMargins } = useDocumentStore();

  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
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
  const [scaleFit, setScaleFit] = useState(100);
  const [pagesPerSheet, setPagesPerSheet] = useState(1);
  const [applyTo, setApplyTo] = useState<"whole" | "forward">("whole");
  const [activeTab, setActiveTab] = useState<"paper" | "margins" | "print">("paper");

  if (!open) return null;

  const handleApply = () => {
    if (selectedPaper !== "custom") {
      setPageSize(selectedPaper as PageSize);
    }
    setMargins(selectedMargin as MarginPreset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-[520px] max-h-[90vh] rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Page Setup</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5" style={{ borderColor: "var(--border)" }}>
          {(["paper", "margins", "print"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-xs font-medium border-b-2 capitalize ${
                activeTab === t ? "border-[var(--primary)]" : "border-transparent"
              }`}
              style={{ color: activeTab === t ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          {activeTab === "paper" && (
            <>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Paper Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAPER_SIZES.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPaper(p.key)}
                      className={`p-2.5 rounded-lg border text-left text-xs ${
                        selectedPaper === p.key ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                      }`}
                      style={{ color: "var(--foreground)" }}
                    >
                      <div className="font-medium">{p.label}</div>
                      <div style={{ color: "var(--muted-foreground)" }}>{p.width} x {p.height} mm</div>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedPaper("custom")}
                    className={`p-2.5 rounded-lg border text-left text-xs ${
                      selectedPaper === "custom" ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                    }`}
                    style={{ color: "var(--foreground)" }}
                  >
                    <div className="font-medium">Custom</div>
                    <div style={{ color: "var(--muted-foreground)" }}>Set dimensions</div>
                  </button>
                </div>
              </div>

              {selectedPaper === "custom" && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Width (mm)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Height (mm)</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Orientation</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrientation("portrait")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs ${
                      orientation === "portrait" ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                    }`}
                    style={{ color: "var(--foreground)" }}
                  >
                    <Smartphone size={16} /> Portrait
                  </button>
                  <button
                    onClick={() => setOrientation("landscape")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs ${
                      orientation === "landscape" ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                    }`}
                    style={{ color: "var(--foreground)" }}
                  >
                    <Monitor size={16} /> Landscape
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Apply to</label>
                <select
                  value={applyTo}
                  onChange={(e) => setApplyTo(e.target.value as "whole" | "forward")}
                  className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
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
                <div className="grid grid-cols-2 gap-2">
                  {MARGIN_OPTIONS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => {
                        setSelectedMargin(m.key);
                        setMarginTop(m.top);
                        setMarginBottom(m.bottom);
                        setMarginLeft(m.left);
                        setMarginRight(m.right);
                      }}
                      className={`p-2.5 rounded-lg border text-left text-xs ${
                        selectedMargin === m.key ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"
                      }`}
                      style={{ color: "var(--foreground)" }}
                    >
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
                    <input
                      type="number"
                      value={m.value}
                      onChange={(e) => m.set(Number(e.target.value))}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Gutter</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Position</label>
                    <select
                      value={gutterPos}
                      onChange={(e) => setGutterPos(e.target.value as "left" | "top")}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      <option value="left">Left</option>
                      <option value="top">Top</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Size (mm)</label>
                    <input
                      type="number"
                      value={gutterSize}
                      onChange={(e) => setGutterSize(Number(e.target.value))}
                      className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "print" && (
            <>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Scale to Fit (%)</label>
                <input
                  type="range"
                  min={25}
                  max={400}
                  value={scaleFit}
                  onChange={(e) => setScaleFit(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-center mt-1" style={{ color: "var(--foreground)" }}>{scaleFit}%</div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Pages per Sheet</label>
                <select
                  value={pagesPerSheet}
                  onChange={(e) => setPagesPerSheet(Number(e.target.value))}
                  className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  {[1, 2, 4, 6, 9, 16].map((n) => (
                    <option key={n} value={n}>{n} page{n > 1 ? "s" : ""} per sheet</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border text-xs"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg text-xs text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
