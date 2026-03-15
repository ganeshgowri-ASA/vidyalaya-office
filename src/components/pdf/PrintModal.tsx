"use client";

import React from "react";
import { X, Printer } from "lucide-react";
import type { PrintOptions } from "./types";
import { btnStyle, btnPrimaryStyle, inputStyle } from "./types";

interface PrintModalProps {
  options: PrintOptions;
  totalPages: number;
  onOptionsChange: (options: PrintOptions) => void;
  onPrint: () => void;
  onClose: () => void;
}

export default function PrintModal({ options, totalPages, onOptionsChange, onPrint, onClose }: PrintModalProps) {
  const update = (partial: Partial<PrintOptions>) => {
    onOptionsChange({ ...options, ...partial });
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
          width: 420,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Printer size={18} /> Print Options
          </h3>
          <button style={{ border: "none", background: "none", cursor: "pointer" }} onClick={onClose}>
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Page range */}
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Pages</label>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
              <input type="radio" checked={options.pages === "all"} onChange={() => update({ pages: "all" })} />
              All Pages ({totalPages})
            </label>
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
              <input type="radio" checked={options.pages === "current"} onChange={() => update({ pages: "current" })} />
              Current Page
            </label>
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
              <input type="radio" checked={options.pages === "range"} onChange={() => update({ pages: "range" })} />
              Page Range
            </label>
            {options.pages === "range" && (
              <input
                type="text"
                value={options.range}
                onChange={(e) => update({ range: e.target.value })}
                placeholder="e.g., 1-3, 5, 7-10"
                style={{ ...inputStyle, fontSize: 11, marginLeft: 20 }}
              />
            )}
          </div>
        </div>

        {/* Copies */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Copies</label>
            <input
              type="number"
              value={options.copies}
              onChange={(e) => update({ copies: Math.max(1, Number(e.target.value)) })}
              style={inputStyle}
              min={1}
              max={999}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Orientation</label>
            <select
              value={options.orientation}
              onChange={(e) => update({ orientation: e.target.value as PrintOptions["orientation"] })}
              style={inputStyle}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>

        {/* Scale */}
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Scale</label>
          <select
            value={options.scale}
            onChange={(e) => update({ scale: e.target.value as PrintOptions["scale"] })}
            style={inputStyle}
          >
            <option value="actual">Actual Size</option>
            <option value="fit">Fit to Page</option>
            <option value="shrink">Shrink Oversized Pages</option>
          </select>
        </div>

        {/* Annotations */}
        <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
          <input
            type="checkbox"
            checked={options.includeAnnotations}
            onChange={(e) => update({ includeAnnotations: e.target.checked })}
          />
          Include annotations
        </label>

        <button style={btnPrimaryStyle} onClick={onPrint}>
          <Printer size={16} /> Print
        </button>
      </div>
    </div>
  );
}
