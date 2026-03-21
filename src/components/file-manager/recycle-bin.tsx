"use client";

import { useState } from "react";
import { Trash2, RotateCcw, AlertTriangle, Clock, FileText, Table2, Presentation, FileDown, X } from "lucide-react";
import type { VFile } from "@/types";
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

const RETENTION_DAYS = 30;

function daysUntilExpiry(deletedAt?: string): number {
  if (!deletedAt) return RETENTION_DAYS;
  const deleted = new Date(deletedAt).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - deleted) / (1000 * 60 * 60 * 24));
  return Math.max(0, RETENTION_DAYS - elapsed);
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface RecycleBinProps {
  trash: VFile[];
  onRestore: (fileId: string) => void;
  onPermanentDelete: (fileId: string) => void;
  onEmptyTrash: () => void;
}

export function RecycleBin({ trash, onRestore, onPermanentDelete, onEmptyTrash }: RecycleBinProps) {
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const totalSize = trash.reduce((s, f) => s + (f.size || 0), 0);
  const expiringSoon = trash.filter((f) => daysUntilExpiry(f.deletedAt) <= 3);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>
              Recycle Bin
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {trash.length} item{trash.length !== 1 ? "s" : ""} · {formatFileSize(totalSize)} ·{" "}
              Auto-deleted after {RETENTION_DAYS} days
            </p>
          </div>
          {trash.length > 0 && (
            <button
              onClick={() => setConfirmEmpty(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:opacity-80"
              style={{ backgroundColor: "#dc262620", color: "#dc2626" }}
            >
              <Trash2 size={14} /> Empty Trash
            </button>
          )}
        </div>

        {/* Expiring soon warning */}
        {expiringSoon.length > 0 && (
          <div
            className="flex items-center gap-2 rounded-lg p-3"
            style={{ backgroundColor: "#f59e0b10", border: "1px solid #f59e0b30" }}
          >
            <AlertTriangle size={14} style={{ color: "#f59e0b" }} />
            <p className="text-xs" style={{ color: "#f59e0b" }}>
              {expiringSoon.length} file{expiringSoon.length !== 1 ? "s" : ""} will be permanently deleted within 3 days
            </p>
          </div>
        )}
      </div>

      {/* Files in trash */}
      {trash.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <Trash2 size={36} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Recycle Bin is Empty</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Deleted files will appear here for {RETENTION_DAYS} days before permanent deletion.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border divide-y overflow-hidden"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {trash.map((file) => {
            const Icon = typeIcons[file.type] || FileText;
            const daysLeft = daysUntilExpiry(file.deletedAt);
            const isExpiringSoon = daysLeft <= 3;

            return (
              <div key={file.id} className="flex items-center gap-3 px-4 py-3 group">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${typeColors[file.type]}15` }}
                >
                  <Icon size={18} style={{ color: typeColors[file.type] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {formatFileSize(file.size)}
                    </span>
                    {file.deletedAt && (
                      <>
                        <span style={{ color: "var(--muted-foreground)" }}>·</span>
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                          <Clock size={10} /> Deleted {formatDate(file.deletedAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Expiry indicator */}
                  <span
                    className="text-[10px] rounded-full px-2 py-0.5 font-medium"
                    style={{
                      backgroundColor: isExpiringSoon ? "#dc262620" : "var(--muted)",
                      color: isExpiringSoon ? "#dc2626" : "var(--muted-foreground)",
                    }}
                  >
                    {daysLeft}d left
                  </span>

                  <button
                    onClick={() => onRestore(file.id)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium hover:opacity-80"
                    style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                    title="Restore"
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(file.id)}
                    className="rounded p-1 hover:opacity-70 opacity-0 group-hover:opacity-100"
                    title="Permanently delete"
                  >
                    <X size={14} style={{ color: "#dc2626" }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Retention policy info */}
      <div
        className="rounded-xl border px-4 py-3 flex items-start gap-3"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <Clock size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          <strong style={{ color: "var(--foreground)" }}>Auto-cleanup policy:</strong> Files in the recycle bin are
          automatically and permanently deleted after {RETENTION_DAYS} days. Restore files before they expire to
          retain them.
        </p>
      </div>

      {/* Empty trash confirm modal */}
      {confirmEmpty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmEmpty(false)} />
          <div
            className="relative z-10 w-full max-w-sm rounded-xl border shadow-2xl p-6"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--card-foreground)" }}>
              Empty Recycle Bin?
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              This will permanently delete all {trash.length} file{trash.length !== 1 ? "s" : ""} (
              {formatFileSize(trash.reduce((s, f) => s + (f.size || 0), 0))}). This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmEmpty(false)}
                className="rounded-lg px-4 py-2 text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onEmptyTrash(); setConfirmEmpty(false); }}
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: "#dc2626", color: "#fff" }}
              >
                Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent delete confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDeleteId(null)} />
          <div
            className="relative z-10 w-full max-w-sm rounded-xl border shadow-2xl p-6"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--card-foreground)" }}>
              Permanently Delete?
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              This file will be permanently deleted and cannot be recovered.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg px-4 py-2 text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onPermanentDelete(confirmDeleteId); setConfirmDeleteId(null); }}
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: "#dc2626", color: "#fff" }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
