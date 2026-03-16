"use client";

import React, { useState } from "react";
import {
  EyeOff,
  Search,
  ScanLine,
  Square,
  CheckSquare,
  AlertTriangle,
  Crosshair,
  Type,
  Regex,
  Trash2,
} from "lucide-react";
import { btnStyle, btnPrimaryStyle, inputStyle } from "./types";

interface RedactionPanelProps {
  annotations: Array<{
    id: string;
    type: string;
    page: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
  }>;
  onApplyRedactions: () => void;
  onSearchRedact: (term: string) => void;
  redactionsApplied: boolean;
  pdfLoaded: boolean;
}

type RedactionMode = "area" | "text" | "pattern";

interface FoundOccurrence {
  id: string;
  text: string;
  page: number;
  selected: boolean;
}

type PatternType = "email" | "phone" | "ssn" | "credit-card" | "ip-address";

const patternLabels: Record<PatternType, string> = {
  email: "Email Addresses",
  phone: "Phone Numbers",
  ssn: "Social Security Numbers",
  "credit-card": "Credit Card Numbers",
  "ip-address": "IP Addresses",
};

const panelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 16,
  height: "100%",
  overflowY: "auto",
};

const sectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 12,
  backgroundColor: "var(--muted)",
  borderRadius: 8,
  border: "1px solid var(--border)",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--muted-foreground)",
  marginBottom: 2,
};

const modeButtonStyle: React.CSSProperties = {
  ...btnStyle,
  flex: 1,
  justifyContent: "center",
  padding: "8px 10px",
  fontSize: 12,
};

const activeModeStyle: React.CSSProperties = {
  ...modeButtonStyle,
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};

const btnDangerStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: "#ef4444",
  color: "#fff",
  border: "1px solid #dc2626",
};

const resultItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 8px",
  fontSize: 12,
  color: "var(--card-foreground)",
  backgroundColor: "var(--card)",
  borderRadius: 6,
  border: "1px solid var(--border)",
  cursor: "pointer",
};

export default function RedactionPanel({
  annotations,
  onApplyRedactions,
  onSearchRedact,
  redactionsApplied,
  pdfLoaded,
}: RedactionPanelProps) {
  const [mode, setMode] = useState<RedactionMode>("area");
  const [searchTerm, setSearchTerm] = useState("");
  const [foundOccurrences, setFoundOccurrences] = useState<FoundOccurrence[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<Set<PatternType>>(new Set());
  const [patternResults, setPatternResults] = useState<FoundOccurrence[]>([]);
  const [fillColor, setFillColor] = useState("#000000");
  const [overlayText, setOverlayText] = useState("");
  const [scanned, setScanned] = useState(false);

  const redactionAnnotations = annotations.filter((a) => a.type === "redaction");
  const pendingCount = redactionAnnotations.length;

  const handleFindAll = () => {
    if (!searchTerm.trim()) return;
    onSearchRedact(searchTerm);
    // Simulate found occurrences for UI demonstration
    const simulated: FoundOccurrence[] = [
      { id: "f1", text: searchTerm, page: 1, selected: true },
      { id: "f2", text: searchTerm, page: 2, selected: true },
      { id: "f3", text: searchTerm, page: 4, selected: true },
    ];
    setFoundOccurrences(simulated);
  };

  const toggleOccurrence = (id: string) => {
    setFoundOccurrences((prev) =>
      prev.map((o) => (o.id === id ? { ...o, selected: !o.selected } : o))
    );
  };

  const handleRedactSelected = () => {
    const selected = foundOccurrences.filter((o) => o.selected);
    selected.forEach((o) => onSearchRedact(o.text));
  };

  const handleRedactAllFound = () => {
    foundOccurrences.forEach((o) => onSearchRedact(o.text));
  };

  const togglePattern = (pattern: PatternType) => {
    setSelectedPatterns((prev) => {
      const next = new Set(prev);
      if (next.has(pattern)) next.delete(pattern);
      else next.add(pattern);
      return next;
    });
  };

  const handleScanDocument = () => {
    if (selectedPatterns.size === 0) return;
    // Simulate scan results
    const results: FoundOccurrence[] = [];
    let idx = 0;
    if (selectedPatterns.has("email")) {
      results.push({ id: `p${idx++}`, text: "user@example.com", page: 1, selected: true });
      results.push({ id: `p${idx++}`, text: "admin@company.org", page: 3, selected: true });
    }
    if (selectedPatterns.has("phone")) {
      results.push({ id: `p${idx++}`, text: "(555) 123-4567", page: 2, selected: true });
    }
    if (selectedPatterns.has("ssn")) {
      results.push({ id: `p${idx++}`, text: "***-**-1234", page: 1, selected: true });
    }
    if (selectedPatterns.has("credit-card")) {
      results.push({ id: `p${idx++}`, text: "****-****-****-5678", page: 4, selected: true });
    }
    if (selectedPatterns.has("ip-address")) {
      results.push({ id: `p${idx++}`, text: "192.168.1.100", page: 2, selected: true });
    }
    setPatternResults(results);
    setScanned(true);
  };

  const handleRedactAllPatterns = () => {
    patternResults.forEach((r) => onSearchRedact(r.text));
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <EyeOff size={16} style={{ color: "var(--foreground)" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
          Redaction Tools
        </span>
      </div>

      {!pdfLoaded && (
        <div
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            textAlign: "center",
            padding: 20,
          }}
        >
          Load a PDF to use redaction tools.
        </div>
      )}

      {pdfLoaded && (
        <>
          {/* Mode selector */}
          <div style={sectionLabelStyle}>Redaction Mode</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              style={mode === "area" ? activeModeStyle : modeButtonStyle}
              onClick={() => setMode("area")}
            >
              <Crosshair size={14} /> Area
            </button>
            <button
              style={mode === "text" ? activeModeStyle : modeButtonStyle}
              onClick={() => setMode("text")}
            >
              <Type size={14} /> Text
            </button>
            <button
              style={mode === "pattern" ? activeModeStyle : modeButtonStyle}
              onClick={() => setMode("pattern")}
            >
              <Regex size={14} /> Pattern
            </button>
          </div>

          {/* Area mode instructions */}
          {mode === "area" && (
            <div style={sectionStyle}>
              <div style={sectionLabelStyle}>Area Redaction</div>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: 0 }}>
                Click and drag on the document to draw redaction rectangles over
                sensitive content. Each rectangle will be filled with the selected
                color when redactions are applied.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                  border: "2px dashed var(--border)",
                  borderRadius: 6,
                  color: "var(--muted-foreground)",
                  fontSize: 12,
                }}
              >
                <Crosshair size={16} style={{ marginRight: 8 }} />
                Draw rectangles on the PDF to mark areas
              </div>
            </div>
          )}

          {/* Text search & redact mode */}
          {mode === "text" && (
            <div style={sectionStyle}>
              <div style={sectionLabelStyle}>Search &amp; Redact</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text"
                  placeholder="Enter text to find..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFindAll();
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button style={btnStyle} onClick={handleFindAll}>
                  <Search size={14} /> Find All
                </button>
              </div>

              {foundOccurrences.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      fontWeight: 500,
                    }}
                  >
                    Found {foundOccurrences.length} occurrence
                    {foundOccurrences.length !== 1 ? "s" : ""}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      maxHeight: 160,
                      overflowY: "auto",
                    }}
                  >
                    {foundOccurrences.map((occ) => (
                      <div
                        key={occ.id}
                        style={{
                          ...resultItemStyle,
                          borderColor: occ.selected ? "var(--primary)" : "var(--border)",
                        }}
                        onClick={() => toggleOccurrence(occ.id)}
                      >
                        {occ.selected ? (
                          <CheckSquare size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                        ) : (
                          <Square size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                        )}
                        <span style={{ flex: 1 }}>
                          &ldquo;{occ.text}&rdquo;
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--muted-foreground)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Page {occ.page}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 12 }}
                      onClick={handleRedactSelected}
                    >
                      <EyeOff size={13} /> Redact Selected
                    </button>
                    <button
                      style={{ ...btnDangerStyle, flex: 1, justifyContent: "center", fontSize: 12 }}
                      onClick={handleRedactAllFound}
                    >
                      <EyeOff size={13} /> Redact All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pattern redaction mode */}
          {mode === "pattern" && (
            <div style={sectionStyle}>
              <div style={sectionLabelStyle}>Pattern Redaction</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(Object.keys(patternLabels) as PatternType[]).map((pattern) => (
                  <label
                    key={pattern}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "var(--card-foreground)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPatterns.has(pattern)}
                      onChange={() => togglePattern(pattern)}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    {patternLabels[pattern]}
                  </label>
                ))}
              </div>
              <button
                style={{
                  ...btnPrimaryStyle,
                  justifyContent: "center",
                  opacity: selectedPatterns.size === 0 ? 0.4 : 1,
                  cursor: selectedPatterns.size === 0 ? "not-allowed" : "pointer",
                }}
                onClick={handleScanDocument}
                disabled={selectedPatterns.size === 0}
              >
                <ScanLine size={14} /> Scan Document
              </button>

              {scanned && patternResults.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      fontWeight: 500,
                    }}
                  >
                    Found {patternResults.length} match
                    {patternResults.length !== 1 ? "es" : ""}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      maxHeight: 160,
                      overflowY: "auto",
                    }}
                  >
                    {patternResults.map((r) => (
                      <div key={r.id} style={resultItemStyle}>
                        <EyeOff size={12} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                        <span style={{ flex: 1, fontFamily: "monospace", fontSize: 11 }}>
                          {r.text}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--muted-foreground)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Page {r.page}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    style={{ ...btnDangerStyle, justifyContent: "center", fontSize: 12 }}
                    onClick={handleRedactAllPatterns}
                  >
                    <EyeOff size={13} /> Redact All Matches
                  </button>
                </div>
              )}

              {scanned && patternResults.length === 0 && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    textAlign: "center",
                    padding: 8,
                  }}
                >
                  No matches found for selected patterns.
                </div>
              )}
            </div>
          )}

          {/* Redaction appearance */}
          <div style={sectionStyle}>
            <div style={sectionLabelStyle}>Redaction Appearance</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                Fill Color
              </label>
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                style={{
                  width: 32,
                  height: 26,
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  padding: 2,
                  cursor: "pointer",
                  backgroundColor: "var(--card)",
                }}
              />
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  backgroundColor: fillColor,
                  border: "1px solid var(--border)",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  whiteSpace: "nowrap",
                }}
              >
                Overlay Text
              </label>
              <input
                type="text"
                placeholder="e.g. [REDACTED]"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                style={{ ...inputStyle, flex: 1, fontSize: 12 }}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: "var(--border)" }} />

          {/* Warning and apply section */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: 10,
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              fontSize: 12,
              color: "#991b1b",
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Redactions are permanent once applied. This cannot be undone. Please
              review all marked areas carefully before applying.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
              color: "var(--muted-foreground)",
            }}
          >
            <span>
              {pendingCount} pending redaction{pendingCount !== 1 ? "s" : ""}
            </span>
            {redactionsApplied && (
              <span style={{ color: "#16a34a", fontWeight: 500 }}>
                Redactions applied
              </span>
            )}
          </div>

          <button
            style={{
              ...btnDangerStyle,
              justifyContent: "center",
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 600,
              opacity: pendingCount === 0 ? 0.4 : 1,
              cursor: pendingCount === 0 ? "not-allowed" : "pointer",
            }}
            onClick={onApplyRedactions}
            disabled={pendingCount === 0}
          >
            <Trash2 size={16} /> Apply All Redactions
          </button>
        </>
      )}
    </div>
  );
}
