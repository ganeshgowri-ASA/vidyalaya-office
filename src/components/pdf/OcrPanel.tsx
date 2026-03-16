"use client";

import React from "react";
import {
  ScanText,
  Loader2,
  CheckCircle2,
  Circle,
  Info,
  FileText,
  Languages,
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

interface OcrPanelProps {
  processing: boolean;
  complete: boolean;
  language: string;
  onLanguageChange: (l: string) => void;
  onStartOcr: () => void;
  pdfLoaded: boolean;
}

const languages = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "chi", label: "Chinese" },
  { code: "jpn", label: "Japanese" },
  { code: "ara", label: "Arabic" },
  { code: "hin", label: "Hindi" },
  { code: "por", label: "Portuguese" },
  { code: "rus", label: "Russian" },
];

export default function OcrPanel({
  processing,
  complete,
  language,
  onLanguageChange,
  onStartOcr,
  pdfLoaded,
}: OcrPanelProps) {
  const [pageRange, setPageRange] = React.useState<"all" | "custom">("all");
  const [customRange, setCustomRange] = React.useState("");

  const statusColor = complete
    ? "#22c55e"
    : processing
      ? "#eab308"
      : "#ef4444";
  const statusLabel = complete
    ? "Complete"
    : processing
      ? "Processing"
      : "Not Processed";

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
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--card)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <ScanText size={20} style={{ color: "var(--primary)" }} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            OCR - Text Recognition
          </h3>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            backgroundColor: "var(--background)",
            borderRadius: 6,
            border: "1px solid var(--border)",
          }}
        >
          <Info size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            OCR (Optical Character Recognition) extracts text from scanned
            documents and images within PDFs.
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        {/* Status Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            padding: "12px 16px",
            backgroundColor: "var(--card)",
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}
        >
          <Circle
            size={14}
            fill={statusColor}
            stroke={statusColor}
          />
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            Status: {statusLabel}
          </span>
        </div>

        {/* Text Layer Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            padding: "12px 16px",
            backgroundColor: "var(--card)",
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}
        >
          <FileText size={14} style={{ color: "var(--muted-foreground)" }} />
          <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Text Layer Status:
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: complete ? "#22c55e" : "var(--muted-foreground)",
            }}
          >
            {complete ? "Extracted" : "Not Extracted"}
          </span>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Languages size={13} />
            Language
          </label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={processing}
            style={{
              ...inputStyle,
              width: "100%",
              boxSizing: "border-box",
              cursor: processing ? "not-allowed" : "pointer",
              opacity: processing ? 0.6 : 1,
              appearance: "auto",
            }}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Page Range Selector */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              marginBottom: 6,
              display: "block",
            }}
          >
            Page Range
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => setPageRange("all")}
              disabled={processing}
              style={{
                ...(pageRange === "all" ? btnPrimaryStyle : btnStyle),
                flex: 1,
                justifyContent: "center",
                opacity: processing ? 0.6 : 1,
                cursor: processing ? "not-allowed" : "pointer",
              }}
            >
              All Pages
            </button>
            <button
              onClick={() => setPageRange("custom")}
              disabled={processing}
              style={{
                ...(pageRange === "custom" ? btnPrimaryStyle : btnStyle),
                flex: 1,
                justifyContent: "center",
                opacity: processing ? 0.6 : 1,
                cursor: processing ? "not-allowed" : "pointer",
              }}
            >
              Specific Range
            </button>
          </div>
          {pageRange === "custom" && (
            <input
              type="text"
              value={customRange}
              onChange={(e) => setCustomRange(e.target.value)}
              placeholder="e.g. 1-5, 8, 10-12"
              disabled={processing}
              style={{
                ...inputStyle,
                width: "100%",
                boxSizing: "border-box",
                opacity: processing ? 0.6 : 1,
              }}
            />
          )}
        </div>

        {/* Processing Animation */}
        {processing && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              padding: "32px 16px",
              marginBottom: 24,
              backgroundColor: "var(--card)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          >
            <Loader2
              size={36}
              style={{
                color: "var(--primary)",
                animation: "spin 1s linear infinite",
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--card-foreground)",
              }}
            >
              Analyzing document...
            </span>
            <span
              style={{ fontSize: 12, color: "var(--muted-foreground)" }}
            >
              This may take a few moments depending on document size.
            </span>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Completion Message */}
        {complete && !processing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "16px",
              marginBottom: 24,
              backgroundColor: "var(--card)",
              borderRadius: 8,
              border: "1px solid #22c55e",
            }}
          >
            <CheckCircle2
              size={20}
              style={{ color: "#22c55e", flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#22c55e" }}>
                OCR Complete
              </div>
              <div
                style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}
              >
                Text has been successfully extracted from the document.
              </div>
            </div>
          </div>
        )}

        {/* Start OCR Button */}
        <button
          onClick={onStartOcr}
          disabled={processing || !pdfLoaded}
          style={{
            ...btnPrimaryStyle,
            width: "100%",
            justifyContent: "center",
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            opacity: processing || !pdfLoaded ? 0.5 : 1,
            cursor: processing || !pdfLoaded ? "not-allowed" : "pointer",
          }}
        >
          {processing ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Processing...
            </>
          ) : (
            <>
              <ScanText size={16} />
              Start OCR
            </>
          )}
        </button>

        {!pdfLoaded && (
          <p
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Load a PDF document to begin OCR processing.
          </p>
        )}
      </div>
    </div>
  );
}
