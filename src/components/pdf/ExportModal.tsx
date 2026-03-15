"use client";

import React from "react";
import { X, Download, FileCheck } from "lucide-react";
import type { ExportOptions } from "./types";
import { btnPrimaryStyle, inputStyle } from "./types";

interface ExportModalProps {
  options: ExportOptions;
  onOptionsChange: (options: ExportOptions) => void;
  onExport: () => void;
  onClose: () => void;
}

export default function ExportModal({ options, onOptionsChange, onExport, onClose }: ExportModalProps) {
  const update = (partial: Partial<ExportOptions>) => {
    onOptionsChange({ ...options, ...partial });
  };

  const formatDescriptions: Record<string, string> = {
    standard: "Standard PDF format with full compatibility",
    "pdf-a": "PDF/A — Archival format for long-term preservation",
    "pdf-x": "PDF/X — Print production format with color management",
  };

  const qualityDescriptions: Record<string, string> = {
    screen: "72 dpi — Smallest file, screen viewing only",
    ebook: "150 dpi — Good balance of quality and size",
    printer: "300 dpi — High quality for desktop printing",
    prepress: "300+ dpi — Maximum quality for professional printing",
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
          width: 440,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <FileCheck size={18} /> Export PDF
          </h3>
          <button style={{ border: "none", background: "none", cursor: "pointer" }} onClick={onClose}>
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Format */}
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Format</label>
          <select
            value={options.format}
            onChange={(e) => update({ format: e.target.value as ExportOptions["format"] })}
            style={inputStyle}
          >
            <option value="standard">Standard PDF</option>
            <option value="pdf-a">PDF/A (Archival)</option>
            <option value="pdf-x">PDF/X (Print Production)</option>
          </select>
          <p style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
            {formatDescriptions[options.format]}
          </p>
        </div>

        {/* Quality */}
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Quality</label>
          <select
            value={options.quality}
            onChange={(e) => update({ quality: e.target.value as ExportOptions["quality"] })}
            style={inputStyle}
          >
            <option value="screen">Screen (72 dpi)</option>
            <option value="ebook">eBook (150 dpi)</option>
            <option value="printer">Printer (300 dpi)</option>
            <option value="prepress">Prepress (300+ dpi)</option>
          </select>
          <p style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
            {qualityDescriptions[options.quality]}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
            <input type="checkbox" checked={options.includeBookmarks} onChange={(e) => update({ includeBookmarks: e.target.checked })} />
            Include bookmarks
          </label>
          <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
            <input type="checkbox" checked={options.includeAnnotations} onChange={(e) => update({ includeAnnotations: e.target.checked })} />
            Include annotations
          </label>
          <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
            <input type="checkbox" checked={options.flatten} onChange={(e) => update({ flatten: e.target.checked })} />
            Flatten annotations (merge into content)
          </label>
        </div>

        <button style={btnPrimaryStyle} onClick={onExport}>
          <Download size={16} /> Export PDF
        </button>
      </div>
    </div>
  );
}
