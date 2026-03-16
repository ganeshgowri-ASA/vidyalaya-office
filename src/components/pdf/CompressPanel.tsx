"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Sparkles,
  Equal,
  Minimize2,
  Loader2,
  Download,
  FileDown,
  BarChart3,
} from "lucide-react";
import { btnStyle, btnPrimaryStyle, formatBytes } from "./types";

interface CompressPanelProps {
  compressFile: File | null;
  compressQuality: "low" | "medium" | "high";
  onQualityChange: (q: "low" | "medium" | "high") => void;
  onLoadFile: (file: File) => void;
  onCompress: () => void;
  compressing: boolean;
  compressProgress: number;
  originalSize: number;
  compressedSize: number | null;
}

const panelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 20,
  height: "100%",
  overflowY: "auto",
};

const radioCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  backgroundColor: "var(--card)",
  border: "2px solid var(--border)",
  borderRadius: 10,
  cursor: "pointer",
  transition: "all 0.15s",
};

const radioCardActiveStyle: React.CSSProperties = {
  ...radioCardStyle,
  border: "2px solid var(--primary)",
  backgroundColor: "var(--accent)",
};

const presets: Array<{
  key: "high" | "medium" | "low";
  label: string;
  desc: string;
  estimate: string;
  Icon: typeof Sparkles;
}> = [
  { key: "high", label: "High Quality", desc: "Minimal compression, best quality", estimate: "~90% of original", Icon: Sparkles },
  { key: "medium", label: "Medium", desc: "Balanced compression and quality", estimate: "~60% of original", Icon: Equal },
  { key: "low", label: "Low Size", desc: "Maximum compression, smaller file", estimate: "~30% of original", Icon: Minimize2 },
];

export default function CompressPanel({
  compressFile,
  compressQuality,
  onQualityChange,
  onLoadFile,
  onCompress,
  compressing,
  compressProgress,
  originalSize,
  compressedSize,
}: CompressPanelProps) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const savings =
    compressedSize !== null && originalSize > 0
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : null;

  const maxBar = Math.max(originalSize, compressedSize ?? 0) || 1;

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--card-foreground)" }}>
        Compress PDF
      </h3>
      <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>
        Reduce file size while preserving document quality.
      </p>

      {/* DropZone */}
      {!compressFile && (
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
            if (f && f.type === "application/pdf") onLoadFile(f);
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
            Drop a PDF file here or click to browse
          </span>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Select a PDF to compress
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onLoadFile(f);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* File info */}
      {compressFile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            backgroundColor: "var(--accent)",
            borderRadius: 8,
            border: "1px solid var(--border)",
            fontSize: 13,
          }}
        >
          <FileDown size={14} style={{ color: "var(--primary)" }} />
          <span
            style={{
              flex: 1,
              color: "var(--card-foreground)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {compressFile.name}
          </span>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)", flexShrink: 0 }}>
            {formatBytes(compressFile.size)}
          </span>
        </div>
      )}

      {/* Quality presets */}
      {compressFile && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--card-foreground)" }}>
            Compression Quality
          </span>
          {presets.map(({ key, label, desc, estimate, Icon }) => (
            <div
              key={key}
              style={compressQuality === key ? radioCardActiveStyle : radioCardStyle}
              onClick={() => onQualityChange(key)}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: compressQuality === key ? "var(--primary)" : "var(--muted)",
                  flexShrink: 0,
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: compressQuality === key ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--card-foreground)" }}>
                  {label}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                  {desc}
                </div>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0 }}>
                {estimate}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {compressing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--card-foreground)" }}>Compressing...</span>
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>{compressProgress}%</span>
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
                width: `${compressProgress}%`,
                backgroundColor: "var(--primary)",
                borderRadius: 4,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Before / After comparison */}
      {compressedSize !== null && !compressing && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 14,
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={16} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--card-foreground)" }}>
              Compression Results
            </span>
          </div>

          {/* Original bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "var(--muted-foreground)" }}>Original</span>
              <span style={{ color: "var(--card-foreground)", fontWeight: 500 }}>
                {formatBytes(originalSize)}
              </span>
            </div>
            <div
              style={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "var(--muted)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(originalSize / maxBar) * 100}%`,
                  backgroundColor: "var(--muted-foreground)",
                  borderRadius: 5,
                }}
              />
            </div>
          </div>

          {/* Compressed bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "var(--muted-foreground)" }}>Compressed</span>
              <span style={{ color: "var(--card-foreground)", fontWeight: 500 }}>
                {formatBytes(compressedSize)}
              </span>
            </div>
            <div
              style={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "var(--muted)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(compressedSize / maxBar) * 100}%`,
                  backgroundColor: "var(--primary)",
                  borderRadius: 5,
                }}
              />
            </div>
          </div>

          {/* Savings */}
          {savings !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 12px",
                backgroundColor: "var(--accent)",
                borderRadius: 6,
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>
                {savings}% smaller
              </span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                &mdash; saved {formatBytes(originalSize - compressedSize)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {compressFile && (
        <div style={{ display: "flex", gap: 8 }}>
          {compressedSize === null ? (
            <button
              style={{
                ...btnPrimaryStyle,
                flex: 1,
                justifyContent: "center",
                opacity: compressing ? 0.5 : 1,
                cursor: compressing ? "not-allowed" : "pointer",
              }}
              disabled={compressing}
              onClick={onCompress}
            >
              {compressing ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Compressing...
                </>
              ) : (
                "Compress PDF"
              )}
            </button>
          ) : (
            <button
              style={{
                ...btnPrimaryStyle,
                flex: 1,
                justifyContent: "center",
              }}
              onClick={onCompress}
            >
              <Download size={14} />
              Download Compressed
            </button>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
