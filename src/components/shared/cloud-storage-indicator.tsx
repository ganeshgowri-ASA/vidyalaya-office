"use client";

import { useEffect, useMemo } from "react";
import {
  Cloud,
  CloudOff,
  HardDrive,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { useCloudStorageStore, formatBytes } from "@/store/cloud-storage-store";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

/**
 * Cloud storage quota indicator + upload/download progress panel.
 * Designed to sit in a sidebar or settings page.
 */
export function CloudStorageIndicator() {
  const {
    authMode,
    storageUsage,
    storageLoading,
    refreshStorageUsage,
    uploads,
    downloads,
    clearUploadProgress,
    clearDownloadProgress,
    syncStatus,
    lastSyncedAt,
  } = useCloudStorageStore();

  const files = useAppStore((s) => s.recentFiles);

  useEffect(() => {
    refreshStorageUsage(files);
  }, [files, refreshStorageUsage]);

  const activeUploads = useMemo(
    () => Object.values(uploads).filter((u) => u.status === "uploading"),
    [uploads]
  );

  const activeDownloads = useMemo(
    () => Object.values(downloads).filter((d) => d.status === "downloading"),
    [downloads]
  );

  const completedUploads = useMemo(
    () => Object.values(uploads).filter((u) => u.status === "completed"),
    [uploads]
  );

  const completedDownloads = useMemo(
    () => Object.values(downloads).filter((d) => d.status === "completed"),
    [downloads]
  );

  const errorUploads = useMemo(
    () => Object.values(uploads).filter((u) => u.status === "error"),
    [uploads]
  );

  const usedPercent = storageUsage
    ? Math.round((storageUsage.usedBytes / storageUsage.quotaBytes) * 100)
    : 0;

  const quotaColor =
    usedPercent > 90
      ? "#dc2626"
      : usedPercent > 70
      ? "#f59e0b"
      : "var(--primary)";

  return (
    <div className="space-y-4">
      {/* Storage Mode Badge */}
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{
          backgroundColor: "var(--sidebar)",
          borderColor: "var(--border)",
        }}
      >
        {authMode === "authenticated" ? (
          <>
            <Cloud size={16} style={{ color: "var(--primary)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
              Cloud Storage
            </span>
            <span
              className="ml-auto text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "rgba(34,197,94,0.15)",
                color: "#22c55e",
              }}
            >
              Connected
            </span>
          </>
        ) : (
          <>
            <HardDrive size={16} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
              Local Storage
            </span>
            <span
              className="ml-auto text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "rgba(234,179,8,0.15)",
                color: "#eab308",
              }}
            >
              Guest Mode
            </span>
          </>
        )}
      </div>

      {/* Storage Quota Bar */}
      <div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
            Storage Usage
          </span>
          {storageLoading ? (
            <Loader2 size={12} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
          ) : (
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {storageUsage
                ? `${formatBytes(storageUsage.usedBytes)} / ${formatBytes(storageUsage.quotaBytes)}`
                : "Calculating..."}
            </span>
          )}
        </div>

        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--muted)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(usedPercent, 100)}%`,
              backgroundColor: quotaColor,
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            {usedPercent}% used
          </span>
          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            {storageUsage ? formatBytes(storageUsage.quotaBytes - storageUsage.usedBytes) : "—"} free
          </span>
        </div>

        {usedPercent > 90 && (
          <div className="flex items-center gap-1.5 mt-2 text-[10px]" style={{ color: "#dc2626" }}>
            <AlertTriangle size={10} />
            Storage almost full. Consider deleting unused files.
          </div>
        )}

        {/* File count */}
        {storageUsage && (
          <div className="mt-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {storageUsage.fileCount} files stored
            </span>
          </div>
        )}
      </div>

      {/* Active Transfers */}
      {(activeUploads.length > 0 || activeDownloads.length > 0) && (
        <div
          className="rounded-lg border p-3 space-y-2"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
            Active Transfers
          </span>

          {activeUploads.map((u) => (
            <TransferItem
              key={u.fileId}
              icon={<Upload size={12} />}
              label={u.fileName}
              progress={u.progress}
              onCancel={() => clearUploadProgress(u.fileId)}
            />
          ))}

          {activeDownloads.map((d) => (
            <TransferItem
              key={d.fileId}
              icon={<Download size={12} />}
              label={d.fileName}
              progress={d.progress}
              onCancel={() => clearDownloadProgress(d.fileId)}
            />
          ))}
        </div>
      )}

      {/* Completed / Error items */}
      {(completedUploads.length > 0 || completedDownloads.length > 0 || errorUploads.length > 0) && (
        <div
          className="rounded-lg border p-3 space-y-1.5"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
            Recent Transfers
          </span>

          {errorUploads.map((u) => (
            <div key={u.fileId} className="flex items-center gap-2">
              <AlertTriangle size={10} style={{ color: "#dc2626" }} />
              <span className="text-[11px] flex-1 truncate" style={{ color: "#dc2626" }}>
                {u.fileName} — {u.error}
              </span>
              <button onClick={() => clearUploadProgress(u.fileId)}>
                <X size={10} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>
          ))}

          {completedUploads.slice(0, 3).map((u) => (
            <div key={u.fileId} className="flex items-center gap-2">
              <CheckCircle2 size={10} style={{ color: "#22c55e" }} />
              <span className="text-[11px] flex-1 truncate" style={{ color: "var(--muted-foreground)" }}>
                {u.fileName} uploaded
              </span>
              <button onClick={() => clearUploadProgress(u.fileId)}>
                <X size={10} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>
          ))}

          {completedDownloads.slice(0, 3).map((d) => (
            <div key={d.fileId} className="flex items-center gap-2">
              <CheckCircle2 size={10} style={{ color: "#22c55e" }} />
              <span className="text-[11px] flex-1 truncate" style={{ color: "var(--muted-foreground)" }}>
                {d.fileName} downloaded
              </span>
              <button onClick={() => clearDownloadProgress(d.fileId)}>
                <X size={10} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sync Status */}
      {authMode === "authenticated" && (
        <div className="flex items-center gap-2 px-1">
          <SyncStatusDot status={syncStatus} />
          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            {syncStatus === "syncing"
              ? "Syncing..."
              : syncStatus === "synced"
              ? `Last synced ${lastSyncedAt ? formatTime(lastSyncedAt) : "just now"}`
              : syncStatus === "error"
              ? "Sync error"
              : syncStatus === "offline"
              ? "Offline — changes saved locally"
              : "Ready"}
          </span>
        </div>
      )}
    </div>
  );
}

function TransferItem({
  icon,
  label,
  progress,
  onCancel,
}: {
  icon: React.ReactNode;
  label: string;
  progress: number;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span style={{ color: "var(--primary)" }}>{icon}</span>
        <span className="text-[11px] flex-1 truncate" style={{ color: "var(--foreground)" }}>
          {label}
        </span>
        <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          {progress}%
        </span>
        <button onClick={onCancel}>
          <X size={10} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--primary)",
          }}
        />
      </div>
    </div>
  );
}

function SyncStatusDot({ status }: { status: string }) {
  const color =
    status === "synced"
      ? "#22c55e"
      : status === "syncing"
      ? "#3b82f6"
      : status === "error"
      ? "#dc2626"
      : status === "offline"
      ? "#6b7280"
      : "var(--muted-foreground)";

  return (
    <span
      className={cn("inline-block h-1.5 w-1.5 rounded-full", status === "syncing" && "animate-pulse")}
      style={{ backgroundColor: color }}
    />
  );
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return date.toLocaleDateString();
}
