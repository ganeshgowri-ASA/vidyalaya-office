"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, Download, Loader2, CheckSquare, Square, X, Scissors } from "lucide-react";

const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)", color: "var(--card-foreground)",
  border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px",
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 13, transition: "background-color 0.15s",
};
const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle, backgroundColor: "var(--primary)", color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};
const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--card)", color: "var(--card-foreground)",
  border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px",
  fontSize: 13, outline: "none",
};

interface PdfSplitProps {
  hasPdf: boolean;
  splitPages: number;
  splitRange: string;
  onSplitRangeChange: (r: string) => void;
  splitSelected: Set<number>;
  onToggleSplitPage: (page: number) => void;
  onApplySplitRange: () => void;
  onExtractPages: () => void;
  onSplitEveryN: () => void;
  splitting: boolean;
  onLoadPdf: (file: File) => void;
  splitMode: "range" | "every-n" | "extract";
  onSplitModeChange: (m: "range" | "every-n" | "extract") => void;
  splitEveryN: number;
  onSplitEveryNChange: (n: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onResetSplit: () => void;
}

export default function PdfSplit({
  hasPdf, splitPages, splitRange, onSplitRangeChange, splitSelected, onToggleSplitPage,
  onApplySplitRange, onExtractPages, onSplitEveryN, splitting, onLoadPdf,
  splitMode, onSplitModeChange, splitEveryN, onSplitEveryNChange,
  onSelectAll, onDeselectAll, onResetSplit,
}: PdfSplitProps) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const modeTabs: { id: "range" | "every-n" | "extract"; label: string }[] = [
    { id: "range", label: "Page Range" },
    { id: "every-n", label: "Every N Pages" },
    { id: "extract", label: "Extract Pages" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          <Scissors size={20} style={{ display: "inline", marginRight: 8 }} />
          Split / Extract Pages
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
          Split a PDF by page range, every N pages, or extract specific pages.
        </p>

        {!hasPdf ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setHover(true); }}
            onDragLeave={() => setHover(false)}
            onDrop={(e) => { e.preventDefault(); setHover(false); if (e.dataTransfer.files[0]) onLoadPdf(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 cursor-pointer"
            style={{ border: `2px dashed ${hover ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, padding: 40,
              backgroundColor: hover ? "var(--accent)" : "var(--card)", transition: "all 0.2s" }}>
            <Upload size={36} style={{ color: "var(--muted-foreground)" }} />
            <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>Drag & drop a PDF here, or click to browse</p>
            <input ref={inputRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) onLoadPdf(e.target.files[0]); }} />
          </div>
        ) : (
          <>
            {/* File info */}
            <div className="p-3 flex items-center gap-3"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <FileText size={20} style={{ color: "var(--primary)" }} />
              <span style={{ color: "var(--foreground)", fontSize: 14 }}>{splitPages} pages loaded</span>
              <button style={{ ...btnStyle, marginLeft: "auto" }} onClick={onResetSplit}>Load Different PDF</button>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1">
              {modeTabs.map((tab) => (
                <button key={tab.id} onClick={() => onSplitModeChange(tab.id)}
                  style={{ ...btnStyle, flex: 1, justifyContent: "center",
                    backgroundColor: splitMode === tab.id ? "var(--primary)" : "var(--card)",
                    color: splitMode === tab.id ? "var(--primary-foreground)" : "var(--card-foreground)" }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Page Range mode */}
            {splitMode === "range" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input type="text" value={splitRange} onChange={(e) => onSplitRangeChange(e.target.value)}
                    placeholder="e.g., 1-3, 5, 7-10" style={{ ...inputStyle, flex: 1 }} />
                  <button style={btnStyle} onClick={onApplySplitRange}>Apply Range</button>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  {splitSelected.size} page{splitSelected.size !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}

            {/* Every N Pages mode */}
            {splitMode === "every-n" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label style={{ fontSize: 13, color: "var(--foreground)" }}>Split every</label>
                  <input type="number" value={splitEveryN} min={1} max={splitPages}
                    onChange={(e) => onSplitEveryNChange(Math.max(1, Number(e.target.value)))}
                    style={{ ...inputStyle, width: 70, textAlign: "center" }} />
                  <label style={{ fontSize: 13, color: "var(--foreground)" }}>page(s)</label>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  Will create {Math.ceil(splitPages / splitEveryN)} document{Math.ceil(splitPages / splitEveryN) !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* Extract Pages mode */}
            {splitMode === "extract" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button style={btnStyle} onClick={onSelectAll}>Select All</button>
                  <button style={btnStyle} onClick={onDeselectAll}>Deselect All</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: splitPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => onToggleSplitPage(p)} className="flex items-center gap-1"
                      style={{ ...btnStyle, backgroundColor: splitSelected.has(p) ? "var(--primary)" : "var(--card)",
                        color: splitSelected.has(p) ? "var(--primary-foreground)" : "var(--card-foreground)",
                        minWidth: 48, justifyContent: "center" }}>
                      {splitSelected.has(p) ? <CheckSquare size={14} /> : <Square size={14} />} {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {splitMode === "every-n" ? (
                <button style={btnPrimaryStyle} onClick={onSplitEveryN} disabled={splitting}>
                  {splitting ? <><Loader2 size={16} className="animate-spin" /> Splitting...</>
                    : <><Download size={16} /> Split into {Math.ceil(splitPages / splitEveryN)} Files</>}
                </button>
              ) : (
                <button style={btnPrimaryStyle} onClick={onExtractPages} disabled={splitSelected.size === 0 || splitting}>
                  {splitting ? <><Loader2 size={16} className="animate-spin" /> Extracting...</>
                    : <><Download size={16} /> Extract {splitSelected.size} Page{splitSelected.size !== 1 ? "s" : ""}</>}
                </button>
              )}
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                {splitSelected.size} of {splitPages} selected
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
