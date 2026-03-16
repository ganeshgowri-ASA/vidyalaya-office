"use client";

import { useState } from "react";
import {
  Trash2,
  FileText,
  Table2,
  Presentation,
  FileDown,
  RotateCcw,
  AlertTriangle,
  Clock,
  CheckSquare,
  Square,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import type { FileType } from "@/types";

const typeIcons: Record<FileType, React.ElementType> = {
  document: FileText,
  spreadsheet: Table2,
  presentation: Presentation,
  pdf: FileDown,
};

const typeColors: Record<FileType, string> = {
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

function getDaysUntilPurge(deletedAt?: string): number {
  if (!deletedAt) return 30;
  const deleted = new Date(deletedAt);
  const purgeDate = new Date(deleted.getTime() + 30 * 86400000);
  const now = new Date();
  return Math.max(0, Math.ceil((purgeDate.getTime() - now.getTime()) / 86400000));
}

export default function TrashPage() {
  const { trash, restoreFile, permanentDelete, emptyTrash } = useAppStore();
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedFiles);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedFiles(next);
  };

  const selectAll = () => {
    if (selectedFiles.size === trash.length) setSelectedFiles(new Set());
    else setSelectedFiles(new Set(trash.map((f) => f.id)));
  };

  const restoreSelected = () => {
    selectedFiles.forEach((id) => restoreFile(id));
    setSelectedFiles(new Set());
  };

  const deleteSelected = () => {
    selectedFiles.forEach((id) => permanentDelete(id));
    setSelectedFiles(new Set());
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Trash</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Deleted files are kept for 30 days before being permanently removed
          </p>
        </div>
        {trash.length > 0 && (
          <button
            onClick={() => setShowEmptyConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
            style={{ color: "#dc2626" }}
          >
            <Trash2 size={16} /> Empty Trash
          </button>
        )}
      </div>

      {/* Info banner */}
      <div
        className="flex items-center gap-3 rounded-xl border px-4 py-3"
        style={{ backgroundColor: "var(--accent)", borderColor: "var(--border)" }}
      >
        <Clock size={16} style={{ color: "var(--muted-foreground)" }} />
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Items in trash will be automatically purged after 30 days. Restore files to keep them.
        </p>
      </div>

      {/* Bulk actions */}
      {selectedFiles.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor: "var(--accent)", borderColor: "var(--border)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--accent-foreground)" }}>{selectedFiles.size} selected</span>
          <div className="flex-1" />
          <button onClick={restoreSelected} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm" style={{ color: "var(--foreground)" }}>
            <RotateCcw size={14} /> Restore
          </button>
          <button onClick={deleteSelected} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm" style={{ color: "#dc2626" }}>
            <Trash2 size={14} /> Delete Forever
          </button>
        </div>
      )}

      {/* Files */}
      {trash.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <Trash2 size={48} className="mx-auto mb-4" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>Trash is empty</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Deleted files will appear here</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button onClick={selectAll} className="flex items-center gap-1.5 text-sm hover:opacity-80" style={{ color: "var(--muted-foreground)" }}>
              {selectedFiles.size === trash.length ? <CheckSquare size={14} /> : <Square size={14} />}
              {selectedFiles.size === trash.length ? "Deselect all" : "Select all"}
            </button>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>({trash.length} items)</span>
          </div>

          <div className="rounded-xl border divide-y" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            {trash.map((file) => {
              const Icon = typeIcons[file.type];
              const daysLeft = getDaysUntilPurge(file.deletedAt);
              const isSelected = selectedFiles.has(file.id);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderColor: "var(--border)", backgroundColor: isSelected ? "var(--accent)" : "transparent" }}
                >
                  <button onClick={() => toggleSelect(file.id)}>
                    {isSelected ? <CheckSquare size={16} style={{ color: "var(--primary)" }} /> : <Square size={16} style={{ color: "var(--muted-foreground)" }} />}
                  </button>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${typeColors[file.type]}15` }}>
                    <Icon size={18} style={{ color: typeColors[file.type] }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{file.name}</p>
                    <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      <span>Deleted {file.deletedAt ? formatDate(file.deletedAt) : "—"}</span>
                      <span>&middot;</span>
                      <span>{formatFileSize(file.size)}</span>
                      <span>&middot;</span>
                      <span className={daysLeft <= 7 ? "font-medium" : ""} style={daysLeft <= 7 ? { color: "#dc2626" } : undefined}>
                        {daysLeft} days until purge
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => restoreFile(file.id)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs hover:opacity-80"
                    style={{ color: "var(--primary)" }}
                    title="Restore"
                  >
                    <RotateCcw size={14} /> Restore
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(file.id)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs hover:opacity-80"
                    style={{ color: "#dc2626" }}
                    title="Delete forever"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty trash confirmation */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEmptyConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} style={{ color: "#dc2626" }} />
              <h3 className="text-lg font-semibold" style={{ color: "var(--card-foreground)" }}>Empty Trash?</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
              This will permanently delete all {trash.length} items in the trash. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEmptyConfirm(false)}
                className="flex-1 rounded-lg py-2 text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => { emptyTrash(); setShowEmptyConfirm(false); }}
                className="flex-1 rounded-lg py-2 text-sm font-medium text-white"
                style={{ backgroundColor: "#dc2626" }}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--card-foreground)" }}>Delete Forever?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>This file will be permanently deleted and cannot be recovered.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 rounded-lg py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
              <button onClick={() => { permanentDelete(showDeleteConfirm); setShowDeleteConfirm(null); }} className="flex-1 rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: "#dc2626" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
