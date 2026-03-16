"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, ArrowUp, ArrowDown, Trash2, Download, Loader2, GripVertical } from "lucide-react";

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
  onMerge: () => void;
  merging: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

export default function PdfMerge({ files, onAddFiles, onRemoveFile, onMoveFile, onMerge, merging }: PdfMergeProps) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Merge PDFs</h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
          Upload multiple PDF files, reorder them, then merge into a single document.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setHover(true); }}
          onDragLeave={() => setHover(false)}
          onDrop={(e) => { e.preventDefault(); setHover(false); if (e.dataTransfer.files.length) onAddFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 cursor-pointer"
          style={{ border: `2px dashed ${hover ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, padding: 40,
            backgroundColor: hover ? "var(--accent)" : "var(--card)", transition: "all 0.2s" }}>
          <Upload size={36} style={{ color: "var(--muted-foreground)" }} />
          <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>Drop PDF files here or click to select (multiple allowed)</p>
          <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
            onChange={(e) => { if (e.target.files?.length) onAddFiles(e.target.files); }} />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{files.length} files selected</h3>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Total: {files.reduce((sum, f) => sum + f.pageCount, 0)} pages
              </span>
            </div>
            {files.map((mf, idx) => (
              <div key={mf.id} className="flex items-center gap-3 px-3 py-2"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}>
                <GripVertical size={16} style={{ color: "var(--muted-foreground)", cursor: "grab", flexShrink: 0 }} />
                <FileText size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>{mf.name}</p>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    {mf.pageCount} page{mf.pageCount !== 1 ? "s" : ""} · {formatBytes(mf.data.byteLength)}
                  </p>
                </div>
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
            ))}
          </div>
        )}

        {files.length >= 2 && (
          <button style={btnPrimaryStyle} onClick={onMerge} disabled={merging}>
            {merging ? <><Loader2 size={16} className="animate-spin" /> Merging...</> : <><Download size={16} /> Merge All & Download</>}
          </button>
        )}
      </div>
    </div>
  );
}

export type { MergeFile };
