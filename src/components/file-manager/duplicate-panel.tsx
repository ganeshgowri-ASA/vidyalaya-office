"use client";

import { useState } from "react";
import {
  ScanSearch,
  FileText,
  Table2,
  Presentation,
  FileDown,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  Copy,
  X,
} from "lucide-react";
import type { VFile, DuplicateGroup } from "@/types";
import { formatDate } from "@/lib/utils";

const typeIcons: Record<string, React.ElementType> = {
  document: FileText,
  spreadsheet: Table2,
  presentation: Presentation,
  pdf: FileDown,
};

const typeColors: Record<string, string> = {
  document: "#3b82f6",
  spreadsheet: "#16a34a",
  presentation: "#f59e0b",
  pdf: "#dc2626",
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DuplicatePanelProps {
  files: VFile[];
  scanning: boolean;
  results: DuplicateGroup[] | null;
  onScan: () => void;
  onDeleteFiles: (fileIds: string[]) => void;
  onDismissGroup: (groupId: string, keepFileId: string) => void;
}

export function DuplicatePanel({
  files,
  scanning,
  results,
  onScan,
  onDeleteFiles,
  onDismissGroup,
}: DuplicatePanelProps) {
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const toggleFileSelect = (fileId: string) => {
    const next = new Set(selectedForDelete);
    if (next.has(fileId)) next.delete(fileId);
    else next.add(fileId);
    setSelectedForDelete(next);
  };

  const handleBulkDelete = () => {
    if (selectedForDelete.size === 0) return;
    onDeleteFiles(Array.from(selectedForDelete));
    setSelectedForDelete(new Set());
  };

  const handleKeepNewest = (group: DuplicateGroup) => {
    const sorted = [...group.files].sort(
      (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );
    const toDelete = sorted.slice(1).map((f) => f.id);
    onDeleteFiles(toDelete);
    onDismissGroup(group.id, sorted[0].id);
  };

  const handleKeepLargest = (group: DuplicateGroup) => {
    const sorted = [...group.files].sort((a, b) => (b.size || 0) - (a.size || 0));
    const toDelete = sorted.slice(1).map((f) => f.id);
    onDeleteFiles(toDelete);
    onDismissGroup(group.id, sorted[0].id);
  };

  const totalDuplicateSize = results
    ?.flatMap((g) => g.files.slice(1))
    .reduce((s, f) => s + (f.size || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Scan header */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>
              Duplicate File Detector
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Find exact duplicates and similar files to free up storage
            </p>
          </div>
          <button
            onClick={onScan}
            disabled={scanning}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <ScanSearch size={16} className={scanning ? "animate-pulse" : ""} />
            {scanning ? "Scanning…" : "Scan Files"}
          </button>
        </div>

        {scanning && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--muted)" }}>
              <div
                className="h-full rounded-full animate-pulse"
                style={{ width: "60%", backgroundColor: "var(--primary)" }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Analyzing {files.length} files…
            </p>
          </div>
        )}

        {results !== null && !scanning && (
          <div className="mt-3 flex items-center gap-4 rounded-lg p-3" style={{ backgroundColor: "var(--accent)" }}>
            <Copy size={16} style={{ color: "var(--accent-foreground)" }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "var(--accent-foreground)" }}>
                {results.length === 0 ? "No duplicates found — your files are unique!" : `Found ${results.length} duplicate group${results.length !== 1 ? "s" : ""}`}
              </p>
              {results.length > 0 && (
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Potential savings: {formatFileSize(totalDuplicateSize)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk delete bar */}
      {selectedForDelete.size > 0 && (
        <div
          className="rounded-xl border px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: "var(--accent)", borderColor: "var(--border)" }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--accent-foreground)" }}>
            {selectedForDelete.size} file{selectedForDelete.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setSelectedForDelete(new Set())}
            className="text-sm hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            Clear
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
            style={{ backgroundColor: "#dc2626", color: "#fff" }}
          >
            <Trash2 size={14} /> Delete Selected
          </button>
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-4">
          {results.map((group) => {
            const isExpanded = expandedGroup === group.id;
            return (
              <div
                key={group.id}
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                {/* Group header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: group.reason === "exact" ? "#dc262610" : "#f59e0b10",
                    borderBottom: isExpanded ? "1px solid var(--border)" : "none",
                  }}
                  onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                >
                  <AlertTriangle
                    size={16}
                    style={{ color: group.reason === "exact" ? "#dc2626" : "#f59e0b" }}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      {group.reason === "exact" ? "Exact Duplicate" : "Similar Name"} ·{" "}
                      {group.files.length} files
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                      {group.files.map((f) => f.name).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleKeepNewest(group); }}
                      className="rounded-lg px-2 py-1 text-[10px] font-medium hover:opacity-80"
                      style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                    >
                      Keep Newest
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleKeepLargest(group); }}
                      className="rounded-lg px-2 py-1 text-[10px] font-medium hover:opacity-80"
                      style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
                    >
                      Keep Largest
                    </button>
                  </div>
                </div>

                {/* Files in group */}
                {isExpanded && (
                  <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {group.files.map((file, idx) => {
                      const Icon = typeIcons[file.type] || FileText;
                      const isSelected = selectedForDelete.has(file.id);
                      return (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-90"
                          style={{ backgroundColor: isSelected ? "var(--accent)" : "transparent" }}
                          onClick={() => toggleFileSelect(file.id)}
                        >
                          <button onClick={(e) => { e.stopPropagation(); toggleFileSelect(file.id); }}>
                            {isSelected ? (
                              <CheckSquare size={15} style={{ color: "var(--primary)" }} />
                            ) : (
                              <Square size={15} style={{ color: "var(--muted-foreground)" }} />
                            )}
                          </button>
                          <Icon size={16} style={{ color: typeColors[file.type] }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>
                              {file.name}
                              {idx === 0 && (
                                <span
                                  className="ml-1.5 rounded px-1 py-0.5 text-[9px]"
                                  style={{ backgroundColor: "#16a34a20", color: "#16a34a" }}
                                >
                                  newest
                                </span>
                              )}
                            </p>
                            <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                              {formatFileSize(file.size)} · {formatDate(file.modified)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteFiles([file.id]); }}
                            className="rounded p-1 hover:opacity-70"
                          >
                            <X size={14} style={{ color: "#dc2626" }} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {results !== null && results.length === 0 && !scanning && (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <Copy size={36} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>All Clear!</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            No duplicate files detected in your library.
          </p>
        </div>
      )}

      {results === null && !scanning && (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <ScanSearch size={36} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Ready to Scan</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Click &ldquo;Scan Files&rdquo; to detect duplicates and similar files.
          </p>
        </div>
      )}
    </div>
  );
}
