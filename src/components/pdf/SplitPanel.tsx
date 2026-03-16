"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Scissors,
  Loader2,
  CheckSquare,
  Square,
  Columns,
  List,
  Grid,
} from "lucide-react";
import { btnStyle, btnPrimaryStyle, inputStyle } from "./types";

interface SplitPanelProps {
  splitPages: number;
  splitRange: string;
  onSplitRangeChange: (r: string) => void;
  splitSelected: Set<number>;
  onToggleSplitPage: (page: number) => void;
  onApplySplitRange: () => void;
  onExtractPages: () => void;
  onSplitEveryN: (n: number) => void;
  splitting: boolean;
  onLoadPdf: (file: File) => void;
  splitMode: "range" | "every-n" | "extract";
  onSplitModeChange: (m: "range" | "every-n" | "extract") => void;
  splitEveryN: number;
  onSplitEveryNChange: (n: number) => void;
  hasPdf: boolean;
}

const panelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 20,
  height: "100%",
  overflowY: "auto",
};

const tabStyle: React.CSSProperties = {
  ...btnStyle,
  flex: 1,
  justifyContent: "center",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 500,
};

const tabActiveStyle: React.CSSProperties = {
  ...tabStyle,
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};

const pageChipStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  border: "1px solid var(--border)",
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  transition: "all 0.15s",
};

const pageChipSelectedStyle: React.CSSProperties = {
  ...pageChipStyle,
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};

export default function SplitPanel({
  splitPages,
  splitRange,
  onSplitRangeChange,
  splitSelected,
  onToggleSplitPage,
  onApplySplitRange,
  onExtractPages,
  onSplitEveryN,
  splitting,
  onLoadPdf,
  splitMode,
  onSplitModeChange,
  splitEveryN,
  onSplitEveryNChange,
  hasPdf,
}: SplitPanelProps) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const docsCount = splitEveryN > 0 ? Math.ceil(splitPages / splitEveryN) : 0;

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--card-foreground)" }}>
        Split PDF
      </h3>
      <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>
        Split a PDF into multiple documents by page range, interval, or selection.
      </p>

      {/* DropZone */}
      {!hasPdf && (
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
            if (f && f.type === "application/pdf") onLoadPdf(f);
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
            Select a PDF to split
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onLoadPdf(f);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {hasPdf && (
        <>
          {/* Page count badge */}
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
            <Scissors size={14} style={{ color: "var(--primary)" }} />
            <span style={{ color: "var(--card-foreground)" }}>
              Total pages: <strong>{splitPages}</strong>
            </span>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            <button
              style={splitMode === "range" ? tabActiveStyle : tabStyle}
              onClick={() => onSplitModeChange("range")}
            >
              <List size={13} /> Page Range
            </button>
            <button
              style={splitMode === "every-n" ? tabActiveStyle : tabStyle}
              onClick={() => onSplitModeChange("every-n")}
            >
              <Columns size={13} /> Every N Pages
            </button>
            <button
              style={splitMode === "extract" ? tabActiveStyle : tabStyle}
              onClick={() => onSplitModeChange("extract")}
            >
              <Grid size={13} /> Extract Pages
            </button>
          </div>

          {/* Page Range Mode */}
          {splitMode === "range" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Enter page ranges (e.g., 1-3, 5, 7-10)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={splitRange}
                  onChange={(e) => onSplitRangeChange(e.target.value)}
                  placeholder="1-3, 5, 7-10"
                />
                <button style={btnStyle} onClick={onApplySplitRange}>
                  Apply Range
                </button>
              </div>
              {splitSelected.size > 0 && (
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  Selected pages: {Array.from(splitSelected).sort((a, b) => a - b).join(", ")}
                </div>
              )}
            </div>
          )}

          {/* Every N Pages Mode */}
          {splitMode === "every-n" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Split every N pages
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  style={{ ...inputStyle, width: 80 }}
                  value={splitEveryN}
                  onChange={(e) => onSplitEveryNChange(Math.max(1, Math.min(100, Number(e.target.value))))}
                />
                <span style={{ fontSize: 13, color: "var(--card-foreground)" }}>pages per document</span>
              </div>
              {docsCount > 0 && (
                <div
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "var(--accent)",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    fontSize: 13,
                    color: "var(--card-foreground)",
                  }}
                >
                  Will create <strong>{docsCount}</strong> document{docsCount !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}

          {/* Extract Pages Mode */}
          {splitMode === "extract" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  Click pages to select ({splitSelected.size} selected)
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    style={{ ...btnStyle, fontSize: 11, padding: "3px 8px" }}
                    onClick={() => {
                      for (let i = 1; i <= splitPages; i++) {
                        if (!splitSelected.has(i)) onToggleSplitPage(i);
                      }
                    }}
                  >
                    <CheckSquare size={12} /> Select All
                  </button>
                  <button
                    style={{ ...btnStyle, fontSize: 11, padding: "3px 8px" }}
                    onClick={() => {
                      for (let i = 1; i <= splitPages; i++) {
                        if (splitSelected.has(i)) onToggleSplitPage(i);
                      }
                    }}
                  >
                    <Square size={12} /> Deselect All
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  maxHeight: 240,
                  overflowY: "auto",
                  padding: 4,
                }}
              >
                {Array.from({ length: splitPages }, (_, i) => i + 1).map((page) => (
                  <div
                    key={page}
                    style={splitSelected.has(page) ? pageChipSelectedStyle : pageChipStyle}
                    onClick={() => onToggleSplitPage(page)}
                  >
                    {page}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            style={{
              ...btnPrimaryStyle,
              opacity: splitting ? 0.5 : 1,
              cursor: splitting ? "not-allowed" : "pointer",
              justifyContent: "center",
            }}
            disabled={splitting}
            onClick={() => {
              if (splitMode === "extract") {
                onExtractPages();
              } else if (splitMode === "every-n") {
                onSplitEveryN(splitEveryN);
              } else {
                onApplySplitRange();
              }
            }}
          >
            {splitting ? (
              <>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                Splitting...
              </>
            ) : splitMode === "extract" ? (
              <>
                <Scissors size={14} /> Extract Pages
              </>
            ) : (
              <>
                <Scissors size={14} /> Split PDF
              </>
            )}
          </button>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
