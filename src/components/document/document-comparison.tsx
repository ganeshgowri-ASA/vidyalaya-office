"use client";

import React, { useState, useCallback } from "react";
import { X, Upload, FileText, ArrowLeftRight, Check, ChevronDown, ChevronUp } from "lucide-react";

interface DiffChunk {
  type: "equal" | "insert" | "delete";
  lines: string[];
  startA: number;
  startB: number;
}

function computeDiff(textA: string, textB: string): DiffChunk[] {
  const linesA = textA.split("\n");
  const linesB = textB.split("\n");

  // Simple LCS-based diff
  const n = linesA.length;
  const m = linesB.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (linesA[i] === linesB[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const chunks: DiffChunk[] = [];
  let i = 0, j = 0;

  while (i < n || j < m) {
    if (i < n && j < m && linesA[i] === linesB[j]) {
      // Equal
      const last = chunks[chunks.length - 1];
      if (last && last.type === "equal") {
        last.lines.push(linesA[i]);
      } else {
        chunks.push({ type: "equal", lines: [linesA[i]], startA: i, startB: j });
      }
      i++; j++;
    } else if (j < m && (i >= n || dp[i][j + 1] >= dp[i + 1][j])) {
      // Insert
      const last = chunks[chunks.length - 1];
      if (last && last.type === "insert") {
        last.lines.push(linesB[j]);
      } else {
        chunks.push({ type: "insert", lines: [linesB[j]], startA: i, startB: j });
      }
      j++;
    } else {
      // Delete
      const last = chunks[chunks.length - 1];
      if (last && last.type === "delete") {
        last.lines.push(linesA[i]);
      } else {
        chunks.push({ type: "delete", lines: [linesA[i]], startA: i, startB: j });
      }
      i++;
    }
  }

  return chunks;
}

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

interface DiffViewProps {
  chunks: DiffChunk[];
  collapseEqual?: boolean;
}

function DiffView({ chunks, collapseEqual }: DiffViewProps) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggleCollapse = (idx: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="font-mono text-xs leading-relaxed">
      {chunks.map((chunk, idx) => {
        const isCollapsible = collapseEqual && chunk.type === "equal" && chunk.lines.length > 4;
        const isCollapsed = collapsed.has(idx);

        if (chunk.type === "equal") {
          if (isCollapsible && isCollapsed) {
            return (
              <button
                key={idx}
                className="w-full text-left px-3 py-1 text-[10px] hover:bg-[var(--muted)] flex items-center gap-1"
                style={{ color: "var(--muted-foreground)", backgroundColor: "rgba(0,0,0,0.05)" }}
                onClick={() => toggleCollapse(idx)}
              >
                <ChevronDown size={10} />
                {chunk.lines.length} unchanged lines
              </button>
            );
          }
          const displayLines = isCollapsible && !isCollapsed ? chunk.lines : chunk.lines;
          return (
            <div key={idx}>
              {isCollapsible && !isCollapsed && (
                <button
                  className="w-full text-left px-3 py-0.5 text-[10px] hover:bg-[var(--muted)] flex items-center gap-1"
                  style={{ color: "var(--muted-foreground)", backgroundColor: "rgba(0,0,0,0.05)" }}
                  onClick={() => toggleCollapse(idx)}
                >
                  <ChevronUp size={10} />
                  Collapse {chunk.lines.length} unchanged lines
                </button>
              )}
              {displayLines.map((line, li) => (
                <div
                  key={li}
                  className="px-3 py-0.5 whitespace-pre-wrap break-all"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {line || "\u00A0"}
                </div>
              ))}
            </div>
          );
        }

        if (chunk.type === "delete") {
          return (
            <div key={idx} style={{ backgroundColor: "rgba(239,68,68,0.15)", borderLeft: "3px solid #ef4444" }}>
              {chunk.lines.map((line, li) => (
                <div key={li} className="px-3 py-0.5 whitespace-pre-wrap break-all" style={{ color: "#ef4444", textDecoration: "line-through" }}>
                  {line || "\u00A0"}
                </div>
              ))}
            </div>
          );
        }

        // insert
        return (
          <div key={idx} style={{ backgroundColor: "rgba(34,197,94,0.15)", borderLeft: "3px solid #22c55e" }}>
            {chunk.lines.map((line, li) => (
              <div key={li} className="px-3 py-0.5 whitespace-pre-wrap break-all" style={{ color: "#22c55e" }}>
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

interface DocumentComparisonProps {
  open: boolean;
  onClose: () => void;
  currentContent?: string;
  currentTitle?: string;
}

export function DocumentComparisonModal({ open, onClose, currentContent = "", currentTitle = "Current Document" }: DocumentComparisonProps) {
  const [docAText, setDocAText] = useState(currentContent ? stripHtml(currentContent) : "");
  const [docBText, setDocBText] = useState("");
  const [docATitle, setDocATitle] = useState(currentTitle);
  const [docBTitle, setDocBTitle] = useState("Compared Document");
  const [view, setView] = useState<"split" | "unified">("unified");
  const [collapseEqual, setCollapseEqual] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const chunks = React.useMemo(() => {
    if (!showResult) return [];
    return computeDiff(docAText, docBText);
  }, [docAText, docBText, showResult]);

  const stats = React.useMemo(() => {
    const insertions = chunks.filter((c) => c.type === "insert").reduce((sum, c) => sum + c.lines.length, 0);
    const deletions = chunks.filter((c) => c.type === "delete").reduce((sum, c) => sum + c.lines.length, 0);
    return { insertions, deletions };
  }, [chunks]);

  const handleFileLoad = useCallback((side: "a" | "b", file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (side === "a") {
        setDocAText(stripHtml(content));
        setDocATitle(file.name);
      } else {
        setDocBText(stripHtml(content));
        setDocBTitle(file.name);
      }
    };
    reader.readAsText(file);
  }, []);

  const triggerFileUpload = (side: "a" | "b") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.html,.htm";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileLoad(side, file);
    };
    input.click();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div
        className="flex flex-col rounded-xl border shadow-2xl"
        style={{
          backgroundColor: "var(--background)",
          borderColor: "var(--border)",
          width: "min(95vw, 1100px)",
          height: "min(90vh, 800px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={18} style={{ color: "var(--primary)" }} />
            <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Document Comparison</span>
            {showResult && (
              <span className="text-[10px] px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                +{stats.insertions} insertions
              </span>
            )}
            {showResult && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                -{stats.deletions} deletions
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded border overflow-hidden text-[10px]" style={{ borderColor: "var(--border)" }}>
              {(["unified", "split"] as const).map((v) => (
                <button
                  key={v}
                  className="px-2 py-1 transition-colors"
                  style={{
                    backgroundColor: view === v ? "var(--primary)" : "transparent",
                    color: view === v ? "#fff" : "var(--foreground)",
                  }}
                  onClick={() => setView(v)}
                >
                  {v === "unified" ? "Unified" : "Split"}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1 text-[10px] cursor-pointer" style={{ color: "var(--muted-foreground)" }}>
              <input
                type="checkbox"
                checked={collapseEqual}
                onChange={(e) => setCollapseEqual(e.target.checked)}
                className="w-3 h-3"
              />
              Collapse unchanged
            </label>
            <button onClick={onClose} className="rounded p-1 hover:bg-[var(--muted)]" style={{ color: "var(--muted-foreground)" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {!showResult ? (
            /* Setup view */
            <div className="flex flex-1 gap-4 p-4 overflow-auto">
              {/* Doc A */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>Original Document</span>
                  <button
                    className="flex items-center gap-1 rounded border px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    onClick={() => triggerFileUpload("a")}
                  >
                    <Upload size={10} /> Load File
                  </button>
                </div>
                <input
                  type="text"
                  value={docATitle}
                  onChange={(e) => setDocATitle(e.target.value)}
                  placeholder="Document A title"
                  className="rounded border px-2 py-1 text-xs bg-transparent outline-none"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                />
                <textarea
                  className="flex-1 rounded border p-2 text-xs font-mono resize-none outline-none min-h-[300px]"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--card)" }}
                  placeholder="Paste or type original document text here..."
                  value={docAText}
                  onChange={(e) => setDocAText(e.target.value)}
                />
              </div>

              <div className="flex items-center flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>
                <ArrowLeftRight size={20} />
              </div>

              {/* Doc B */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>Revised Document</span>
                  <button
                    className="flex items-center gap-1 rounded border px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    onClick={() => triggerFileUpload("b")}
                  >
                    <Upload size={10} /> Load File
                  </button>
                </div>
                <input
                  type="text"
                  value={docBTitle}
                  onChange={(e) => setDocBTitle(e.target.value)}
                  placeholder="Document B title"
                  className="rounded border px-2 py-1 text-xs bg-transparent outline-none"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                />
                <textarea
                  className="flex-1 rounded border p-2 text-xs font-mono resize-none outline-none min-h-[300px]"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--card)" }}
                  placeholder="Paste or type revised document text here..."
                  value={docBText}
                  onChange={(e) => setDocBText(e.target.value)}
                />
              </div>
            </div>
          ) : view === "unified" ? (
            /* Unified diff view */
            <div className="flex-1 overflow-auto">
              {/* Legend */}
              <div className="flex items-center gap-4 px-4 py-2 border-b flex-shrink-0 text-[10px]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded" style={{ backgroundColor: "rgba(34,197,94,0.4)" }} /> Inserted in {docBTitle}</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded" style={{ backgroundColor: "rgba(239,68,68,0.4)" }} /> Deleted from {docATitle}</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded" style={{ backgroundColor: "rgba(0,0,0,0.1)" }} /> Unchanged</span>
              </div>
              <div className="overflow-auto flex-1" style={{ maxHeight: "calc(100% - 40px)" }}>
                <DiffView chunks={chunks} collapseEqual={collapseEqual} />
              </div>
            </div>
          ) : (
            /* Split view */
            <div className="flex-1 flex overflow-hidden">
              {/* Left: A with deletions */}
              <div className="flex-1 overflow-auto border-r" style={{ borderColor: "var(--border)" }}>
                <div className="px-3 py-1.5 border-b text-[10px] font-medium sticky top-0 z-10" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}>
                  {docATitle}
                </div>
                <div className="font-mono text-xs leading-relaxed">
                  {chunks.map((chunk, idx) => {
                    if (chunk.type === "insert") return null;
                    const bg = chunk.type === "delete" ? "rgba(239,68,68,0.15)" : "transparent";
                    const borderLeft = chunk.type === "delete" ? "3px solid #ef4444" : "3px solid transparent";
                    const color = chunk.type === "delete" ? "#ef4444" : "var(--muted-foreground)";
                    const decoration = chunk.type === "delete" ? "line-through" : "none";
                    return (
                      <div key={idx} style={{ backgroundColor: bg, borderLeft }}>
                        {chunk.lines.map((line, li) => (
                          <div key={li} className="px-3 py-0.5 whitespace-pre-wrap break-all" style={{ color, textDecoration: decoration }}>
                            {line || "\u00A0"}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Right: B with insertions */}
              <div className="flex-1 overflow-auto">
                <div className="px-3 py-1.5 border-b text-[10px] font-medium sticky top-0 z-10" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}>
                  {docBTitle}
                </div>
                <div className="font-mono text-xs leading-relaxed">
                  {chunks.map((chunk, idx) => {
                    if (chunk.type === "delete") return null;
                    const bg = chunk.type === "insert" ? "rgba(34,197,94,0.15)" : "transparent";
                    const borderLeft = chunk.type === "insert" ? "3px solid #22c55e" : "3px solid transparent";
                    const color = chunk.type === "insert" ? "#22c55e" : "var(--muted-foreground)";
                    return (
                      <div key={idx} style={{ backgroundColor: bg, borderLeft }}>
                        {chunk.lines.map((line, li) => (
                          <div key={li} className="px-3 py-0.5 whitespace-pre-wrap break-all" style={{ color }}>
                            {line || "\u00A0"}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            {showResult
              ? `${stats.insertions} lines added · ${stats.deletions} lines removed · ${chunks.filter((c) => c.type === "equal").reduce((s, c) => s + c.lines.length, 0)} lines unchanged`
              : "Paste text or load files, then click Compare"}
          </div>
          <div className="flex items-center gap-2">
            {showResult ? (
              <button
                className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                onClick={() => setShowResult(false)}
              >
                <FileText size={12} /> Edit Documents
              </button>
            ) : (
              <button
                className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
                style={{ backgroundColor: "var(--primary)", color: "#fff", opacity: docBText ? 1 : 0.5, cursor: docBText ? "pointer" : "not-allowed" }}
                onClick={() => { if (docBText) setShowResult(true); }}
                disabled={!docBText}
              >
                <Check size={12} /> Compare
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
