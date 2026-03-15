"use client";

import React from "react";
import { X, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { HeaderFooterConfig } from "./types";
import { btnStyle, btnPrimaryStyle, inputStyle } from "./types";

interface HeaderFooterModalProps {
  config: HeaderFooterConfig;
  onConfigChange: (config: HeaderFooterConfig) => void;
  onApply: () => void;
  onClose: () => void;
}

export default function HeaderFooterModal({ config, onConfigChange, onApply, onClose }: HeaderFooterModalProps) {
  const update = (partial: Partial<HeaderFooterConfig>) => {
    onConfigChange({ ...config, ...partial });
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-4 p-6"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          width: 500,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
            Headers & Footers
          </h3>
          <button style={{ border: "none", background: "none", cursor: "pointer" }} onClick={onClose}>
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Header section */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            Header
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                <AlignLeft size={10} /> Left
              </label>
              <input
                type="text"
                value={config.headerLeft}
                onChange={(e) => update({ headerLeft: e.target.value })}
                style={{ ...inputStyle, fontSize: 11 }}
                placeholder="e.g., Document Title"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                <AlignCenter size={10} /> Center
              </label>
              <input
                type="text"
                value={config.headerCenter}
                onChange={(e) => update({ headerCenter: e.target.value })}
                style={{ ...inputStyle, fontSize: 11 }}
                placeholder="e.g., Chapter Title"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                <AlignRight size={10} /> Right
              </label>
              <input
                type="text"
                value={config.headerRight}
                onChange={(e) => update({ headerRight: e.target.value })}
                style={{ ...inputStyle, fontSize: 11 }}
                placeholder="e.g., Date"
              />
            </div>
          </div>
        </div>

        {/* Footer section */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            Footer
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                <AlignLeft size={10} /> Left
              </label>
              <input
                type="text"
                value={config.footerLeft}
                onChange={(e) => update({ footerLeft: e.target.value })}
                style={{ ...inputStyle, fontSize: 11 }}
                placeholder="e.g., Author"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                <AlignCenter size={10} /> Center
              </label>
              <input
                type="text"
                value={config.footerCenter}
                onChange={(e) => update({ footerCenter: e.target.value })}
                style={{ ...inputStyle, fontSize: 11 }}
                placeholder="e.g., Page {n}"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                <AlignRight size={10} /> Right
              </label>
              <input
                type="text"
                value={config.footerRight}
                onChange={(e) => update({ footerRight: e.target.value })}
                style={{ ...inputStyle, fontSize: 11 }}
                placeholder="e.g., Confidential"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            Options
          </h4>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Font Size</label>
              <input
                type="number"
                value={config.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
                style={{ ...inputStyle, fontSize: 11 }}
                min={6}
                max={24}
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Start Page</label>
              <input
                type="number"
                value={config.startPage}
                onChange={(e) => update({ startPage: Number(e.target.value) })}
                style={{ ...inputStyle, fontSize: 11 }}
                min={1}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
            <input
              type="checkbox"
              checked={config.includePageNumbers}
              onChange={(e) => update({ includePageNumbers: e.target.checked })}
            />
            Include page numbers in footer center
          </label>
          {config.includePageNumbers && (
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Page Number Format</label>
              <select
                value={config.pageNumberFormat}
                onChange={(e) => update({ pageNumberFormat: e.target.value as HeaderFooterConfig["pageNumberFormat"] })}
                style={{ ...inputStyle, fontSize: 11 }}
              >
                <option value="1">1, 2, 3...</option>
                <option value="i">i, ii, iii...</option>
                <option value="I">I, II, III...</option>
                <option value="a">a, b, c...</option>
                <option value="A">A, B, C...</option>
              </select>
            </div>
          )}
        </div>

        {/* Preview */}
        <div
          className="flex flex-col gap-1 p-3"
          style={{ backgroundColor: "var(--secondary)", borderRadius: 8, border: "1px solid var(--border)" }}
        >
          <span style={{ fontSize: 10, color: "var(--muted-foreground)", textAlign: "center" }}>Preview</span>
          <div className="flex justify-between" style={{ fontSize: 10, color: "var(--foreground)", borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>
            <span>{config.headerLeft || "—"}</span>
            <span>{config.headerCenter || "—"}</span>
            <span>{config.headerRight || "—"}</span>
          </div>
          <div style={{ height: 30 }} />
          <div className="flex justify-between" style={{ fontSize: 10, color: "var(--foreground)", borderTop: "1px solid var(--border)", paddingTop: 4 }}>
            <span>{config.footerLeft || "—"}</span>
            <span>{config.includePageNumbers ? `Page ${config.startPage}` : config.footerCenter || "—"}</span>
            <span>{config.footerRight || "—"}</span>
          </div>
        </div>

        <button style={btnPrimaryStyle} onClick={onApply}>
          Apply Headers & Footers
        </button>
      </div>
    </div>
  );
}
