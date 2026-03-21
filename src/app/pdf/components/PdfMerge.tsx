"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, FileText, ArrowUp, ArrowDown, Trash2, Download, Loader2, GripVertical, Eye, ChevronDown, ChevronUp } from "lucide-react";

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

interface MergeFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

interface PdfMergeProps {
  files: MergeFile[];
  onAddFiles: (files: FileList) => void;
  onRemoveFile: (id: string) => void;
  onMoveFile: (index: number, dir: -1 | 1) => void;
  onReorderFiles?: (fromIndex: number, toIndex: number) => void;
  onMerge: () => void;
  merging: boolean;
  mergeProgress?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function PageThumbnail({ data, pageNum, size = 60 }: { data: ArrayBuffer; pageNum: number; size?: number }) {
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
        const viewport = page.getViewport({ scale: size / Math.max(page.getViewport({ scale: 1 }).width, page.getViewport({ scale: 1 }).height) });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport } as Parameters<typeof page.render>[0]).promise;
        if (!cancelled) setLoaded(true);
      } catch {
        // Ignore render errors for thumbnails
      }
    })();
    return () => { cancelled = true; };
  }, [data, pageNum, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        maxWidth: size, maxHeight: size, borderRadius: 4,
        border: "1px solid var(--border)",
        backgroundColor: loaded ? "#fff" : "var(--muted)",
        display: "block",
      }}
    />
  );
}

export default function PdfMerge({ files, onAddFiles, onRemoveFile, onMoveFile, onReorderFiles, onMerge, merging, mergeProgress }: PdfMergeProps) {
  const [hover, setHover] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState<Record<string, boolean>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = dragIndex;
    setDragIndex(null);
    setDragOverIndex(null);
    if (fromIndex === null || fromIndex === toIndex) return;
    if (onReorderFiles) {
      onReorderFiles(fromIndex, toIndex);
    } else {
      // Fallback: use move up/down
      const dir = toIndex > fromIndex ? 1 : -1;
      let current = fromIndex;
      while (current !== toIndex) {
        onMoveFile(current, dir as -1 | 1);
        current += dir;
      }
    }
  };

  const toggleThumbnails = (id: string) => {
    setShowThumbnails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);
  const totalSize = files.reduce((sum, f) => sum + f.data.byteLength, 0);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Merge PDFs</h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
          Upload multiple PDF files, drag to reorder, preview page thumbnails, then merge into a single document.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            // Only show hover for file drops, not reorder drags
            if (dragIndex === null) setHover(true);
          }}
          onDragLeave={() => { if (dragIndex === null) setHover(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setHover(false);
            if (dragIndex === null && e.dataTransfer.files.length) {
              onAddFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 cursor-pointer"
          style={{
            border: `2px dashed ${hover ? "var(--primary)" : "var(--border)"}`,
            borderRadius: 12, padding: 40,
            backgroundColor: hover ? "var(--accent)" : "var(--card)",
            transition: "all 0.2s",
          }}
        >
          <Upload size={36} style={{ color: "var(--muted-foreground)" }} />
          <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>Drop PDF files here or click to select (multiple allowed)</p>
          <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
            onChange={(e) => { if (e.target.files?.length) onAddFiles(e.target.files); e.target.value = ""; }} />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </h3>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                {totalPages} pages &middot; {formatBytes(totalSize)}
              </span>
            </div>
            {files.map((mf, idx) => (
              <div
                key={mf.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, idx)}
                style={{
                  opacity: dragIndex === idx ? 0.5 : 1,
                  borderTop: dragOverIndex === idx && dragIndex !== null && (dragIndex > idx)
                    ? "3px solid var(--primary)" : undefined,
                  borderBottom: dragOverIndex === idx && dragIndex !== null && (dragIndex < idx)
                    ? "3px solid var(--primary)" : undefined,
                }}
              >
                <div
                  className="flex items-center gap-3 px-3 py-2"
                  style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                >
                  <GripVertical
                    size={16}
                    style={{ color: "var(--muted-foreground)", cursor: "grab", flexShrink: 0 }}
                  />
                  {/* Page thumbnail for first page */}
                  <PageThumbnail data={mf.data} pageNum={1} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>{mf.name}</p>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      {mf.pageCount} page{mf.pageCount !== 1 ? "s" : ""} &middot; {formatBytes(mf.data.byteLength)}
                    </p>
                  </div>
                  <button
                    style={{ ...btnStyle, padding: "4px 8px" }}
                    onClick={() => toggleThumbnails(mf.id)}
                    title="Preview pages"
                  >
                    <Eye size={14} />
                    {showThumbnails[mf.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <button style={btnStyle} onClick={() => onMoveFile(idx, -1)} disabled={idx === 0} title="Move up">
                    <ArrowUp size={14} />
                  </button>
                  <button style={btnStyle} onClick={() => onMoveFile(idx, 1)} disabled={idx === files.length - 1} title="Move down">
                    <ArrowDown size={14} />
                  </button>
                  <button style={{ ...btnStyle, color: "#dc2626" }} onClick={() => onRemoveFile(mf.id)} title="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Page thumbnails gallery */}
                {showThumbnails[mf.id] && (
                  <div
                    className="mt-1 p-3 flex flex-wrap gap-2"
                    style={{
                      backgroundColor: "var(--secondary)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  >
                    {Array.from({ length: Math.min(mf.pageCount, 20) }, (_, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <PageThumbnail data={mf.data} pageNum={i + 1} size={64} />
                        <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                          p.{i + 1}
                        </span>
                      </div>
                    ))}
                    {mf.pageCount > 20 && (
                      <div className="flex items-center justify-center" style={{ minWidth: 64, fontSize: 11, color: "var(--muted-foreground)" }}>
                        +{mf.pageCount - 20} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {merging && mergeProgress !== undefined && (
          <div className="space-y-2">
            <div style={{ width: "100%", height: 8, backgroundColor: "var(--secondary)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(mergeProgress, 100)}%`, height: "100%",
                backgroundColor: "var(--primary)", borderRadius: 4, transition: "width 0.3s",
              }} />
            </div>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              Merging... {Math.min(Math.round(mergeProgress), 100)}%
            </p>
          </div>
        )}

        {files.length >= 2 && (
          <button style={btnPrimaryStyle} onClick={onMerge} disabled={merging}>
            {merging
              ? <><Loader2 size={16} className="animate-spin" /> Merging...</>
              : <><Download size={16} /> Merge All & Download</>}
          </button>
        )}

        {files.length === 1 && (
          <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Add at least 2 files to merge.
          </p>
        )}
      </div>
    </div>
  );
}

export type { MergeFile };
