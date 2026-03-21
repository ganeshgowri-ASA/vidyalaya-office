"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  splitPdfData?: ArrayBuffer | null;
  splitProgress?: number;
}

function SplitPageThumbnail({ data, pageNum, size = 80, selected, onClick }: {
  data: ArrayBuffer; pageNum: number; size?: number; selected: boolean; onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        }
        const doc = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;
        const page = await doc.getPage(pageNum);
        const baseVp = page.getViewport({ scale: 1 });
        const scale = size / Math.max(baseVp.width, baseVp.height);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport } as Parameters<typeof page.render>[0]).promise;
        if (!cancelled) setLoaded(true);
      } catch {
        // Ignore thumbnail render errors
      }
    })();
    return () => { cancelled = true; };
  }, [data, pageNum, size]);

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer"
      style={{
        padding: 6,
        borderRadius: 8,
        border: selected ? "2px solid var(--primary)" : "2px solid transparent",
        backgroundColor: selected ? "var(--accent)" : "transparent",
        transition: "all 0.15s",
      }}
    >
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: size, maxHeight: size * 1.4, borderRadius: 4,
            border: "1px solid var(--border)",
            backgroundColor: loaded ? "#fff" : "var(--muted)",
            display: "block",
          }}
        />
        {selected && (
          <div style={{
            position: "absolute", top: 2, right: 2,
            width: 18, height: 18, borderRadius: 4,
            backgroundColor: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckSquare size={12} style={{ color: "var(--primary-foreground)" }} />
          </div>
        )}
      </div>
      <span style={{
        fontSize: 11, fontWeight: selected ? 600 : 400,
        color: selected ? "var(--primary)" : "var(--muted-foreground)",
      }}>
        Page {pageNum}
      </span>
    </div>
  );
}

export default function PdfSplit({
  hasPdf, splitPages, splitRange, onSplitRangeChange, splitSelected, onToggleSplitPage,
  onApplySplitRange, onExtractPages, onSplitEveryN, splitting, onLoadPdf,
  splitMode, onSplitModeChange, splitEveryN, onSplitEveryNChange,
  onSelectAll, onDeselectAll, onResetSplit, splitPdfData, splitProgress,
}: PdfSplitProps) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<"thumbnails" | "list">("thumbnails");

  const modeTabs: { id: "range" | "every-n" | "extract"; label: string }[] = [
    { id: "range", label: "Page Range" },
    { id: "every-n", label: "Every N Pages" },
    { id: "extract", label: "Extract Pages" },
  ];

  const showVisualSelector = hasPdf && splitPdfData && (splitMode === "extract" || splitMode === "range");

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          <Scissors size={20} style={{ display: "inline", marginRight: 8 }} />
          Split / Extract Pages
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
          Split a PDF by page range, every N pages, or visually select pages to extract.
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
                  {splitSelected.size > 0 && ` (${Array.from(splitSelected).sort((a, b) => a - b).join(", ")})`}
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
                  <button style={btnStyle} onClick={onSelectAll}>
                    <CheckSquare size={14} /> Select All
                  </button>
                  <button style={btnStyle} onClick={onDeselectAll}>
                    <Square size={14} /> Deselect All
                  </button>
                  {splitPdfData && (
                    <div className="flex gap-1 ml-auto">
                      <button
                        style={{ ...btnStyle, padding: "4px 10px",
                          backgroundColor: viewMode === "thumbnails" ? "var(--primary)" : "var(--card)",
                          color: viewMode === "thumbnails" ? "var(--primary-foreground)" : "var(--card-foreground)" }}
                        onClick={() => setViewMode("thumbnails")}
                      >
                        Thumbnails
                      </button>
                      <button
                        style={{ ...btnStyle, padding: "4px 10px",
                          backgroundColor: viewMode === "list" ? "var(--primary)" : "var(--card)",
                          color: viewMode === "list" ? "var(--primary-foreground)" : "var(--card-foreground)" }}
                        onClick={() => setViewMode("list")}
                      >
                        List
                      </button>
                    </div>
                  )}
                </div>

                {/* Visual page selector with thumbnails */}
                {splitPdfData && viewMode === "thumbnails" ? (
                  <div className="flex flex-wrap gap-2"
                    style={{
                      maxHeight: 400, overflowY: "auto", padding: 8,
                      backgroundColor: "var(--secondary)", borderRadius: 8,
                    }}
                  >
                    {Array.from({ length: splitPages }, (_, i) => i + 1).map((p) => (
                      <SplitPageThumbnail
                        key={p}
                        data={splitPdfData}
                        pageNum={p}
                        size={80}
                        selected={splitSelected.has(p)}
                        onClick={() => onToggleSplitPage(p)}
                      />
                    ))}
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* Visual page selector for range mode too */}
            {splitMode === "range" && splitPdfData && splitSelected.size > 0 && (
              <div className="space-y-2">
                <label style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 500 }}>
                  Selected pages preview:
                </label>
                <div className="flex flex-wrap gap-2" style={{
                  maxHeight: 200, overflowY: "auto", padding: 8,
                  backgroundColor: "var(--secondary)", borderRadius: 8,
                }}>
                  {Array.from(splitSelected).sort((a, b) => a - b).map((p) => (
                    <SplitPageThumbnail
                      key={p}
                      data={splitPdfData}
                      pageNum={p}
                      size={64}
                      selected={true}
                      onClick={() => onToggleSplitPage(p)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Progress bar */}
            {splitting && splitProgress !== undefined && (
              <div className="space-y-2">
                <div style={{ width: "100%", height: 8, backgroundColor: "var(--secondary)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.min(splitProgress, 100)}%`, height: "100%",
                    backgroundColor: "var(--primary)", borderRadius: 4, transition: "width 0.3s",
                  }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  Splitting... {Math.min(Math.round(splitProgress), 100)}%
                </p>
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
