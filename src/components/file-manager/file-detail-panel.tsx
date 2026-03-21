"use client";

import { useState } from "react";
import {
  X,
  FileText,
  Table2,
  Presentation,
  FileDown,
  Tag,
  Clock,
  History,
  ClipboardList,
  RotateCcw,
  Plus,
  Info,
  Star,
} from "lucide-react";
import type { VFile, VFolder, FileVersion, FileAuditEntry } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

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

const auditActionColors: Record<string, string> = {
  created: "#16a34a",
  modified: "#3b82f6",
  viewed: "#6b7280",
  shared: "#8b5cf6",
  deleted: "#dc2626",
  restored: "#f59e0b",
  moved: "#f59e0b",
  renamed: "#3b82f6",
  tagged: "#06b6d4",
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileDetailPanelProps {
  file: VFile;
  folder: VFolder | undefined;
  versions: FileVersion[];
  auditLogs: FileAuditEntry[];
  onClose: () => void;
  onRestoreVersion: (fileId: string, versionId: string) => void;
  onToggleStar: (fileId: string) => void;
  onAddTag: (fileId: string, tag: string) => void;
  onRemoveTag: (fileId: string, tag: string) => void;
}

type Tab = "info" | "versions" | "audit" | "tags";

export function FileDetailPanel({
  file,
  folder,
  versions,
  auditLogs,
  onClose,
  onRestoreVersion,
  onToggleStar,
  onAddTag,
  onRemoveTag,
}: FileDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [newTag, setNewTag] = useState("");
  const [restoringVersion, setRestoringVersion] = useState<string | null>(null);

  const Icon = typeIcons[file.type] || FileText;
  const color = typeColors[file.type] || "#6b7280";

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !file.tags.includes(tag)) {
      onAddTag(file.id, tag);
      setNewTag("");
    }
  };

  const handleRestoreVersion = (versionId: string) => {
    setRestoringVersion(versionId);
    setTimeout(() => {
      onRestoreVersion(file.id, versionId);
      setRestoringVersion(null);
    }, 800);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "info", label: "Info", icon: Info },
    { id: "versions", label: "Versions", icon: History },
    { id: "audit", label: "Audit", icon: ClipboardList },
    { id: "tags", label: "Tags", icon: Tag },
  ];

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: "var(--card)",
        borderLeft: "1px solid var(--border)",
        width: 280,
        minWidth: 280,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon size={18} style={{ color }} />
          </div>
          <span className="text-sm font-semibold truncate" style={{ color: "var(--card-foreground)" }}>
            {file.name}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggleStar(file.id)}
            className="rounded p-1 hover:bg-[var(--accent)]"
            title={file.starred ? "Unstar" : "Star"}
          >
            <Star
              size={14}
              style={{ color: file.starred ? "#f59e0b" : "var(--muted-foreground)" }}
              fill={file.starred ? "#f59e0b" : "none"}
            />
          </button>
          <button onClick={onClose} className="rounded p-1 hover:bg-[var(--accent)]">
            <X size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-[var(--primary)]"
                  : "hover:bg-[var(--accent)]"
              )}
              style={{
                color: activeTab === tab.id ? "var(--primary)" : "var(--muted-foreground)",
                borderColor: activeTab === tab.id ? "var(--primary)" : "transparent",
              }}
            >
              <TabIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="p-4 space-y-4">
            {/* File preview area */}
            <div
              className="flex h-28 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30` }}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon size={36} style={{ color }} />
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color }}>
                  {file.type}
                </span>
              </div>
            </div>

            {/* Metadata rows */}
            <div className="space-y-2">
              {[
                { label: "Size", value: formatFileSize(file.size) },
                { label: "Type", value: file.type.charAt(0).toUpperCase() + file.type.slice(1) },
                { label: "Owner", value: file.owner },
                { label: "Folder", value: folder?.name || "My Files" },
                { label: "Version", value: `v${file.version}` },
                { label: "Created", value: formatDate(file.created) },
                { label: "Modified", value: formatDate(file.modified) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--muted-foreground)", minWidth: 64 }}>
                    {label}
                  </span>
                  <span className="text-xs font-medium text-right truncate" style={{ color: "var(--foreground)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {file.tags.length > 0 && (
              <div>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Tags</span>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {file.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Versions Tab */}
        {activeTab === "versions" && (
          <div className="p-3 space-y-2">
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
              {versions.length} version{versions.length !== 1 ? "s" : ""} saved
            </p>
            {versions.length === 0 && (
              <div className="text-center py-8">
                <History size={24} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No version history</p>
              </div>
            )}
            {versions.map((ver, idx) => (
              <div
                key={ver.id}
                className="rounded-lg border p-3"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                    v{ver.version}
                    {idx === 0 && (
                      <span
                        className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]"
                        style={{ backgroundColor: "#16a34a20", color: "#16a34a" }}
                      >
                        Current
                      </span>
                    )}
                  </span>
                  {idx > 0 && (
                    <button
                      onClick={() => handleRestoreVersion(ver.id)}
                      disabled={restoringVersion === ver.id}
                      className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                    >
                      <RotateCcw size={10} />
                      {restoringVersion === ver.id ? "Restoring…" : "Restore"}
                    </button>
                  )}
                </div>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                  {ver.modifiedBy} · {formatDate(ver.modifiedAt)}
                </p>
                {ver.note && (
                  <p className="text-[10px] mt-1 italic" style={{ color: "var(--muted-foreground)" }}>
                    &ldquo;{ver.note}&rdquo;
                  </p>
                )}
                <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                  {formatFileSize(ver.size)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === "audit" && (
          <div className="p-3 space-y-1">
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
              {auditLogs.length} event{auditLogs.length !== 1 ? "s" : ""}
            </p>
            {auditLogs.length === 0 && (
              <div className="text-center py-8">
                <ClipboardList size={24} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No audit events</p>
              </div>
            )}
            {auditLogs.map((log) => (
              <div key={log.id} className="flex gap-2 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                <div
                  className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: auditActionColors[log.action] || "#6b7280" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                      {log.performedBy}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                      {log.action}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {log.details}
                    </p>
                  )}
                  <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                    <Clock size={9} />
                    {formatDate(log.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === "tags" && (
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--foreground)" }}>Current Tags</p>
              {file.tags.length === 0 && (
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No tags yet</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {file.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                    style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
                  >
                    #{tag}
                    <button
                      onClick={() => onRemoveTag(file.id, tag)}
                      className="ml-0.5 hover:opacity-70"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--foreground)" }}>Add Tag</p>
              <div className="flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
                  placeholder="e.g. finance"
                  className="flex-1 rounded-lg border px-3 py-1.5 text-xs outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <button
                  onClick={handleAddTag}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>
            </div>

            {/* Suggested tags */}
            <div>
              <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Suggested</p>
              <div className="flex flex-wrap gap-1.5">
                {["important", "review", "shared", "archived", "draft", "approved"].map((tag) => (
                  !file.tags.includes(tag) && (
                    <button
                      key={tag}
                      onClick={() => onAddTag(file.id, tag)}
                      className="rounded-full border px-2.5 py-1 text-xs hover:opacity-80 transition-opacity"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--muted-foreground)",
                        backgroundColor: "transparent",
                      }}
                    >
                      + #{tag}
                    </button>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
