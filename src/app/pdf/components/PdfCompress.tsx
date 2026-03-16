"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, Download, Loader2, X, Minimize2, Sparkles, Equal, ArrowDown } from "lucide-react";

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

type CompressQuality = "low" | "medium" | "high";

interface PdfCompressProps {
  compressFile: File | null;
  compressQuality: CompressQuality;
  onQualityChange: (q: CompressQuality) => void;
  onLoadFile: (file: File) => void;
  onCompress: () => void;
  compressing: boolean;
  compressProgress: number;
  originalSize: number;
  compressedSize: number | null;
  onReset: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

const qualityOptions: { id: CompressQuality; label: string; desc: string; ratio: string; icon: React.ElementType }[] = [
  { id: "high", label: "High Quality", desc: "Minimal compression, best quality", ratio: "~90%", icon: Sparkles },
  { id: "medium", label: "Medium", desc: "Balanced compression and quality", ratio: "~60%", icon: Equal },
  { id: "low", label: "Low Size", desc: "Maximum compression, smaller file", ratio: "~30%", icon: ArrowDown },
];

export default function PdfCompress({
  compressFile, compressQuality, onQualityChange, onLoadFile, onCompress,
  compressing, compressProgress, originalSize, compressedSize, onReset,
}: PdfCompressProps) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getEstimatedSize = () => {
    const ratios: Record<CompressQuality, number> = { high: 0.9, medium: 0.6, low: 0.3 };
    return Math.round(originalSize * ratios[compressQuality]);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          <Minimize2 size={20} style={{ display: "inline", marginRight: 8 }} />
          Compress PDF
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
          Reduce the file size of your PDF. Choose a quality level to balance size and quality.
        </p>

        {!compressFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setHover(true); }}
            onDragLeave={() => setHover(false)}
            onDrop={(e) => { e.preventDefault(); setHover(false); if (e.dataTransfer.files[0]) onLoadFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 cursor-pointer"
            style={{ border: `2px dashed ${hover ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, padding: 40,
              backgroundColor: hover ? "var(--accent)" : "var(--card)", transition: "all 0.2s" }}>
            <Upload size={36} style={{ color: "var(--muted-foreground)" }} />
            <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>Drag & drop a PDF here, or click to browse</p>
            <input ref={inputRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) onLoadFile(e.target.files[0]); }} />
          </div>
        ) : (
          <div className="space-y-5">
            {/* File info */}
            <div className="p-3 flex items-center gap-3"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <FileText size={20} style={{ color: "var(--primary)" }} />
              <div className="flex-1">
                <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>{compressFile.name}</p>
                <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Original: {formatBytes(originalSize)}</p>
              </div>
              <button style={btnStyle} onClick={onReset}><X size={14} /></button>
            </div>

            {/* Quality cards */}
            <div className="space-y-2">
              <label style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 600 }}>Compression Quality</label>
              <div className="grid grid-cols-3 gap-3">
                {qualityOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = compressQuality === opt.id;
                  return (
                    <button key={opt.id} onClick={() => onQualityChange(opt.id)}
                      className="flex flex-col items-center gap-2 p-4"
                      style={{
                        backgroundColor: isSelected ? "var(--primary)" : "var(--card)",
                        color: isSelected ? "var(--primary-foreground)" : "var(--card-foreground)",
                        border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                        borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                      }}>
                      <Icon size={24} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>{opt.desc}</span>
                      <span style={{ fontSize: 10, opacity: 0.6 }}>{opt.ratio} of original</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size comparison */}
            <div className="p-4" style={{ backgroundColor: "var(--secondary)", borderRadius: 8 }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Original: {formatBytes(originalSize)}</span>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  Est. output: {formatBytes(compressedSize ?? getEstimatedSize())}
                </span>
              </div>
              <div className="flex gap-2 items-end" style={{ height: 40 }}>
                <div style={{ flex: 1, backgroundColor: "var(--muted-foreground)", borderRadius: 4, height: "100%", opacity: 0.3 }} />
                <div style={{
                  flex: 1, backgroundColor: "var(--primary)", borderRadius: 4,
                  height: `${Math.max(10, ((compressedSize ?? getEstimatedSize()) / originalSize) * 100)}%`,
                }} />
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Original</span>
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Compressed</span>
              </div>
              {compressedSize !== null && (
                <p className="text-center mt-2" style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
                  Saved {Math.round((1 - compressedSize / originalSize) * 100)}% ({formatBytes(originalSize - compressedSize)})
                </p>
              )}
            </div>

            {/* Progress */}
            {compressing && (
              <div className="space-y-2">
                <div style={{ width: "100%", height: 8, backgroundColor: "var(--secondary)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(compressProgress, 100)}%`, height: "100%", backgroundColor: "var(--primary)", borderRadius: 4, transition: "width 0.3s" }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Compressing... {Math.min(Math.round(compressProgress), 100)}%</p>
              </div>
            )}

            {!compressing && (
              <button style={btnPrimaryStyle} onClick={onCompress}>
                <Download size={16} /> Compress & Download
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export type { CompressQuality };
