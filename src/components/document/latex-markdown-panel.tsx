"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X, AlertTriangle, CheckCircle2, Info, Code2, FileWarning,
  RefreshCw, ChevronDown, ChevronRight, Copy,
} from "lucide-react";

interface DiagnosticItem {
  id: string;
  type: "error" | "warning" | "info";
  line: number;
  message: string;
  suggestion: string;
  source: "latex" | "markdown";
}

const LATEX_PATTERNS: { pattern: RegExp; message: string; suggestion: string }[] = [
  { pattern: /\\begin\{([^}]+)\}(?![\s\S]*\\end\{\1\})/, message: "Unclosed LaTeX environment", suggestion: "Add matching \\end{$1}" },
  { pattern: /\$[^$]*$/, message: "Unclosed inline math delimiter", suggestion: "Add closing $ to complete math expression" },
  { pattern: /\\\[(?![\s\S]*\\\])/, message: "Unclosed display math", suggestion: "Add \\] to close display math" },
  { pattern: /\\(frac|sqrt|sum|int|prod)\s*(?![{(])/, message: "Missing argument braces", suggestion: "Add {} after command" },
  { pattern: /\\\\(?=\s*\\\\)/, message: "Consecutive line breaks", suggestion: "Use \\vspace{} for vertical spacing" },
  { pattern: /\\[a-zA-Z]+\{[^}]*\{[^}]*$/, message: "Unbalanced braces in command", suggestion: "Check for missing closing }" },
];

const MARKDOWN_PATTERNS: { pattern: RegExp; message: string; suggestion: string }[] = [
  { pattern: /^#{7,}/m, message: "Invalid heading level (max H6)", suggestion: "Use at most 6 # characters" },
  { pattern: /\[([^\]]*)\]\((\s*)\)/, message: "Empty link URL", suggestion: "Add a URL inside the parentheses" },
  { pattern: /!\[([^\]]*)\]\((\s*)\)/, message: "Empty image source", suggestion: "Add an image URL inside the parentheses" },
  { pattern: /```[^`]*$/, message: "Unclosed code block", suggestion: "Add closing ``` on a new line" },
  { pattern: /\|[^|]*\n[^|]/, message: "Malformed table row", suggestion: "Ensure all table rows have matching | delimiters" },
  { pattern: /^(\s*[-*+]\s.*\n)(?!\s*[-*+]\s|\s*\n|\s*$)/m, message: "List item not followed by list continuation", suggestion: "Add blank line after list or continue with list items" },
];

function analyzeContent(text: string): DiagnosticItem[] {
  const items: DiagnosticItem[] = [];
  const lines = text.split("\n");

  lines.forEach((line, lineIdx) => {
    LATEX_PATTERNS.forEach((pat, i) => {
      if (pat.pattern.test(line)) {
        items.push({
          id: `latex-${lineIdx}-${i}`,
          type: i === 4 ? "warning" : "error",
          line: lineIdx + 1,
          message: pat.message,
          suggestion: pat.suggestion,
          source: "latex",
        });
      }
    });

    MARKDOWN_PATTERNS.forEach((pat, i) => {
      if (pat.pattern.test(line)) {
        items.push({
          id: `md-${lineIdx}-${i}`,
          type: i >= 3 ? "error" : "warning",
          line: lineIdx + 1,
          message: pat.message,
          suggestion: pat.suggestion,
          source: "markdown",
        });
      }
    });
  });

  // Check for balanced braces in full text
  let braceCount = 0;
  for (const ch of text) {
    if (ch === "{") braceCount++;
    if (ch === "}") braceCount--;
    if (braceCount < 0) {
      items.push({
        id: "brace-extra-close",
        type: "error",
        line: 0,
        message: "Extra closing brace found",
        suggestion: "Remove the unmatched }",
        source: "latex",
      });
      break;
    }
  }
  if (braceCount > 0) {
    items.push({
      id: "brace-unclosed",
      type: "error",
      line: 0,
      message: `${braceCount} unclosed brace(s)`,
      suggestion: "Add matching } for each unclosed {",
      source: "latex",
    });
  }

  return items;
}

export function LatexMarkdownPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "latex" | "markdown">("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const runAnalysis = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const text = editor.innerText || "";
    const results = analyzeContent(text);
    setDiagnostics(results);
  }, []);

  useEffect(() => {
    if (!visible) return;
    runAnalysis();
    if (!autoRefresh) return;
    const interval = setInterval(runAnalysis, 3000);
    return () => clearInterval(interval);
  }, [visible, autoRefresh, runAnalysis]);

  if (!visible) return null;

  const filtered = diagnostics.filter((d) => {
    if (filter !== "all" && d.type !== filter) return false;
    if (sourceFilter !== "all" && d.source !== sourceFilter) return false;
    return true;
  });

  const errorCount = diagnostics.filter((d) => d.type === "error").length;
  const warnCount = diagnostics.filter((d) => d.type === "warning").length;

  const iconForType = (type: string) => {
    if (type === "error") return <AlertTriangle size={12} color="#ef4444" />;
    if (type === "warning") return <FileWarning size={12} color="#f59e0b" />;
    return <Info size={12} color="#3b82f6" />;
  };

  return (
    <div
      className="no-print flex w-[300px] flex-shrink-0 flex-col border-l"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <Code2 size={14} style={{ color: "var(--primary)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            LaTeX / Markdown
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={runAnalysis} className="p-1 rounded hover:bg-[var(--muted)]" title="Refresh">
            <RefreshCw size={12} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-3 px-3 py-2 border-b text-[10px]" style={{ borderColor: "var(--border)" }}>
        <span className="flex items-center gap-1" style={{ color: errorCount > 0 ? "#ef4444" : "var(--muted-foreground)" }}>
          <AlertTriangle size={10} /> {errorCount} errors
        </span>
        <span className="flex items-center gap-1" style={{ color: warnCount > 0 ? "#f59e0b" : "var(--muted-foreground)" }}>
          <FileWarning size={10} /> {warnCount} warnings
        </span>
        {errorCount === 0 && warnCount === 0 && (
          <span className="flex items-center gap-1" style={{ color: "#22c55e" }}>
            <CheckCircle2 size={10} /> All clear
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
        {(["all", "error", "warning"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-2 py-0.5 rounded text-[9px] capitalize"
            style={{
              backgroundColor: filter === f ? "var(--primary)" : "transparent",
              color: filter === f ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >
            {f}
          </button>
        ))}
        <div className="w-px h-3 mx-1" style={{ backgroundColor: "var(--border)" }} />
        {(["all", "latex", "markdown"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setSourceFilter(f)}
            className="px-2 py-0.5 rounded text-[9px] capitalize"
            style={{
              backgroundColor: sourceFilter === f ? "var(--muted)" : "transparent",
              color: sourceFilter === f ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            {f === "latex" ? "LaTeX" : f === "markdown" ? "MD" : f}
          </button>
        ))}
      </div>

      {/* Auto-refresh toggle */}
      <div className="flex items-center justify-between px-3 py-1 border-b text-[9px]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
        <span>Auto-refresh (3s)</span>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="px-2 py-0.5 rounded"
          style={{
            backgroundColor: autoRefresh ? "var(--primary)" : "var(--muted)",
            color: autoRefresh ? "var(--primary-foreground)" : "var(--muted-foreground)",
          }}
        >
          {autoRefresh ? "ON" : "OFF"}
        </button>
      </div>

      {/* Diagnostics list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 size={20} className="mx-auto mb-2" style={{ color: "#22c55e" }} />
            <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              No issues detected
            </p>
          </div>
        )}
        {filtered.map((d) => (
          <div
            key={d.id}
            className="rounded-md border p-2 cursor-pointer hover:bg-[var(--muted)] transition-colors"
            style={{ borderColor: "var(--border)" }}
            onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
          >
            <div className="flex items-start gap-2">
              {iconForType(d.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium" style={{ color: "var(--foreground)" }}>
                    {d.message}
                  </span>
                  {expandedId === d.id ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {d.line > 0 && (
                    <span className="text-[9px] px-1 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                      Line {d.line}
                    </span>
                  )}
                  <span className="text-[9px] px-1 rounded uppercase" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                    {d.source}
                  </span>
                </div>
              </div>
            </div>
            {expandedId === d.id && (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-1 mb-1">
                  <Info size={9} style={{ color: "var(--primary)" }} />
                  <span className="text-[9px] font-medium" style={{ color: "var(--primary)" }}>Suggestion</span>
                </div>
                <p className="text-[10px]" style={{ color: "var(--foreground)" }}>{d.suggestion}</p>
                <button
                  className="mt-1.5 flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border hover:bg-[var(--muted)]"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(d.suggestion);
                  }}
                >
                  <Copy size={9} /> Copy fix
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
