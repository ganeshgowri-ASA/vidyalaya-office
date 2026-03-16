"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, FileSpreadsheet, Image, Presentation, Download, Loader2, X, FileOutput, ArrowRight } from "lucide-react";

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

type ConvertDirection = "pdf-to-word" | "pdf-to-excel" | "pdf-to-ppt" | "pdf-to-image" |
  "word-to-pdf" | "excel-to-pdf" | "ppt-to-pdf" | "image-to-pdf";

interface PdfConvertProps {
  direction: ConvertDirection;
  onDirectionChange: (d: ConvertDirection) => void;
  convertFile: File | null;
  onSetFile: (f: File | null) => void;
  onConvert: () => void;
  converting: boolean;
  convertProgress: number;
  imageFormat: "png" | "jpg";
  onImageFormatChange: (f: "png" | "jpg") => void;
}

const pdfToFormats: { id: ConvertDirection; label: string; ext: string; icon: React.ElementType }[] = [
  { id: "pdf-to-word", label: "Word", ext: ".docx", icon: FileText },
  { id: "pdf-to-excel", label: "Excel", ext: ".xlsx", icon: FileSpreadsheet },
  { id: "pdf-to-ppt", label: "PowerPoint", ext: ".pptx", icon: Presentation },
  { id: "pdf-to-image", label: "Image", ext: ".png/.jpg", icon: Image },
];

const toPdfFormats: { id: ConvertDirection; label: string; accept: string; icon: React.ElementType }[] = [
  { id: "word-to-pdf", label: "Word to PDF", accept: ".doc,.docx", icon: FileText },
  { id: "excel-to-pdf", label: "Excel to PDF", accept: ".xls,.xlsx", icon: FileSpreadsheet },
  { id: "ppt-to-pdf", label: "PPT to PDF", accept: ".ppt,.pptx", icon: Presentation },
  { id: "image-to-pdf", label: "Image to PDF", accept: "image/*", icon: Image },
];

function getAcceptType(dir: ConvertDirection): string {
  if (dir.startsWith("pdf-to")) return ".pdf";
  const found = toPdfFormats.find((f) => f.id === dir);
  return found?.accept ?? "*";
}

export default function PdfConvert({
  direction, onDirectionChange, convertFile, onSetFile, onConvert,
  converting, convertProgress, imageFormat, onImageFormatChange,
}: PdfConvertProps) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPdfToOther = direction.startsWith("pdf-to");

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          <FileOutput size={20} style={{ display: "inline", marginRight: 8 }} />
          Convert PDF
        </h2>

        {/* PDF to Other */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>
            PDF to Other Formats
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {pdfToFormats.map((f) => {
              const Icon = f.icon;
              return (
                <button key={f.id} onClick={() => onDirectionChange(f.id)}
                  style={{ ...btnStyle, flexDirection: "column" as const, padding: "16px 8px", gap: 8, justifyContent: "center",
                    backgroundColor: direction === f.id ? "var(--primary)" : "var(--card)",
                    color: direction === f.id ? "var(--primary-foreground)" : "var(--card-foreground)" }}>
                  <Icon size={24} />
                  <span style={{ fontSize: 12 }}>{f.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{f.ext}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Other to PDF */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>
            Other Formats to PDF
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {toPdfFormats.map((f) => {
              const Icon = f.icon;
              return (
                <button key={f.id} onClick={() => onDirectionChange(f.id)}
                  style={{ ...btnStyle, flexDirection: "column" as const, padding: "16px 8px", gap: 8, justifyContent: "center",
                    backgroundColor: direction === f.id ? "var(--primary)" : "var(--card)",
                    color: direction === f.id ? "var(--primary-foreground)" : "var(--card-foreground)" }}>
                  <Icon size={24} />
                  <span style={{ fontSize: 12 }}>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Image format selection */}
        {direction === "pdf-to-image" && (
          <div className="flex items-center gap-3">
            <label style={{ fontSize: 13, color: "var(--foreground)" }}>Output format:</label>
            <button onClick={() => onImageFormatChange("png")}
              style={{ ...btnStyle, backgroundColor: imageFormat === "png" ? "var(--primary)" : "var(--card)",
                color: imageFormat === "png" ? "var(--primary-foreground)" : "var(--card-foreground)" }}>PNG</button>
            <button onClick={() => onImageFormatChange("jpg")}
              style={{ ...btnStyle, backgroundColor: imageFormat === "jpg" ? "var(--primary)" : "var(--card)",
                color: imageFormat === "jpg" ? "var(--primary-foreground)" : "var(--card-foreground)" }}>JPG</button>
          </div>
        )}

        <div style={{ height: 1, backgroundColor: "var(--border)" }} />

        {/* Upload area */}
        {!convertFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setHover(true); }}
            onDragLeave={() => setHover(false)}
            onDrop={(e) => { e.preventDefault(); setHover(false); if (e.dataTransfer.files[0]) onSetFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 cursor-pointer"
            style={{ border: `2px dashed ${hover ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, padding: 40,
              backgroundColor: hover ? "var(--accent)" : "var(--card)", transition: "all 0.2s" }}>
            <Upload size={36} style={{ color: "var(--muted-foreground)" }} />
            <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
              Drop your {isPdfToOther ? "PDF" : "file"} here, or click to browse
            </p>
            <input ref={inputRef} type="file" accept={getAcceptType(direction)} className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) onSetFile(e.target.files[0]); }} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 flex items-center gap-3"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <FileText size={20} style={{ color: "var(--primary)" }} />
              <span className="flex-1 text-sm truncate" style={{ color: "var(--foreground)" }}>{convertFile.name}</span>
              <ArrowRight size={16} style={{ color: "var(--muted-foreground)" }} />
              <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>
                {direction.replace("pdf-to-", "").replace("-to-pdf", " → PDF").toUpperCase()}
              </span>
              <button style={btnStyle} onClick={() => { onSetFile(null); }}>
                <X size={14} />
              </button>
            </div>

            {converting && (
              <div className="space-y-2">
                <div style={{ width: "100%", height: 8, backgroundColor: "var(--secondary)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(convertProgress, 100)}%`, height: "100%", backgroundColor: "var(--primary)", borderRadius: 4, transition: "width 0.3s" }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Converting... {Math.min(Math.round(convertProgress), 100)}%</p>
              </div>
            )}

            {!converting && convertProgress >= 100 && (
              <div className="p-3 text-center" style={{ backgroundColor: "var(--accent)", borderRadius: 8, color: "var(--accent-foreground)", fontSize: 13 }}>
                Conversion complete! (Simulated — server-side processing required for actual conversion)
              </div>
            )}

            {!converting && convertProgress < 100 && (
              <button style={btnPrimaryStyle} onClick={onConvert}>
                <FileOutput size={16} /> Start Conversion
              </button>
            )}
          </div>
        )}

        <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic" }}>
          Note: Conversion is processed locally where possible. Complex documents may have formatting differences.
        </p>
      </div>
    </div>
  );
}

export type { ConvertDirection };
