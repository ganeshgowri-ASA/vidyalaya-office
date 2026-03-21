"use client";

import { useState, useRef, useEffect } from "react";
import {
  Cloud,
  CloudOff,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Upload,
  Download,
} from "lucide-react";
import { useCloudStorageStore, formatBytes } from "@/store/cloud-storage-store";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

/**
 * Compact cloud sync status indicator for the topbar.
 * Shows a small icon + optional dropdown with details.
 */
export function CloudSyncStatus() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    authMode,
    syncStatus,
    lastSyncedAt,
    isOnline,
    autoSaveEnabled,
    setAutoSaveEnabled,
    uploads,
    downloads,
    storageUsage,
    refreshStorageUsage,
    syncAllPending,
    pendingFileIds,
  } = useCloudStorageStore();

  const files = useAppStore((s) => s.recentFiles);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const activeTransfers =
    Object.values(uploads).filter((u) => u.status === "uploading").length +
    Object.values(downloads).filter((d) => d.status === "downloading").length;

  const pendingCount = pendingFileIds.size;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors",
          "hover:opacity-80"
        )}
        style={{
          color: "var(--foreground)",
          backgroundColor: open ? "var(--sidebar-accent)" : "transparent",
        }}
        title={
          authMode === "guest"
            ? "Guest mode — files saved locally"
            : `Cloud storage — ${syncStatus}`
        }
      >
        <StatusIcon authMode={authMode} syncStatus={syncStatus} isOnline={isOnline} />

        {activeTransfers > 0 && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-medium"
            style={{ color: "var(--primary)" }}
          >
            <Loader2 size={10} className="animate-spin" />
            {activeTransfers}
          </span>
        )}

        {pendingCount > 0 && authMode === "authenticated" && (
          <span
            className="text-[10px] px-1 rounded"
            style={{
              backgroundColor: "rgba(234,179,8,0.15)",
              color: "#eab308",
            }}
          >
            {pendingCount} pending
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-72 rounded-lg border shadow-xl z-50"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
              {authMode === "authenticated" ? "Cloud Storage" : "Local Storage"}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor:
                  authMode === "authenticated"
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(234,179,8,0.15)",
                color: authMode === "authenticated" ? "#22c55e" : "#eab308",
              }}
            >
              {authMode === "authenticated" ? "Connected" : "Guest"}
            </span>
          </div>

          <div className="p-3 space-y-3">
            {/* Storage bar */}
            {storageUsage && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {formatBytes(storageUsage.usedBytes)} / {formatBytes(storageUsage.quotaBytes)}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {Math.round((storageUsage.usedBytes / storageUsage.quotaBytes) * 100)}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        Math.round(
                          (storageUsage.usedBytes / storageUsage.quotaBytes) * 100
                        ),
                        100
                      )}%`,
                      backgroundColor: "var(--primary)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Sync info */}
            <div className="flex items-center gap-2">
              <SyncDot status={syncStatus} />
              <span className="text-[11px]" style={{ color: "var(--foreground)" }}>
                {syncStatus === "syncing"
                  ? "Syncing files..."
                  : syncStatus === "synced"
                  ? "All files synced"
                  : syncStatus === "error"
                  ? "Sync error occurred"
                  : syncStatus === "offline"
                  ? "Working offline"
                  : "Ready to sync"}
              </span>
            </div>

            {lastSyncedAt && (
              <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                Last synced: {new Date(lastSyncedAt).toLocaleTimeString()}
              </p>
            )}

            {/* Auto-save toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[11px]" style={{ color: "var(--foreground)" }}>
                Auto-save (30s)
              </span>
              <button
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className="relative inline-flex h-4 w-8 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: autoSaveEnabled ? "var(--primary)" : "var(--muted)",
                }}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full bg-white transition-transform"
                  style={{
                    transform: autoSaveEnabled ? "translateX(16px)" : "translateX(2px)",
                  }}
                />
              </button>
            </div>

            {/* Sync now button */}
            {authMode === "authenticated" && pendingCount > 0 && (
              <button
                onClick={() => syncAllPending(files)}
                className="flex items-center justify-center gap-1.5 w-full rounded-md px-2 py-1.5 text-xs transition-colors"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "white",
                }}
              >
                <RefreshCw size={12} />
                Sync {pendingCount} pending file{pendingCount !== 1 ? "s" : ""}
              </button>
            )}

            {/* Refresh storage info */}
            <button
              onClick={() => refreshStorageUsage(files)}
              className="flex items-center gap-1.5 text-[11px] transition-colors hover:underline"
              style={{ color: "var(--muted-foreground)" }}
            >
              <RefreshCw size={10} />
              Refresh storage info
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIcon({
  authMode,
  syncStatus,
  isOnline,
}: {
  authMode: string;
  syncStatus: string;
  isOnline: boolean;
}) {
  if (!isOnline) return <CloudOff size={14} style={{ color: "#6b7280" }} />;
  if (authMode === "guest") return <HardDrive size={14} style={{ color: "var(--muted-foreground)" }} />;

  switch (syncStatus) {
    case "syncing":
      return <Loader2 size={14} className="animate-spin" style={{ color: "var(--primary)" }} />;
    case "synced":
      return <CheckCircle2 size={14} style={{ color: "#22c55e" }} />;
    case "error":
      return <AlertTriangle size={14} style={{ color: "#dc2626" }} />;
    default:
      return <Cloud size={14} style={{ color: "var(--primary)" }} />;
  }
}

function SyncDot({ status }: { status: string }) {
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
      className={cn("inline-block h-2 w-2 rounded-full", status === "syncing" && "animate-pulse")}
      style={{ backgroundColor: color }}
    />
  );
}
