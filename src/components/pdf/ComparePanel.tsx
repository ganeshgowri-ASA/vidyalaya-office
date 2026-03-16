"use client";

import React from "react";
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye,
  Link,
  FileText,
} from "lucide-react";

const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  transition: "background-color 0.15s",
};
const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};
const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 13,
  outline: "none",
};

interface ComparePanelProps {
  pdfLoaded: boolean;
  pdfName: string;
  compareName: string;
  comparePage: number;
  compareTotalPages: number;
  totalPages: number;
  highlightDiffs: boolean;
  syncScroll: boolean;
  onLoadCompareDoc: (file: File) => void;
  onPageChange: (p: number) => void;
  onToggleHighlightDiffs: () => void;
  onToggleSyncScroll: () => void;
  canvasRef1: React.RefObject<HTMLCanvasElement>;
  canvasRef2: React.RefObject<HTMLCanvasElement>;
}

export default function ComparePanel({
  pdfLoaded,
  pdfName,
  compareName,
  comparePage,
  compareTotalPages,
  totalPages,
  highlightDiffs,
  syncScroll,
  onLoadCompareDoc,
  onPageChange,
  onToggleHighlightDiffs,
  onToggleSyncScroll,
  canvasRef1,
  canvasRef2,
}: ComparePanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadCompareDoc(file);
    }
  };

  const maxPages = Math.max(totalPages, compareTotalPages);

  const checkboxStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    accentColor: "var(--primary)",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Top Controls Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: "var(--card)",
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {/* Left: Document labels */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FileText size={14} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              Original: {pdfName || "No document"}
            </span>
          </div>
          <div
            style={{
              width: 1,
              height: 20,
              backgroundColor: "var(--border)",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FileText size={14} style={{ color: "var(--muted-foreground)" }} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: compareName
                  ? "var(--card-foreground)"
                  : "var(--muted-foreground)",
              }}
            >
              {compareName
                ? `Comparison: ${compareName}`
                : "Upload PDF to compare"}
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={btnStyle}
          >
            <Upload size={14} /> Upload Compare PDF
          </button>

          {/* Page Navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              borderLeft: "1px solid var(--border)",
              paddingLeft: 10,
            }}
          >
            <button
              onClick={() => onPageChange(Math.max(1, comparePage - 1))}
              disabled={comparePage <= 1}
              style={{
                ...btnStyle,
                padding: "4px 6px",
                opacity: comparePage <= 1 ? 0.4 : 1,
                cursor: comparePage <= 1 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, minWidth: 60, textAlign: "center" }}>
              Page {comparePage}
            </span>
            <button
              onClick={() =>
                onPageChange(Math.min(maxPages, comparePage + 1))
              }
              disabled={comparePage >= maxPages}
              style={{
                ...btnStyle,
                padding: "4px 6px",
                opacity: comparePage >= maxPages ? 0.4 : 1,
                cursor:
                  comparePage >= maxPages ? "not-allowed" : "pointer",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Toggles */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              cursor: "pointer",
              borderLeft: "1px solid var(--border)",
              paddingLeft: 10,
            }}
          >
            <input
              type="checkbox"
              checked={highlightDiffs}
              onChange={onToggleHighlightDiffs}
              style={checkboxStyle}
            />
            <Eye size={14} />
            Highlight Differences
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={onToggleSyncScroll}
              style={checkboxStyle}
            />
            <Link size={14} />
            Sync Scroll
          </label>
        </div>
      </div>

      {/* Main Comparison Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 2,
          padding: 16,
          overflow: "hidden",
        }}
      >
        {/* Left: Original */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "var(--card)",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid var(--border)",
              backgroundColor: "var(--secondary)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--card-foreground)",
              textAlign: "center",
            }}
          >
            Original Document
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
              padding: 12,
              backgroundColor: "var(--background)",
            }}
          >
            {pdfLoaded ? (
              <canvas
                ref={canvasRef1}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--muted-foreground)",
                }}
              >
                <FileText size={40} strokeWidth={1} />
                <span style={{ fontSize: 13 }}>No document loaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Comparison */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "var(--card)",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid var(--border)",
              backgroundColor: "var(--secondary)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--card-foreground)",
              textAlign: "center",
            }}
          >
            Comparison Document
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
              padding: 12,
              backgroundColor: "var(--background)",
            }}
          >
            {compareName ? (
              <canvas
                ref={canvasRef2}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  color: "var(--muted-foreground)",
                }}
              >
                <Upload size={40} strokeWidth={1} />
                <span style={{ fontSize: 14 }}>Upload a PDF to compare</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={btnPrimaryStyle}
                >
                  <Upload size={14} /> Select PDF File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          backgroundColor: "var(--card)",
          borderTop: "1px solid var(--border)",
          fontSize: 12,
          color: "var(--muted-foreground)",
        }}
      >
        <div style={{ display: "flex", gap: 24 }}>
          <span>
            Original: Page {comparePage} of {totalPages || 0}
          </span>
          <span>
            Comparison: Page {comparePage} of {compareTotalPages || 0}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontWeight: 500 }}>Difference Legend:</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: "rgba(34, 197, 94, 0.4)",
                border: "1px solid rgba(34, 197, 94, 0.6)",
              }}
            />
            <span>Added</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: "rgba(239, 68, 68, 0.4)",
                border: "1px solid rgba(239, 68, 68, 0.6)",
              }}
            />
            <span>Removed</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: "rgba(234, 179, 8, 0.4)",
                border: "1px solid rgba(234, 179, 8, 0.6)",
              }}
            />
            <span>Modified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
