"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  Loader2,
  Download,
  ArrowRight,
  Info,
} from "lucide-react";
import { btnStyle, btnPrimaryStyle } from "./types";

interface ConvertPanelProps {
  direction: string;
  onDirectionChange: (d: string) => void;
  convertFile: File | null;
  onSetFile: (f: File | null) => void;
  onConvert: () => void;
  converting: boolean;
  convertProgress: number;
  imageFormat: "png" | "jpg";
  onImageFormatChange: (f: "png" | "jpg") => void;
}

const panelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 20,
  height: "100%",
  overflowY: "auto",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 600,
  color: "var(--muted-foreground)",
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  backgroundColor: "var(--card)",
  border: "2px solid var(--border)",
  borderRadius: 8,
  cursor: "pointer",
  transition: "all 0.15s",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--card-foreground)",
};

const cardActiveStyle: React.CSSProperties = {
  ...cardStyle,
  border: "2px solid var(--primary)",
  backgroundColor: "var(--accent)",
};

interface ConversionOption {
  key: string;
  label: string;
  Icon: typeof FileText;
  accept: string;
}

const pdfToOthers: ConversionOption[] = [
  { key: "pdf-to-word", label: "PDF to Word (.docx)", Icon: FileText, accept: ".pdf" },
  { key: "pdf-to-excel", label: "PDF to Excel (.xlsx)", Icon: FileSpreadsheet, accept: ".pdf" },
  { key: "pdf-to-ppt", label: "PDF to PowerPoint (.pptx)", Icon: Presentation, accept: ".pdf" },
  { key: "pdf-to-image", label: "PDF to Image", Icon: Image, accept: ".pdf" },
];

const othersToPdf: ConversionOption[] = [
  { key: "word-to-pdf", label: "Word to PDF", Icon: FileText, accept: ".doc,.docx" },
  { key: "excel-to-pdf", label: "Excel to PDF", Icon: FileSpreadsheet, accept: ".xls,.xlsx" },
  { key: "ppt-to-pdf", label: "PowerPoint to PDF", Icon: Presentation, accept: ".ppt,.pptx" },
  { key: "image-to-pdf", label: "Image to PDF", Icon: Image, accept: ".png,.jpg,.jpeg,.bmp,.tiff,.tif" },
];

function getAcceptForDirection(dir: string): string {
  const all = [...pdfToOthers, ...othersToPdf];
  return all.find((o) => o.key === dir)?.accept ?? ".pdf";
}

export default function ConvertPanel({
  direction,
  onDirectionChange,
  convertFile,
  onSetFile,
  onConvert,
  converting,
  convertProgress,
  imageFormat,
  onImageFormatChange,
}: ConvertPanelProps) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptType = getAcceptForDirection(direction);

  const renderCard = (opt: ConversionOption) => {
    const isActive = direction === opt.key;
    return (
      <div
        key={opt.key}
        style={isActive ? cardActiveStyle : cardStyle}
        onClick={() => {
          onDirectionChange(opt.key);
          if (convertFile) onSetFile(null);
        }}
      >
        <opt.Icon
          size={18}
          style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)", flexShrink: 0 }}
        />
        <span style={{ flex: 1 }}>{opt.label}</span>
        {isActive && (
          <ArrowRight size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
        )}
      </div>
    );
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--card-foreground)" }}>
        Convert
      </h3>
      <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>
        Convert between PDF and other document formats.
      </p>

      {/* PDF to Other Formats */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={sectionTitleStyle}>PDF to Other Formats</span>
        {pdfToOthers.map(renderCard)}
      </div>

      {/* Image format toggle for pdf-to-image */}
      {direction === "pdf-to-image" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            backgroundColor: "var(--accent)",
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Output format:</span>
          <button
            style={{
              ...btnStyle,
              fontSize: 12,
              padding: "3px 10px",
              ...(imageFormat === "png"
                ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "1px solid var(--primary)" }
                : {}),
            }}
            onClick={() => onImageFormatChange("png")}
          >
            PNG
          </button>
          <button
            style={{
              ...btnStyle,
              fontSize: 12,
              padding: "3px 10px",
              ...(imageFormat === "jpg"
                ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "1px solid var(--primary)" }
                : {}),
            }}
            onClick={() => onImageFormatChange("jpg")}
          >
            JPG
          </button>
        </div>
      )}

      {/* Other Formats to PDF */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={sectionTitleStyle}>Other Formats to PDF</span>
        {othersToPdf.map(renderCard)}
      </div>

      {/* DropZone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          const f = e.dataTransfer.files[0];
          if (f) onSetFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 cursor-pointer"
        style={{
          border: `2px dashed ${hover ? "var(--primary)" : "var(--border)"}`,
          borderRadius: 12,
          padding: 40,
          backgroundColor: hover ? "var(--accent)" : "var(--card)",
          transition: "all 0.2s",
        }}
      >
        <Upload size={28} style={{ color: hover ? "var(--primary)" : "var(--muted-foreground)" }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--card-foreground)" }}>
          {convertFile ? convertFile.name : "Drop your file here or click to browse"}
        </span>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          Accepted: {acceptType}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={acceptType}
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onSetFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Progress bar */}
      {converting && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--card-foreground)" }}>Converting...</span>
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>{convertProgress}%</span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "var(--muted)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${convertProgress}%`,
                backgroundColor: "var(--primary)",
                borderRadius: 4,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Convert / Download button */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{
            ...btnPrimaryStyle,
            flex: 1,
            justifyContent: "center",
            opacity: !convertFile || converting ? 0.5 : 1,
            cursor: !convertFile || converting ? "not-allowed" : "pointer",
          }}
          disabled={!convertFile || converting}
          onClick={onConvert}
        >
          {converting ? (
            <>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              Converting...
            </>
          ) : convertProgress === 100 && !converting ? (
            <>
              <Download size={14} />
              Download Result
            </>
          ) : (
            "Convert"
          )}
        </button>
      </div>

      {/* Info note */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          padding: "10px 12px",
          backgroundColor: "var(--accent)",
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      >
        <Info size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          Conversion is processed locally. Complex documents may have formatting differences.
        </span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
